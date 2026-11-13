const path = require('path');
const reportesService = require('../services/reportes.service');
const ErrorReporte = require('../reportes/ErrorReporte');
const formatearFecha = require('../utils/formatearFecha');

function vacioAUndefined(valor) {
  return valor === undefined || valor === '' ? undefined : valor;
}

// CU7: GET /reportes/:tipo?formato=json|csv|xlsx|pdf&idAlumno=&desde=&hasta=
async function generar(req, res) {
  const { tipo } = req.params;
  const formato = req.query.formato || 'json';
  const filtros = {
    idAlumno: vacioAUndefined(req.query.idAlumno),
    desde: vacioAUndefined(req.query.desde),
    hasta: vacioAUndefined(req.query.hasta),
  };

  try {
    const archivo = await reportesService.generar(tipo, formato, filtros);

    res.set('Content-Type', archivo.contentType);
    if (formato !== 'json') {
      // El formato solo conoce su extensión; el nombre final lo arma el controller.
      const extension = path.extname(archivo.nombreArchivo);
      const nombre = `reporte-${tipo}-${formatearFecha(new Date())}${extension}`;
      res.set('Content-Disposition', `attachment; filename="${nombre}"`);
    }
    res.send(archivo.contenido);
  } catch (err) {
    if (err instanceof ErrorReporte) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

module.exports = { generar };
