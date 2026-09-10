const rutinasRepository = require('../repositories/rutinas.repository');
const ejerciciosClient = require('../clients/ejercicios.client');

async function listar() {
  return rutinasRepository.listar();
}

async function obtenerPorId(id) {
  const rutina = await rutinasRepository.obtenerPorId(id);
  if (!rutina) return null;

  const detalle = await rutinasRepository.obtenerDetalle(id);
  const ejercicios = await hidratarDetalle(detalle);

  return { ...rutina, ejercicios };
}

async function crear({ nombre, descripcion, ejercicios }) {
  const idRutina = await rutinasRepository.crearConDetalle({ nombre, descripcion, ejercicios });
  return obtenerPorId(idRutina);
}

async function actualizar(id, { nombre, descripcion, ejercicios }) {
  const actualizado = await rutinasRepository.actualizarConDetalle(id, { nombre, descripcion, ejercicios });
  if (!actualizado) return null;
  return obtenerPorId(id);
}

async function eliminar(id) {
  const totalAsignaciones = await rutinasRepository.contarAsignaciones(id);
  if (totalAsignaciones > 0) {
    const error = new Error('la rutina está asignada a uno o más alumnos');
    error.conflict = true;
    throw error;
  }
  return rutinasRepository.eliminar(id);
}

// Compartido con asignaciones.service (mi-rutina): junta el detalle propio con los
// datos de MS-Ejercicios en una sola llamada batch. Si MS-Ejercicios no responde,
// el cliente ya degrada a [] y acá queda con nombre/fotoUrl/videoUrl en null.
async function hidratarDetalle(detalle) {
  if (detalle.length === 0) return [];

  const ids = detalle.map((d) => d.idEjercicio);
  const ejerciciosInfo = await ejerciciosClient.obtenerPorIds(ids);
  const porId = new Map(ejerciciosInfo.map((e) => [e.idEjercicio, e]));

  return detalle.map((d) => {
    const info = porId.get(d.idEjercicio);
    return {
      idEjercicio: d.idEjercicio,
      series: d.series,
      repeticiones: d.repeticiones,
      descanso: d.descanso,
      nombre: info ? info.nombre : null,
      fotoUrl: info ? info.fotoUrl : null,
      videoUrl: info ? info.videoUrl : null,
    };
  });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, hidratarDetalle };
