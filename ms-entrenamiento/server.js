const express = require('express');
const rutinasRoutes = require('./src/routes/rutinas.routes');
const asignacionesRoutes = require('./src/routes/asignaciones.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const asignacionesController = require('./src/controllers/asignaciones.controller');
const asyncHandler = require('./src/utils/asyncHandler');
const seed = require('./src/seed');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.use('/rutinas', rutinasRoutes);
app.use('/asignaciones', asignacionesRoutes);
app.use('/reportes', reportesRoutes);
app.get('/mi-rutina', asyncHandler(asignacionesController.miRutina));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-entrenamiento' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

seed()
  .catch((err) => console.error('no se pudo ejecutar la siembra de datos:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`ms-entrenamiento escuchando en el puerto ${PORT}`);
    });
  });
