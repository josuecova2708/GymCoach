const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const alumnosRepository = require('../repositories/alumnos.repository');
const coachesRepository = require('../repositories/coaches.repository');

async function login(email, password) {
  const alumno = await alumnosRepository.obtenerPorEmail(email);
  if (alumno && (await bcrypt.compare(password, alumno.password))) {
    return construirToken({ id: alumno.idAlumno, rol: 'alumno', nombre: alumno.nombre });
  }

  const coach = await coachesRepository.obtenerPorEmail(email);
  if (coach && (await bcrypt.compare(password, coach.password))) {
    return construirToken({ id: coach.idCoach, rol: 'coach', nombre: coach.nombre });
  }

  return null;
}

function construirToken({ id, rol, nombre }) {
  const token = jwt.sign({ id, rol, nombre }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return { token, rol, id, nombre };
}

module.exports = { login };
