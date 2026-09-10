const gruposRepository = require('./repositories/grupos.repository');
const ejerciciosRepository = require('./repositories/ejercicios.repository');

const USUARIOS_URL = process.env.USUARIOS_URL;

// Mismas credenciales que siembra ms-usuarios (src/seed.js). Nunca se lee su base
// directamente: el id real del coach se resuelve haciendo login, igual que lo haría
// cualquier cliente de la API pública.
const COACH_SEED = { email: 'coach@gymcoach.com', password: 'coach123' };

const GRUPOS_SEED = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

const EJERCICIOS_SEED = [
  { grupo: 'Pecho', nombre: 'Press banca', descripcion: 'Con barra, banco plano' },
  { grupo: 'Pecho', nombre: 'Press inclinado', descripcion: 'Con mancuernas' },
  { grupo: 'Pecho', nombre: 'Aperturas con mancuerna', descripcion: 'Banco plano' },
  { grupo: 'Espalda', nombre: 'Dominadas', descripcion: 'Peso corporal' },
  { grupo: 'Espalda', nombre: 'Remo con barra', descripcion: 'Espalda media' },
  { grupo: 'Espalda', nombre: 'Peso muerto', descripcion: 'Cadena posterior completa' },
  { grupo: 'Piernas', nombre: 'Sentadilla', descripcion: 'Con barra' },
  { grupo: 'Piernas', nombre: 'Prensa', descripcion: 'Maquina de prensa' },
  { grupo: 'Piernas', nombre: 'Zancadas', descripcion: 'Con mancuernas' },
  { grupo: 'Hombros', nombre: 'Press militar', descripcion: 'De pie, con barra' },
  { grupo: 'Hombros', nombre: 'Elevaciones laterales', descripcion: 'Con mancuernas' },
  { grupo: 'Brazos', nombre: 'Curl de biceps', descripcion: 'Con mancuernas' },
  { grupo: 'Brazos', nombre: 'Extension de triceps', descripcion: 'En polea' },
  { grupo: 'Core', nombre: 'Plancha', descripcion: 'Isometrico' },
  { grupo: 'Core', nombre: 'Crunch abdominal', descripcion: 'En el piso' },
];

// MS-Usuarios puede tardar unos segundos en levantar; se reintenta en vez de fallar.
async function resolverIdCoach(intentosMaximos = 15, esperaMs = 2000) {
  for (let intento = 1; intento <= intentosMaximos; intento++) {
    try {
      const respuesta = await fetch(`${USUARIOS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(COACH_SEED),
      });
      if (respuesta.ok) {
        const { id } = await respuesta.json();
        return id;
      }
    } catch (err) {
      // MS-Usuarios todavía no responde; se reintenta.
    }
    await new Promise((resolve) => setTimeout(resolve, esperaMs));
  }
  return null;
}

async function seed() {
  const grupos = await gruposRepository.listar();
  if (grupos.length > 0) return; // ya sembrado

  const idCoach = await resolverIdCoach();
  if (idCoach === null) {
    console.error('seed: no se pudo obtener el coach desde MS-Usuarios, se omite la siembra');
    return;
  }

  const idPorGrupo = new Map();
  for (const nombre of GRUPOS_SEED) {
    const grupo = await gruposRepository.crear({ nombre });
    idPorGrupo.set(nombre, grupo.idGrupo);
  }

  for (const ej of EJERCICIOS_SEED) {
    await ejerciciosRepository.crear({
      nombre: ej.nombre,
      descripcion: ej.descripcion,
      idGrupo: idPorGrupo.get(ej.grupo),
      fotoUrl: null,
      videoUrl: null,
      idCoach,
    });
  }

  console.log(`semilla: ${GRUPOS_SEED.length} grupos y ${EJERCICIOS_SEED.length} ejercicios creados`);
}

module.exports = seed;
