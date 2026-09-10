const authService = require('../services/auth.service');

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const resultado = await authService.login(email, password);

  if (!resultado) {
    return res.status(401).json({ error: 'credenciales inválidas' });
  }

  res.json(resultado);
}

module.exports = { login };
