const mediaService = require('../services/media.service');

function subir(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'archivo no provisto' });
  }

  res.status(201).json({ url: mediaService.construirUrl(req.file.filename) });
}

function eliminar(req, res) {
  const { filename } = req.params;

  if (!/^[\w.-]+$/.test(filename)) {
    return res.status(400).json({ error: 'nombre de archivo inválido' });
  }

  const eliminado = mediaService.eliminar(filename);
  if (!eliminado) return res.status(404).json({ error: 'archivo no encontrado' });

  res.status(204).send();
}

module.exports = { subir, eliminar };
