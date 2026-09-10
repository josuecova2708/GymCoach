\c bd_ejercicios ejercicios_app

CREATE TABLE "GrupoMuscular" (
    "idGrupo"   SERIAL PRIMARY KEY,
    "nombre"    VARCHAR(100) NOT NULL
);

CREATE TABLE "Ejercicio" (
    "idEjercicio"   SERIAL PRIMARY KEY,
    "nombre"        VARCHAR(150) NOT NULL,
    "descripcion"   TEXT,
    "idGrupo"       INTEGER NOT NULL REFERENCES "GrupoMuscular"("idGrupo"),
    "fotoUrl"       TEXT,
    "videoUrl"      TEXT,
    "idCoach"       INTEGER NOT NULL -- sin FK a propósito: Coach vive en bd_usuarios
);
