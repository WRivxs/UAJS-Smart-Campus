# 🛡️ API Gateway — UAJS Smart Campus

Punto único de entrada (Reverse Proxy) y capa de seguridad centralizada para la plataforma **UAJS Smart Campus**.

## 📌 Ficha Técnica

- **Puerto Expuesto:** `8080` (Único puerto público hacia el exterior / Frontend React)
- **Tecnología:** Node.js, Express.js, `express-http-proxy`, `jsonwebtoken`
- **Contenedor Docker:** `uajs-api-gateway`
- **Red Interna Docker:** `uajs-network`

---

## 📐 Responsabilidades

1. **Reverse Proxy:** Redirige todas las peticiones desde `http://localhost:8080/api/...` al microservicio correspondiente en su puerto interno.
2. **Validación JWT (`authVerify`):** Verifica el token en el encabezado `Authorization: Bearer <token>`.
3. **Control de Acceso (RBAC):** Verifica que el rol del usuario tenga permisos suficientes.
4. **Header Enrichment:** Inyecta automáticamente los encabezados `x-user-id` y `x-user-rol` en la petición que se reenvía al microservicio.

---

## 📂 Estructura del Código

```text
api-gateway/
├── Dockerfile                   # Configuración de imagen Docker
├── package.json                 # Dependencias (express, express-http-proxy, jsonwebtoken, dotenv, morgan)
├── .env                         # Variables de entorno (JWT_SECRET y URLs de microservicios)
├── README.md                    # Documentación técnica
└── src/
    ├── index.js                 # Servidor Express y endpoint /health
    ├── middlewares/
    │   ├── authVerify.js        # Middleware de verificación de token JWT
    │   └── checkRole.js         # Middleware de verificación de roles
    └── routes/
        └── gateway.routes.js    # Enrutador principal del proxy
```

---

## 📡 Tabla de Enrutamiento (Proxy Mappings)

| Ruta Pública Gateway | Microservicio Destino | Puerto Interno | Requiere JWT |
|---|---|---|---|
| `/api/auth/*` | `ms-usuarios` | 3001 | ❌ No (Público) |
| `/api/usuarios/*` | `ms-usuarios` | 3001 | 🔒 Sí (`authVerify`) |
| `/api/servicios/*` | `ms-servicios` | 3002 | 🔒 Sí (`authVerify`) |
| `/api/solicitudes/*` | `ms-solicitudes` | 3003 | 🔒 Sí (`authVerify`) |
| `/api/pqrs/*` | `ms-pqrs` | 3004 | 🔒 Sí (`authVerify`) |
| `/api/recursos/*` | `ms-recursos` | 3005 | 🔒 Sí (`authVerify`) |
| `/api/reservas/*` | `ms-reservas` | 3006 | 🔒 Sí (`authVerify`) |
| `/api/notificaciones/*` | `ms-notificaciones` | 3007 | 🔒 Sí (`authVerify`) |
| `/api/eventos/*` | `ms-eventos` | 3008 | 🔒 Sí (`authVerify`) |

---

## ⚙️ Variables de Entorno (`.env`)

```env
PORT=8080
JWT_SECRET=uajs_smart_campus_jwt_secret_key_2026

MS_USUARIOS_URL=http://ms-usuarios:3001
MS_SERVICIOS_URL=http://ms-servicios:3002
MS_SOLICITUDES_URL=http://ms-solicitudes:3003
MS_PQRS_URL=http://ms-pqrs:3004
MS_RECURSOS_URL=http://ms-recursos:3005
MS_RESERVAS_URL=http://ms-reservas:3006
MS_NOTIFICACIONES_URL=http://ms-notificaciones:3007
MS_EVENTOS_URL=http://ms-eventos:3008
```

---

## 🩺 Endpoint de Salud (Healthcheck)

- **`GET /health`**
  - **Respuesta Esperada:**
  ```json
  {
    "status": "OK",
    "service": "API Gateway — UAJS Smart Campus",
    "version": "2.0.0",
    "timestamp": "2026-09-06T12:00:00.000Z",
    "microservicios": {
      "ms-usuarios": "http://ms-usuarios:3001",
      "ms-servicios": "http://ms-servicios:3002",
      "ms-solicitudes": "http://ms-solicitudes:3003",
      "ms-pqrs": "http://ms-pqrs:3004",
      "ms-recursos": "http://ms-recursos:3005",
      "ms-reservas": "http://ms-reservas:3006",
      "ms-notificaciones": "http://ms-notificaciones:3007",
      "ms-eventos": "http://ms-eventos:3008"
    }
  }
  ```
