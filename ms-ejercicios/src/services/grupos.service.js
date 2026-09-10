const gruposRepository = require('../repositories/grupos.repository');

async function listar() {
  return gruposRepository.listar();
}

async function crear({ nombre }) {
  return gruposRepository.crear({ nombre });
}

async function actualizar(id, { nombre }) {
  return gruposRepository.actualizar(id, { nombre });
}

async function eliminar(id) {
  const totalEjercicios = await gruposRepository.contarEjercicios(id);
  if (totalEjercicios > 0) {
    const error = new Error('el grupo muscular tiene ejercicios asociados');
    error.conflict = true;
    throw error;
  }
  return gruposRepository.eliminar(id);
}

module.exports = { listar, crear, actualizar, eliminar };
