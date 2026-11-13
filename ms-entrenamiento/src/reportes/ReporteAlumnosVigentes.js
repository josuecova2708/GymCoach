const Reporte = require('./Reporte');
const reportesRepositoryReal = require('../repositories/reportes.repository');
const usuariosClientReal = require('../clients/usuarios.client');
const formatearFecha = require('../utils/formatearFecha');

// Abstracción refinada / ConcreteClass: alumnos con una asignación vigente hoy.
class ReporteAlumnosVigentes extends Reporte {
  constructor(formato, { reportesRepository = reportesRepositoryReal, usuariosClient = usuariosClientReal } = {}) {
    super(formato);
    this.reportesRepository = reportesRepository;
    this.usuariosClient = usuariosClient;
  }

  async obtenerDatos(filtros) {
    return this.reportesRepository.alumnosVigentes();
  }

  // Una llamada a MS-Usuarios por fila: intencional, documentado en el primer parcial.
  async enriquecer(filas, filtros) {
    const resultado = [];
    for (const fila of filas) {
      const alumno = await this.usuariosClient.obtenerAlumnoPorId(fila.idAlumno);
      resultado.push([
        alumno ? alumno.nombre : `#${fila.idAlumno}`,
        fila.nombreRutina,
        formatearFecha(fila.fechaInicio),
        formatearFecha(fila.fechaFin),
      ]);
    }
    return resultado;
  }

  titulo() {
    return 'Alumnos con rutina vigente';
  }

  columnas() {
    return ['Alumno', 'Rutina', 'Inicio', 'Fin'];
  }
}

module.exports = ReporteAlumnosVigentes;
