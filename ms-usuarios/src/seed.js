const bcrypt = require('bcrypt');
const coachesRepository = require('./repositories/coaches.repository');
const alumnosRepository = require('./repositories/alumnos.repository');

const COACH_SEED = {
  nombre: 'Coach Demo',
  email: 'coach@gymcoach.com',
  password: 'coach123',
};

// Credenciales fijas de demo. ms-ejercicios y ms-entrenamiento las usan (o usan estos
// mismos emails) para resolver ids reales por HTTP al armar su propia siembra —
// ver sus respectivos src/seed.js. Nunca acceden a esta base directamente.
const ALUMNOS_SEED = [
  { nombre: 'Ana Gutierrez', email: 'ana@gymcoach.com', password: 'alumno123', telefono: '70011111' },
  { nombre: 'Luis Fernandez', email: 'luis@gymcoach.com', password: 'alumno123', telefono: '70022222' },
  { nombre: 'Maria Rojas', email: 'maria@gymcoach.com', password: 'alumno123', telefono: '70033333' },
];

async function seedCoach() {
  const existente = await coachesRepository.obtenerPorEmail(COACH_SEED.email);
  if (existente) return;

  const hash = await bcrypt.hash(COACH_SEED.password, 10);
  await coachesRepository.crear({ nombre: COACH_SEED.nombre, email: COACH_SEED.email, password: hash });
  console.log(`coach semilla creado: ${COACH_SEED.email}`);
}

async function seedAlumnos() {
  for (const alumno of ALUMNOS_SEED) {
    const existente = await alumnosRepository.obtenerPorEmail(alumno.email);
    if (existente) continue;

    const hash = await bcrypt.hash(alumno.password, 10);
    await alumnosRepository.crear({ ...alumno, password: hash });
    console.log(`alumno semilla creado: ${alumno.email}`);
  }
}

async function seed() {
  await seedCoach();
  await seedAlumnos();
}

module.exports = seed;
