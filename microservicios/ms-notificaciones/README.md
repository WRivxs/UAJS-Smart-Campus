# 🔔 Microservicio `ms-notificaciones` — Centro de Notificaciones y Alertas

Emisión, consulta y seguimiento del estado de lectura de notificaciones para los usuarios del campus, con soporte para el contador de notificaciones no leídas (`no_leidas_count`) e integración de difusiones masivas.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3007`
- **Base de Datos:** `db_notificaciones` (PostgreSQL)
- **Índice Elasticsearch:** `idx_notificaciones` (Búsqueda Full-Text por título y mensaje)
- **Ruta Gateway Externa:** `http://localhost:8080/api/notificaciones`
- **Contenedor Docker:** `uajs-ms-notificaciones`

---

## 📂 Estructura Interna del Microservicio

```text
ms-notificaciones/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_notificaciones en postgres_db
    │   └── initDb.js            # Creación de tabla de notificaciones con semillas
    ├── controllers/
    │   └── notificacionController.js # Emisión, contador, marcado como leída y difusión
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── notificacionModel.js # Lógica SQL, conteo de no leídas e insersión en lote
    └── routes/
        └── notificacionRoutes.js# Rutas Express (/api/notificaciones)
```

---

## 🏷️ Tipos de Notificación Supported

- `CAMBIO_ESTADO_SOLICITUD`
- `CONFIRMACION_RESERVA`
- `RECHAZO_RESERVA`
- `NUEVA_PQRS`
- `EVENTO_NUEVO`
- `ALERTA_SISTEMA`

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Consultar Mis Notificaciones (`GET /api/notificaciones`)
- **Headers:** `Authorization: Bearer <token>`
- **Query Params Opcionales:** `?leida=false`
- **Response (200 OK):**
  ```json
  {
    "no_leidas_count": 2,
    "notificaciones": [
      {
        "id": 1,
        "tipo": "CONFIRMACION_RESERVA",
        "titulo": "Reserva Aprobada: Laboratorio IA",
        "mensaje": "Tu reserva para el día 2026-09-10 ha sido aprobada.",
        "leida": false,
        "fecha_creacion": "2026-09-06T12:00:00.000Z"
      }
    ]
  }
  ```

### 2. Marcar Todas como Leídas (`PUT /api/notificaciones/marcar-todas-leidas`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Todas las notificaciones (2) han sido marcadas como leídas.",
    "total_actualizadas": 2
  }
  ```

### 3. Emisión Masiva / Difusión (`POST /api/notificaciones/difusion` — Administrativo / Admin)
- Permite emitir una alerta institucional a un arreglo de destinatarios de la universidad.
