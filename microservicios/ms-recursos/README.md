# 🔬 Microservicio `ms-recursos` — Catálogo de Recursos e Infraestructura

Administración del catálogo de recursos físicos de la universidad (laboratorios, aulas inteligentes, video beams, impresoras 3D, auditorios), control de **aforos máximos**, gestión de **estados operativos (`BUENO`, `DANADO`, `EN_MANTENIMIENTO`)** y diario de **mantenimientos técnicos**.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3005`
- **Base de Datos:** `db_recursos` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/recursos`
- **Contenedor Docker:** `uajs-ms-recursos`

---

## 📂 Estructura Interna del Microservicio

```text
ms-recursos/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_recursos en postgres_db
    │   └── initDb.js            # Creación de tablas de recursos y mantenimientos con semillas
    ├── controllers/
    │   └── recursoController.js # Búsqueda, filtros por disponibilidad, mantenimientos y CRUD
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── recursoModel.js      # Lógica SQL de Recursos y Registro de Mantenimientos
    └── routes/
        └── recursoRoutes.js     # Rutas Express (/api/recursos)
```

---

## 🌱 Recursos Semilla Pre-cargados (Para Reservas y Frontend)

| ID | Nombre | Tipo | Ubicación | Aforo | Estado |
|---|---|---|---|---|---|
| 1 | `Laboratorio de Inteligencia Artificial (LAB-IA-01)` | ESPACIO | Edificio Tecnológico 3er Piso | 35 | BUENO |
| 2 | `Auditorio Magno (AUD-MAGNO)` | ESPACIO | Bloque Central 1er Piso | 250 | BUENO |
| 3 | `Video Beam 4K EPSON (BEAM-4K-02)` | EQUIPO | Decanatura de Ingeniería | N/A | BUENO |
| 4 | `Impresora 3D Creality Ender 3 (IMP-3D-01)` | EQUIPO | Laboratorio de Prototipado | N/A | EN_MANTENIMIENTO |

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Listar Recursos (`GET /api/recursos`)
- **Headers:** `Authorization: Bearer <token>`
- **Query Params Opcionales:** `?tipo=ESPACIO&estado=BUENO&busqueda=Laboratorio`
- **Response (200 OK):**
  ```json
  {
    "recursos": [
      {
        "id": 1,
        "nombre": "Laboratorio de Inteligencia Artificial (LAB-IA-01)",
        "tipo": "ESPACIO",
        "ubicacion": "Edificio Tecnológico 3er Piso",
        "aforo_maximo": 35,
        "estado": "BUENO",
        "imagen_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
      }
    ]
  }
  ```

### 2. Registrar Mantenimiento (`POST /api/recursos/:id/mantenimiento` — Administrativo / Admin)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "descripcion": "Calibración de lentes e inyectores de impresión.",
    "tecnico_responsable": "Sistemas y Mantenimiento UAJS",
    "fecha_mantenimiento": "2026-09-10"
  }
  ```

### 3. Actualizar Estado de Recurso (`PUT /api/recursos/:id/estado`)
- **Request Body:** `{ "estado": "EN_MANTENIMIENTO" }`
