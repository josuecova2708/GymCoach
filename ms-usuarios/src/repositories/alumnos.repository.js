const pool = require('../db');

async function listar() {
  const { rows } = await pool.query(
    'SELECT "idAlumno", "nombre", "email", "telefono" FROM "Alumno" ORDER BY "idAlumno"'
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    'SELECT "idAlumno", "nombre", "email", "telefono" FROM "Alumno" WHERE "idAlumno" = $1',
    [id]
  );
  return rows[0] || null;
}

async function obtenerPorEmail(email) {
  const { rows } = await pool.query(
    'SELECT "idAlumno", "nombre", "email", "password" FROM "Alumno" WHERE "email" = $1',
    [email]
  );
  return rows[0] || null;
}

async function crear({ nombre, email, password, telefono }) {
  const { rows } = await pool.query(
    `INSERT INTO "Alumno" ("nombre", "email", "password", "telefono")
     VALUES ($1, $2, $3, $4)
     RETURNING "idAlumno", "nombre", "email", "telefono"`,
    [nombre, email, password, telefono || null]
  );
  return rows[0];
}

async function actualizar(id, { nombre, email, password, telefono }) {
  const { rows } = await pool.query(
    `UPDATE "Alumno"
     SET "nombre" = $1, "email" = $2, "password" = COALESCE($3, "password"), "telefono" = $4
     WHERE "idAlumno" = $5
     RETURNING "idAlumno", "nombre", "email", "telefono"`,
    [nombre, email, password || null, telefono || null, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM "Alumno" WHERE "idAlumno" = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, obtenerPorId, obtenerPorEmail, crear, actualizar, eliminar };
