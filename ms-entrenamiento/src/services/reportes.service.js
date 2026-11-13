const ErrorReporte = require('../reportes/ErrorReporte');
const ReporteAlumnosVigentes = require('../reportes/ReporteAlumnosVigentes');
const ReporteEjerciciosMasUsados = require('../reportes/ReporteEjerciciosMasUsados');
const ReporteHistorialAsignaciones = require('../reportes/ReporteHistorialAsignaciones');
const FormatoPantalla = require('../reportes/formatos/FormatoPantalla');
const FormatoCSV = require('../reportes/formatos/FormatoCSV');
const FormatoExcel = require('../reportes/formatos/FormatoExcel');
const FormatoPDF = require('../reportes/formatos/FormatoPDF');

// Cliente del Bridge: elige la Abstracción (tipo) y el Implementador (formato) y los une.
// 3 reportes × 4 formatos = 12 combinaciones con solo 7 clases concretas.
const reportes = {
  'alumnos-vigentes': ReporteAlumnosVigentes,
  'ejercicios-mas-usados': ReporteEjerciciosMasUsados,
  'historial-asignaciones': ReporteHistorialAsignaciones,
};

const formatos = {
  json: FormatoPantalla,
  csv: FormatoCSV,
  xlsx: FormatoExcel,
  pdf: FormatoPDF,
};

async function generar(tipo, formato, filtros) {
  // Object.hasOwn evita que "constructor" o "__proto__" pasen como tipo/formato válido.
  if (typeof tipo !== 'string' || !Object.hasOwn(reportes, tipo)) {
    throw new ErrorReporte(400, `tipo de reporte inválido; use: ${Object.keys(reportes).join(', ')}`);
  }
  if (typeof formato !== 'string' || !Object.hasOwn(formatos, formato)) {
    throw new ErrorReporte(400, `formato inválido; use: ${Object.keys(formatos).join(', ')}`);
  }

  const f = new formatos[formato]();
  const r = new reportes[tipo](f);
  return r.generar(filtros);
}

module.exports = { generar };
