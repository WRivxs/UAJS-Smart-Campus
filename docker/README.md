# 🐳 Guía de Orquestación Docker — UAJS Smart Campus

Este directorio contiene la configuración y scripts de inicialización de la infraestructura en contenedores para **UAJS Smart Campus**.

---

## 🏛️ Mapa de Contenedores y Puertos (11 Servicios)

El archivo `docker-compose.yml` en la raíz del proyecto orquesta **11 contenedores independientes** interconectados mediante la red interna `uajs-network`:

| Contenedor | Servicio | Puerto Externo | BD Asociada | Estado / Healthcheck |
|---|---|---|---|---|
| `uajs-postgres-db` | Base de Datos PostgreSQL | `5432` | *(Instancia Central)* | 🟢 `pg_isready` |
| `uajs-api-gateway` | API Gateway (Orquestador) | **`8080`** | — | 🟢 `Up` |
| `uajs-frontend` | Frontend React + Vite | **`3000`** | — | 🟢 `Up` |
| `uajs-ms-usuarios` | MS Usuarios & Auth | `3001` (interno) | `db_usuarios` | 🟢 `Up` |
| `uajs-ms-servicios` | MS Servicios Universitarios | `3002` (interno) | `db_servicios` | 🟢 `Up` |
| `uajs-ms-solicitudes` | MS Solicitudes | `3003` (interno) | `db_solicitudes` | 🟢 `Up` |
| `uajs-ms-pqrs` | MS PQRS | `3004` (interno) | `db_pqrs` | 🟢 `Up` |
| `uajs-ms-recursos` | MS Recursos Físicos | `3005` (interno) | `db_recursos` | 🟢 `Up` |
| `uajs-ms-reservas` | MS Reservas de Aulas | `3006` (interno) | `db_reservas` | 🟢 `Up` |
| `uajs-ms-notificaciones`| MS Notificaciones | `3007` (interno) | `db_notificaciones` | 🟢 `Up` |
| `uajs-ms-eventos` | MS Eventos Campus | `3008` (interno) | `db_eventos` | 🟢 `Up` |

---

## 🔄 Flujo de Inicialización de la Base de Datos

1. **Creación de Bases de Datos (`/docker/init-scripts/01-init-databases.sql`):**
   Al encender el contenedor `uajs-postgres-db` por primera vez, se ejecutan automáticamente los comandos SQL para crear las 8 bases de datos independientes:
   ```sql
   CREATE DATABASE db_usuarios;
   CREATE DATABASE db_servicios;
   CREATE DATABASE db_solicitudes;
   CREATE DATABASE db_pqrs;
   CREATE DATABASE db_recursos;
   CREATE DATABASE db_reservas;
   CREATE DATABASE db_notificaciones;
   CREATE DATABASE db_eventos;
   ```

2. **Auto-inicialización por Microservicio (`initDb.js`):**
   Al arrancar cada contenedor Node.js, su código ejecuta las migraciones programáticas para crear tablas, claves foráneas e insertar los **datos semilla de prueba**.

---

## 🛠️ Comandos de Uso Frecuente para Desarrolladores

### 1. Iniciar todo el entorno (Backend + Frontend + BD)
```bash
docker compose up -d
```

### 2. Reconstruir imágenes tras cambios en código o dependencias
```bash
docker compose up -d --build
```

### 3. Verificar el estado de los contenedores
```bash
docker ps
```

### 4. Ver los logs en tiempo real de un microservicio específico
```bash
docker logs -f uajs-api-gateway
docker logs -f uajs-ms-solicitudes
docker logs -f uajs-frontend
```

### 5. Apagar todos los contenedores sin borrar los datos
```bash
docker compose down
```

### 6. Reiniciar por completo eliminando volúmenes (Limpieza Total)
```bash
docker compose down -v
```

---

## 🔑 Credenciales por Defecto (Entorno de Desarrollo)

* **PostgreSQL:**
  * Host: `localhost`
  * Puerto: `5432`
  * Usuario: `postgres`
  * Contraseña: `uajs_secure_password_2026`
* **JWT Secret:** `uajs_smart_campus_jwt_secret_key_2026`
* **Credenciales Semilla de Usuarios:**
  * Administrador: `admin@uajs.edu.co` / `Password123!`
  * Docente: `docente@uajs.edu.co` / `Password123!`
  * Administrativo: `administrativo@uajs.edu.co` / `Password123!`
  * Estudiante: `estudiante@uajs.edu.co` / `Password123!`
