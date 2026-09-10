const reportesRepository = require('../repositories/reportes.repository');
const ejerciciosClient = require('../clients/ejercicios.client');
const usuariosClient = require('../clients/usuarios.client');

async function alumnosVigentes() {
  const asignaciones = await reportesRepository.alumnosVigentes();

  const resultados = [];
  for (const asignacion of asignaciones) {
    const alumno = await usuariosClient.obtenerAlumnoPorId(asignacion.idAlumno);
    resultados.push({
      idAlumno: asignacion.idAlumno,
      nombreAlumno: alumno ? alumno.nombre : null,
      idRutina: asignacion.idRutina,
      nombreRutina: asignacion.nombreRutina,
      fechaInicio: asignacion.fechaInicio,
      fechaFin: asignacion.fechaFin,
    });
  }
  return resultados;
}

async function ejerciciosMasUsados() {
  const conteos = await reportesRepository.ejerciciosMasUsados();
  if (conteos.length === 0) return [];

  const ids = conteos.map((c) => c.idEjercicio);
  const ejercicios = await ejerciciosClient.obtenerPorIds(ids);
  const porId = new Map(ejercicios.map((e) => [e.idEjercicio, e]));

  return conteos.map((c) => {
    const info = porId.get(c.idEjercicio);
    return {
      idEjercicio: c.idEjercicio,
      nombreEjercicio: info ? info.nombre : null,
      vecesUsado: c.vecesUsado,
    };
  });
}

module.exports = { alumnosVigentes, ejerciciosMasUsados };
