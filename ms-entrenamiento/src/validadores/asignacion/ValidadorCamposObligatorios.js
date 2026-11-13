const ValidadorAsignacion = require('./ValidadorAsignacion');

function esIdValido(valor) {
  return Number.isInteger(valor) && valor > 0;
}

// Acepta solo YYYY-MM-DD y una fecha de calendario real (rechaza 2026-02-30).
function esFechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().substring(0, 10) === valor;
}

// Eslabón 1: campos presentes, ids enteros positivos y fechas válidas → 400.
class ValidadorCamposObligatorios extends ValidadorAsignacion {
  async validar(solicitud) {
    const { idAlumno, idRutina, fechaInicio, fechaFin } = solicitud;

    if (idAlumno == null || idRutina == null || !fechaInicio || !fechaFin) {
      return this.rechazar(400, 'idAlumno, idRutina, fechaInicio y fechaFin son obligatorios');
    }
    if (!esIdValido(idAlumno) || !esIdValido(idRutina)) {
      return this.rechazar(400, 'idAlumno e idRutina deben ser enteros positivos');
    }
    if (!esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
      return this.rechazar(400, 'fechaInicio y fechaFin deben ser fechas válidas (YYYY-MM-DD)');
    }
    return super.validar(solicitud);
  }
}

module.exports = ValidadorCamposObligatorios;
