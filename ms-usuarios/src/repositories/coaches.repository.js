const pool = require('../db');

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    'SELECT "idCoach", "nombre", "email" FROM "Coach" WHERE "idCoach" = $1',
    [id]
  );
  return rows[0] || null;
}

async function obtenerPorEmail(email) {
  const { rows } = await pool.query(
    'SELECT "idCoach", "nombre", "email", "password" FROM "Coach" WHERE "email" = $1',
    [email]
  );
  return rows[0] || null;
}

// Solo la usa el seed de arranque (src/seed.js): no hay POST /coaches en el contrato de API.
async function crear({ nombre, email, password }) {
  const { rows } = await pool.query(
    `INSERT INTO "Coach" ("nombre", "email", "password")
     VALUES ($1, $2, $3)
     RETURNING "idCoach", "nombre", "email"`,
    [nombre, email, password]
  );
  return rows[0];
}

module.exports = { obtenerPorId, obtenerPorEmail, crear };
