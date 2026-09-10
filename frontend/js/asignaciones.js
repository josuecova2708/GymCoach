inicializarNavbar(['coach']);

const formAsignacion = document.getElementById('formAsignacion');
const idAlumnoSelect = document.getElementById('idAlumno');
const idRutinaSelect = document.getElementById('idRutina');
const fechaInicioInput = document.getElementById('fechaInicio');
const fechaFinInput = document.getElementById('fechaFin');
const errorEl = document.getElementById('errorAsignacion');
const filtroAlumno = document.getElementById('filtroAlumno');
const tablaAsignaciones = document.getElementById('tablaAsignaciones');

// /api/asignaciones no devuelve los nombres hidratados: se arman acá con lo ya cargado
// para los selects (evita llamadas extra, ya que alumnos y rutinas se piden de todos modos).
let alumnosPorId = new Map();
let rutinasPorId = new Map();

async function cargarAlumnos() {
  const alumnos = await apiFetch('/alumnos');
  alumnosPorId = new Map(alumnos.map((a) => [a.idAlumno, a.nombre]));

  const opciones = alumnos.map((a) => `<option value="${a.idAlumno}">${escapeHtml(a.nombre)}</option>`).join('');
  idAlumnoSelect.innerHTML = opciones;
  filtroAlumno.innerHTML = `<option value="">Todos</option>${opciones}`;
}

async function cargarRutinas() {
  const rutinas = await apiFetch('/rutinas');
  rutinasPorId = new Map(rutinas.map((r) => [r.idRutina, r.nombre]));
  idRutinaSelect.innerHTML = rutinas.map((r) => `<option value="${r.idRutina}">${escapeHtml(r.nombre)}</option>`).join('');
}

function formatearFecha(valor) {
  return valor ? String(valor).substring(0, 10) : '';
}

async function cargarAsignaciones() {
  const idAlumno = filtroAlumno.value;
  const query = idAlumno ? `?idAlumno=${idAlumno}` : '';
  const asignaciones = await apiFetch(`/asignaciones${query}`);

  tablaAsignaciones.innerHTML = asignaciones.map((a) => `
    <tr>
      <td>${a.idAsignacion}</td>
      <td>${escapeHtml(alumnosPorId.get(a.idAlumno) || `#${a.idAlumno}`)}</td>
      <td>${escapeHtml(rutinasPorId.get(a.idRutina) || `#${a.idRutina}`)}</td>
      <td>${formatearFecha(a.fechaInicio)}</td>
      <td>${formatearFecha(a.fechaFin)}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-danger" data-eliminar="${a.idAsignacion}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

formAsignacion.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorEl.classList.add('d-none');

  const datos = {
    idAlumno: Number(idAlumnoSelect.value),
    idRutina: Number(idRutinaSelect.value),
    fechaInicio: fechaInicioInput.value,
    fechaFin: fechaFinInput.value,
  };

  try {
    await apiFetch('/asignaciones', { method: 'POST', body: datos });
    formAsignacion.reset();
    await cargarAsignaciones();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});

filtroAlumno.addEventListener('change', cargarAsignaciones);

tablaAsignaciones.addEventListener('click', async (evento) => {
  const idEliminar = evento.target.dataset.eliminar;
  if (!idEliminar) return;
  if (!confirm('¿Eliminar esta asignación?')) return;

  try {
    await apiFetch(`/asignaciones/${idEliminar}`, { method: 'DELETE' });
    await cargarAsignaciones();
  } catch (err) {
    alert(err.message);
  }
});

(async () => {
  await cargarAlumnos();
  await cargarRutinas();
  await cargarAsignaciones();
})();
