const asignacionesRepository = require('../repositories/asignaciones.repository');
const rutinasRepository = require('../repositories/rutinas.repository');
const rutinasService = require('./rutinas.service');

async function listar({ idAlumno } = {}) {
  return asignacionesRepository.listar({ idAlumno });
}

async function crear({ idAlumno, idRutina, fechaInicio, fechaFin }) {
  return asignacionesRepository.crear({ idAlumno, idRutina, fechaInicio, fechaFin });
}

async function eliminar(id) {
  return asignacionesRepository.eliminar(id);
}

// CU6: rutina vigente del alumno autenticado, con los ejercicios hidratados vía HTTP a MS-Ejercicios.
async function miRutina(idAlumno) {
  const asignacion = await asignacionesRepository.obtenerVigentePorAlumno(idAlumno);
  if (!asignacion) return null;

  const rutina = await rutinasRepository.obtenerPorId(asignacion.idRutina);
  const detalle = await rutinasRepository.obtenerDetalle(asignacion.idRutina);
  const ejercicios = await rutinasService.hidratarDetalle(detalle);

  return {
    idAsignacion: asignacion.idAsignacion,
    fechaInicio: asignacion.fechaInicio,
    fechaFin: asignacion.fechaFin,
    rutina: { idRutina: rutina.idRutina, nombre: rutina.nombre, descripcion: rutina.descripcion },
    ejercicios,
  };
}

module.exports = { listar, crear, eliminar, miRutina };
