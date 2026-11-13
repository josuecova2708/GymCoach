const asignacionesService = require('../services/asignaciones.service');
const parseId = require('../utils/parseId');
const ErrorValidacion = require('../errores/ErrorValidacion');

async function listar(req, res) {
  let idAlumno;
  if (req.query.idAlumno !== undefined) {
    idAlumno = parseId(req.query.idAlumno);
    if (idAlumno === null) return res.status(400).json({ error: 'idAlumno inválido' });
  }
  res.json(await asignacionesService.listar({ idAlumno }));
}

// CU5: las validaciones viven en la cadena de validadores (asignaciones.service).
async function crear(req, res) {
  try {
    const asignacion = await asignacionesService.crear(req.body || {});
    res.status(201).json(asignacion);
  } catch (err) {
    if (err instanceof ErrorValidacion) {
      return res.status(err.status).json({ error: err.message });
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
