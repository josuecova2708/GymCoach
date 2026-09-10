const ejerciciosRepository = require('../repositories/ejercicios.repository');

async function listar({ idGrupo } = {}) {
  return ejerciciosRepository.listar({ idGrupo });
}

async function obtenerPorId(id) {
  return ejerciciosRepository.obtenerPorId(id);
}

async function obtenerPorIds(ids) {
  return ejerciciosRepository.obtenerPorIds(ids);
}

async function crear(datos) {
  const id = await ejerciciosRepository.crear(datos);
  return ejerciciosRepository.obtenerPorId(id);
}

async function actualizar(id, datos) {
  const idActualizado = await ejerciciosRepository.actualizar(id, datos);
  if (!idActualizado) return null;
  return ejerciciosRepository.obtenerPorId(idActualizado);
}

async function eliminar(id) {
  return ejerciciosRepository.eliminar(id);
}

module.exports = { listar, obtenerPorId, obtenerPorIds, crear, actualizar, eliminar };
