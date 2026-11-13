// Error de negocio que lanza asignaciones.service cuando la cadena de validadores
// rechaza la solicitud. El controller lo traduce a res.status(status).json({ error }).
class ErrorValidacion extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ErrorValidacion';
    this.status = status;
  }
}

module.exports = ErrorValidacion;
