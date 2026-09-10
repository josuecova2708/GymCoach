const { pool } = require('../db');

async function listar({ idAlumno } = {}) {
  if (idAlumno) {
    const { rows } = await pool.query(
      'SELECT "idAsignacion", "idAlumno", "idRutina", "fechaInicio", "fechaFin" FROM "Asignacion" WHERE "idAlumno" = $1 ORDER BY "idAsignacion"',
      [idAlumno]
    );
    return rows;
  }
  const { rows } = await pool.query(
    'SELECT "idAsignacion", "idAlumno", "idRutina", "fechaInicio", "fechaFin" FROM "Asignacion" ORDER BY "idAsignacion"'
  );
  return rows;
}

async function crear({ idAlumno, idRutina, fechaInicio, fechaFin }) {
  const { rows } = await pool.query(
    `INSERT INTO "Asignacion" ("idAlumno", "idRutina", "fechaInicio", "fechaFin")
     VALUES ($1, $2, $3, $4)
     RETURNING "idAsignacion", "idAlumno", "idRutina", "fechaInicio", "fechaFin"`,
    [idAlumno, idRutina, fechaInicio, fechaFin]
  );
  return rows[0];
}

async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM "Asignacion" WHERE "idAsignacion" = $1', [id]);
  return rowCount > 0;
}

// CU6: la asignación vigente es la que contiene la fecha de hoy en su rango.
async function obtenerVigentePorAlumno(idAlumno) {
  const { rows } = await pool.query(
    `SELECT "idAsignacion", "idAlumno", "idRutina", "fechaInicio", "fechaFin"
     FROM "Asignacion"
     WHERE "idAlumno" = $1 AND CURRENT_DATE BETWEEN "fechaInicio" AND "fechaFin"
     ORDER BY "fechaInicio" DESC
     LIMIT 1`,
    [idAlumno]
  );
  return rows[0] || null;
}

module.exports = { listar, crear, eliminar, obtenerVigentePorAlumno };
