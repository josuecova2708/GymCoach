/**
 * Solicitud de asignación normalizada desde req.body.
 * @typedef {Object} SolicitudAsignacion
 * @property {number|null} idAlumno
 * @property {number|null} idRutina
 * @property {string|null} fechaInicio  formato YYYY-MM-DD
 * @property {string|null} fechaFin     formato YYYY-MM-DD
 */

/**
 * Resultado que devuelve cualquier eslabón de la cadena.
 * @typedef {Object} ResultadoValidacion
 * @property {boolean} valido
 * @property {number} [status]  código HTTP si valido === false
 * @property {string} [error]   mensaje si valido === false
 */

// Patrón Chain of Responsibility — Handler abstracto.
// Cada validador concreto revisa una sola regla: si falla corta la cadena con
// rechazar(); si pasa, delega al siguiente con super.validar().
class ValidadorAsignacion {
  constructor() {
    /** @protected @type {ValidadorAsignacion|null} */
    this.siguiente = null;
  }

  /**
   * Guarda el siguiente eslabón y lo devuelve para poder encadenar las llamadas.
   * @param {ValidadorAsignacion} validador
   * @returns {ValidadorAsignacion}
   */
  setSiguiente(validador) {
    this.siguiente = validador;
    return validador;
  }

  /**
   * Comportamiento por defecto: delegar al siguiente o, si es el último, aprobar.
   * @param {SolicitudAsignacion} solicitud
   * @returns {Promise<ResultadoValidacion>}
   */
  async validar(solicitud) {
    if (this.siguiente) return this.siguiente.validar(solicitud);
    return { valido: true };
  }

  /**
   * @protected
   * @param {number} status
   * @param {string} mensaje
   * @returns {ResultadoValidacion}
   */
  rechazar(status, mensaje) {
    return { valido: false, status, error: mensaje };
  }
}

module.exports = ValidadorAsignacion;
