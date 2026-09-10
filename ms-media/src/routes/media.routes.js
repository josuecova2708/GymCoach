const { Router } = require('express');
const upload = require('../middleware/upload');
const mediaController = require('../controllers/media.controller');

const router = Router();

// El campo del form-data se llama "archivo" (lo usará frontend/js/api.js en la Fase 6).
router.post('/upload', upload.single('archivo'), mediaController.subir);
router.delete('/:filename', mediaController.eliminar);

module.exports = router;
