import { useState } from 'react';
import FileUploader from './components/FileUploader';
import ChunkGrid from './components/ChunkGrid';

export default function App() {
  const [chunks, setChunks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null); // ✅ add error state

  return (
    <div className="app">
      <h1>🚀 Chunked Uploader</h1>

      <FileUploader
        chunks={chunks}
        setChunks={setChunks}
        setStatus={setStatus}
        setError={setError}   // ✅ pass it here
      />

      {chunks.length > 0 && (
        <>
          <h3>Chunk Progress</h3>
          <ChunkGrid chunks={chunks} />
        </>
      )}

      {error && <div className="error-box">❌ {error}</div>}  {/* display error */}

      <p className={`status ${status}`}>{status.toUpperCase()}</p>
    </div>
  );
}