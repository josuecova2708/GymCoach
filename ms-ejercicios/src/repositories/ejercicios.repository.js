const pool = require('../db');

// JOIN permitido: GrupoMuscular y Ejercicio viven en la misma base (bd_ejercicios).
const SELECT_BASE = `
  SELECT e."idEjercicio", e."nombre", e."descripcion", e."idGrupo",
         g."nombre" AS "nombreGrupo", e."fotoUrl", e."videoUrl", e."idCoach"
  FROM "Ejercicio" e
  JOIN "GrupoMuscular" g ON g."idGrupo" = e."idGrupo"
`;

async function listar({ idGrupo } = {}) {
  if (idGrupo) {
    const { rows } = await pool.query(`${SELECT_BASE} WHERE e."idGrupo" = $1 ORDER BY e."idEjercicio"`, [idGrupo]);
    return rows;
  }
  const { rows } = await pool.query(`${SELECT_BASE} ORDER BY e."idEjercicio"`);
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(`${SELECT_BASE} WHERE e."idEjercicio" = $1`, [id]);
  return rows[0] || null;
}

// Usado por /ejercicios/batch: hidrata varios ejercicios en una sola consulta (evita el N+1 en CU6).
async function obtenerPorIds(ids) {
  const { rows } = await pool.query(`${SELECT_BASE} WHERE e."idEjercicio" = ANY($1::int[])`, [ids]);
  return rows;
}

async function crear({ nombre, descripcion, idGrupo, fotoUrl, videoUrl, idCoach }) {
  const { rows } = await pool.query(
    `INSERT INTO "Ejercicio" ("nombre", "descripcion", "idGrupo", "fotoUrl", "videoUrl", "idCoach")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING "idEjercicio"`,
    [nombre, descripcion || null, idGrupo, fotoUrl || null, videoUrl || null, idCoach]
  );
  return rows[0].idEjercicio;
}

async function actualizar(id, { nombre, descripcion, idGrupo, fotoUrl, videoUrl }) {
  const { rows } = await pool.query(
    `UPDATE "Ejercicio"
     SET "nombre" = $1, "descripcion" = $2, "idGrupo" = $3, "fotoUrl" = $4, "videoUrl" = $5
     WHERE "idEjercicio" = $6
     RETURNING "idEjercicio"`,
    [nombre, descripcion || null, idGrupo, fotoUrl || null, videoUrl || null, id]
  );
  return rows[0] ? rows[0].idEjercicio : null;
}

async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM "Ejercicio" WHERE "idEjercicio" = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, obtenerPorId, obtenerPorIds, crear, actualizar, eliminar };
