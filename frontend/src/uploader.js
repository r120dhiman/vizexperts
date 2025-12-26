import { API_BASE } from './api';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT = 3;

export async function uploadFile(file, onProgress, onChunkUpdate) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // 🔹 Handshake
  const handshakeRes = await fetch(`${API_BASE}/handshake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      size: file.size
    })
  });

  const { uploadId, uploadedChunks } = await handshakeRes.json();
  const uploadedSet = new Set(uploadedChunks);

  let completed = uploadedSet.size;
  let active = 0;
  const queue = [];

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedSet.has(i)) queue.push(i);
    else onChunkUpdate(i, 'success');
  }

  return new Promise((resolve) => {
    const next = () => {
      if (queue.length === 0 && active === 0) return resolve(uploadId);

      while (active < MAX_CONCURRENT && queue.length > 0) {
        const index = queue.shift();
        active++;
        onChunkUpdate(index, 'uploading');

        const start = index * CHUNK_SIZE;
        const chunk = file.slice(start, start + CHUNK_SIZE);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('index', index);
        formData.append('start', start);

        fetch(`${API_BASE}/chunk`, {
          method: 'POST',
          body: formData
        })
          .then(() => {
            completed++;
            onChunkUpdate(index, 'success');
            onProgress(Math.floor((completed / totalChunks) * 100));
          })
          .catch(() => {
            onChunkUpdate(index, 'error');
            queue.push(index); // retry later
          })
          .finally(() => {
            active--;
            next();
          });
      }
    };

    next();
  }).then(() =>
    fetch(`${API_BASE}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId })
    })
  );
}