const ValidadorAsignacion = require('./ValidadorAsignacion');

// Eslabón 3: la rutina existe en bd_entrenamiento → 404.
class ValidadorRutinaExiste extends ValidadorAsignacion {
  constructor(rutinasRepository) {
    super();
    this.rutinasRepository = rutinasRepository;
  }

  async validar(solicitud) {
    const rutina = await this.rutinasRepository.obtenerPorId(solicitud.idRutina);
    if (!rutina) {
      return this.rechazar(404, 'la rutina indicada no existe');
    }
    return super.validar(solicitud);
  }
}

module.exports = ValidadorRutinaExiste;
