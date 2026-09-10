const reportesService = require('../services/reportes.service');

async function alumnosVigentes(req, res) {
  res.json(await reportesService.alumnosVigentes());
}

async function ejerciciosMasUsados(req, res) {
  res.json(await reportesService.ejerciciosMasUsados());
}

module.exports = { alumnosVigentes, ejerciciosMasUsados };
