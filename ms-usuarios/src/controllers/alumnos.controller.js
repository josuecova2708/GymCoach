const alumnosService = require('../services/alumnos.service');
const parseId = require('../utils/parseId');

async function listar(req, res) {
  const alumnos = await alumnosService.listar();
  res.json(alumnos);
}

async function obtenerPorId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const alumno = await alumnosService.obtenerPorId(id);
  if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });

  res.json(alumno);
}

async function crear(req, res) {
  const { nombre, email, password, telefono } = req.body || {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
  }

  try {
    const alumno = await alumnosService.crear({ nombre, email, password, telefono });
    res.status(201).json(alumno);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'ya existe un alumno con ese email' });
    }
    throw err;
  }
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const { nombre, email, password, telefono } = req.body || {};
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son obligatorios' });
  }

  try {
    const alumno = await alumnosService.actualizar(id, { nombre, email, password, telefono });
    if (!alumno) return res.status(404).json({ error: 'alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'ya existe un alumno con ese email' });
    }
    throw err;
  }
}

async function eliminar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const eliminado = await alumnosService.eliminar(id);
  if (!eliminado) return res.status(404).json({ error: 'alumno no encontrado' });

  res.status(204).send();
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
