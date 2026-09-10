const ejerciciosService = require('../services/ejercicios.service');
const parseId = require('../utils/parseId');

async function listar(req, res) {
  let idGrupo;
  if (req.query.idGrupo !== undefined) {
    idGrupo = parseId(req.query.idGrupo);
    if (idGrupo === null) return res.status(400).json({ error: 'idGrupo inválido' });
  }
  const ejercicios = await ejerciciosService.listar({ idGrupo });
  res.json(ejercicios);
}

// GET /ejercicios/batch?ids=1,2,3 — clave para evitar el N+1 al hidratar una rutina completa.
async function batch(req, res) {
  const crudo = req.query.ids || '';
  const ids = crudo
    .split(',')
    .map((v) => v.trim())
    .filter((v) => /^\d+$/.test(v))
    .map(Number);

  if (ids.length === 0) {
    return res.status(400).json({ error: 'ids es obligatorio, ej. ?ids=1,2,3' });
  }

  const ejercicios = await ejerciciosService.obtenerPorIds(ids);
  res.json(ejercicios);
}

async function obtenerPorId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const ejercicio = await ejerciciosService.obtenerPorId(id);
  if (!ejercicio) return res.status(404).json({ error: 'ejercicio no encontrado' });
  res.json(ejercicio);
}

async function crear(req, res) {
  const idCoach = parseId(req.headers['x-user-id']);
  if (idCoach === null) {
    return res.status(400).json({ error: 'no se pudo determinar el coach (falta X-User-Id)' });
  }

  const { nombre, descripcion, idGrupo, fotoUrl, videoUrl } = req.body || {};
  const idGrupoNum = parseId(idGrupo);
  if (!nombre || idGrupoNum === null) {
    return res.status(400).json({ error: 'nombre e idGrupo son obligatorios' });
  }

  try {
    const ejercicio = await ejerciciosService.crear({
      nombre,
      descripcion,
      idGrupo: idGrupoNum,
      fotoUrl,
      videoUrl,
      idCoach,
    });
    res.status(201).json(ejercicio);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'el grupo muscular indicado no existe' });
    }
    throw err;
  }
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const { nombre, descripcion, idGrupo, fotoUrl, videoUrl } = req.body || {};
  const idGrupoNum = parseId(idGrupo);
  if (!nombre || idGrupoNum === null) {
    return res.status(400).json({ error: 'nombre e idGrupo son obligatorios' });
  }

  try {
    const ejercicio = await ejerciciosService.actualizar(id, {
      nombre,
      descripcion,
      idGrupo: idGrupoNum,
      fotoUrl,
      videoUrl,
    });
    if (!ejercicio) return res.status(404).json({ error: 'ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'el grupo muscular indicado no existe' });
    }
    throw err;
  }
}

async function eliminar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const eliminado = await ejerciciosService.eliminar(id);
  if (!eliminado) return res.status(404).json({ error: 'ejercicio no encontrado' });
  res.status(204).send();
}

module.exports = { listar, batch, obtenerPorId, crear, actualizar, eliminar };
