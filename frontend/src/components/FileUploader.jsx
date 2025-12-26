import axios from 'axios';

const CHUNK_SIZE = 5 * 1024 * 1024;

export default function FileUploader({ chunks, setChunks, setStatus, setError }) {
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only ZIP files are allowed');
      setStatus('error');
      return;
    }

    setStatus('uploading');

    // 1️⃣ HANDSHAKE
    let handshakeData;
    try {
      const handshakeRes = await axios.post('http://localhost:3001/upload/handshake', {
        filename: file.name,
        size: file.size
      });
      handshakeData = handshakeRes.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Handshake failed');
      setStatus('error');
      return;
    }
    const { uploadId, uploadedChunks, totalChunks } = handshakeData;

    // initialize chunk UI
    const chunkStates = Array(totalChunks).fill('idle');
    uploadedChunks.forEach(i => (chunkStates[i] = 'success'));
    setChunks([...chunkStates]);

    // 2️⃣ UPLOAD CHUNKS
    for (let i = 0; i < totalChunks; i++) {
      if (uploadedChunks.includes(i)) continue;

      chunkStates[i] = 'uploading';
      setChunks([...chunkStates]);

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);

      const form = new FormData();
      form.append('chunk', blob);
      form.append('uploadId', uploadId);
      form.append('index', i);

      try {
        await axios.post('http://localhost:3001/upload/chunk', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Chunk upload failed at index ' + i);
        chunkStates[i] = 'error';
        setChunks([...chunkStates]);
        setStatus('error');
        return;
      }

      chunkStates[i] = 'success';
      setChunks([...chunkStates]);
    }

    // 3️⃣ FINALIZE
    let finalizeData;
    try {
      const finalizeRes = await axios.post('http://localhost:3001/upload/finalize', { uploadId });
      finalizeData = finalizeRes.data;
    } catch (err) {
      finalizeData = err.response?.data || {};
      setError(finalizeData.error || 'Finalize failed');
      setStatus('error');
      return;
    }
    setStatus('done');
  }

  return (
    <div className="uploader">
      <input type="file" onChange={handleFile} />
    </div>
  );
}