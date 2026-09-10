inicializarNavbar(['coach']);

const tablaAlumnosVigentes = document.getElementById('tablaAlumnosVigentes');
const tablaEjerciciosMasUsados = document.getElementById('tablaEjerciciosMasUsados');

function formatearFecha(valor) {
  return valor ? String(valor).substring(0, 10) : '';
}

async function cargarAlumnosVigentes() {
  const filas = await apiFetch('/reportes/alumnos-vigentes');
  tablaAlumnosVigentes.innerHTML = filas.length
    ? filas.map((f) => `
        <tr>
          <td>${escapeHtml(f.nombreAlumno || `#${f.idAlumno}`)}</td>
          <td>${escapeHtml(f.nombreRutina)}</td>
          <td>${formatearFecha(f.fechaInicio)}</td>
          <td>${formatearFecha(f.fechaFin)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="text-muted">Sin alumnos con rutina vigente</td></tr>';
}

async function cargarEjerciciosMasUsados() {
  const filas = await apiFetch('/reportes/ejercicios-mas-usados');
  tablaEjerciciosMasUsados.innerHTML = filas.length
    ? filas.map((f) => `
        <tr>
          <td>${escapeHtml(f.nombreEjercicio || `#${f.idEjercicio}`)}</td>
          <td>${f.vecesUsado}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="2" class="text-muted">Sin datos todavía</td></tr>';
}

cargarAlumnosVigentes();
cargarEjerciciosMasUsados();
