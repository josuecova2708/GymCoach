const asignacionesRepository = require('../repositories/asignaciones.repository');
const rutinasRepository = require('../repositories/rutinas.repository');
const rutinasService = require('./rutinas.service');
const usuariosClient = require('../clients/usuarios.client');
const parseId = require('../utils/parseId');
const ErrorValidacion = require('../errores/ErrorValidacion');
const ValidadorCamposObligatorios = require('../validadores/asignacion/ValidadorCamposObligatorios');
const ValidadorRangoFechas = require('../validadores/asignacion/ValidadorRangoFechas');
const ValidadorRutinaExiste = require('../validadores/asignacion/ValidadorRutinaExiste');
const ValidadorSolapamiento = require('../validadores/asignacion/ValidadorSolapamiento');
const ValidadorAlumnoExiste = require('../validadores/asignacion/ValidadorAlumnoExiste');

// Patrón Chain of Responsibility — este service es el Cliente: arma la cadena una
// sola vez al cargar el módulo y le entrega cada solicitud al primer eslabón.
function construirCadena() {
  const campos = new ValidadorCamposObligatorios();
  const fechas = new ValidadorRangoFechas();
  const rutina = new ValidadorRutinaExiste(rutinasRepository);
  const solapamiento = new ValidadorSolapamiento(asignacionesRepository);
  const alumno = new ValidadorAlumnoExiste(usuariosClient);

  campos.setSiguiente(fechas).setSiguiente(rutina).setSiguiente(solapamiento).setSiguiente(alumno);
  return campos;
}

const cadenaValidacion = construirCadena();

// Ausente → null (ValidadorCamposObligatorios: "obligatorio");
// presente pero no entero → NaN (ValidadorCamposObligatorios: "entero positivo").
function normalizarId(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const id = parseId(valor);
  return id === null ? NaN : id;
}

function normalizarFecha(valor) {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
}

async function listar({ idAlumno } = {}) {
  return asignacionesRepository.listar({ idAlumno });
}

async function crear(datos = {}) {
  /** @type {import('../validadores/asignacion/ValidadorAsignacion').SolicitudAsignacion} */
  const solicitud = {
    idAlumno: normalizarId(datos.idAlumno),
    idRutina: normalizarId(datos.idRutina),
    fechaInicio: normalizarFecha(datos.fechaInicio),
    fechaFin: normalizarFecha(datos.fechaFin),
  };

  const r = await cadenaValidacion.validar(solicitud);
  if (!r.valido) throw new ErrorValidacion(r.status, r.error);

  return asignacionesRepository.crear(solicitud);
}

async function eliminar(id) {
  return asignacionesRepository.eliminar(id);
}

// CU6: rutina vigente del alumno autenticado, con los ejercicios hidratados vía HTTP a MS-Ejercicios.
async function miRutina(idAlumno) {
  const asignacion = await asignacionesRepository.obtenerVigentePorAlumno(idAlumno);
  if (!asignacion) return null;

  const rutina = await rutinasRepository.obtenerPorId(asignacion.idRutina);
  const detalle = await rutinasRepository.obtenerDetalle(asignacion.idRutina);
  const ejercicios = await rutinasService.hidratarDetalle(detalle);

  return {
    idAsignacion: asignacion.idAsignacion,
    fechaInicio: asignacion.fechaInicio,
    fechaFin: asignacion.fechaFin,
    rutina: { idRutina: rutina.idRutina, nombre: rutina.nombre, descripcion: rutina.descripcion },
    ejercicios,
  };
}

module.exports = { listar, crear, eliminar, miRutina };
