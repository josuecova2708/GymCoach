/**
 * Lo que produce cualquier formato al finalizar.
 * @typedef {Object} ArchivoReporte
 * @property {string|Buffer} contenido
 * @property {string} contentType
 * @property {string} nombreArchivo  genérico (ej. "reporte.csv"); el controller arma el nombre final
 */

// Patrón Bridge — Implementador ("interfaz"). Cada formato concreto sabe cómo
// escribir un título, encabezados y filas, sin saber qué reporte las produce.
class FormatoReporte {
  /** @param {string} titulo */
  iniciar(titulo) {
    throw new Error('Método abstracto: iniciar');
  }

  /** @param {string[]} columnas */
  agregarEncabezados(columnas) {
    throw new Error('Método abstracto: agregarEncabezados');
  }

  /** @param {Array<string|number>} valores  en el mismo orden que las columnas */
  agregarFila(valores) {
    throw new Error('Método abstracto: agregarFila');
  }

  /** @returns {Promise<ArchivoReporte>} */
  async finalizar() {
    throw new Error('Método abstracto: finalizar');
  }
}

module.exports = FormatoReporte;
