// pg devuelve las columnas DATE como Date a medianoche (hora local del contenedor):
// se usan los getters locales para no correr el día por zona horaria.
function formatearFecha(valor) {
  if (valor === null || valor === undefined) return '';
  if (!(valor instanceof Date)) return String(valor).substring(0, 10);
  const mm = String(valor.getMonth() + 1).padStart(2, '0');
  const dd = String(valor.getDate()).padStart(2, '0');
  return `${valor.getFullYear()}-${mm}-${dd}`;
}

module.exports = formatearFecha;
