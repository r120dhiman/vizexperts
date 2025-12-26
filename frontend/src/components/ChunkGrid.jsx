export default function ChunkGrid({ chunks }) {
  return (
    <div className="grid">
      {chunks.map((status, idx) => (
        <div key={idx} className={`cell ${status}`}>
          {idx}
        </div>
      ))}
    </div>
  );
}