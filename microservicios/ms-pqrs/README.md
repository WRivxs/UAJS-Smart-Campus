# 📣 Microservicio `ms-pqrs` — Peticiones, Quejas, Reclamos y Sugerencias

Atención a solicitudes institucionales con **generación automática de radicado único (`PQRS-2026-XXXX`)**, opción de envío **anónimo**, cálculo de **SLA de respuesta (15 días hábiles)** y gestión de respuestas oficiales.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3004`
- **Base de Datos:** `db_pqrs` (PostgreSQL)
- **Índice Elasticsearch:** `idx_pqrs` (Búsqueda Full-Text por radicado, asunto y descripción)
- **Ruta Gateway Externa:** `http://localhost:8080/api/pqrs`
- **Contenedor Docker:** `uajs-ms-pqrs`

---

## 📂 Estructura Interna del Microservicio

```text
ms-pqrs/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_pqrs en postgres_db
    │   └── initDb.js            # Creación de tablas de pqrs y respuestas con semillas
    ├── controllers/
    │   └── pqrsController.js    # Creación de radicado, búsqueda por código, respuestas
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── pqrsModel.js         # Lógica SQL y generador de secuencia PQRS-2026-XXXX
    └── routes/
        └── pqrsRoutes.js        # Rutas Express (/api/pqrs)
```

---

## 🏷️ Tipos y Estados de PQRS

- **Tipos Permitidos:** `PETICION`, `QUEJA`, `RECLAMO`, `SUGERENCIA`, `FELICITACION`
- **Estados:** `ABIERTO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Radicar PQRS (`POST /api/pqrs`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "tipo": "QUEJA",
    "asunto": "Falla en aire acondicionado del laboratorio de física",
    "descripcion": "El aire acondicionado presenta ruidos molestos y no enfría adecuadamente.",
    "es_anonimo": false
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "PQRS radicada exitosamente.",
    "pqrs": {
      "id": 1,
      "codigo_radicado": "PQRS-2026-0001",
      "tipo": "QUEJA",
      "asunto": "Falla en aire acondicionado del laboratorio de física",
      "estado": "ABIERTO",
      "fecha_radicacion": "2026-09-06T12:00:00.000Z",
      "fecha_limite_respuesta": "2026-09-27T12:00:00.000Z"
    }
  }
  ```

### 2. Mis PQRS Radicadas (`GET /api/pqrs/mias`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "pqrs": [
      {
        "id": 1,
        "codigo_radicado": "PQRS-2026-0001",
        "asunto": "Falla en aire acondicionado del laboratorio de física",
        "estado": "RESUELTO",
        "respuesta_oficial": "Mantenimiento realizado exitosamente el día 5 de septiembre."
      }
    ]
  }
  ```

### 3. Responder PQRS (`PUT /api/pqrs/:id/responder` — Administrativo / Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "respuesta_oficial": "Se envió equipo técnico a reparar el compresor.",
    "nuevo_estado": "RESUELTO"
  }
  ```
