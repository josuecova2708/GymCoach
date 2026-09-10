const coachesRepository = require('../repositories/coaches.repository');

async function obtenerPorId(id) {
  return coachesRepository.obtenerPorId(id);
}

module.exports = { obtenerPorId };
