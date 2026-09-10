const { pool, withTransaction } = require('../db');

async function listar() {
  const { rows } = await pool.query('SELECT "idRutina", "nombre", "descripcion" FROM "Rutina" ORDER BY "idRutina"');
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    'SELECT "idRutina", "nombre", "descripcion" FROM "Rutina" WHERE "idRutina" = $1',
    [id]
  );
  return rows[0] || null;
}

async function obtenerDetalle(idRutina) {
  const { rows } = await pool.query(
    'SELECT "idEjercicio", "series", "repeticiones", "descanso" FROM "DetalleRutina" WHERE "idRutina" = $1 ORDER BY "idEjercicio"',
    [idRutina]
  );
  return rows;
}

async function crearConDetalle({ nombre, descripcion, ejercicios }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'INSERT INTO "Rutina" ("nombre", "descripcion") VALUES ($1, $2) RETURNING "idRutina"',
      [nombre, descripcion || null]
    );
    const idRutina = rows[0].idRutina;

    for (const ej of ejercicios) {
      await client.query(
        `INSERT INTO "DetalleRutina" ("idRutina", "idEjercicio", "series", "repeticiones", "descanso")
         VALUES ($1, $2, $3, $4, $5)`,
        [idRutina, ej.idEjercicio, ej.series, ej.repeticiones, ej.descanso]
      );
    }

    return idRutina;
  });
}

async function actualizarConDetalle(id, { nombre, descripcion, ejercicios }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'UPDATE "Rutina" SET "nombre" = $1, "descripcion" = $2 WHERE "idRutina" = $3 RETURNING "idRutina"',
      [nombre, descripcion || null, id]
    );
    if (!rows[0]) return null;

    await client.query('DELETE FROM "DetalleRutina" WHERE "idRutina" = $1', [id]);

    for (const ej of ejercicios) {
      await client.query(
        `INSERT INTO "DetalleRutina" ("idRutina", "idEjercicio", "series", "repeticiones", "descanso")
         VALUES ($1, $2, $3, $4, $5)`,
        [id, ej.idEjercicio, ej.series, ej.repeticiones, ej.descanso]
      );
    }

    return id;
  });
}

async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM "Rutina" WHERE "idRutina" = $1', [id]);
  return rowCount > 0;
}

// Usado para rechazar el DELETE si la rutina está asignada a algún alumno.
async function contarAsignaciones(id) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM "Asignacion" WHERE "idRutina" = $1', [id]);
  return rows[0].total;
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerDetalle,
  crearConDetalle,
  actualizarConDetalle,
  eliminar,
  contarAsignaciones,
};
