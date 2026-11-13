const Reporte = require('./Reporte');
const reportesRepositoryReal = require('../repositories/reportes.repository');
const ejerciciosClientReal = require('../clients/ejercicios.client');

// Abstracción refinada / ConcreteClass: ejercicios ordenados por cantidad de rutinas que los usan.
class ReporteEjerciciosMasUsados extends Reporte {
  constructor(formato, { reportesRepository = reportesRepositoryReal, ejerciciosClient = ejerciciosClientReal } = {}) {
    super(formato);
    this.reportesRepository = reportesRepository;
    this.ejerciciosClient = ejerciciosClient;
  }

  async obtenerDatos(filtros) {
    return this.reportesRepository.ejerciciosMasUsados();
  }

  // Una sola llamada batch a MS-Ejercicios para todos los nombres (evita el N+1).
  async enriquecer(filas, filtros) {
    const ejercicios = await this.ejerciciosClient.obtenerPorIds(filas.map((f) => f.idEjercicio));
    const porId = new Map(ejercicios.map((e) => [e.idEjercicio, e]));

    return filas.map((f) => {
      const info = porId.get(f.idEjercicio);
      return [info ? info.nombre : `#${f.idEjercicio}`, f.vecesUsado];
    });
  }

  titulo() {
    return 'Ejercicios más usados';
  }

  columnas() {
    return ['Ejercicio', 'Veces usado'];
  }
}

module.exports = ReporteEjerciciosMasUsados;
