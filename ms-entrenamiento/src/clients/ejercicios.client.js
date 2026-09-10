const EJERCICIOS_URL = process.env.EJERCICIOS_URL;
const TIMEOUT_MS = 3000;

// Si MS-Ejercicios no responde, degrada devolviendo [] en vez de tirar un 500.
// El llamador (rutinas/asignaciones) queda a cargo de mostrar los datos sin hidratar.
async function obtenerPorIds(ids) {
  if (!ids || ids.length === 0) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${EJERCICIOS_URL}/ejercicios/batch?ids=${ids.join(',')}`;
    console.log(`[ejercicios.client] GET ${url}`);
    const respuesta = await fetch(url, { signal: controller.signal });

    if (!respuesta.ok) {
      console.error(`[ejercicios.client] MS-Ejercicios respondió ${respuesta.status}`);
      return [];
    }

    return await respuesta.json();
  } catch (err) {
    console.error(`[ejercicios.client] no se pudo contactar a MS-Ejercicios: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { obtenerPorIds };
