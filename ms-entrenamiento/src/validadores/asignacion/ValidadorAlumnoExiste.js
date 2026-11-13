const ValidadorAsignacion = require('./ValidadorAsignacion');

// Eslabón 5: el alumno existe en MS-Usuarios (consulta por HTTP, nunca a su base).
// 404 si no existe; 503 si MS-Usuarios no responde. Va al final porque es el único
// eslabón con llamada de red: si algo anterior falla, no se gasta la llamada.
class ValidadorAlumnoExiste extends ValidadorAsignacion {
  constructor(usuariosClient) {
    super();
    this.usuariosClient = usuariosClient;
  }

  async validar(solicitud) {
    const { existe, disponible } = await this.usuariosClient.verificarAlumno(solicitud.idAlumno);

    if (!disponible) {
      return this.rechazar(503, 'MS-Usuarios no está disponible; no se pudo verificar el alumno');
    }
    if (!existe) {
      return this.rechazar(404, 'el alumno indicado no existe');
    }
    return super.validar(solicitud);
  }
}

module.exports = ValidadorAlumnoExiste;
