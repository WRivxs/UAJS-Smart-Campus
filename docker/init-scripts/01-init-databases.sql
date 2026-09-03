-- Script de Inicialización de Bases de Datos Lógicas para UAJS Smart Campus
-- Se ejecuta automáticamente cuando el contenedor de PostgreSQL arranca por primera vez.

CREATE DATABASE db_usuarios;
CREATE DATABASE db_servicios;
CREATE DATABASE db_solicitudes;
CREATE DATABASE db_pqrs;
CREATE DATABASE db_recursos;
CREATE DATABASE db_reservas;
CREATE DATABASE db_notificaciones;
CREATE DATABASE db_eventos;

-- Otorgar permisos al usuario postgres
GRANT ALL PRIVILEGES ON DATABASE db_usuarios TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_servicios TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_solicitudes TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_pqrs TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_recursos TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_reservas TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_notificaciones TO postgres;
GRANT ALL PRIVILEGES ON DATABASE db_eventos TO postgres;
