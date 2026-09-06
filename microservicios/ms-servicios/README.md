# 🏫 Microservicio `ms-servicios` — Catálogo de Servicios Universitarios

Administración y consulta del catálogo centralizado de servicios del campus para alimentar el Dashboard Principal de la aplicación Frontend.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3002`
- **Base de Datos:** `db_servicios` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/servicios`
- **Contenedor Docker:** `uajs-ms-servicios`

---

## 📂 Estructura Interna del Microservicio

```text
ms-servicios/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_servicios en postgres_db
    │   └── initDb.js            # Creación de tablas de servicios y categorías con semillas
    ├── controllers/
    │   └── servicioController.js# Filtros por categoría, búsqueda y CRUD de servicios
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── servicioModel.js     # Modelo de datos SQL de Servicios y Categorías
    └── routes/
        └── servicioRoutes.js    # Rutas Express (/api/servicios)
```

---

## 🌱 Servicios Semilla Pre-cargados (Para Dashboard Frontend)

| ID | Nombre | Categoría | Icono | Descripción |
|---|---|---|---|---|
| 1 | `Expedición de Certificado de Notas` | Académico | 📜 | Solicitud y descarga de certificados oficiales de notas por semestre. |
| 2 | `Reserva de Laboratorios e Infraestructura` | Recursos | 🔬 | Separación de espacios, equipos de cómputo y laboratorios especializados. |
| 3 | `Radicación y Seguimiento de PQRS` | Atencion | 📣 | Canal directo para presentar Peticiones, Quejas, Reclamos y Sugerencias. |
| 4 | `Inscripción a Eventos y Talleres` | Eventos | 🎯 | Registro a seminarios, conferencias y actividades institucionales. |
| 5 | `Carnetización Digital Universitaria` | Trámites | 💳 | Expedición y duplicado de carnet institucional en formato digital QR. |

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Listar Catálogo de Servicios (`GET /api/servicios`)
- **Headers:** `Authorization: Bearer <token>`
- **Query Params Opcionales:** `?categoria=Academico&busqueda=Certificado`
- **Response (200 OK):**
  ```json
  {
    "servicios": [
      {
        "id": 1,
        "nombre": "Expedición de Certificado de Notas",
        "categoria": "Académico",
        "icono": "certificate",
        "descripcion": "Solicitud y descarga de certificados oficiales de notas por semestre.",
        "activo": true
      }
    ]
  }
  ```

### 2. Ver Detalle de un Servicio (`GET /api/servicios/:id`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "nombre": "Expedición de Certificado de Notas",
    "categoria": "Académico",
    "requisitos": "Estar a paz y salvo con la institución.",
    "tiempo_estimado": "24 horas hábiles"
  }
  ```

### 3. Crear Servicio (`POST /api/servicios` — Solo Administrador)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "nombre": "Duplicado de Diploma",
    "categoria": "Trámites",
    "descripcion": "Solicitud de copia de título profesional.",
    "icono": "school"
  }
  ```
