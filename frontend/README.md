# Chunked File Upload Frontend (React + Vite)

This is the frontend implementation for a **resumable, chunk-based file upload system**.  
It communicates with a Node.js backend to upload large ZIP files reliably, visualize chunk progress, and display backend errors in real time.

---

## Tech Stack

- **React** – UI and state management
- **Vite** – Development server and build tool
- **Axios** – HTTP client for API communication
- **HTML5 File API** – File slicing and chunk creation

---

## Core Features

- ZIP file validation before upload
- Chunk-based file upload
- Visual chunk progress grid
- Resume support using backend handshake
- Backend error propagation to UI
- Final upload status tracking

---

## Project Structure

```
src/
├── components/
│   ├── FileUploader.jsx   # Main upload logic
│   └── ChunkGrid.jsx      # Visual chunk progress grid
├── App.jsx                # Root component & state management
```

---

## Upload Flow

### 1. Client-Side ZIP Validation

Before making any backend request, the frontend validates that the selected file is a ZIP file:

```js
if (!file.name.toLowerCase().endsWith('.zip')) {
  setError('Only ZIP files are allowed');
  setStatus('error');
  return;
}
```

This prevents unnecessary backend calls and provides immediate feedback to the user.

---

### 2. Handshake (Resumability)

The upload process begins with a handshake request:

```
POST /upload/handshake
```

Payload:
```json
{
  "filename": "<file-name>",
  "size": <file-size>
}
```

The backend responds with:
- `uploadId`
- `uploadedChunks`
- `totalChunks`

This allows the frontend to resume interrupted uploads by skipping already uploaded chunks.

---

### 3. Chunk Upload Logic

- The file is divided into fixed-size chunks (5 MB each).
- Chunks are uploaded sequentially.
- Each chunk upload updates the UI state.

```js
const chunk = file.slice(start, end);
```

Chunk states used in the UI:
- `idle`
- `uploading`
- `success`
- `error`

---

### 4. Chunk Progress Visualization

Chunk progress is displayed using a grid-based UI:

```jsx
<ChunkGrid chunks={chunks} />
```

Each cell visually represents the state of an individual chunk, making upload progress easy to track and debug.

---

### 5. Finalization

Once all chunks are uploaded, the frontend calls:

```
POST /upload/finalize
```

- On success → upload status is set to `done`
- On failure (e.g. invalid ZIP) → backend error is shown in the UI

Axios automatically throws errors for non-2xx responses, enabling clean error handling.

---

## Error Handling Strategy

- All backend errors are displayed directly in the UI.
- Previous errors are cleared when a new file is selected.
- Upload stops immediately if any chunk or finalize step fails.

Example:
```js
setError(err.response?.data?.error || 'Upload failed');
setStatus('error');
```

---

## Resume Support

Resume functionality is supported by design:
- Browser refresh
- Network interruption
- Re-selecting the same file

The handshake ensures only missing chunks are uploaded again.

---

## Trade-offs Made

### Sequential Chunk Upload
- Easier to implement and debug
- Lower backend load
- Slower than parallel chunk uploads

---

### Filename-Based ZIP Validation
- Simple and fast
- Does not inspect ZIP magic bytes

---

### Grid-Based Progress UI
- Useful for debugging and visualization
- Less user-friendly than a traditional progress bar

---

## Future Enhancements

### Frontend Improvements
- Pause / Resume button
- Parallel chunk uploads
- Upload speed and ETA display
- Drag-and-drop file input
- Animated transitions using GSAP or Framer Motion

---

### UX Improvements
- Replace chunk grid with progress bar
- Retry failed chunks automatically
- Upload success preview

---

## Summary

This frontend provides a **robust and resilient upload experience** with:
- Chunk-level progress visualization
- Strong error handling
- Resume-friendly architecture
- Clean integration with the backend upload system

It serves as a solid foundation for large-file uploads in production environments.