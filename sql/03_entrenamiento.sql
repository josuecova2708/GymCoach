\c bd_entrenamiento entrenamiento_app

CREATE TABLE "Rutina" (
    "idRutina"      SERIAL PRIMARY KEY,
    "nombre"        VARCHAR(150) NOT NULL,
    "descripcion"   TEXT
);

CREATE TABLE "DetalleRutina" (
    "idRutina"      INTEGER NOT NULL REFERENCES "Rutina"("idRutina") ON DELETE CASCADE,
    "idEjercicio"   INTEGER NOT NULL, -- sin FK a propósito: Ejercicio vive en bd_ejercicios
    "series"        INTEGER NOT NULL,
    "repeticiones"  INTEGER NOT NULL,
    "descanso"      INTEGER NOT NULL,
    PRIMARY KEY ("idRutina", "idEjercicio")
);

CREATE TABLE "Asignacion" (
    "idAsignacion"  SERIAL PRIMARY KEY,
    "idAlumno"      INTEGER NOT NULL, -- sin FK a propósito: Alumno vive en bd_usuarios
    "idRutina"      INTEGER NOT NULL REFERENCES "Rutina"("idRutina"),
    "fechaInicio"   DATE NOT NULL,
    "fechaFin"      DATE NOT NULL
);
