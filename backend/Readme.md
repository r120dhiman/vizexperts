# Chunked File Upload System (MERN Stack)

This project implements a **resumable, chunk-based file upload system** using a MERN-style architecture.  
It is designed to reliably upload large files, handle network failures, and ensure file integrity on the backend.

---

## File Integrity Handling (Hashing)

File integrity is ensured using **SHA-256 hashing** on the backend.

### How it works
- After all file chunks are uploaded, the client calls the `/upload/finalize` endpoint.
- The server reconstructs the file and reads it using a **stream-based approach**.
- A SHA-256 hash is calculated incrementally as data is streamed.

### Why this approach was chosen
- Prevents loading the entire file into memory.
- Scales well for large files.
- Guarantees that the uploaded file is not corrupted.
- The final hash is stored in the database for verification and auditing.

---

## Pause and Resume Logic

The system supports **pause and resume functionality by design**.

### Handshake Mechanism
- Before uploading chunks, the client calls `/upload/handshake` with:
  - File name
  - File size
- The server generates a deterministic `uploadId` using:



### Resume Flow
- The server returns:
- `uploadId`
- A list of already uploaded chunk indices
- The client uploads **only the missing chunks**.

This allows uploads to resume after:
- Page refresh
- Network interruption
- Browser close
- Server restart

### Pause Handling
- Upload is paused on the frontend by stopping the chunk upload loop.
- No server-side session state is required.
- Resume simply restarts the upload process using the same handshake.

---

## Trade-offs Made

### ZIP Validation at Finalization
- ZIP file validation is performed only during `/upload/finalize`.

**Trade-off:**  
The user receives an "Invalid ZIP" error after upload completion rather than earlier in the process.

---

### Fixed Chunk Size
- Chunk size is fixed at **5 MB**.

**Pros**
- Simple offset calculation
- Predictable disk writes
- Balanced memory usage

**Cons**
- Not adaptive to varying network speeds

---

### Sequential Chunk Upload
- Chunks are uploaded sequentially from the frontend.

**Pros**
- Simple implementation
- Easier error handling
- Lower server load

**Cons**
- Slower compared to parallel uploads

---

### Disk-Based Chunk Writing
- Chunks are written directly to disk using byte offsets.

**Pros**
- Very low memory usage
- Supports out-of-order chunk uploads
- Crash-safe

**Cons**
- Slightly slower than in-memory buffering

---

## Further Enhancements

### Backend Enhancements
- Parallel chunk uploads
- Per-chunk checksum validation
- Automatic cleanup of abandoned uploads
- Background job processing for finalization
- Upload rate limiting

---

### Frontend Enhancements
- Pause / Resume button
- Retry failed chunks
- Upload speed and ETA calculation
- Drag-and-drop upload UI
- Animated progress indicators

---

### Security Enhancements
- Authentication and authorization
- File type validation using magic bytes
- Maximum upload size enforcement
- User-based upload quotas

---

## Summary

This project demonstrates a **robust, production-ready chunked file upload system** with:
- Resumable uploads
- Backend file integrity validation
- Stateless and scalable backend design
- Efficient disk and memory usage

It provides a strong foundation for building enterprise-grade file upload services.