#!/bin/bash
# Crea un usuario y una base por microservicio. Cada usuario es dueño exclusivo de su base:
# usuarios_app no tiene ningún privilegio sobre bd_ejercicios ni bd_entrenamiento, y viceversa.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER usuarios_app WITH PASSWORD '$USUARIOS_DB_PASSWORD';
    CREATE DATABASE bd_usuarios OWNER usuarios_app;
    REVOKE CONNECT ON DATABASE bd_usuarios FROM PUBLIC;
    GRANT CONNECT ON DATABASE bd_usuarios TO usuarios_app;

    CREATE USER ejercicios_app WITH PASSWORD '$EJERCICIOS_DB_PASSWORD';
    CREATE DATABASE bd_ejercicios OWNER ejercicios_app;
    REVOKE CONNECT ON DATABASE bd_ejercicios FROM PUBLIC;
    GRANT CONNECT ON DATABASE bd_ejercicios TO ejercicios_app;

    CREATE USER entrenamiento_app WITH PASSWORD '$ENTRENAMIENTO_DB_PASSWORD';
    CREATE DATABASE bd_entrenamiento OWNER entrenamiento_app;
    REVOKE CONNECT ON DATABASE bd_entrenamiento FROM PUBLIC;
    GRANT CONNECT ON DATABASE bd_entrenamiento TO entrenamiento_app;
EOSQL
