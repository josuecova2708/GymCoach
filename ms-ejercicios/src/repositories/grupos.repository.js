const pool = require('../db');

async function listar() {
  const { rows } = await pool.query('SELECT "idGrupo", "nombre" FROM "GrupoMuscular" ORDER BY "idGrupo"');
  return rows;
}

async function crear({ nombre }) {
  const { rows } = await pool.query(
    'INSERT INTO "GrupoMuscular" ("nombre") VALUES ($1) RETURNING "idGrupo", "nombre"',
    [nombre]
  );
  return rows[0];
}

async function actualizar(id, { nombre }) {
  const { rows } = await pool.query(
    'UPDATE "GrupoMuscular" SET "nombre" = $1 WHERE "idGrupo" = $2 RETURNING "idGrupo", "nombre"',
    [nombre, id]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM "GrupoMuscular" WHERE "idGrupo" = $1', [id]);
  return rowCount > 0;
}

// Usado para rechazar el DELETE si el grupo tiene ejercicios asociados.
async function contarEjercicios(id) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM "Ejercicio" WHERE "idGrupo" = $1', [id]);
  return rows[0].total;
}

module.exports = { listar, crear, actualizar, eliminar, contarEjercicios };
