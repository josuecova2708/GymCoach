const Reporte = require('./Reporte');
const ErrorReporte = require('./ErrorReporte');
const reportesRepositoryReal = require('../repositories/reportes.repository');
const usuariosClientReal = require('../clients/usuarios.client');
const parseId = require('../utils/parseId');
const formatearFecha = require('../utils/formatearFecha');

function esFechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().substring(0, 10) === valor;
}

// Abstracción refinada / ConcreteClass: todas las asignaciones de un alumno, con su estado.
class ReporteHistorialAsignaciones extends Reporte {
  constructor(formato, { reportesRepository = reportesRepositoryReal, usuariosClient = usuariosClientReal } = {}) {
    super(formato);
    this.reportesRepository = reportesRepository;
    this.usuariosClient = usuariosClient;
    /** Se resuelve en enriquecer() y lo lee titulo(). */
    this.nombreAlumno = null;
  }

  // Sobrescribe el hook: idAlumno obligatorio; si vienen desde y hasta, desde ≤ hasta.
  validarFiltros(filtros) {
    const { idAlumno, desde, hasta } = filtros;

    const id = parseId(idAlumno);
    if (id === null || id <= 0) {
      throw new ErrorReporte(400, 'idAlumno es obligatorio y debe ser un entero positivo');
    }
    if ((desde && !esFechaValida(desde)) || (hasta && !esFechaValida(hasta))) {
      throw new ErrorReporte(400, 'desde y hasta deben ser fechas válidas (YYYY-MM-DD)');
    }
    if (desde && hasta && desde > hasta) {
      throw new ErrorReporte(400, 'desde no puede ser posterior a hasta');
    }
  }

  async obtenerDatos(filtros) {
    return this.reportesRepository.historialPorAlumno(
      Number(filtros.idAlumno),
      filtros.desde || null,
      filtros.hasta || null
    );
  }

  async enriquecer(filas, filtros) {
    // Una sola llamada a MS-Usuarios para el título (todas las filas son del mismo alumno).
    const alumno = await this.usuariosClient.obtenerAlumnoPorId(Number(filtros.idAlumno));
    this.nombreAlumno = alumno ? alumno.nombre : `#${filtros.idAlumno}`;

    const hoy = formatearFecha(new Date());
    return filas.map((f) => {
      const inicio = formatearFecha(f.fechaInicio);
      const fin = formatearFecha(f.fechaFin);
      let estado = 'Vigente';
      if (fin < hoy) estado = 'Vencida';
      else if (inicio > hoy) estado = 'Programada';
      return [f.nombreRutina, inicio, fin, estado];
    });
  }

  titulo() {
    return `Historial de asignaciones: ${this.nombreAlumno}`;
  }

  columnas() {
    return ['Rutina', 'Inicio', 'Fin', 'Estado'];
  }
}

module.exports = ReporteHistorialAsignaciones;
