const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const CHUNK_SIZE = 5 * 1024 * 1024;

module.exports = {
  UPLOAD_DIR,
  CHUNK_SIZE
};