# Chunked File Upload System (MERN Stack)

This repository contains a **resumable, chunk-based file upload system** built using a MERN-style architecture.  
The project is divided into separate **backend** and **frontend** modules, each documented independently.

The system is designed to:
- Reliably upload large files
- Support pause and resume
- Handle network interruptions
- Ensure file integrity on the backend

---

## Project Structure

```
chunked-uploader/
├── backend/
│   └── Readme.md          # Backend architecture & upload logic
├── frontend/
│   └── vite-project/
│       └── README.md      # Frontend implementation & UI logic
└── README.md              # Master documentation (this file)
```

---

## Backend Overview

The backend handles all core upload responsibilities, including:
- Resumable chunk-based uploads
- Writing chunks directly to disk using offsets
- Storing upload and chunk metadata in the database
- Verifying file integrity using SHA-256 hashing
- Validating ZIP files during the finalization step

📄 **Detailed backend documentation:**  
➡️ `backend/Readme.md`

---

## Frontend Overview

The frontend provides the user-facing upload experience, including:
- ZIP file validation before upload
- Chunk-based upload orchestration
- Visual chunk progress tracking
- Resume support via handshake mechanism
- Clear display of backend error messages

📄 **Detailed frontend documentation:**  
➡️ `frontend/vite-project/README.md`

---

## Key Features

- Chunk-based file uploads (5 MB chunks)
- Resume support using handshake protocol
- Backend file integrity verification
- Robust error handling
- Scalable and stateless design

---


## Summary

This project demonstrates a **production-grade approach to large file uploads**, featuring strong fault tolerance, clean separation of concerns, and extensibility for future enhancements.
