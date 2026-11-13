const API_BASE_URL = 'http://localhost:3000/api';

// Escapa texto/URLs de la API antes de meterlos en innerHTML (evita XSS en las tablas).
function escapeHtml(valor) {
  const div = document.createElement('div');
  div.textContent = valor === null || valor === undefined ? '' : String(valor);
  return div.innerHTML;
}

function getToken() {
  return localStorage.getItem('token');
}

function getUsuario() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

function guardarSesion({ token, rol, id, nombre }) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify({ rol, id, nombre }));
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

// Exige sesión activa (y opcionalmente un rol) antes de dejar usar la página.
function requerirSesion(rolesPermitidos) {
  const usuario = getUsuario();
  if (!usuario || !getToken()) {
    window.location.href = 'index.html';
    return null;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    window.location.href = 'index.html';
    return null;
  }
  return usuario;
}

// Wrapper único de fetch: agrega el JWT, serializa el body si hace falta,
// y redirige al login si el gateway devuelve 401 con una sesión que ya existía.
async function apiFetch(path, options = {}) {
  const opciones = { ...options };
  const headers = { ...(opciones.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const esFormData = opciones.body instanceof FormData;
  if (!esFormData && opciones.body && typeof opciones.body !== 'string') {
    opciones.body = JSON.stringify(opciones.body);
    headers['Content-Type'] = 'application/json';
  }

  const respuesta = await fetch(`${API_BASE_URL}${path}`, { ...opciones, headers });

  if (respuesta.status === 401 && token) {
    cerrarSesion();
    throw new Error('sesión expirada');
  }

  const contentType = respuesta.headers.get('content-type') || '';
  const cuerpo = contentType.includes('application/json') ? await respuesta.json() : null;

  if (!respuesta.ok) {
    const error = new Error((cuerpo && cuerpo.error) || `error ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }

  return cuerpo;
}

// CU7: descarga un archivo binario (CSV, Excel, PDF) a través del gateway.
// Errores: lanza Error con .status y el mensaje del JSON { error }, igual que apiFetch.
async function apiDescargar(path) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const respuesta = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (respuesta.status === 401 && token) {
    cerrarSesion();
    throw new Error('sesión expirada');
  }

  if (!respuesta.ok) {
    let mensaje = `error ${respuesta.status}`;
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo && cuerpo.error) mensaje = cuerpo.error;
    } catch (e) {
      // la respuesta de error no era JSON; queda el mensaje genérico
    }
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }

  const blob = await respuesta.blob();
  const disposition = respuesta.headers.get('content-disposition') || '';
  const coincidencia = /filename="?([^";]+)"?/i.exec(disposition);
  const nombreArchivo = coincidencia ? coincidencia[1] : 'reporte';

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
