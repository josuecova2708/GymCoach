-- Se conecta ya como usuarios_app: las tablas quedan de su propiedad, sin depender de GRANTs.
\c bd_usuarios usuarios_app

CREATE TABLE "Alumno" (
    "idAlumno"  SERIAL PRIMARY KEY,
    "nombre"    VARCHAR(150) NOT NULL,
    "email"     VARCHAR(150) NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "telefono"  VARCHAR(20)
);

CREATE TABLE "Coach" (
    "idCoach"   SERIAL PRIMARY KEY,
    "nombre"    VARCHAR(150) NOT NULL,
    "email"     VARCHAR(150) NOT NULL UNIQUE,
    "password"  TEXT NOT NULL
);
