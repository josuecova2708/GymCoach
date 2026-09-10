const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'token no provisto' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'token inválido o expirado' });
  }
}

// Exige el rol para todos los métodos (ej. /api/rutinas es solo para coach).
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'no tiene permiso para esta acción' });
    }
    next();
  };
}

// Exige el rol solo en escritura; GET queda abierto a cualquier rol autenticado
// (ej. /api/ejercicios: cualquiera lista, solo coach crea/edita/borra).
function requireRoleForWrite(...rolesPermitidos) {
  return (req, res, next) => {
    const esEscritura = req.method !== 'GET';
    if (esEscritura && !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'no tiene permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, requireRoleForWrite };
