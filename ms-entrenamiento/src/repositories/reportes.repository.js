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

module.exports = { alumnosVigentes, ejerciciosMasUsados };
