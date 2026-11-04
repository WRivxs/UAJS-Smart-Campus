# 🗄️ Arquitectura de Base de Datos — UAJS Smart Campus

Este directorio contiene los scripts DDL y DML consolidados para el **Entregable 2** del proyecto integrador **UAJS Smart Campus (Sistemas Distribuidos 2026)**.

---

## 🏛️ Modelo y Principio Arquitectónico

El sistema utiliza **PostgreSQL 15** bajo el patrón arquitectónico **Database-per-Service (Base de datos por Microservicio)**:
* Cada microservicio es dueño absoluto de su dominio de datos.
* Ningún microservicio realiza consultas o `JOIN` directos a la base de datos de otro servicio.
* Para optimizar recursos en el entorno de desarrollo y pruebas, todas las bases de datos lógicas conviven de forma aislada dentro de un único contenedor Docker (`uajs-postgres-db:5432`).

---

## 📂 Contenido del Directorio

| Archivo | Descripción |
| :--- | :--- |
| **`schema.sql`** | Definición consolidada de tablas (DDL), tipos de datos, restricciones (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`) para las 8 bases de datos. |
| **`seed.sql`** | Datos de prueba ficticios y reproducibles (DML) para poblar usuarios, roles, recursos, solicitudes, reservas, PQRS, eventos y notificaciones. |

---

## 🗂️ Mapeo de Bases de Datos por Microservicio

| Base de Datos Lógica | Microservicio Dueño | Tablas Principales |
| :--- | :--- | :--- |
| **`db_usuarios`** | `ms-usuarios` (:3001) | `roles`, `permisos`, `roles_permisos`, `usuarios` |
| **`db_servicios`** | `ms-servicios` (:3002) | `categorias_servicios`, `servicios` |
| **`db_solicitudes`** | `ms-solicitudes` (:3003) | `solicitudes`, `historial_estados_solicitud` |
| **`db_pqrs`** | `ms-pqrs` (:3004) | `pqrs`, `respuestas_pqrs` |
| **`db_recursos`** | `ms-recursos` (:3005) | `recursos`, `mantenimientos_recurso` |
| **`db_reservas`** | `ms-reservas` (:3006) | `reservas` (Anti-solapamiento) |
| **`db_notificaciones`**| `ms-notificaciones` (:3007) | `notificaciones` |
| **`db_eventos`** | `ms-eventos` (:3008) | `eventos`, `inscripciones_evento` |

---

## 🚀 Inicialización y Reproducibilidad

1. **Automática (Recomendada con Docker Compose):**
   Al ejecutar `docker compose up -d`, el script `docker/init-scripts/01-init-databases.sql` crea automáticamente las 8 bases de datos, y cada microservicio inicializa sus tablas y datos semilla al arrancar mediante su módulo `initDb.js`.

2. **Manual (mediante psql o cliente SQL):**
   ```bash
   # Conectarse al contenedor PostgreSQL e importar esquema y datos
   docker exec -i uajs-postgres-db psql -U postgres < database/schema.sql
   docker exec -i uajs-postgres-db psql -U postgres < database/seed.sql
   ```

---

## 🔑 Credenciales de Prueba por Defecto
* **Host:** `localhost` o `db` (red interna Docker)
* **Puerto:** `5432`
* **Usuario:** `postgres`
* **Contraseña BD:** `uajs_secure_password_2026`
* **Contraseña de todos los usuarios de la plataforma:** `Password123!`
