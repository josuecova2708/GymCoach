// Si ya hay sesión activa, no tiene sentido mostrar el login de nuevo.
if (getToken() && getUsuario()) {
  window.location.href = getUsuario().rol === 'coach' ? 'alumnos.html' : 'mi-rutina.html';
}

document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('errorLogin');
  errorEl.classList.add('d-none');

  try {
    const resultado = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    guardarSesion(resultado);
    window.location.href = resultado.rol === 'coach' ? 'alumnos.html' : 'mi-rutina.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  }
});
