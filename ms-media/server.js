const express = require('express');
const multer = require('multer');
const mediaRoutes = require('./src/routes/media.routes');
const UPLOADS_DIR = require('./src/config/uploadsDir');

const app = express();
const PORT = process.env.PORT || 3003;

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/media', mediaRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-media' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`ms-media escuchando en el puerto ${PORT}`);
});
