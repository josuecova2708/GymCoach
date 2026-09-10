const express = require('express');
const gruposRoutes = require('./src/routes/grupos.routes');
const ejerciciosRoutes = require('./src/routes/ejercicios.routes');
const seed = require('./src/seed');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use('/grupos', gruposRoutes);
app.use('/ejercicios', ejerciciosRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-ejercicios' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

seed()
  .catch((err) => console.error('no se pudo ejecutar la siembra de datos:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`ms-ejercicios escuchando en el puerto ${PORT}`);
    });
  });
