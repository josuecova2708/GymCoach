const asignacionesService = require('../services/asignaciones.service');
const parseId = require('../utils/parseId');

async function listar(req, res) {
  let idAlumno;
  if (req.query.idAlumno !== undefined) {
    idAlumno = parseId(req.query.idAlumno);
    if (idAlumno === null) return res.status(400).json({ error: 'idAlumno inválido' });
  }
  res.json(await asignacionesService.listar({ idAlumno }));
}

async function crear(req, res) {
  const { idAlumno, idRutina, fechaInicio, fechaFin } = req.body || {};
  const idAlumnoNum = parseId(idAlumno);
  const idRutinaNum = parseId(idRutina);

  if (idAlumnoNum === null || idRutinaNum === null || !fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'idAlumno, idRutina, fechaInicio y fechaFin son obligatorios' });
  }

  if (new Date(fechaFin) <= new Date(fechaInicio)) {
    return res.status(400).json({ error: 'fechaFin debe ser posterior a fechaInicio' });
  }

  try {
    const asignacion = await asignacionesService.crear({
      idAlumno: idAlumnoNum,
      idRutina: idRutinaNum,
      fechaInicio,
      fechaFin,
    });
    res.status(201).json(asignacion);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'la rutina indicada no existe' });
    }
    throw err;
  }
}

async function eliminar(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const eliminado = await asignacionesService.eliminar(id);
  if (!eliminado) return res.status(404).json({ error: 'asignación no encontrada' });
  res.status(204).send();
}

// CU6: no recibe :id, el alumno sale de X-User-Id (inyectado por el gateway a partir del JWT).
async function miRutina(req, res) {
  const idAlumno = parseId(req.headers['x-user-id']);
  if (idAlumno === null) {
    return res.status(400).json({ error: 'no se pudo determinar el alumno (falta X-User-Id)' });
  }

  const rutina = await asignacionesService.miRutina(idAlumno);
  if (!rutina) return res.status(404).json({ error: 'no tiene una rutina vigente' });
  res.json(rutina);
}

module.exports = { listar, crear, eliminar, miRutina };
