const path = require('path');
const fs = require('fs');

// Coincide con el volumen Docker montado en /app/uploads (docker-compose.yml).
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

module.exports = UPLOADS_DIR;
