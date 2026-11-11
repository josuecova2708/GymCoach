# GymCoach — Guía de demo local (examen)

Guía rápida para levantar el proyecto en tu máquina y mostrarlo en el examen: cómo correrlo,
qué hacer como coach y como alumno, cómo abrir las 3 bases de datos por separado en TablePlus,
y cómo argumentar que esto es una arquitectura de microservicios real (no un monolito
disfrazado).

---

## 1. Levantar el proyecto

**Requisito:** Docker Desktop abierto y corriendo (ícono de la ballena fijo, sin animación).

Desde la raíz del proyecto:

```bash
docker compose up -d --build
```

Esto levanta 6 contenedores: Postgres + gateway + 4 microservicios. La primera vez que corre
contra una base vacía, cada microservicio siembra sus propios datos de demo automáticamente
(coach, 3 alumnos, 6 grupos musculares, 15 ejercicios, 2 rutinas ya asignadas). No hace falta
ningún paso manual de seed.

Verificar que los 5 servicios respondan:

```bash
for p in 3000 3001 3002 3003 3004; do curl -s http://localhost:$p/health; echo; done
```

Los 5 deben devolver `{"status":"ok", ...}`.

**Levantar el frontend** (HTML/JS plano, sin build step — cualquier servidor estático sirve):

```bash
cd frontend
python -m http.server 5500
```

Abrir en el navegador: **http://localhost:5500/index.html**

### Apagar / reiniciar

```bash
docker compose down          # apaga, conserva los datos
docker compose down -v       # apaga y borra todo (bases + archivos subidos)
docker compose up -d         # vuelve a levantar (si usaste -v, siembra todo de nuevo)
```

### Si algo falla el día del examen

- **Puerto ocupado**: si `5500` está en uso, usa otro (`python -m http.server 5600`) y ajusta
  la URL. Los puertos 3000-3004 y 5432 deben estar libres para Docker.
- **Docker Desktop no inicia**: dale unos 30-60s después de abrirlo antes de correr `docker
  compose up`.
- **Un contenedor no arranca**: `docker compose logs -f <servicio>` (ej.
  `docker compose logs -f ms-entrenamiento`) para ver el error puntual.

---

## 2. Credenciales de demo

| Usuario | Email | Password | Rol |
|---|---|---|---|
| Coach Demo | `coach@gymcoach.com` | `coach123` | coach |
| Ana Gutierrez | `ana@gymcoach.com` | `alumno123` | alumno — **con** rutina vigente |
| Luis Fernandez | `luis@gymcoach.com` | `alumno123` | alumno — **con** rutina vigente |
| Maria Rojas | `maria@gymcoach.com` | `alumno123` | alumno — **sin** rutina (para mostrar el estado vacío) |

---

## 3. Actividades del coach

Entrar con `coach@gymcoach.com`. El navbar solo muestra las secciones de coach.

1. **Alumnos** (`alumnos.html`, CU1) — formulario arriba, tabla abajo. Crear un alumno nuevo,
   editarlo (la contraseña queda igual si el campo se deja vacío), eliminarlo.
2. **Grupos Musculares** (`grupos.html`, CU2) — crear/editar/eliminar un grupo. Si intentas
   borrar uno que tiene ejercicios asociados, el sistema lo rechaza (409) — buen punto para
   mostrar en el examen que la regla de negocio se cumple.
3. **Ejercicios** (`ejercicios.html`, CU3) — crear un ejercicio eligiendo su grupo muscular, con
   foto y/o video subidos directo desde el selector de archivos del navegador. La foto se sube a
   MS-Media *antes* de guardar el ejercicio; la URL que vuelve es la que se guarda.
4. **Rutinas** (`rutinas.html`, CU4) — nombre + descripción, y un selector para ir agregando
   ejercicios con series/repeticiones/descanso antes de guardar. Editar una rutina trae de
   vuelta su detalle completo (con nombre/foto de cada ejercicio, hidratado desde MS-Ejercicios).
5. **Asignaciones** (`asignaciones.html`, CU5) — elegir alumno + rutina + rango de fechas.
   Si `fechaFin` no es posterior a `fechaInicio`, se rechaza con un mensaje claro.
6. **Reportes** (`reportes.html`, CU7) — alumnos con rutina vigente ahora mismo, y ranking de
   ejercicios más usados en todas las rutinas. Ambos datos vienen combinados de más de un
   microservicio (ver sección 5).

## 4. Actividades del alumno

Cerrar sesión y entrar con `ana@gymcoach.com` (o `luis@gymcoach.com`). El navbar ahora solo
muestra "Mi Rutina".

- **Mi Rutina** (`mi-rutina.html`, CU6): muestra la rutina vigente con una tarjeta por
  ejercicio (foto, series×repeticiones, descanso, link a video si tiene). Entrando con
  `maria@gymcoach.com` en cambio vas a ver el mensaje de "no tienes una rutina vigente" —
  útil para mostrar ambos casos.

---

## 5. Ver las 3 bases de datos por separado (TablePlus)

Un solo motor Postgres corriendo en `localhost:5432`, pero **3 bases con 3 usuarios
distintos**, cada uno dueño exclusivo de la suya. La forma correcta de verlo en TablePlus es
creando **tres conexiones separadas** (una por microservicio), no una sola conexión que
navegue entre bases:

| Conexión | Host | Puerto | Usuario | Password | Base de datos |
|---|---|---|---|---|---|
| GymCoach – Usuarios | localhost | 5432 | `usuarios_app` | `usuarios_pass` | `bd_usuarios` |
| GymCoach – Ejercicios | localhost | 5432 | `ejercicios_app` | `ejercicios_pass` | `bd_ejercicios` |
| GymCoach – Entrenamiento | localhost | 5432 | `entrenamiento_app` | `entrenamiento_pass` | `bd_entrenamiento` |

(Estas credenciales están en tu `.env`. Si las cambiaste, usa las tuyas.)

En cada conexión vas a ver únicamente sus tablas:
- `bd_usuarios` → `Alumno`, `Coach`
- `bd_ejercicios` → `GrupoMuscular`, `Ejercicio`
- `bd_entrenamiento` → `Rutina`, `DetalleRutina`, `Asignacion`

### Truco para el examen: demostrar el aislamiento en vivo

Crea una cuarta conexión en TablePlus con usuario `usuarios_app` / password `usuarios_pass`,
pero elige la base `bd_ejercicios` en vez de `bd_usuarios`. TablePlus va a fallar al conectar
con un error de permisos (`permission denied for database`). Eso es intencional: cada usuario
de Postgres tiene revocado el `CONNECT` a las bases que no son suyas (ver `sql/00_init.sh`).
Es una prueba visual, en vivo, de que el aislamiento entre microservicios no es solo una
convención de código — está reforzado a nivel de motor de base de datos.

Si además quieres una vista "de administrador" que muestre las 3 bases listadas (sin poder
entrar a los datos de las que no le tocan), conéctate con `postgres` / `postgres` — al ser
superusuario ve las 3 en el listado de bases, pero esa cuenta nunca la usa ningún
microservicio en tiempo de ejecución.

**Alternativa sin TablePlus**, directo por terminal:

```bash
docker exec -it gymcoach-postgres psql -U usuarios_app -d bd_usuarios -c "\dt"
docker exec -it gymcoach-postgres psql -U ejercicios_app -d bd_ejercicios -c "\dt"
docker exec -it gymcoach-postgres psql -U entrenamiento_app -d bd_entrenamiento -c "\dt"
```

---

## 6. Cómo logramos microservicios de verdad (y no un monolito con carpetas)

Esto es lo que sustenta que la arquitectura es correcta, punto por punto:

1. **Procesos independientes.** `gateway/`, `ms-usuarios/`, `ms-ejercicios/`, `ms-media/` y
   `ms-entrenamiento/` son 5 proyectos Node separados, cada uno con su propio
   `package.json`, `Dockerfile` y `server.js` — 5 contenedores distintos en
   `docker-compose.yml`, no un solo Express con rutas por carpeta.

2. **Una base de datos por servicio, con aislamiento real.** No alcanza con "cada uno usa su
   propio usuario": en `sql/00_init.sh` se revoca explícitamente el `CONNECT` de `PUBLIC`
   sobre cada base y solo se le otorga a su dueño. Por eso el "truco" de la sección 5
   funciona — es aislamiento a nivel de Postgres, no solo buenas intenciones en el código.

3. **Sin FK ni JOIN entre servicios.** `Ejercicio.idCoach`, `DetalleRutina.idEjercicio` y
   `Asignacion.idAlumno` son enteros sueltos, a propósito. Cuando se necesita el dato del otro
   lado (el nombre de un alumno, el detalle de un ejercicio), se pide por HTTP y se combina en
   memoria — nunca con SQL. Ejemplo real: `ms-entrenamiento/src/services/reportes.service.js`
   arma el reporte de alumnos vigentes leyendo su propia tabla `Asignacion` y llamando a
   `usuarios.client.js` por cada alumno.

4. **`/ejercicios/batch` para evitar el N+1.** Mostrar una rutina de varios ejercicios no hace
   una llamada HTTP por ejercicio: `ms-entrenamiento` pide todos los ids de una sola vez a
   `GET /ejercicios/batch?ids=1,2,3` en `ms-ejercicios`. Se ve en los logs de
   `ms-entrenamiento` cada vez que se abre `mi-rutina.html` o el detalle de una rutina.

5. **Degradación elegante, no un 500.** `ms-entrenamiento/src/clients/*.client.js` llaman a
   los otros servicios con timeout (`AbortController`, 3s) y si no responden devuelven
   `null`/`[]` en vez de propagar el error. Esto se puede demostrar en vivo: apaga
   `ms-ejercicios` (`docker stop gymcoach-ms-ejercicios`) y entra a `mi-rutina.html` — la
   rutina se sigue mostrando, solo que sin nombre/foto de los ejercicios. Prende el servicio
   de nuevo con `docker start gymcoach-ms-ejercicios`.

6. **Gateway como único punto de entrada.** El navegador solo conoce `localhost:3000`. El
   gateway (`gateway/server.js` + `gateway/src/proxy.js`) verifica el JWT, revisa el rol
   (`gateway/src/middleware/auth.js`) y recién ahí reenvía la petición al microservicio
   interno, inyectando `X-User-Id` / `X-User-Rol` en las cabeceras — así `ms-ejercicios` sabe
   qué coach está creando un ejercicio sin que el frontend tenga que mandarlo en el body (y
   sin poder falsificarlo).

7. **Capas obligatorias dentro de cada servicio.** `routes → controllers → services →
   repositories` en los tres microservicios con base de datos. Los `repositories/` son el
   único lugar con SQL; los `services/` tienen la lógica de negocio y las llamadas HTTP
   salientes; los `controllers/` solo leen `req` y arman `res`.

**Para la sustentación**: si te preguntan "¿cómo sé que esto no es un monolito con nombres de
microservicios?", la respuesta más contundente es la demo en vivo de los puntos 2 y 5 — el
error de permisos en TablePlus y el apagar un contenedor sin que el sistema se caiga. Ninguna
de esas dos cosas es posible en un monolito.

-----------------
posible error

