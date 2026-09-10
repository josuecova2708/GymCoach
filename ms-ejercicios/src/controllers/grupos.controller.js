const gruposService = require('../services/grupos.service');
const parseId = require('../utils/parseId');

async function listar(req, res) {
  const grupos = await gruposService.listar();
  res.json(grupos);
}

async function crear(req, res) {
  const { nombre } = req.body || {};
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

  const grupo = await gruposService.crear({ nombre });
  res.status(201).json(grupo);
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const { nombre } = req.body || {};
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

  const grupo = await gruposService.actualizar(id, { nombre });
  if (!grupo) return res.status(404).json({ error: 'grupo muscular no encontrado' });
  res.json(grupo);
}

async function eliminar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  try {
    const eliminado = await gruposService.eliminar(id);
    if (!eliminado) return res.status(404).json({ error: 'grupo muscular no encontrado' });
    res.status(204).send();
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: err.message });
    throw err;
  }
}

module.exports = { listar, crear, actualizar, eliminar };
