// Error de negocio de CU7 (filtro inválido, tipo/formato inexistente, sin datos).
// El controller lo traduce a res.status(status).json({ error }).
class ErrorReporte extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ErrorReporte';
    this.status = status;
  }
}

module.exports = ErrorReporte;
