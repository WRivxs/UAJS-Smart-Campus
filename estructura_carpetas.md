# Estructura Detallada a Nivel de Archivo 📂

> **v2.0 — Corregida:** Se agregaron `ms-servicios` y `ms-pqrs` (faltaban), y se unificó el puerto del API Gateway a **8080** en todos los documentos.

```text
UAJS_Smart_Campus/
│
├── docker-compose.yml       ← Maestro Orquestador
├── README.md                ← Documentación para el equipo
│
├── frontend/                ← ⚛️ FRONTEND REACT
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx         ← Punto de entrada de React
│       ├── App.jsx          ← Definición de React Router (rutas protegidas)
│       ├── index.css        ← Estilos globales Tailwind
│       │
│       ├── hooks/           ← 🪝 Custom Hooks (Rúbrica)
│       │   ├── useSmartRedirect.js  ← Temporizador 5s landing page
│       │   ├── useFetch.js          ← Hook para llamadas HTTP al API Gateway
│       │   └── useAuth.js           ← Manejo del JWT y rol en contexto
│       │
│       ├── context/
│       │   └── AuthContext.jsx      ← Proveedor global del usuario autenticado
│       │
│       ├── routes/
│       │   └── ProtectedRoute.jsx   ← Redirecciona si el rol no tiene acceso
│       │
│       ├── views/           ← 🖥️ Las 9 Vistas Obligatorias (Rúbrica)
│       │   ├── LandingAuth.jsx
│       │   ├── DashboardPrincipal.jsx
│       │   ├── DetalleServicio.jsx
│       │   ├── ListadoSolicitudes.jsx
│       │   ├── FlujoSolicitud.jsx
│       │   ├── PanelReservas.jsx
│       │   ├── AgendaEventos.jsx
│       │   ├── CentroNotificaciones.jsx
│       │   └── MiPerfil.jsx
│       │
│       └── components/      ← 🧩 Los 10 Componentes con BEM (Rúbrica)
│           ├── Navbar/
│           │   ├── Navbar.jsx
│           │   └── Navbar.css
│           ├── SidebarMenu/
│           │   ├── SidebarMenu.jsx
│           │   └── SidebarMenu.css
│           ├── SearchBar/
│           │   ├── SearchBar.jsx
│           │   └── SearchBar.css
│           ├── ServiceCard/
│           │   ├── ServiceCard.jsx
│           │   └── ServiceCard.css
│           ├── StatusBadge.jsx
│           ├── DataTable.jsx
│           ├── EventCard.jsx
│           ├── ResourceModal.jsx
│           ├── NotificationItem.jsx
│           └── KPIWidget.jsx
│
├── api-gateway/             ← 🛡️ BACKEND: API GATEWAY (Puerto: 8080)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js         ← Arranca en puerto 8080
│       ├── middlewares/
│       │   ├── authVerify.js     ← Valida JWT y extrae rol
│       │   └── checkRole.js      ← Verifica permiso por rol
│       └── routes/
│           └── gateway.routes.js ← Encamina al microservicio correcto
│
└── microservicios/          ← 🧩 BACKEND: 8 MICROSERVICIOS
    │
    ├── ms-usuarios/         ← Puerto interno: 3001 | BD: db_usuarios
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js              ← Conexión a db_usuarios en postgres_db
    │       ├── routes/
    │       │   └── usuarios.routes.js
    │       ├── controllers/
    │       │   ├── auth.controller.js
    │       │   └── usuarios.controller.js
    │       └── models/
    │           ├── Usuario.js
    │           ├── Rol.js
    │           └── Permiso.js
    │
    ├── ms-servicios/        ← Puerto interno: 3002 | BD: db_servicios  [NUEVO ✅]
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js              ← Conexión a db_servicios
    │       ├── routes/
    │       │   └── servicios.routes.js
    │       ├── controllers/
    │       │   └── servicios.controller.js
    │       └── models/
    │           └── Servicio.js
    │
    ├── ms-solicitudes/      ← Puerto interno: 3003 | BD: db_solicitudes
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js
    │       ├── routes/
    │       │   └── solicitudes.routes.js
    │       ├── controllers/
    │       │   └── solicitudes.controller.js
    │       └── models/
    │           ├── Solicitud.js
    │           └── HistorialEstado.js
    │
    ├── ms-pqrs/             ← Puerto interno: 3004 | BD: db_pqrs       [NUEVO ✅]
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js
    │       ├── routes/
    │       │   └── pqrs.routes.js
    │       ├── controllers/
    │       │   └── pqrs.controller.js
    │       └── models/
    │           └── Pqrs.js
    │
    ├── ms-recursos/         ← Puerto interno: 3005 | BD: db_recursos
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js
    │       ├── routes/
    │       │   └── recursos.routes.js
    │       ├── controllers/
    │       │   └── recursos.controller.js
    │       └── models/
    │           └── Recurso.js
    │
    ├── ms-reservas/         ← Puerto interno: 3006 | BD: db_reservas
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js
    │       ├── routes/
    │       │   └── reservas.routes.js
    │       ├── controllers/
    │       │   └── reservas.controller.js
    │       └── models/
    │           └── Reserva.js
    │
    ├── ms-notificaciones/   ← Puerto interno: 3007 | BD: db_notificaciones
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── configuracion/
    │       │   └── db.js
    │       ├── routes/
    │       │   └── notificaciones.routes.js
    │       ├── controllers/
    │       │   └── notificaciones.controller.js
    │       └── models/
    │           └── Notificacion.js
    │
    └── ms-eventos/          ← Puerto interno: 3008 | BD: db_eventos
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js
            ├── configuracion/
            │   └── db.js
            ├── routes/
            │   └── eventos.routes.js
            ├── controllers/
            │   └── eventos.controller.js
            └── models/
                ├── Evento.js
                └── Inscripcion.js
```

---

## 📊 Mapa de Puertos (Referencia rápida)

| Servicio | Puerto interno Docker | BD propia |
|---|---|---|
| `api-gateway` | **8080** (expuesto al exterior) | — |
| `ms-usuarios` | 3001 | `db_usuarios` |
| `ms-servicios` | 3002 | `db_servicios` |
| `ms-solicitudes` | 3003 | `db_solicitudes` |
| `ms-pqrs` | 3004 | `db_pqrs` |
| `ms-recursos` | 3005 | `db_recursos` |
| `ms-reservas` | 3006 | `db_reservas` |
| `ms-notificaciones` | 3007 | `db_notificaciones` |
| `ms-eventos` | 3008 | `db_eventos` |
| `postgres_db` | 5432 (solo interno) | Todas las BDs |

> 💡 **Para el equipo frontend:** El único URL que deben usar es `http://localhost:8080/api/...`. Nunca llaman directamente a un microservicio.
