# 📅 Microservicio `ms-reservas` — Sistema de Reservas y Prevención de Solapamiento

Gestión de reservación de espacios físicos y equipos del campus con un **algoritmo matemático estricto de prevención de solapamiento de horarios** y API de consulta de disponibilidad en tiempo real para integrarse con componentes de calendario en el Frontend.

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3006`
- **Base de Datos:** `db_reservas` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/reservas`
- **Contenedor Docker:** `uajs-ms-reservas`

---

## 📂 Estructura Interna del Microservicio

```text
ms-reservas/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_reservas en postgres_db
    │   └── initDb.js            # Creación de tablas de reservas con semillas
    ├── controllers/
    │   └── reservaController.js # Algoritmo de choque, consulta de disponibilidad, aprobación
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación JWT y roles dentro del MS
    ├── models/
    │   └── reservaModel.js      # Lógica SQL y algoritmo de choque entre horas inicio/fin
    └── routes/
        └── reservaRoutes.js     # Rutas Express (/api/reservas)
```

---

## 🧮 Algoritmo de Prevención de Solapamiento

Para impedir que dos usuarios reserven el mismo recurso a la misma hora, la consulta ejecuta la siguiente condición lógica SQL:

$$\text{Existe choque si: } (\text{hora\_inicio} < \text{NUEVA\_HORA\_FIN}) \quad \text{AND} \quad (\text{hora\_fin} > \text{NUEVA\_HORA\_INICIO})$$

Cualquier reserva en estado `PENDIENTE` o `APROBADA` que cumpla esa condición bloquea automáticamente la creación de la nueva reserva respondiendo con un error HTTP 400.

---

## 📡 Contrato de API (Endpoints para Frontend)

### 1. Consultar Disponibilidad (`GET /api/reservas/disponibilidad`)
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?recurso_id=1&fecha=2026-09-10`
- **Response (200 OK):**
  ```json
  {
    "recurso_id": 1,
    "fecha": "2026-09-10",
    "reservas_existentes": [
      {
        "hora_inicio": "08:00:00",
        "hora_fin": "10:00:00",
        "estado": "APROBADA"
      }
    ]
  }
  ```

### 2. Crear Reserva (`POST /api/reservas`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "recurso_id": 1,
    "recurso_nombre": "Laboratorio de Inteligencia Artificial (LAB-IA-01)",
    "fecha_reserva": "2026-09-10",
    "hora_inicio": "10:00:00",
    "hora_fin": "12:00:00",
    "motivo": "Clase práctica de Redes Neuronales"
  }
  ```

### 3. Mis Reservas (`GET /api/reservas/mias`)
- Devuelve la lista de reservas realizadas por el usuario logueado.

### 4. Aprobar / Rechazar Reserva (`PUT /api/reservas/:id/aprobar` — Administrativo / Admin)
- Cambia el estado a `APROBADA` o `RECHAZADA`.
