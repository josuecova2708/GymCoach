inicializarNavbar(['coach']);

const formEjercicio = document.getElementById('formEjercicio');
const idEjercicioInput = document.getElementById('idEjercicio');
const nombreInput = document.getElementById('nombre');
const idGrupoSelect = document.getElementById('idGrupo');
const descripcionInput = document.getElementById('descripcion');
const fotoInput = document.getElementById('foto');
const videoInput = document.getElementById('video');
const errorEl = document.getElementById('errorEjercicio');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');
const tablaEjercicios = document.getElementById('tablaEjercicios');

// Se conservan al editar si el coach no elige un archivo nuevo.
let fotoUrlActual = null;
let videoUrlActual = null;

async function cargarGrupos() {
  const grupos = await apiFetch('/grupos');
  idGrupoSelect.innerHTML = grupos
    .map((g) => `<option value="${g.idGrupo}">${escapeHtml(g.nombre)}</option>`)
    .join('');
}

async function cargarEjercicios() {
  const ejercicios = await apiFetch('/ejercicios');
  tablaEjercicios.innerHTML = ejercicios.map((e) => `
    <tr>
      <td>${e.idEjercicio}</td>
      <td>${e.fotoUrl ? `<img src="${escapeHtml(e.fotoUrl)}" alt="" width="48" height="48" class="rounded" style="object-fit:cover;">` : ''}</td>
      <td>${escapeHtml(e.nombre)}</td>
      <td>${escapeHtml(e.nombreGrupo)}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" data-editar="${e.idEjercicio}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar="${e.idEjercicio}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Sube el archivo elegido a MS-Media (vía gateway) y devuelve la URL resultante.
async function subirArchivo(input) {
  if (!input.files || input.files.length === 0) return null;
  const formData = new FormData();
  formData.append('archivo', input.files[0]);
  const resultado = await apiFetch('/media/upload', { method: 'POST', body: formData });
  return resultado.url;
}

function limpiarFormulario() {
  formEjercicio.reset();
  idEjercicioInput.value = '';
  formTitulo.textContent = 'Nuevo ejercicio';
  btnCancelar.classList.add('d-none');
  errorEl.classList.add('d-none');
  fotoUrlActual = null;
  videoUrlActual = null;
}

formEjercicio.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorEl.classList.add('d-none');

  try {
    const fotoUrl = (await subirArchivo(fotoInput)) || fotoUrlActual;
    const videoUrl = (await subirArchivo(videoInput)) || videoUrlActual;

    const datos = {
      nombre: nombreInput.value.trim(),
      descripcion: descripcionInput.value.trim() || null,
      idGrupo: Number(idGrupoSelect.value),
      fotoUrl,
      videoUrl,
    };

    if (idEjercicioInput.value) {
      await apiFetch(`/ejercicios/${idEjercicioInput.value}`, { method: 'PUT', body: datos });
    } else {
      await apiFetch('/ejercicios', { method: 'POST', body: datos });
    }

    limpiarFormulario();
    await cargarEjercicios();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

tablaEjercicios.addEventListener('click', async (evento) => {
  const idEditar = evento.target.dataset.editar;
  const idEliminar = evento.target.dataset.eliminar;

  if (idEditar) {
    const ejercicio = await apiFetch(`/ejercicios/${idEditar}`);
    idEjercicioInput.value = ejercicio.idEjercicio;
    nombreInput.value = ejercicio.nombre;
    idGrupoSelect.value = ejercicio.idGrupo;
    descripcionInput.value = ejercicio.descripcion || '';
    fotoInput.value = '';
    videoInput.value = '';
    fotoUrlActual = ejercicio.fotoUrl;
    videoUrlActual = ejercicio.videoUrl;
    formTitulo.textContent = `Editar ejercicio #${ejercicio.idEjercicio}`;
    btnCancelar.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (idEliminar) {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    try {
      await apiFetch(`/ejercicios/${idEliminar}`, { method: 'DELETE' });
      await cargarEjercicios();
    } catch (err) {
      alert(err.message);
    }
  }
});

(async () => {
  await cargarGrupos();
  await cargarEjercicios();
})();
