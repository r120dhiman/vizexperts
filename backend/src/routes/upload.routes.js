const express = require('express');
const multer = require('multer');

const {
  handshake,
  uploadChunk,
  finalize
} = require('../controllers/upload.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload/handshake', handshake);
router.post('/upload/chunk', upload.single('chunk'), uploadChunk);
router.post('/upload/finalize', finalize);

module.exports = router;