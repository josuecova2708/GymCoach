inicializarNavbar(['coach']);

const formAlumno = document.getElementById('formAlumno');
const idAlumnoInput = document.getElementById('idAlumno');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const telefonoInput = document.getElementById('telefono');
const passwordInput = document.getElementById('password');
const errorEl = document.getElementById('errorAlumno');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');
const tablaAlumnos = document.getElementById('tablaAlumnos');

async function cargarAlumnos() {
  const alumnos = await apiFetch('/alumnos');
  tablaAlumnos.innerHTML = alumnos.map((a) => `
    <tr>
      <td>${a.idAlumno}</td>
      <td>${escapeHtml(a.nombre)}</td>
      <td>${escapeHtml(a.email)}</td>
      <td>${escapeHtml(a.telefono || '')}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" data-editar="${a.idAlumno}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar="${a.idAlumno}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function limpiarFormulario() {
  formAlumno.reset();
  idAlumnoInput.value = '';
  formTitulo.textContent = 'Nuevo alumno';
  passwordInput.required = true;
  btnCancelar.classList.add('d-none');
  errorEl.classList.add('d-none');
}

formAlumno.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorEl.classList.add('d-none');

  const datos = {
    nombre: nombreInput.value.trim(),
    email: emailInput.value.trim(),
    telefono: telefonoInput.value.trim() || null,
  };
  if (passwordInput.value) datos.password = passwordInput.value;

  try {
    if (idAlumnoInput.value) {
      await apiFetch(`/alumnos/${idAlumnoInput.value}`, { method: 'PUT', body: datos });
    } else {
      await apiFetch('/alumnos', { method: 'POST', body: datos });
    }
    limpiarFormulario();
    await cargarAlumnos();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

tablaAlumnos.addEventListener('click', async (evento) => {
  const idEditar = evento.target.dataset.editar;
  const idEliminar = evento.target.dataset.eliminar;

  if (idEditar) {
    const alumno = await apiFetch(`/alumnos/${idEditar}`);
    idAlumnoInput.value = alumno.idAlumno;
    nombreInput.value = alumno.nombre;
    emailInput.value = alumno.email;
    telefonoInput.value = alumno.telefono || '';
    passwordInput.value = '';
    passwordInput.required = false;
    formTitulo.textContent = `Editar alumno #${alumno.idAlumno}`;
    btnCancelar.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (idEliminar) {
    if (!confirm('¿Eliminar este alumno?')) return;
    try {
      await apiFetch(`/alumnos/${idEliminar}`, { method: 'DELETE' });
      await cargarAlumnos();
    } catch (err) {
      alert(err.message);
    }
  }
});

limpiarFormulario();
cargarAlumnos();
