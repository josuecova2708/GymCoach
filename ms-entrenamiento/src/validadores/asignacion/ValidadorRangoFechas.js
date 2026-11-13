const ValidadorAsignacion = require('./ValidadorAsignacion');

// Eslabón 2: fechaFin > fechaInicio → 400.
// Las fechas ya llegan en YYYY-MM-DD (eslabón 1), así que la comparación de texto es cronológica.
class ValidadorRangoFechas extends ValidadorAsignacion {
  async validar(solicitud) {
    if (!(solicitud.fechaFin > solicitud.fechaInicio)) {
      return this.rechazar(400, 'fechaFin debe ser posterior a fechaInicio');
    }
    return super.validar(solicitud);
  }
}

module.exports = ValidadorRangoFechas;
