const PDFDocument = require('pdfkit');
const FormatoReporte = require('./FormatoReporte');

const MARGEN = 50;
const PADDING = 4;

function fechaHoraActual() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Implementador concreto: .pdf con pdfkit (título, fecha de generación y una tabla
// simple que repite el encabezado al saltar de página).
class FormatoPDF extends FormatoReporte {
  constructor() {
    super();
    this.doc = null;
    this.partes = [];
    this.columnas = [];
    this.anchoColumna = 0;
  }

  iniciar(titulo) {
    this.doc = new PDFDocument({ size: 'A4', margin: MARGEN, info: { Title: titulo } });
    this.partes = [];
    this.doc.on('data', (parte) => this.partes.push(parte));

    this.doc.font('Helvetica-Bold').fontSize(16).text(titulo);
    this.doc.font('Helvetica').fontSize(9).fillColor('#555555').text(`Generado el ${fechaHoraActual()}`);
    this.doc.fillColor('black').moveDown(1);
  }

  agregarEncabezados(columnas) {
    this.columnas = columnas;
    this.anchoColumna = (this.doc.page.width - MARGEN * 2) / columnas.length;
    this.dibujarFila(columnas, true);
  }

  agregarFila(valores) {
    const alto = this.altoFila(valores, false);
    if (this.doc.y + alto > this.doc.page.height - MARGEN) {
      this.doc.addPage();
      this.dibujarFila(this.columnas, true);
    }
    this.dibujarFila(valores, false);
  }

  async finalizar() {
    const fin = new Promise((resolve) => this.doc.on('end', resolve));
    this.doc.end();
    await fin;
    return {
      contenido: Buffer.concat(this.partes),
      contentType: 'application/pdf',
      nombreArchivo: 'reporte.pdf',
    };
  }

  // --- auxiliares privados ---

  altoFila(valores, negrita) {
    this.doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
    const altos = valores.map((v) =>
      this.doc.heightOfString(String(v ?? ''), { width: this.anchoColumna - PADDING * 2 })
    );
    return Math.max(...altos) + PADDING * 2;
  }

  dibujarFila(valores, negrita) {
    const alto = this.altoFila(valores, negrita); // también deja la fuente correcta
    const y = this.doc.y;
    const anchoTotal = this.anchoColumna * valores.length;

    if (negrita) {
      this.doc.rect(MARGEN, y, anchoTotal, alto).fill('#e0e0e0');
      this.doc.fillColor('black');
    }

    valores.forEach((v, i) => {
      this.doc.text(String(v ?? ''), MARGEN + i * this.anchoColumna + PADDING, y + PADDING, {
        width: this.anchoColumna - PADDING * 2,
      });
    });

    this.doc.moveTo(MARGEN, y + alto).lineTo(MARGEN + anchoTotal, y + alto)
      .lineWidth(0.5).strokeColor('#999999').stroke();

    this.doc.x = MARGEN;
    this.doc.y = y + alto;
  }
}

module.exports = FormatoPDF;
