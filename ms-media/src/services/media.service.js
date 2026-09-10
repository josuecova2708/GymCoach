const path = require('path');
const fs = require('fs');
const UPLOADS_DIR = require('../config/uploadsDir');

// El navegador solo habla con el gateway (regla 6): la URL devuelta pasa por él,
// nunca apunta directo al puerto interno de este microservicio.
const PUBLIC_GATEWAY_URL = process.env.PUBLIC_GATEWAY_URL || 'http://localhost:3000';

function construirUrl(filename) {
  return `${PUBLIC_GATEWAY_URL}/api/uploads/${filename}`;
}

function eliminar(filename) {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

module.exports = { construirUrl, eliminar };
