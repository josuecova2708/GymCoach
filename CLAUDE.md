# GymCoach — Plan de Implementación

Proyecto académico de **INF552 — Arquitectura de Software**. La arquitectura asignada es
**microservicios** y ya está documentada y aprobada. Este plan traduce esa documentación a
código. **La documentación manda: el código se adapta al diseño, nunca al revés.**

---

## 0. Reglas invariantes (leer antes de escribir cualquier línea)

Estas reglas no son preferencias de estilo. Son lo que hace que el proyecto sea válido como
arquitectura de microservicios. Romper cualquiera invalida la entrega.

1. **Cada microservicio es un proceso Node independiente**, con su propio `package.json`, su
   propio `server.js` y su propio puerto. Nunca un solo Express con carpetas por tema.

2. **Cada microservicio es dueño exclusivo de su base de datos.** Un servicio se conecta
   únicamente a su propia base, con su propio usuario de Postgres. Nunca abre una conexión a la
   base de otro.

3. **Prohibido el `FOREIGN KEY` entre bases distintas.** `Ejercicio.idCoach` y
   `Asignacion.idAlumno` son enteros sueltos, sin FK, a propósito. Si hace falta el nombre del
   coach o del alumno, se pide por HTTP al servicio dueño.

4. **Prohibido el JOIN entre datos de servicios distintos.** Si una consulta necesita datos de
   dos servicios, se resuelve con dos llamadas y se compone el resultado en memoria (en el
   servicio que orquesta), nunca en SQL.

5. **Comunicación entre servicios solo por HTTP/REST.** Nunca `require()` del código de otro
   servicio, nunca compartir modelos, nunca importar sus archivos.

6. **El frontend habla únicamente con el API Gateway** (`http://localhost:3000`). El navegador
   jamás llama directo a un puerto de microservicio.

7. Si una tarea parece requerir romper alguna de estas reglas: **parar y preguntar**, no
   improvisar una solución que las viole.

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JavaScript vanilla, **Bootstrap 5 por CDN** |
| Microservicios | Node.js 20 + Express 4 (un proyecto por servicio) |
| API Gateway | Express + `http-proxy-middleware` |
| Base de datos | PostgreSQL 16, driver `pg`. **Una base por servicio** |
| Autenticación | `jsonwebtoken` + `bcrypt` |
| Multimedia | `multer` (disco local) + `express.static` |
| Orquestación | Docker Compose |

**Bootstrap por CDN, no Tailwind.** Tailwind necesita un paso de build; con HTML plano
Bootstrap por `<link>` no requiere toolchain y es lo que usa el documento de referencia.

Sin TypeScript, sin ORM (SQL directo con `pg`), sin framework de frontend. El objetivo es que
la estructura del código sea legible y se corresponda 1:1 con los diagramas del documento.

---

## 2. Mapa del sistema

| Servicio | Puerto | Base de datos | Usuario Postgres | Casos de uso |
|---|---|---|---|---|
| API Gateway | 3000 | — | — | punto de entrada único |
| MS-Usuarios | 3001 | `bd_usuarios` | `usuarios_app` | CU1 + login |
| MS-Ejercicios | 3002 | `bd_ejercicios` | `ejercicios_app` | CU2, CU3 |
| MS-Media | 3003 | — (disco) | — | soporta CU3 |
| MS-Entrenamiento | 3004 | `bd_entrenamiento` | `entrenamiento_app` | CU4, CU5, CU6, CU7 |

**MS-Media no tiene base de datos.** Guarda archivos en disco y devuelve una URL. Se comporta
como un bucket (S3/Cloudinary); el disco local es solo el adaptador elegido para la demo.

### Estructura de carpetas

```
gymcoach/
├── docker-compose.yml
├── .env.example
├── sql/
│   ├── 00_init.sql              # CREATE USER + CREATE DATABASE (las 3)
│   ├── 01_usuarios.sql
│   ├── 02_ejercicios.sql
│   └── 03_entrenamiento.sql
├── gateway/
│   ├── package.json
│   ├── Dockerfile
│   ├── server.js
│   └── src/middleware/auth.js
├── ms-usuarios/
│   ├── package.json
│   ├── Dockerfile
│   ├── server.js
│   └── src/
│       ├── db.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── repositories/
├── ms-ejercicios/               # misma estructura interna
├── ms-media/                    # + uploads/
├── ms-entrenamiento/            # + src/clients/  (llamadas REST a otros MS)
└── frontend/
    ├── index.html               # login
    ├── alumnos.html
    ├── grupos.html
    ├── ejercicios.html
    ├── rutinas.html
    ├── asignaciones.html
    ├── mi-rutina.html
    ├── reportes.html
    ├── css/styles.css
    └── js/
        ├── api.js               # wrapper de fetch, adjunta el JWT
        └── <una por página>.js
```

**Las capas `controllers / services / repositories` son obligatorias.** No son decoración: son
literalmente las líneas de vida de los diagramas de secuencia de la sección 3.4 del documento.
Cada capa hace solo lo suyo:

- `routes/` — define las rutas Express y las conecta al controller
- `controllers/` — lee `req`, valida entrada, arma `res`. Sin SQL, sin lógica de negocio
- `services/` — lógica de negocio y llamadas REST a otros microservicios. Sin `req`/`res`, sin SQL
- `repositories/` — únicamente SQL contra la base propia. Sin lógica de negocio

---

## 3. Modelo de datos (ya definido, no rediseñar)

`SERIAL` para las PK. Cada bloque va en su propia base.

**bd_usuarios** — `Alumno(idAlumno, nombre, email UNIQUE, password, telefono)`,
`Coach(idCoach, nombre, email UNIQUE, password)`

**bd_ejercicios** — `GrupoMuscular(idGrupo, nombre)`,
`Ejercicio(idEjercicio, nombre, descripcion, idGrupo FK, fotoUrl, videoUrl, idCoach)`
→ `idCoach` **sin FK** (Coach vive en `bd_usuarios`)

**bd_entrenamiento** — `Rutina(idRutina, nombre, descripcion)`,
`DetalleRutina(idRutina FK, idEjercicio, series, repeticiones, descanso)` con PK compuesta
`(idRutina, idEjercicio)` → `idEjercicio` **sin FK** (vive en `bd_ejercicios`);
`Asignacion(idAsignacion, idAlumno, idRutina FK, fechaInicio, fechaFin)`
→ `idAlumno` **sin FK** (vive en `bd_usuarios`)

Las contraseñas se guardan con `bcrypt`, nunca en texto plano.

---

## 4. Contrato de APIs

Rutas públicas (a través del gateway) con prefijo `/api`. Entre servicios se llama al puerto
interno directamente.

### MS-Usuarios (3001)
```
POST   /auth/login              { email, password } → { token, rol, id, nombre }
GET    /alumnos                 lista
POST   /alumnos                 crear
GET    /alumnos/:id             uno solo   ← consumido por MS-Entrenamiento
PUT    /alumnos/:id             actualizar
DELETE /alumnos/:id             eliminar
GET    /coaches/:id             uno solo   ← consumido por MS-Ejercicios
GET    /health
```

### MS-Ejercicios (3002)
```
GET    /grupos                  lista
POST   /grupos
PUT    /grupos/:id
DELETE /grupos/:id              rechazar si tiene ejercicios asociados
GET    /ejercicios              lista (admite ?idGrupo=)
POST   /ejercicios
GET    /ejercicios/:id
PUT    /ejercicios/:id
DELETE /ejercicios/:id
GET    /ejercicios/batch?ids=1,2,3    ← CLAVE: evita el N+1 en CU6
GET    /health
```

`/ejercicios/batch` es importante: sin él, mostrar una rutina de 8 ejercicios haría 8 llamadas
HTTP. Con él, una sola.

### MS-Media (3003)
```
POST   /media/upload            multipart/form-data → { url }
DELETE /media/:filename
GET    /uploads/:filename       archivo estático
GET    /health
```
Validar tipo MIME (imágenes y video) y tamaño máximo. Nombre de archivo con UUID, nunca el
nombre original.

### MS-Entrenamiento (3004)
```
GET    /rutinas                 lista
POST   /rutinas                 { nombre, descripcion, ejercicios:[{idEjercicio,series,repeticiones,descanso}] }
GET    /rutinas/:id             rutina + detalle, con ejercicios hidratados
PUT    /rutinas/:id
DELETE /rutinas/:id             rechazar si está asignada
GET    /asignaciones            lista (admite ?idAlumno=)
POST   /asignaciones            validar fechaFin > fechaInicio
DELETE /asignaciones/:id
GET    /mi-rutina               ← CU6: rutina vigente del alumno autenticado
GET    /reportes/alumnos-vigentes
GET    /reportes/ejercicios-mas-usados
GET    /health
```

### Rutas del Gateway (3000)
```
/api/auth/*           → 3001   (público, sin JWT)
/api/alumnos/*        → 3001   (rol coach)
/api/coaches/*        → 3001
/api/grupos/*         → 3002   (escritura: rol coach)
/api/ejercicios/*     → 3002
/api/media/*          → 3003
/api/uploads/*        → 3003   (público)
/api/rutinas/*        → 3004   (rol coach)
/api/asignaciones/*   → 3004   (rol coach)
/api/mi-rutina        → 3004   (rol alumno)
/api/reportes/*       → 3004   (rol coach)
```

---

## 5. Fases de implementación

Cada fase termina con un criterio verificable. **No avanzar a la siguiente hasta que el
criterio se cumpla.**

### Fase 0 — Infraestructura

- `docker-compose.yml` con: 1 contenedor Postgres 16 + 5 contenedores Node (gateway y los 4 MS)
- Un solo motor Postgres, **3 bases separadas con 3 usuarios distintos**. Cada usuario es dueño
  solo de su base — que `usuarios_app` no pueda leer `bd_ejercicios` es parte del diseño, no un
  descuido
- `sql/00_init.sql` crea usuarios y bases; los otros scripts crean las tablas de cada una
- `.env.example` con las variables de cada servicio (credenciales, puertos, `JWT_SECRET`,
  URLs internas de los otros MS)
- Node 20 alpine en los Dockerfiles

**Criterio:** `docker compose up` levanta todo y las 3 bases existen con sus tablas creadas.

### Fase 1 — MS-Usuarios

- Estructura completa de capas (`routes → controllers → services → repositories`)
- CRUD de Alumno (CU1), `bcrypt` al guardar contraseñas
- `POST /auth/login` valida contra Alumno y Coach, emite JWT con `{ id, rol, nombre }`
- Un coach semilla para poder entrar (`coach@gymcoach.com`)
- `GET /health`

**Criterio:** login por curl devuelve un JWT válido; el CRUD de alumnos funciona contra
`bd_usuarios`.

### Fase 2 — API Gateway

- Proxy de todas las rutas de la tabla anterior con `http-proxy-middleware`
- Middleware que verifica el JWT y rechaza con 401 si falta o es inválido
- Verificación de rol donde corresponde (un alumno no puede tocar `/api/alumnos`)
- El gateway propaga la identidad a los servicios en cabeceras (`X-User-Id`, `X-User-Rol`)
- CORS habilitado para el frontend

**Criterio:** `POST /api/auth/login` funciona a través del puerto 3000, y una ruta protegida
sin token devuelve 401.

### Fase 3 — MS-Ejercicios

- CRUD de GrupoMuscular (CU2) y de Ejercicio (CU3)
- `idCoach` se toma de la cabecera `X-User-Id` que inyecta el gateway, no del body
- `DELETE /grupos/:id` rechaza si el grupo tiene ejercicios
- Implementar `/ejercicios/batch`
- `GET /ejercicios` devuelve el ejercicio con el **nombre** de su grupo muscular (JOIN interno
  permitido: ambas tablas viven en `bd_ejercicios`)

**Criterio:** CRUD completo funcionando a través del gateway; `/ejercicios/batch?ids=1,2`
devuelve dos ejercicios en una sola llamada.

### Fase 4 — MS-Media

- `POST /media/upload` con `multer`, guarda en `uploads/`, devuelve `{ url }`
- Validación de MIME y tamaño; nombres con UUID
- `express.static` sirviendo `uploads/`
- Volumen Docker para que los archivos sobrevivan al reinicio del contenedor
- **Integración con Fase 3:** al crear un ejercicio con foto, el frontend sube primero a
  `/api/media/upload` y manda la URL resultante en `fotoUrl`

**Criterio:** subir una imagen devuelve una URL que se abre en el navegador, y esa URL queda
guardada en el ejercicio.

### Fase 5 — MS-Entrenamiento

El servicio que integra todo. Acá es donde más fácil se rompen las reglas invariantes.

- CRUD de Rutina con su detalle (CU4), en transacción
- CRUD de Asignacion (CU5), validando fechas
- `GET /mi-rutina` (CU6): busca la asignación vigente del alumno
  (`CURRENT_DATE BETWEEN fechaInicio AND fechaFin`), trae el detalle, y **llama por HTTP a
  MS-Ejercicios** (`/ejercicios/batch`) para hidratar nombre, foto y video de cada ejercicio
- Reportes (CU7)
- `src/clients/ejercicios.client.js` y `usuarios.client.js` encapsulan las llamadas REST
  salientes, con timeout y manejo de error (si el otro servicio no responde, degradar con
  gracia, no tirar 500)

**Criterio:** `GET /api/mi-rutina` con el token de un alumno devuelve su rutina vigente con
los ejercicios completos — y en los logs se ve la llamada HTTP a MS-Ejercicios.

### Fase 6 — Frontend

Bootstrap 5 por CDN. Cada pantalla corresponde a un caso de uso (sirve para las capturas de la
sección 3.3 del documento).

- `js/api.js`: wrapper de `fetch` que apunta a `http://localhost:3000/api`, adjunta el JWT
  desde `localStorage` y redirige al login ante un 401
- `index.html` — login, guarda el token y redirige según el rol
- `alumnos.html` (CU1), `grupos.html` (CU2), `ejercicios.html` (CU3) — formulario arriba +
  tabla abajo, con botones Editar / Eliminar (mismo patrón que el documento de referencia)
- `rutinas.html` (CU4) — selector de ejercicios con series/repeticiones/descanso
- `asignaciones.html` (CU5) — alumno + rutina + rango de fechas
- `mi-rutina.html` (CU6) — vista del alumno, con foto y video de cada ejercicio
- `reportes.html` (CU7)
- Navbar que muestra u oculta secciones según el rol

**Criterio:** un coach puede crear un ejercicio con foto, armar una rutina, asignarla; y un
alumno, entrando con su cuenta, ve esa rutina.

### Fase 7 — Cierre

- Script de datos semilla: ~6 grupos musculares, ~15 ejercicios, 3 alumnos, 2 rutinas, 2
  asignaciones vigentes. Sin esto las capturas del documento se ven vacías
- `README.md` con instrucciones de levantado
- Verificar los 5 `/health`
- Revisar que ninguna regla de la sección 0 se haya roto

**Criterio:** `docker compose up` sobre un clon limpio deja el sistema usable y con datos.

---

## 6. Trazabilidad — caso de uso → código → documento

Sirve para verificar al final que no falta nada y para armar las capturas y los diagramas de
secuencia del documento.

| CU | Servicio | Pantalla | Diagramas de secuencia (sección 3.4) |
|---|---|---|---|
| CU1 Gestionar Alumnos | MS-Usuarios | `alumnos.html` | 3 (registrar / actualizar / eliminar) |
| CU2 Gestionar Grupos Musculares | MS-Ejercicios | `grupos.html` | 3 |
| CU3 Gestionar Ejercicios | MS-Ejercicios + MS-Media | `ejercicios.html` | 3 (incluir la llamada a MS-Media) |
| CU4 Gestionar Rutinas | MS-Entrenamiento | `rutinas.html` | 3 |
| CU5 Asignar Rutina | MS-Entrenamiento | `asignaciones.html` | 3 |
| CU6 Consultar Mi Rutina | MS-Entrenamiento → MS-Ejercicios | `mi-rutina.html` | 1 (mostrar la llamada REST entre servicios) |
| CU7 Generar Reportes | MS-Entrenamiento | `reportes.html` | 1 |

---

## 7. Convenciones

- Código y comentarios en español, coherentes con la nomenclatura del documento
  (`Ejercicio`, `Rutina`, `Asignacion`, `GrupoMuscular`)
- Nombres de tablas y columnas exactamente como en el diseño físico
- Respuestas de error uniformes: `{ error: "mensaje" }` con el código HTTP correcto
  (400 validación, 401 sin token, 403 rol incorrecto, 404 no existe, 409 conflicto)
- Consultas SQL siempre parametrizadas (`$1`, `$2`), nunca concatenando strings
- Ningún secreto hardcodeado: todo por variables de entorno