# 📋 Microservicio `ms-solicitudes` — Trámites y Auditoría de Estados

Gestión del ciclo de vida completo de solicitudes universitarias (certificados, homologaciones, duplicados), respaldada por una **máquina de estados estricta** y un **historial de auditoría inmutable**.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3003`
- **Base de Datos:** `db_solicitudes` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/solicitudes`
- **Contenedor Docker:** `uajs-ms-solicitudes`

---

## 📂 Estructura Interna del Microservicio

```text
ms-solicitudes/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_solicitudes en postgres_db
    │   └── initDb.js            # Creación de tablas de solicitudes e historial de auditoría con semillas
    ├── controllers/
    │   └── solicitudController.js # Flujo de radicación, consulta y cambio de estado
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── solicitudModel.js    # Transacciones SQL de Solicitudes y Registros de Historial
    └── routes/
        └── solicitudRoutes.js   # Rutas Express (/api/solicitudes)
```

---

## 🔄 Máquina de Estados de una Solicitud

```text
               ┌─────────────┐
               │  PENDIENTE  │ (Recién creada por Estudiante/Docente)
               └──────┬──────┘
                      │ (Administrativo toma el caso)
                      ▼
              ┌──────────────┐
              │ EN_REVISION  │
              └──────┬───────┘
         ┌───────────┴───────────┐
         ▼                       ▼
  ┌─────────────┐         ┌─────────────┐
  │  APROBADA   │         │  RECHAZADA  │
  └─────────────┘         └─────────────┘
```

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Crear Solicitud (`POST /api/solicitudes`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "servicio_id": 1,
    "servicio_nombre": "Expedición de Certificado de Notas",
    "observaciones": "Requiero certificado del período 2025-2 para beca académica."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Solicitud radicada exitosamente.",
    "solicitud": {
      "id": 1,
      "usuario_id": 4,
      "usuario_nombre": "Juan David Rivas",
      "servicio_id": 1,
      "servicio_nombre": "Expedición de Certificado de Notas",
      "estado": "PENDIENTE",
      "observaciones": "Requiero certificado del período 2025-2 para beca académica.",
      "fecha_creacion": "2026-09-06T12:00:00.000Z"
    }
  }
  ```

### 2. Mis Solicitudes (`GET /api/solicitudes/mias`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "solicitudes": [
      {
        "id": 1,
        "servicio_nombre": "Expedición de Certificado de Notas",
        "estado": "EN_REVISION",
        "fecha_creacion": "2026-09-06T12:00:00.000Z"
      }
    ]
  }
  ```

### 3. Cambiar Estado (`PUT /api/solicitudes/:id/estado` — Administrativo / Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "nuevo_estado": "APROBADA",
    "comentario": "Certificado generado y adjuntado en plataforma."
  }
  ```

### 4. Consultar Historial de Auditoría (`GET /api/solicitudes/:id/historial`)
- Devuelve el registro cronológico de todos los cambios de estado con el nombre del funcionario que los aprobó.
