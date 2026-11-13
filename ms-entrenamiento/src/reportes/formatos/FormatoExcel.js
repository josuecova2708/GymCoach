const ExcelJS = require('exceljs');
const FormatoReporte = require('./FormatoReporte');

const ANCHO_MIN = 10;
const ANCHO_MAX = 50;

// Implementador concreto: .xlsx con exceljs (título, encabezado en negrita, anchos ajustados).
class FormatoExcel extends FormatoReporte {
  constructor() {
    super();
    this.libro = null;
    this.hoja = null;
  }

  iniciar(titulo) {
    this.libro = new ExcelJS.Workbook();
    this.libro.created = new Date();
    // Excel no admite []:*?/\ en el nombre de hoja y lo limita a 31 caracteres.
    const nombreHoja = titulo.replace(/[[\]:*?/\\]/g, '').replace(/\s+/g, ' ').substring(0, 31).trim() || 'Reporte';
    this.hoja = this.libro.addWorksheet(nombreHoja);

    const filaTitulo = this.hoja.addRow([titulo]);
    filaTitulo.font = { bold: true, size: 14 };
    this.hoja.addRow([]);
  }

  agregarEncabezados(columnas) {
    const fila = this.hoja.addRow(columnas);
    fila.font = { bold: true };
    fila.eachCell((celda) => {
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      celda.border = { bottom: { style: 'thin' } };
    });
    columnas.forEach((nombre, i) => {
      this.hoja.getColumn(i + 1).width = Math.max(ANCHO_MIN, String(nombre).length + 2);
    });
  }

  agregarFila(valores) {
    this.hoja.addRow(valores);
    valores.forEach((valor, i) => {
      const columna = this.hoja.getColumn(i + 1);
      const largo = String(valor ?? '').length + 2;
      columna.width = Math.min(ANCHO_MAX, Math.max(columna.width || ANCHO_MIN, largo));
    });
  }

  async finalizar() {
    const buffer = await this.libro.xlsx.writeBuffer();
    return {
      contenido: Buffer.from(buffer),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      nombreArchivo: 'reporte.xlsx',
    };
  }
}

module.exports = FormatoExcel;
