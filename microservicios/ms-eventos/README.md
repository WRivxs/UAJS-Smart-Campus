# 🎯 Microservicio `ms-eventos` — Actividades Institucionales y Asistencia

Gestión de la agenda de eventos y conferencias del campus con **control dinámico de cupos en tiempo real (`cupos_disponibles`)**, prevención de **doble inscripción del mismo usuario** y registro de **asistencia**.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3008`
- **Base de Datos:** `db_eventos` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/eventos`
- **Contenedor Docker:** `uajs-ms-eventos`

---

## 📂 Estructura Interna del Microservicio

```text
ms-eventos/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_eventos en postgres_db
    │   └── initDb.js            # Creación de tablas de eventos e inscripciones con semillas
    ├── controllers/
    │   └── eventoController.js  # Creación, inscripción, cancelación y registro de asistencia
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── eventoModel.js       # Consultas SQL y transacciones de descuento de cupos
    └── routes/
        └── eventoRoutes.js      # Rutas Express (/api/eventos)
```

---

## 🌱 Eventos Semilla Pre-cargados

| ID | Nombre | Tipo | Lugar | Fecha | Cupos Totales | Cupos Disponibles |
|---|---|---|---|---|---|---|
| 1 | `Seminario Internacional de IA & Cloud Computing` | ACADEMICO | Auditorio Magno | 2026-10-15 09:00 | 200 | 198 |
| 2 | `Feria de Emprendimiento e Innovación UNiAJS` | CULTURAL | Plaza Central | 2026-10-20 10:00 | 500 | 500 |
| 3 | `Taller Práctico de Microservicios con Node.js` | TALLER | LAB-IA-01 | 2026-09-25 14:00 | 35 | 34 |

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Listar Eventos Disponibles (`GET /api/eventos`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "eventos": [
      {
        "id": 1,
        "titulo": "Seminario Internacional de IA & Cloud Computing",
        "lugar": "Auditorio Magno",
        "fecha": "2026-10-15T09:00:00.000Z",
        "cupo_maximo": 200,
        "cupos_disponibles": 198,
        "activo": true
      }
    ]
  }
  ```

### 2. Inscribirse a un Evento (`POST /api/eventos/:id/inscribirse`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Inscripción realizada exitosamente.",
    "inscripcion": {
      "id": 1,
      "evento_id": 1,
      "usuario_id": 4,
      "fecha_inscripcion": "2026-09-06T12:00:00.000Z",
      "asistio": false
    }
  }
  ```

### 3. Mis Inscripciones (`GET /api/eventos/mis-inscripciones`)
- Devuelve los eventos a los que el usuario logueado está inscrito.

### 4. Cancelar Inscripción (`DELETE /api/eventos/:id/cancelar`)
- Cancela la inscripción y incrementa automáticamente en 1 el contador `cupos_disponibles`.
