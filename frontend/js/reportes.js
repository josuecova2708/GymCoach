inicializarNavbar(['coach']);

const tipoReporte = document.getElementById('tipoReporte');
const filtrosHistorial = document.getElementById('filtrosHistorial');
const filtroAlumno = document.getElementById('filtroAlumno');
const filtroDesde = document.getElementById('filtroDesde');
const filtroHasta = document.getElementById('filtroHasta');
const btnVerPantalla = document.getElementById('btnVerPantalla');
const alertaReporte = document.getElementById('alertaReporte');
const tituloReporte = document.getElementById('tituloReporte');
const tablaReporte = document.getElementById('tablaReporte');
const encabezadoReporte = document.getElementById('encabezadoReporte');
const cuerpoReporte = document.getElementById('cuerpoReporte');

const TIPO_HISTORIAL = 'historial-asignaciones';

async function cargarAlumnos() {
  const alumnos = await apiFetch('/alumnos');
  filtroAlumno.innerHTML = '<option value="">Seleccione un alumno</option>' +
    alumnos.map((a) => `<option value="${a.idAlumno}">${escapeHtml(a.nombre)}</option>`).join('');
}

function onCambiarTipo() {
  filtrosHistorial.classList.toggle('d-none', tipoReporte.value !== TIPO_HISTORIAL);
  ocultarAlerta();
  limpiarTabla();
}

// Arma /reportes/<tipo>?formato=...; los filtros solo se mandan para el historial.
function construirRuta(formato) {
  const params = new URLSearchParams({ formato });
  if (tipoReporte.value === TIPO_HISTORIAL) {
    if (filtroAlumno.value) params.set('idAlumno', filtroAlumno.value);
    if (filtroDesde.value) params.set('desde', filtroDesde.value);
    if (filtroHasta.value) params.set('hasta', filtroHasta.value);
  }
  return `/reportes/${encodeURIComponent(tipoReporte.value)}?${params}`;
}

async function verEnPantalla() {
  ocultarAlerta();
  limpiarTabla();
  try {
    const { titulo, columnas, filas } = await apiFetch(construirRuta('json'));
    dibujarTabla(titulo, columnas, filas);
  } catch (err) {
    manejarError(err);
  }
}

async function descargar(formato) {
  ocultarAlerta();
  try {
    await apiDescargar(construirRuta(formato));
  } catch (err) {
    manejarError(err);
  }
}

// Tabla genérica: sirve para cualquier reporte porque se arma desde columnas y filas.
function dibujarTabla(titulo, columnas, filas) {
  tituloReporte.textContent = titulo;
  encabezadoReporte.innerHTML = `<tr>${columnas.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
  cuerpoReporte.innerHTML = filas
    .map((fila) => `<tr>${fila.map((v) => `<td>${escapeHtml(v)}</td>`).join('')}</tr>`)
    .join('');
  tablaReporte.classList.remove('d-none');
}

function limpiarTabla() {
  tituloReporte.textContent = '';
  encabezadoReporte.innerHTML = '';
  cuerpoReporte.innerHTML = '';
  tablaReporte.classList.add('d-none');
}

// 404 = sin datos para el filtro → advertencia (amarilla). 400 o error de red → roja.
function manejarError(err) {
  if (err.status === 404) mostrarAdvertencia(err.message);
  else mostrarError(err.status ? err.message : 'No se pudo contactar al servidor');
}

function mostrarAdvertencia(mensaje) {
  mostrarAlerta(mensaje, 'alert-warning');
}

function mostrarError(mensaje) {
  mostrarAlerta(mensaje, 'alert-danger');
}

function mostrarAlerta(mensaje, clase) {
  alertaReporte.classList.remove('d-none', 'alert-warning', 'alert-danger');
  alertaReporte.classList.add(clase);
  alertaReporte.textContent = mensaje;
}

function ocultarAlerta() {
  alertaReporte.classList.add('d-none');
}

tipoReporte.addEventListener('change', onCambiarTipo);
btnVerPantalla.addEventListener('click', verEnPantalla);
document.querySelectorAll('[data-formato]').forEach((btn) => {
  btn.addEventListener('click', () => descargar(btn.dataset.formato));
});

cargarAlumnos().catch((err) => mostrarError(err.message));
