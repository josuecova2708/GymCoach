inicializarNavbar(['coach']);

const formGrupo = document.getElementById('formGrupo');
const idGrupoInput = document.getElementById('idGrupo');
const nombreInput = document.getElementById('nombre');
const errorEl = document.getElementById('errorGrupo');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');
const tablaGrupos = document.getElementById('tablaGrupos');

async function cargarGrupos() {
  const grupos = await apiFetch('/grupos');
  tablaGrupos.innerHTML = grupos.map((g) => `
    <tr>
      <td>${g.idGrupo}</td>
      <td>${escapeHtml(g.nombre)}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" data-editar="${g.idGrupo}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar="${g.idGrupo}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function limpiarFormulario() {
  formGrupo.reset();
  idGrupoInput.value = '';
  formTitulo.textContent = 'Nuevo grupo muscular';
  btnCancelar.classList.add('d-none');
  errorEl.classList.add('d-none');
}

formGrupo.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorEl.classList.add('d-none');

  const datos = { nombre: nombreInput.value.trim() };

  try {
    if (idGrupoInput.value) {
      await apiFetch(`/grupos/${idGrupoInput.value}`, { method: 'PUT', body: datos });
    } else {
      await apiFetch('/grupos', { method: 'POST', body: datos });
    }
    limpiarFormulario();
    await cargarGrupos();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

tablaGrupos.addEventListener('click', async (evento) => {
  const idEditar = evento.target.dataset.editar;
  const idEliminar = evento.target.dataset.eliminar;

  if (idEditar) {
    const grupos = await apiFetch('/grupos');
    const grupo = grupos.find((g) => String(g.idGrupo) === idEditar);
    if (!grupo) return;

    idGrupoInput.value = grupo.idGrupo;
    nombreInput.value = grupo.nombre;
    formTitulo.textContent = `Editar grupo #${grupo.idGrupo}`;
    btnCancelar.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (idEliminar) {
    if (!confirm('¿Eliminar este grupo muscular?')) return;
    try {
      await apiFetch(`/grupos/${idEliminar}`, { method: 'DELETE' });
      await cargarGrupos();
    } catch (err) {
      alert(err.message);
    }
  }
});

limpiarFormulario();
cargarGrupos();
