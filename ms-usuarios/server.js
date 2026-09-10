const express = require('express');
const authRoutes = require('./src/routes/auth.routes');
const alumnosRoutes = require('./src/routes/alumnos.routes');
const coachesRoutes = require('./src/routes/coaches.routes');
const seed = require('./src/seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/alumnos', alumnosRoutes);
app.use('/coaches', coachesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-usuarios' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'error interno del servidor' });
});

seed()
  .catch((err) => console.error('no se pudo ejecutar la siembra de datos:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`ms-usuarios escuchando en el puerto ${PORT}`);
    });
  });
