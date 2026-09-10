# GymCoach

Proyecto académico de **INF552 — Arquitectura de Software**. Arquitectura de **microservicios**:
API Gateway + 4 microservicios independientes (cada uno con su propia base de datos y su
propio proceso Node), orquestados con Docker Compose. El diseño completo está documentado en
[`CLAUDE.md`](CLAUDE.md).

## Requisitos

- Docker Desktop (o Docker Engine + Docker Compose v2)

No hace falta tener Node ni Postgres instalados localmente: todo corre en contenedores.

## Levantar el proyecto

```bash
cp .env.example .env
docker compose up -d --build
```

Esto levanta 6 contenedores: Postgres (con 3 bases separadas, una por microservicio) y los 5
servicios Node (gateway + 4 microservicios). Cada microservicio siembra sus propios datos de
demo la primera vez que arranca contra una base vacía (ver "Datos de demo" abajo).

Frontend (HTML/JS plano, sin build step) — servirlo con cualquier servidor estático, por ejemplo:

```bash
cd frontend
python -m http.server 5500
```

y abrir `http://localhost:5500/index.html`.

## Verificar que todo levantó bien

```bash
for p in 3000 3001 3002 3003 3004; do curl -s http://localhost:$p/health; echo; done
```

Los 5 deben responder `{"status":"ok", ...}`.

## Mapa de servicios

| Servicio | Puerto | Base de datos |
|---|---|---|
| API Gateway | 3000 | — |
| MS-Usuarios | 3001 | `bd_usuarios` |
| MS-Ejercicios | 3002 | `bd_ejercicios` |
| MS-Media | 3003 | — (disco, volumen Docker) |
| MS-Entrenamiento | 3004 | `bd_entrenamiento` |

El frontend y cualquier cliente externo hablan **solo** con el gateway (`localhost:3000`);
nunca directo a un microservicio.

## Datos de demo (sembrados automáticamente)

| Usuario | Email | Password | Rol |
|---|---|---|---|
| Coach Demo | `coach@gymcoach.com` | `coach123` | coach |
| Ana Gutierrez | `ana@gymcoach.com` | `alumno123` | alumno (con rutina vigente) |
| Luis Fernandez | `luis@gymcoach.com` | `alumno123` | alumno (con rutina vigente) |
| Maria Rojas | `maria@gymcoach.com` | `alumno123` | alumno (sin rutina asignada) |

Además: 6 grupos musculares, 15 ejercicios, y 2 rutinas ya asignadas (para poder ver
`mi-rutina.html` y los reportes con datos desde el primer arranque).

La siembra es idempotente: si las tablas ya tienen datos, no se repite. Cada microservicio
siembra únicamente su propia base; cuando necesita un id de otro servicio (ej. el `idCoach`
real, o los `idEjercicio` de una rutina) lo resuelve llamando a la API pública del servicio
dueño — nunca leyendo su base directamente.

## Reiniciar desde cero

```bash
docker compose down -v
docker compose up -d --build
```

`-v` borra los volúmenes (bases de datos y archivos subidos), forzando que la siembra corra
de nuevo en el próximo arranque.

## Estructura del proyecto

Ver la sección 2 de [`CLAUDE.md`](CLAUDE.md) para el detalle de carpetas y la sección 6 para
la trazabilidad caso de uso → servicio → pantalla.
