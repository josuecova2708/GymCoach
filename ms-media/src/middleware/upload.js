const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const UPLOADS_DIR = require('../config/uploadsDir');

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Nunca el nombre original: evita colisiones y path traversal.
    const extension = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

function fileFilter(req, file, cb) {
  if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
    const error = new Error('tipo de archivo no permitido (solo imágenes o video)');
    error.status = 400;
    return cb(error);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANO_MAXIMO_BYTES },
});

module.exports = upload;
