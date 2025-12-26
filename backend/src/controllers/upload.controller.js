const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yauzl = require('yauzl');

const { getDB } = require('../config/db');
const { UPLOAD_DIR, CHUNK_SIZE } = require('../utils/constants');

exports.handshake = async (req, res) => {
  try {
    const db = getDB();
    const { filename, size } = req.body;

    const uploadId = crypto
      .createHash('md5')
      .update(`${filename}-${size}`)
      .digest('hex');

    const totalChunks = Math.ceil(size / CHUNK_SIZE);

    await db.query(
      `INSERT INTO uploads (id, file_name, total_chunks, file_size, status)
       VALUES ($1, $2, $3, $4, 'UPLOADING')
       ON CONFLICT (id) DO NOTHING`,
      [uploadId, filename, totalChunks, size]
    );

    const result = await db.query(
      'SELECT chunk_index FROM chunks WHERE upload_id = $1',
      [uploadId]
    );

    res.json({
      uploadId,
      uploadedChunks: result.rows.map(r => r.chunk_index),
      totalChunks
    });
  } catch (err) {
    res.status(500).json({ error: 'Handshake DB Error', details: err.message });
  }
};


exports.uploadChunk = async (req, res) => {
  try {
    const db = getDB();
    const uploadId = req.body.uploadId;
    const index = Number(req.body.index);

    if (!uploadId || Number.isNaN(index) || !req.file) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        body: req.body,
        hasFile: !!req.file
      });
    }

    const startOffset = index * CHUNK_SIZE;

    const fileRes = await db.query(
      'SELECT file_name FROM uploads WHERE id = $1',
      [uploadId]
    );

    if (fileRes.rows.length === 0) {
      return res.status(400).json({ error: 'UPLOAD_NOT_FOUND' });
    }

    const fileName = fileRes.rows[0].file_name;
    const filePath = path.join(UPLOAD_DIR, `${uploadId}-${fileName}`);

    const fd = fs.openSync(filePath, fs.existsSync(filePath) ? 'r+' : 'w');
    fs.writeSync(fd, req.file.buffer, 0, req.file.buffer.length, startOffset);
    fs.closeSync(fd);

    await db.query(
      'INSERT INTO chunks (upload_id, chunk_index) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [uploadId, index]
    );

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Chunk Save Error', details: err.message });
  }
};


exports.finalize = async (req, res) => {
  const { uploadId } = req.body;
  const db = getDB();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const uploadRes = await client.query(
      'SELECT file_name, status FROM uploads WHERE id = $1 FOR UPDATE',
      [uploadId]
    );

    const upload = uploadRes.rows[0];

    if (!upload) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'UPLOAD_NOT_FOUND' });
    }

    if (upload.status === 'COMPLETED') {
      await client.query('ROLLBACK');
      return res.json({ status: 'ALREADY_COMPLETED' });
    }

    const filePath = path.join(UPLOAD_DIR, `${uploadId}-${upload.file_name}`);

    if (!fs.existsSync(filePath)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'FILE_NOT_FOUND' });
    }

    const hash = crypto.createHash('sha256');
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('data', data => hash.update(data));
    fileStream.on('end', async () => {
      const finalHash = hash.digest('hex');

      yauzl.open(filePath, { lazyEntries: true }, async (err, zipfile) => {
        if (err) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: 'Invalid ZIP' });
        }

        const files = [];
        zipfile.readEntry();

        zipfile.on('entry', entry => {
          files.push(entry.fileName);
          zipfile.readEntry();
        });

        zipfile.on('end', async () => {
          await client.query(
            'UPDATE uploads SET status = $1, final_hash = $2 WHERE id = $3',
            ['COMPLETED', finalHash, uploadId]
          );
          await client.query('COMMIT');
          client.release();

          res.json({ success: true, hash: finalHash, files });
        });
      });
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json({ error: err.message });
  }
};