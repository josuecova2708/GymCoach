const ValidadorAsignacion = require('./ValidadorAsignacion');

// Eslabón 4: el alumno no tiene otra asignación con fechas cruzadas → 409 (advertencia del CU5).
class ValidadorSolapamiento extends ValidadorAsignacion {
  constructor(asignacionesRepository) {
    super();
    this.asignacionesRepository = asignacionesRepository;
  }

  async validar(solicitud) {
    const { idAlumno, fechaInicio, fechaFin } = solicitud;
    const solapadas = await this.asignacionesRepository.buscarSolapadas(idAlumno, fechaInicio, fechaFin);

    if (solapadas.length > 0) {
      const s = solapadas[0];
      return this.rechazar(
        409,
        `el alumno ya tiene una asignación que se cruza con esas fechas ` +
          `(#${s.idAsignacion}: ${formatear(s.fechaInicio)} a ${formatear(s.fechaFin)})`
      );
    }
    return super.validar(solicitud);
  }
}

// pg devuelve DATE como Date en hora local del contenedor.
function formatear(fecha) {
  if (!(fecha instanceof Date)) return String(fecha).substring(0, 10);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}

module.exports = ValidadorSolapamiento;
