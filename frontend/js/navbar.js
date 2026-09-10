// Se llama al principio de cada página protegida: valida sesión/rol y ajusta el navbar.
function inicializarNavbar(rolesPermitidos) {
  const usuario = requerirSesion(rolesPermitidos);
  if (!usuario) return null;

  document.querySelectorAll('[data-rol]').forEach((el) => {
    if (el.dataset.rol !== usuario.rol) el.remove();
  });

  const actual = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === actual) link.classList.add('active');
  });

  const nombreEl = document.getElementById('nombreUsuario');
  if (nombreEl) nombreEl.textContent = `${usuario.nombre} (${usuario.rol})`;

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.addEventListener('click', cerrarSesion);

  return usuario;
}
