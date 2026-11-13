const FormatoReporte = require('./FormatoReporte');

// Implementador concreto: JSON { titulo, columnas, filas } para dibujar la tabla en reportes.html.
// No es una descarga (el controller no le pone Content-Disposition).
class FormatoPantalla extends FormatoReporte {
  constructor() {
    super();
    this.titulo = '';
    this.columnas = [];
    this.filas = [];
  }

  iniciar(titulo) {
    this.titulo = titulo;
    this.columnas = [];
    this.filas = [];
  }

  agregarEncabezados(columnas) {
    this.columnas = columnas;
  }

  agregarFila(valores) {
    this.filas.push(valores);
  }

  async finalizar() {
    return {
      contenido: JSON.stringify({ titulo: this.titulo, columnas: this.columnas, filas: this.filas }),
      contentType: 'application/json; charset=utf-8',
      nombreArchivo: 'reporte.json',
    };
  }
}

module.exports = FormatoPantalla;
