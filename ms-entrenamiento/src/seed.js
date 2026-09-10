const rutinasRepository = require('./repositories/rutinas.repository');
const asignacionesRepository = require('./repositories/asignaciones.repository');

const USUARIOS_URL = process.env.USUARIOS_URL;
const EJERCICIOS_URL = process.env.EJERCICIOS_URL;

// Mismos emails que siembra ms-usuarios (src/seed.js). Se resuelven por HTTP, nunca
// por acceso directo a su base.
const ALUMNOS_SEED_EMAILS = ['ana@gymcoach.com', 'luis@gymcoach.com'];

const RUTINAS_SEED = [
  {
    nombre: 'Rutina Full Body A',
    descripcion: 'Tren superior e inferior, 3 veces por semana',
    ejercicios: [
      { nombre: 'Press banca', series: 4, repeticiones: 8, descanso: 90 },
      { nombre: 'Sentadilla', series: 4, repeticiones: 10, descanso: 90 },
      { nombre: 'Dominadas', series: 3, repeticiones: 8, descanso: 60 },
      { nombre: 'Plancha', series: 3, repeticiones: 1, descanso: 30 },
    ],
  },
  {
    nombre: 'Rutina Full Body B',
    descripcion: 'Variante con enfoque en hombros y brazos',
    ejercicios: [
      { nombre: 'Press militar', series: 4, repeticiones: 8, descanso: 90 },
      { nombre: 'Remo con barra', series: 4, repeticiones: 10, descanso: 75 },
      { nombre: 'Curl de biceps', series: 3, repeticiones: 12, descanso: 45 },
      { nombre: 'Extension de triceps', series: 3, repeticiones: 12, descanso: 45 },
    ],
  },
];

// Reintenta hasta que el otro servicio responda Y ya tenga datos (evita la carrera
// de arranque: su contenedor puede estar listo antes de terminar su propia siembra).
async function obtenerConReintento(url, intentosMaximos = 15, esperaMs = 2000) {
  for (let intento = 1; intento <= intentosMaximos; intento++) {
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        if (Array.isArray(datos) && datos.length > 0) return datos;
      }
    } catch (err) {
      // el servicio todavía no responde; se reintenta.
    }
    await new Promise((resolve) => setTimeout(resolve, esperaMs));
  }
  return null;
}

function fechaISO(diasDesdeHoy) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasDesdeHoy);
  return fecha.toISOString().substring(0, 10);
}

async function seed() {
  const rutinasExistentes = await rutinasRepository.listar();
  if (rutinasExistentes.length > 0) return; // ya sembrado

  const ejercicios = await obtenerConReintento(`${EJERCICIOS_URL}/ejercicios`);
  const alumnos = await obtenerConReintento(`${USUARIOS_URL}/alumnos`);

  if (!ejercicios || !alumnos) {
    console.error('seed: no se pudo obtener ejercicios/alumnos de los otros servicios, se omite la siembra');
    return;
  }

  const ejercicioPorNombre = new Map(ejercicios.map((e) => [e.nombre, e.idEjercicio]));
  const idsRutinas = [];

  for (const rutina of RUTINAS_SEED) {
    const detalle = rutina.ejercicios
      .filter((ej) => ejercicioPorNombre.has(ej.nombre))
      .map((ej) => ({
        idEjercicio: ejercicioPorNombre.get(ej.nombre),
        series: ej.series,
        repeticiones: ej.repeticiones,
        descanso: ej.descanso,
      }));

    if (detalle.length === 0) continue;

    const idRutina = await rutinasRepository.crearConDetalle({
      nombre: rutina.nombre,
      descripcion: rutina.descripcion,
      ejercicios: detalle,
    });
    idsRutinas.push(idRutina);
  }

  const alumnosSeed = alumnos.filter((a) => ALUMNOS_SEED_EMAILS.includes(a.email));
  const totalAsignaciones = Math.min(idsRutinas.length, alumnosSeed.length);

  // Rango relativo a "hoy" (no fechas fijas): la asignación queda vigente sin
  // importar cuándo se levante el proyecto para la revisión.
  for (let i = 0; i < totalAsignaciones; i++) {
    await asignacionesRepository.crear({
      idAlumno: alumnosSeed[i].idAlumno,
      idRutina: idsRutinas[i],
      fechaInicio: fechaISO(-7),
      fechaFin: fechaISO(30),
    });
  }

  console.log(`semilla: ${idsRutinas.length} rutinas y ${totalAsignaciones} asignaciones creadas`);
}

module.exports = seed;
