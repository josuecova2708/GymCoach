const coachesService = require('../services/coaches.service');
const parseId = require('../utils/parseId');

async function obtenerPorId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'id inválido' });

  const coach = await coachesService.obtenerPorId(id);
  if (!coach) return res.status(404).json({ error: 'coach no encontrado' });

  res.json(coach);
}

module.exports = { obtenerPorId };
