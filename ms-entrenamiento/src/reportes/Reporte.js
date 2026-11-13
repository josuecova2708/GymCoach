const ErrorReporte = require('./ErrorReporte');

/**
 * Filtros que llegan desde la query string (todos opcionales según el reporte).
 * @typedef {Object} FiltrosReporte
 * @property {string} [idAlumno]
 * @property {string} [desde]  YYYY-MM-DD
 * @property {string} [hasta]  YYYY-MM-DD
 */

// Patrón Bridge — Abstracción: "qué reporte" se genera; delega el "en qué formato"
// al implementador guardado en this.formato (el puente).
// Patrón Template Method — AbstractClass: generar() fija los pasos de todo reporte.
class Reporte {
  /** @param {import('./formatos/FormatoReporte')} formato */
  constructor(formato) {
    /** @protected */
    this.formato = formato;
  }

  /** @param {import('./formatos/FormatoReporte')} formato */
  setFormato(formato) {
    this.formato = formato;
  }

  /**
   * Método plantilla. Las subclases NO lo sobrescriben.
   * @param {FiltrosReporte} filtros
   * @returns {Promise<import('./formatos/FormatoReporte').ArchivoReporte>}
   */
  async generar(filtros = {}) {
    this.validarFiltros(filtros);
    let filas = await this.obtenerDatos(filtros);
    if (filas.length === 0) throw new ErrorReporte(404, 'No hay datos para el filtro seleccionado');
    filas = await this.enriquecer(filas, filtros);
    return this.renderizar(filas);
  }

  /** Hook: por defecto no valida nada. */
  validarFiltros(filtros) {}

  /** @returns {Promise<Object[]>} filas crudas del repository */
  async obtenerDatos(filtros) {
    throw new Error('Método abstracto: obtenerDatos');
  }

  /**
   * Debe devolver cada fila como un arreglo de valores, en el mismo orden que columnas().
   * @returns {Promise<Array<Array<string|number>>>}
   */
  async enriquecer(filas, filtros) {
    throw new Error('Método abstracto: enriquecer');
  }

  /** @returns {string} */
  titulo() {
    throw new Error('Método abstracto: titulo');
  }

  /** @returns {string[]} */
  columnas() {
    throw new Error('Método abstracto: columnas');
  }

  /** Paso fijo: aquí se cruza el puente hacia el formato. */
  renderizar(filas) {
    this.formato.iniciar(this.titulo());
    this.formato.agregarEncabezados(this.columnas());
    filas.forEach((f) => this.formato.agregarFila(f));
    return this.formato.finalizar();
  }
}

module.exports = Reporte;
