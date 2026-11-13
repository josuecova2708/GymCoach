const USUARIOS_URL = process.env.USUARIOS_URL;
const TIMEOUT_MS = 3000;

// Igual que ejercicios.client: si MS-Usuarios no responde, degrada a null en vez de romper el reporte.
async function obtenerAlumnoPorId(id) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${USUARIOS_URL}/alumnos/${id}`;
    console.log(`[usuarios.client] GET ${url}`);
    const respuesta = await fetch(url, { signal: controller.signal });

    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch (err) {
    console.error(`[usuarios.client] no se pudo contactar a MS-Usuarios: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// CU5 (ValidadorAlumnoExiste): a diferencia de obtenerAlumnoPorId, distingue
// "el alumno no existe" (404) de "MS-Usuarios no responde" (timeout, red o 5xx).
async function verificarAlumno(id) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${USUARIOS_URL}/alumnos/${id}`;
    console.log(`[usuarios.client] GET ${url} (verificarAlumno)`);
    const respuesta = await fetch(url, { signal: controller.signal });

    if (respuesta.ok) return { existe: true, disponible: true };
    if (respuesta.status === 404) return { existe: false, disponible: true };

    console.error(`[usuarios.client] MS-Usuarios respondió ${respuesta.status}`);
    return { existe: false, disponible: false };
  } catch (err) {
    console.error(`[usuarios.client] no se pudo contactar a MS-Usuarios: ${err.message}`);
    return { existe: false, disponible: false };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { obtenerAlumnoPorId, verificarAlumno };
