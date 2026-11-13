const { pool } = require('../db');

// JOIN permitido: Asignacion y Rutina viven en la misma base (bd_entrenamiento).
async function alumnosVigentes() {
  const { rows } = await pool.query(`
    SELECT a."idAsignacion", a."idAlumno", a."idRutina", r."nombre" AS "nombreRutina",
           a."fechaInicio", a."fechaFin"
    FROM "Asignacion" a
    JOIN "Rutina" r ON r."idRutina" = a."idRutina"
    WHERE CURRENT_DATE BETWEEN a."fechaInicio" AND a."fechaFin"
    ORDER BY a."idAsignacion"
  `);
  return rows;
}

async function ejerciciosMasUsados() {
  const { rows } = await pool.query(`
    SELECT "idEjercicio", COUNT(*)::int AS "vecesUsado"
    FROM "DetalleRutina"
    GROUP BY "idEjercicio"
    ORDER BY "vecesUsado" DESC
  `);
  return rows;
}

// CU7 historial: asignaciones de un alumno (JOIN con Rutina, misma base). Si viene un
// rango, se incluyen las asignaciones que se cruzan con él (desde/hasta son opcionales).
async function historialPorAlumno(idAlumno, desde, hasta) {
  const { rows } = await pool.query(
    `SELECT a."idAsignacion", a."idRutina", r."nombre" AS "nombreRutina",
            a."fechaInicio", a."fechaFin"
     FROM "Asignacion" a
     JOIN "Rutina" r ON r."idRutina" = a."idRutina"
     WHERE a."idAlumno" = $1
       AND ($2::date IS NULL OR a."fechaFin" >= $2::date)
       AND ($3::date IS NULL OR a."fechaInicio" <= $3::date)
     ORDER BY a."fechaInicio" DESC`,
    [idAlumno, desde, hasta]
  );
  return rows;
}

module.exports = { alumnosVigentes, ejerciciosMasUsados, historialPorAlumno };
