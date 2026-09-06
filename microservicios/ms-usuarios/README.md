# 👤 Microservicio `ms-usuarios` — Autenticación, Usuarios y RBAC

Gestión centralizada de identidad, autenticación mediante JSON Web Tokens (JWT), recuperación de contraseñas y Matriz de Control de Acceso Basado en Roles (RBAC).

## 📌 Ficha Técnica

- **Puerto Interno Docker:** `3001`
- **Base de Datos:** `db_usuarios` (PostgreSQL)
- **Ruta Gateway Externa:** `http://localhost:8080/api/auth` y `http://localhost:8080/api/usuarios`
- **Contenedor Docker:** `uajs-ms-usuarios`

---

## 📂 Estructura Interna del Microservicio

```text
ms-usuarios/
├── Dockerfile                   # Imagen Docker optimizada
├── package.json                 # Dependencias (express, pg, bcryptjs, jsonwebtoken, dotenv, cors, morgan)
├── README.md                    # Documentación técnica y guía de integración para Frontend
└── src/
    ├── index.js                 # Servidor Express e inicialización de BD
    ├── config/
    │   ├── db.js                # Conexión a db_usuarios en postgres_db
    │   └── initDb.js            # Creación de tablas e inserción de semillas
    ├── controllers/
    │   ├── authController.js    # Login, perfil, cambio de contraseña
    │   └── userController.js    # CRUD de usuarios y roles (Solo Administrador)
    ├── middlewares/
    │   └── authMiddleware.js    # Verificación de JWT y roles dentro del MS
    ├── models/
    │   ├── roleModel.js         # Modelo de datos de Roles
    │   └── userModel.js         # Modelo SQL de Usuarios
    └── routes/
        ├── authRoutes.js        # Rutas de autenticación pública/privada (/api/auth)
        └── userRoutes.js        # Rutas de gestión de usuarios (/api/users)
```

---

## 🔑 Matriz de 4 Roles (RBAC)

1. **`Estudiante`**: Acceso al portal de servicios, trámites, PQRS, reservas y eventos.
2. **`Docente`**: Mismos permisos que estudiante + creación de eventos y solicitud de recursos especiales.
3. **`Administrativo`**: Gestión de solicitudes de su área, aprobación de reservas y respuesta a PQRS.
4. **`Administrador`**: Control total del sistema, gestión de usuarios, roles y configuración global.

---

## 🌱 Usuarios Semilla Pre-cargados (Para pruebas en Frontend)

| Email | Contraseña | Rol | Nombre |
|---|---|---|---|
| `admin@uajs.edu.co` | `Admin123!` | Administrador | Administrador General |
| `docente@uajs.edu.co` | `Docente123!` | Docente | Ana María Gómez |
| `administrativo@uajs.edu.co` | `Admin123!` | Administrativo | Carlos Pérez |
| `estudiante@uajs.edu.co` | `Estudiante123!` | Estudiante | Juan David Rivas |

---

## 📡 Contrato de API (Endpoints para Frontend)

### 🔓 Autenticación (Rutas `/api/auth`)

#### 1. Iniciar Sesión (`POST /api/auth/login`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "estudiante@uajs.edu.co",
    "password": "Estudiante123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 4,
      "nombre": "Juan David Rivas",
      "email": "estudiante@uajs.edu.co",
      "rol_nombre": "Estudiante"
    }
  }
  ```

#### 2. Consultar Perfil Actual (`GET /api/auth/perfil`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": 4,
      "nombre": "Juan David Rivas",
      "email": "estudiante@uajs.edu.co",
      "telefono": "3001234567",
      "rol_nombre": "Estudiante",
      "activo": true
    }
  }
  ```

### 🔒 Gestión de Usuarios (Rutas `/api/usuarios` — Solo Administrador)

- `GET /api/usuarios` → Listar todos los usuarios
- `POST /api/usuarios` → Crear nuevo usuario
- `GET /api/usuarios/:id` → Ver detalle de usuario por ID
- `PUT /api/usuarios/:id` → Editar usuario
- `PUT /api/usuarios/:id/rol` → Cambiar rol de un usuario
- `DELETE /api/usuarios/:id` → Desactivar usuario
