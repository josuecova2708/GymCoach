const rutinasService = require('../services/rutinas.service');
const parseId = require('../utils/parseId');

function validarEjercicios(ejercicios) {
  if (!Array.isArray(ejercicios)) return null;

  const normalizados = [];
  for (const ej of ejercicios) {
    const idEjercicio = parseId(ej.idEjercicio);
    const series = parseId(ej.series);
    const repeticiones = parseId(ej.repeticiones);
    const descanso = parseId(ej.descanso);

    if (idEjercicio === null || series === null || repeticiones === null || descanso === null) {
      return null;
    }
    normalizados.push({ idEjercicio, series, repeticiones, descanso });
  }
  return normalizados;
}

async function listar(req, res) {
  res.json(await rutinasService.listar());
}

async function obtenerPorId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const rutina = await rutinasService.obtenerPorId(id);
  if (!rutina) return res.status(404).json({ error: 'rutina no encontrada' });
  res.json(rutina);
}

async function crear(req, res) {
  const { nombre, descripcion } = req.body || {};
  const ejercicios = validarEjercicios(req.body?.ejercicios || []);

  if (!nombre || ejercicios === null) {
    return res.status(400).json({ error: 'nombre es obligatorio y ejercicios debe ser una lista válida' });
  }

  const rutina = await rutinasService.crear({ nombre, descripcion, ejercicios });
  res.status(201).json(rutina);
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const { nombre, descripcion } = req.body || {};
  const ejercicios = validarEjercicios(req.body?.ejercicios || []);

  if (!nombre || ejercicios === null) {
    return res.status(400).json({ error: 'nombre es obligatorio y ejercicios debe ser una lista válida' });
  }

  const rutina = await rutinasService.actualizar(id, { nombre, descripcion, ejercicios });
  if (!rutina) return res.status(404).json({ error: 'rutina no encontrada' });
  res.json(rutina);
}

async function eliminar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  try {
    const eliminado = await rutinasService.eliminar(id);
    if (!eliminado) return res.status(404).json({ error: 'rutina no encontrada' });
    res.status(204).send();
  } catch (err) {
    if (err.conflict) return res.status(409).json({ error: err.message });
    throw err;
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
