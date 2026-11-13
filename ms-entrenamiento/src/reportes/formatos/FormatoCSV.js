const FormatoReporte = require('./FormatoReporte');

const SEPARADOR = ';';
const BOM_UTF8 = '﻿'; // para que Excel detecte UTF-8 y muestre bien los acentos

// Entre comillas si el valor tiene separador, comillas o saltos de línea; las comillas se duplican.
function escapar(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  if (/[;"\r\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

// Implementador concreto: CSV sin librería, separador ";".
class FormatoCSV extends FormatoReporte {
  constructor() {
    super();
    this.lineas = [];
  }

  // El título no se escribe: una primera fila extra rompería la importación como tabla.
  iniciar(titulo) {
    this.lineas = [];
  }

  agregarEncabezados(columnas) {
    this.lineas.push(columnas.map(escapar).join(SEPARADOR));
  }

  agregarFila(valores) {
    this.lineas.push(valores.map(escapar).join(SEPARADOR));
  }

  async finalizar() {
    return {
      contenido: Buffer.from(BOM_UTF8 + this.lineas.join('\r\n') + '\r\n', 'utf8'),
      contentType: 'text/csv; charset=utf-8',
      nombreArchivo: 'reporte.csv',
    };
  }
}

module.exports = FormatoCSV;
