inicializarNavbar(['alumno']);

const sinRutina = document.getElementById('sinRutina');
const contenidoRutina = document.getElementById('contenidoRutina');
const nombreRutina = document.getElementById('nombreRutina');
const descripcionRutina = document.getElementById('descripcionRutina');
const rangoFechas = document.getElementById('rangoFechas');
const listaEjercicios = document.getElementById('listaEjercicios');

function formatearFecha(valor) {
  return valor ? String(valor).substring(0, 10) : '';
}

function tarjetaEjercicio(ej) {
  const foto = ej.fotoUrl
    ? `<img src="${escapeHtml(ej.fotoUrl)}" class="card-img-top" alt="" style="height:180px;object-fit:cover;">`
    : '';
  const video = ej.videoUrl
    ? `<a href="${escapeHtml(ej.videoUrl)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary">Ver video</a>`
    : '';

  return `
    <div class="col-md-4">
      <div class="card h-100">
        ${foto}
        <div class="card-body">
          <h3 class="h6 card-title">${escapeHtml(ej.nombre || `Ejercicio #${ej.idEjercicio}`)}</h3>
          <p class="card-text mb-1">${ej.series} series &times; ${ej.repeticiones} repeticiones</p>
          <p class="card-text text-muted">Descanso: ${ej.descanso}s</p>
          ${video}
        </div>
      </div>
    </div>
  `;
}

async function cargarMiRutina() {
  try {
    const datos = await apiFetch('/mi-rutina');

    nombreRutina.textContent = datos.rutina.nombre;
    descripcionRutina.textContent = datos.rutina.descripcion || '';
    rangoFechas.textContent = `Vigente del ${formatearFecha(datos.fechaInicio)} al ${formatearFecha(datos.fechaFin)}`;
    listaEjercicios.innerHTML = datos.ejercicios.map(tarjetaEjercicio).join('');

    contenidoRutina.classList.remove('d-none');
    sinRutina.classList.add('d-none');
  } catch (err) {
    if (err.status === 404) {
      sinRutina.classList.remove('d-none');
      contenidoRutina.classList.add('d-none');
    } else {
      throw err;
    }
  }
}

cargarMiRutina();
