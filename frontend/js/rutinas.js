inicializarNavbar(['coach']);

const formRutina = document.getElementById('formRutina');
const idRutinaInput = document.getElementById('idRutina');
const nombreInput = document.getElementById('nombre');
const descripcionInput = document.getElementById('descripcion');
const selectEjercicio = document.getElementById('selectEjercicio');
const seriesInput = document.getElementById('series');
const repeticionesInput = document.getElementById('repeticiones');
const descansoInput = document.getElementById('descanso');
const btnAgregarEjercicio = document.getElementById('btnAgregarEjercicio');
const listaEjerciciosRutina = document.getElementById('listaEjerciciosRutina');
const errorEl = document.getElementById('errorRutina');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');
const tablaRutinas = document.getElementById('tablaRutinas');

let ejerciciosDisponibles = [];
let ejerciciosRutina = []; // { idEjercicio, nombre, series, repeticiones, descanso }

async function cargarEjerciciosDisponibles() {
  ejerciciosDisponibles = await apiFetch('/ejercicios');
  selectEjercicio.innerHTML = ejerciciosDisponibles
    .map((e) => `<option value="${e.idEjercicio}">${escapeHtml(e.nombre)}</option>`)
    .join('');
}

function renderizarListaEjercicios() {
  listaEjerciciosRutina.innerHTML = ejerciciosRutina.map((ej, indice) => `
    <tr>
      <td>${escapeHtml(ej.nombre)}</td>
      <td>${ej.series}</td>
      <td>${ej.repeticiones}</td>
      <td>${ej.descanso}</td>
      <td><button type="button" class="btn btn-sm btn-outline-danger" data-quitar="${indice}">Quitar</button></td>
    </tr>
  `).join('');
}

btnAgregarEjercicio.addEventListener('click', () => {
  const idEjercicio = Number(selectEjercicio.value);
  const ejercicio = ejerciciosDisponibles.find((e) => e.idEjercicio === idEjercicio);
  if (!ejercicio) return;

  ejerciciosRutina.push({
    idEjercicio,
    nombre: ejercicio.nombre,
    series: Number(seriesInput.value),
    repeticiones: Number(repeticionesInput.value),
    descanso: Number(descansoInput.value),
  });
  renderizarListaEjercicios();
});

listaEjerciciosRutina.addEventListener('click', (evento) => {
  const indice = evento.target.dataset.quitar;
  if (indice === undefined) return;
  ejerciciosRutina.splice(Number(indice), 1);
  renderizarListaEjercicios();
});

async function cargarRutinas() {
  const rutinas = await apiFetch('/rutinas');
  tablaRutinas.innerHTML = rutinas.map((r) => `
    <tr>
      <td>${r.idRutina}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.descripcion || '')}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary" data-editar="${r.idRutina}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar="${r.idRutina}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function limpiarFormulario() {
  formRutina.reset();
  idRutinaInput.value = '';
  formTitulo.textContent = 'Nueva rutina';
  btnCancelar.classList.add('d-none');
  errorEl.classList.add('d-none');
  ejerciciosRutina = [];
  renderizarListaEjercicios();
}

formRutina.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorEl.classList.add('d-none');

  if (ejerciciosRutina.length === 0) {
    errorEl.textContent = 'Agrega al menos un ejercicio a la rutina';
    errorEl.classList.remove('d-none');
    return;
  }

  const datos = {
    nombre: nombreInput.value.trim(),
    descripcion: descripcionInput.value.trim() || null,
    ejercicios: ejerciciosRutina.map(({ idEjercicio, series, repeticiones, descanso }) => ({
      idEjercicio,
      series,
      repeticiones,
      descanso,
    })),
  };

  try {
    if (idRutinaInput.value) {
      await apiFetch(`/rutinas/${idRutinaInput.value}`, { method: 'PUT', body: datos });
    } else {
      await apiFetch('/rutinas', { method: 'POST', body: datos });
    }
    limpiarFormulario();
    await cargarRutinas();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

tablaRutinas.addEventListener('click', async (evento) => {
  const idEditar = evento.target.dataset.editar;
  const idEliminar = evento.target.dataset.eliminar;

  if (idEditar) {
    const rutina = await apiFetch(`/rutinas/${idEditar}`);
    idRutinaInput.value = rutina.idRutina;
    nombreInput.value = rutina.nombre;
    descripcionInput.value = rutina.descripcion || '';
    ejerciciosRutina = rutina.ejercicios.map((ej) => ({
      idEjercicio: ej.idEjercicio,
      nombre: ej.nombre || `#${ej.idEjercicio}`,
      series: ej.series,
      repeticiones: ej.repeticiones,
      descanso: ej.descanso,
    }));
    renderizarListaEjercicios();
    formTitulo.textContent = `Editar rutina #${rutina.idRutina}`;
    btnCancelar.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (idEliminar) {
    if (!confirm('¿Eliminar esta rutina?')) return;
    try {
      await apiFetch(`/rutinas/${idEliminar}`, { method: 'DELETE' });
      await cargarRutinas();
    } catch (err) {
      alert(err.message);
    }
  }
});

(async () => {
  await cargarEjerciciosDisponibles();
  limpiarFormulario();
  await cargarRutinas();
})();
