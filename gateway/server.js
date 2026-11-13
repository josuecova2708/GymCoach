const express = require('express');
const cors = require('cors');
const proxyTo = require('./src/proxy');
const { verifyToken, requireRole, requireRoleForWrite } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const USUARIOS_URL = process.env.USUARIOS_URL;
const EJERCICIOS_URL = process.env.EJERCICIOS_URL;
const MEDIA_URL = process.env.MEDIA_URL;
const ENTRENAMIENTO_URL = process.env.ENTRENAMIENTO_URL;

// Content-Disposition se expone para que el frontend pueda leer el nombre del
// archivo en las descargas de /api/reportes (CU7); por defecto CORS lo oculta.
app.use(cors({ exposedHeaders: ['Content-Disposition'] }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

// Nota: no se usa express.json() aquí. http-proxy-middleware necesita el stream
// crudo del request para reenviar el body; parsearlo antes rompe el proxy.

// Rutas públicas, sin JWT
app.use('/api/auth', proxyTo(USUARIOS_URL));
app.use('/api/uploads', proxyTo(MEDIA_URL));

// Rutas autenticadas
app.use('/api/alumnos', verifyToken, requireRole('coach'), proxyTo(USUARIOS_URL));
app.use('/api/coaches', verifyToken, proxyTo(USUARIOS_URL));
app.use('/api/grupos', verifyToken, requireRoleForWrite('coach'), proxyTo(EJERCICIOS_URL));
app.use('/api/ejercicios', verifyToken, requireRoleForWrite('coach'), proxyTo(EJERCICIOS_URL));
app.use('/api/media', verifyToken, proxyTo(MEDIA_URL));
app.use('/api/rutinas', verifyToken, requireRole('coach'), proxyTo(ENTRENAMIENTO_URL));
app.use('/api/asignaciones', verifyToken, requireRole('coach'), proxyTo(ENTRENAMIENTO_URL));
app.use('/api/mi-rutina', verifyToken, requireRole('alumno'), proxyTo(ENTRENAMIENTO_URL));
app.use('/api/reportes', verifyToken, requireRole('coach'), proxyTo(ENTRENAMIENTO_URL));

app.listen(PORT, () => {
  console.log(`gateway escuchando en el puerto ${PORT}`);
});
