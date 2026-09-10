const bcrypt = require('bcrypt');
const alumnosRepository = require('../repositories/alumnos.repository');

const SALT_ROUNDS = 10;

async function listar() {
  return alumnosRepository.listar();
}

async function obtenerPorId(id) {
  return alumnosRepository.obtenerPorId(id);
}

async function crear({ nombre, email, password, telefono }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return alumnosRepository.crear({ nombre, email, password: hash, telefono });
}

async function actualizar(id, { nombre, email, password, telefono }) {
  const hash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;
  return alumnosRepository.actualizar(id, { nombre, email, password: hash, telefono });
}

async function eliminar(id) {
  return alumnosRepository.eliminar(id);
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
