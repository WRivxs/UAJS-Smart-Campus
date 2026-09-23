# 🏛️ UAJS Smart Campus — Plataforma Distribuida de Servicios Universitarios

Plataforma distribuida monorepo diseñada e implementada para la **Universidad Antonio José de Sucre (UNiAJS)** como parte de la asignatura **Sistemas Distribuidos (2026)**.

---

## 📑 Tabla de Contenidos
1. [📐 Arquitectura General del Sistema y Tecnologías](#1--arquitectura-general-del-sistema-y-tecnologías)
2. [🐳 Infraestructura Docker, Redes y Comunicación Inter-Servicios](#2--infraestructura-docker-redes-y-comunicación-inter-servicios)
3. [📂 Estructura Detallada del Monorepo a Nivel de Archivo](#3--estructura-detallada-del-monorepo-a-nivel-de-archivo)
4. [🗄️ Esquema Completo de Bases de Datos y Modelos Relacionales](#4-️-esquema-completo-de-bases-de-datos-y-modelos-relacionales)
5. [📡 Contrato de API y Endpoints por Microservicio](#5--contrato-de-api-y-endpoints-por-microservicio)
6. [🔐 Seguridad, Autenticación y Matriz RBAC](#6--seguridad-autenticación-y-matriz-rbac)
7. [⚛️ Planificación y Arquitectura del Frontend (React + Vite + Tailwind)](#7-️-planificación-y-arquitectura-del-frontend-react--vite--tailwind)
8. [📋 Planificación Estratégica, Sprints y Gestión en ClickUp](#8--planificación-estratégica-sprints-y-gestión-en-clickup)
9. [🚀 Guía de Despliegue Local y Producción](#9--guía-de-despliegue-local-y-producción)

---

## 1. 📐 Arquitectura General del Sistema y Tecnologías

El sistema utiliza una arquitectura distribuida basada en **Microservicios** contenerizada con **Docker** y **Docker Compose**, con un **API Gateway** centralizado como único punto de entrada con seguridad **JWT (JSON Web Tokens)** y **RBAC (Control de Acceso Basado en Roles)**, integrado con un **Motor Distribuido de Búsqueda Full-Text (Elasticsearch)**.

### Diagrama General de la Arquitectura Distribuida
```text
                        [ Cliente Web React 19 (Vite + Tailwind) ]
                                      │
                                HTTP / REST (JSON)
                                      ▼
                        [ API Gateway (Puerto 8080) ]
                        (Validación JWT + Roles RBAC)
                                      │
        ┌───────────────┬─────────────┼─────────────┬───────────────┐
        ▼               ▼             ▼             ▼               ▼
  [ ms-usuarios ] [ ms-servicios ] [ ms-solicitudes ] [ ms-pqrs ] [ ms-recursos ]
   (Puerto 3001)   (Puerto 3002)   (Puerto 3003)   (Puerto 3004)  (Puerto 3005)
        │               │             │             │               │
        └───────────────┴─────────────┼─────────────┴───────────────┘
                                      ▼
                         [ ms-reservas  ] [ ms-notificaciones ] [ ms-eventos ]
                          (Puerto 3006)    (Puerto 3007)       (Puerto 3008)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
  [ PostgreSQL Centralizado ]                    [ Elasticsearch ]
 (8 BDs Lógicas Independientes)                (Puerto 9200 - Buscador)
```

### Justificación Técnica: PostgreSQL vs MySQL
Aunque los requerimientos tradicionales sugieren motores estándar, para un ecosistema distribuido se justificó la adopción de **PostgreSQL** por:
1. **Concurrencia Distribuida y Bloqueos:** PostgreSQL maneja Concurrencia Multiversión (MVCC) de manera nativa y robusta, optimizando múltiples lecturas/escrituras concurrentes provenientes de distintos microservicios sin bloqueos de tabla.
2. **Soporte Nativo JSON / JSONB:** Al operar como APIs REST con payloads dinámicos, PostgreSQL permite indexar y consultar columnas `JSONB` de forma rápida para metadatos y configuraciones.
3. **Ecosistema y Hosting en la Nube:** Compatibilidad nativa con servicios administrados de despliegue rápido (como Supabase, Neon Cloud o Render).

### Motor de Búsqueda Distribuido e Indexación (Elasticsearch)
El sistema integra **Elasticsearch** (Puerto 9200) como motor de búsqueda full-text y auditoría:
- **Sincronización Masiva (Bulk Sync):** Algoritmo centralizado (`elasticsearch_manager.js`) que indexa datos relacionales de PostgreSQL en índices optimizados: `idx_usuarios`, `idx_servicios`, `idx_pqrs`, `idx_solicitudes`, `idx_recursos`, `idx_reservas`, `idx_notificaciones` e `idx_eventos`.
- **Búsqueda Inteligente Multicampo:** Análisis léxico en español y **Fuzzy Matching (`AUTO`)** para tolerar errores ortográficos.
- **Endpoint de Búsqueda Global:** `GET /api/search?q=termino` en el API Gateway.

---

## 2. 🐳 Infraestructura Docker, Redes y Comunicación Inter-Servicios

### Estrategia de Bases de Datos: 1 PostgreSQL con 8 BDs Lógicas
Para evitar el alto consumo de memoria que representaría correr 8 instancias independientes de base de datos, se configuró **un solo contenedor PostgreSQL** (`postgres_db`) que aloja **8 bases de datos lógicas independientes**:

```text
┌─────────────────────────────────────────────┐
│       Contenedor: postgres_db               │
│       Puerto: 5432 (interno Docker)         │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ db_usuarios │  │   db_solicitudes     │  │
│  ├─────────────┤  ├──────────────────────┤  │
│  │ db_servicios│  │   db_pqrs            │  │
│  ├─────────────┤  ├──────────────────────┤  │
│  │ db_recursos │  │   db_reservas        │  │
│  ├─────────────┤  ├──────────────────────┤  │
│  │db_notificac │  │   db_eventos         │  │
│  └─────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────┘
```
**Principios clave:**
- Cada microservicio se conecta **únicamente** a su propia BD lógica.
- Ahorro significativo de recursos y arranque veloz con Docker Compose.
- **Regla estricta:** Ningún microservicio realiza consultas o `JOIN` directos a la base de datos de otro microservicio.

### Red Interna de Docker (`smartcampus_network`)
Docker Compose genera una red tipo `bridge` (`smartcampus_network`) donde cada contenedor tiene asignado un hostname igual a su nombre de servicio.

```text
EXTERIOR (Internet / Navegador / React)
        ↓ Puerto 8080
   [ api-gateway ]          ← ÚNICO punto expuesto al exterior
        ↓ Red interna Docker (smartcampus_network)
   ┌────┬────┬────┬────┬────┬────┬────┬────┐
   │ms-u│ms-s│ms-sol│ms-p│ms-rec│ms-res│ms-n│ms-e│  ← Microservicios (puertos internos)
   └────┴────┴────┴────┴────┴────┴────┴────┘
        ↓
   [ postgres_db:5432 ]     ← BD (solo accesible internamente)
```
- **Regla de oro:** Solo `api-gateway` expone el puerto público `8080`. Los microservicios y la base de datos operan aislados en la red interna.

### Patrón de Comunicación Inter-Servicios: HTTP Síncrono Interno
Cuando un microservicio requiere notificar un evento o validar información con otro, efectúa una **llamada HTTP directa** usando el hostname del contenedor Docker de destino (sin necesidad de Message Brokers adicionales).

```javascript
// Ejemplo en ms-solicitudes: cambiarEstado notifica a ms-notificaciones
await axios.post('http://ms-notificaciones:3007/notificaciones/interna', {
  usuario_id: solicitud.usuario_id,
  tipo: 'CAMBIO_ESTADO_SOLICITUD',
  titulo: `Tu solicitud cambió a ${nuevoEstado}`,
  mensaje: `La solicitud #${id} ahora está en estado ${nuevoEstado}`,
  referencia_id: id,
  referencia_tipo: 'solicitud'
});
```

#### Mapa de Llamadas Internas
- `ms-solicitudes` ──→ `ms-notificaciones` (al cambiar de estado una solicitud)
- `ms-reservas`    ──→ `ms-notificaciones` (al aprobar o rechazar una reserva)
- `ms-pqrs`        ──→ `ms-notificaciones` (al emitir respuesta a una PQRS)
- `ms-eventos`     ──→ `ms-notificaciones` (al programar un nuevo evento institucional)
- `api-gateway`    ──→ `ms-usuarios`        (validación y decodificación de JWT)
- `api-gateway`    ──→ `[cualquier ms]`     (enrutamiento de peticiones del frontend)

### Variables de Entorno (.env)

#### `api-gateway`
```env
PORT=8080
JWT_SECRET=super_secreto_uajs_2025
ELASTICSEARCH_URL=http://elasticsearch:9200
MS_USUARIOS_URL=http://ms-usuarios:3001
MS_SERVICIOS_URL=http://ms-servicios:3002
MS_SOLICITUDES_URL=http://ms-solicitudes:3003
MS_PQRS_URL=http://ms-pqrs:3004
MS_RECURSOS_URL=http://ms-recursos:3005
MS_RESERVAS_URL=http://ms-reservas:3006
MS_NOTIFICACIONES_URL=http://ms-notificaciones:3007
MS_EVENTOS_URL=http://ms-eventos:3008
```

#### Microservicios (Plantilla general)
```env
PORT=300X                          # Puerto interno del servicio (3001 a 3008)
DATABASE_URL=postgresql://postgres:uajs_secure_password_2026@postgres_db:5432/db_[servicio]
JWT_SECRET=super_secreto_uajs_2025
MS_NOTIFICACIONES_URL=http://ms-notificaciones:3007
```

### Mapa de Puertos
| Servicio | Puerto Interno Docker | Puerto Expuesto | BD Asignada |
|---|---|---|---|
| `api-gateway` | 8080 | **8080** | — |
| `ms-usuarios` | 3001 | Privado | `db_usuarios` |
| `ms-servicios` | 3002 | Privado | `db_servicios` |
| `ms-solicitudes` | 3003 | Privado | `db_solicitudes` |
| `ms-pqrs` | 3004 | Privado | `db_pqrs` |
| `ms-recursos` | 3005 | Privado | `db_recursos` |
| `ms-reservas` | 3006 | Privado | `db_reservas` |
| `ms-notificaciones` | 3007 | Privado | `db_notificaciones` |
| `ms-eventos` | 3008 | Privado | `db_eventos` |
| `elasticsearch` | 9200 | **9200** | Motor Índices |
| `postgres_db` | 5432 | **5432** | 8 BDs Lógicas |

---

## 3. 📂 Estructura Detallada del Monorepo a Nivel de Archivo

```text
UAJS_Smart_Campus/
│
├── docker-compose.yml              ← Orquestador maestro de contenedores
├── elasticsearch_manager.js         ← Mapeo, ingesta masiva e indexación en Elasticsearch
├── README.md                       ← Documentación unificada maestra
│
├── docker/                         ← Scripts de inicialización PostgreSQL
│   └── init-scripts/
│       └── 01-init-databases.sql
│
├── frontend/                       ← ⚛️ APLICACIÓN CLIENTE (REACT + VITE)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx                ← Punto de entrada React
│   │   ├── App.jsx                 ← Router principal y rutas protegidas
│   │   ├── index.css               ← Estilos globales Tailwind CSS
│   │   │
│   │   ├── hooks/                  ← Custom Hooks
│   │   │   ├── useSmartRedirect.js ← Temporizador de 5s en Landing
│   │   │   ├── useFetch.js         ← Cliente centralizado con JWT
│   │   │   ├── useAuth.js          ← Contexto de sesión y roles
│   │   │   ├── useSolicitudes.js   ← Consumo ms-solicitudes con fallback
│   │   │   └── useEventos.js       ← Consumo ms-eventos con fallback
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← Proveedor global de autenticación
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx  ← Guardián de acceso según rol RBAC
│   │   │
│   │   ├── views/                  ← Las 9 Vistas Obligatorias
│   │   │   ├── LandingAuth.jsx
│   │   │   ├── DashboardPrincipal.jsx
│   │   │   ├── DetalleServicio.jsx
│   │   │   ├── ListadoSolicitudes.jsx
│   │   │   ├── FlujoSolicitud.jsx
│   │   │   ├── PanelReservas.jsx
│   │   │   ├── AgendaEventos.jsx
│   │   │   ├── CentroNotificaciones.jsx
│   │   │   └── MiPerfil.jsx
│   │   │
│   │   └── components/             ← Catálogo de Componentes BEM
│   │       ├── Navbar/             (Navbar.jsx, Navbar.css)
│   │       ├── SidebarMenu/        (SidebarMenu.jsx, SidebarMenu.css)
│   │       ├── SearchBar/          (SearchBar.jsx, SearchBar.css)
│   │       ├── ServiceCard/        (ServiceCard.jsx, ServiceCard.css)
│   │       ├── StatusBadge.jsx
│   │       ├── DataTable.jsx
│   │       ├── EventCard.jsx
│   │       ├── ResourceModal.jsx
│   │       ├── NotificationItem.jsx
│   │       └── KPIWidget.jsx
│
├── api-gateway/                    ← 🛡️ API GATEWAY (Puerto 8080)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js                ← Servidor Express principal
│       ├── middlewares/
│       │   ├── authVerify.js       ← Validador de token JWT
│       │   └── checkRole.js        ← Middleware de verificación RBAC
│       └── routes/
│           ├── gateway.routes.js   ← Proxy hacia los 8 microservicios
│           └── search.routes.js    ← Consulta distribuida en Elasticsearch
│
└── microservicios/                 ← 🧩 LOS 8 MICROSERVICIOS
    ├── ms-usuarios/                (Puerto 3001 | db_usuarios)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Usuario, Rol, Permiso}}
    ├── ms-servicios/               (Puerto 3002 | db_servicios)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Servicio}}
    ├── ms-solicitudes/             (Puerto 3003 | db_solicitudes)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Solicitud, HistorialEstado}}
    ├── ms-pqrs/                    (Puerto 3004 | db_pqrs)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Pqrs}}
    ├── ms-recursos/                (Puerto 3005 | db_recursos)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Recurso}}
    ├── ms-reservas/                (Puerto 3006 | db_reservas)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Reserva}}
    ├── ms-notificaciones/          (Puerto 3007 | db_notificaciones)
    │   └── src/ {configuracion/db.js, routes/, controllers/, models/{Notificacion}}
    └── ms-eventos/                 (Puerto 3008 | db_eventos)
        └── src/ {configuracion/db.js, routes/, controllers/, models/{Evento, Inscripcion}}
```

---

## 4. 🗄️ Esquema Completo de Bases de Datos y Modelos Relacionales

Cada microservicio gestiona su propia base de datos relacional independiente en PostgreSQL. Las referencias entre servicios se realizan mediante **claves foráneas lógicas** (UUIDs) sin enlaces directos del motor de BD.

### 1. `ms-usuarios` (`db_usuarios`)

#### Tabla `usuarios`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre del usuario |
| `apellido` | VARCHAR(100) | NOT NULL | Apellido del usuario |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Correo institucional |
| `password_hash` | VARCHAR(255) | NOT NULL | Contraseña encriptada con bcrypt |
| `rol_id` | INT | FK → `roles.id` | Rol asignado |
| `activo` | BOOLEAN | DEFAULT true | Estado de la cuenta |
| `token_recuperacion` | VARCHAR(255) | NULL | Token para restablecer contraseña |
| `token_expira_en` | TIMESTAMP | NULL | Expiración de token |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última modificación |

#### Tabla `roles`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | SERIAL | PK |
| `nombre` | VARCHAR(50) | UNIQUE, NOT NULL (`ESTUDIANTE`, `DOCENTE`, `ADMINISTRATIVO`, `ADMIN`) |
| `descripcion` | TEXT | NULL |

#### Tabla `permisos`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | SERIAL | PK |
| `nombre` | VARCHAR(100) | UNIQUE, NOT NULL (Ej: `ver_solicitudes`, `gestionar_usuarios`) |
| `descripcion` | TEXT | NULL |

#### Tabla `roles_permisos` (Pivote)
| Columna | Tipo | Restricción |
|---|---|---|
| `rol_id` | INT | FK → `roles.id` |
| `permiso_id` | INT | FK → `permisos.id` |

---

### 2. `ms-servicios` (`db_servicios`)

#### Tabla `servicios`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador del trámite/servicio |
| `nombre` | VARCHAR(150) | NOT NULL | Nombre del servicio (ej. Certificado, Carnet) |
| `descripcion` | TEXT | NULL | Requisitos e instrucciones |
| `icono_url` | VARCHAR(255) | NULL | Ícono representativo en la UI |
| `categoria` | VARCHAR(100) | NOT NULL | Académico, Administrativo, Bienestar, TI |
| `activo` | BOOLEAN | DEFAULT true | Visibilidad en el Dashboard |
| `url_ruta` | VARCHAR(100) | NULL | Ruta interna en React (ej. `/solicitudes`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de alta |

---

### 3. `ms-solicitudes` (`db_solicitudes`)

#### Tabla `solicitudes`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de la solicitud |
| `usuario_id` | UUID | NOT NULL | Referencia lógica al solicitante |
| `tipo` | ENUM | `SERVICIO`, `ACADÉMICA`, `ADMINISTRATIVA` | Categoría de trámite |
| `dependencia` | VARCHAR(150) | NOT NULL | Área encargada (Registro, Biblioteca, etc.) |
| `fecha_registro` | TIMESTAMP | DEFAULT NOW() | Fecha de radicación |
| `descripcion` | TEXT | NOT NULL | Detalle del requerimiento |
| `prioridad` | ENUM | `BAJA`, `MEDIA`, `ALTA` | Nivel de urgencia |
| `responsable_id` | UUID | NULL | Administrativo asignado |
| `estado` | ENUM | (Ver ciclo de estados) | Estado actual |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Máquina de Estados Estricta:**
```text
[REGISTRADA] ──→ [EN_REVISION] ──→ [ASIGNADA] ──→ [EN_PROCESO] ──→ [RESUELTA] ──→ [CERRADA]
```

#### Tabla `historial_estados_solicitud`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | SERIAL | PK | Registro de auditoría |
| `solicitud_id` | UUID | FK → `solicitudes.id` | Solicitud asociada |
| `estado_anterior` | VARCHAR(50) | NOT NULL | Estado de origen |
| `estado_nuevo` | VARCHAR(50) | NOT NULL | Estado de destino |
| `cambiado_por` | UUID | NOT NULL | Usuario que ejecutó la transición |
| `fecha_cambio` | TIMESTAMP | DEFAULT NOW() | Marca de tiempo |

---

### 4. `ms-pqrs` (`db_pqrs`)

#### Tabla `pqrs`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador de radicado |
| `usuario_id` | UUID | NOT NULL | Radicador |
| `tipo` | ENUM | `PETICION`, `QUEJA`, `RECLAMO`, `SUGERENCIA` | Tipo de manifestación |
| `asunto` | VARCHAR(200) | NOT NULL | Resumen |
| `descripcion` | TEXT | NOT NULL | Exposición de hechos |
| `dependencia_destino`| VARCHAR(150) | NOT NULL | Área responsable |
| `fecha_registro` | TIMESTAMP | DEFAULT NOW() | Momento de radicación |
| `estado` | ENUM | `RECIBIDA`, `EN_TRAMITE`, `RESPONDIDA`, `CERRADA` | Estado del trámite |
| `respuesta` | TEXT | NULL | Respuesta oficial |
| `fecha_respuesta` | TIMESTAMP | NULL | Fecha de pronunciamiento |
| `responsable_id` | UUID | NULL | Funcionario que respondió |

---

### 5. `ms-recursos` (`db_recursos`)

#### Tabla `recursos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador |
| `codigo` | VARCHAR(20) | UNIQUE, NOT NULL | Código patrimonial (ej. `LAB-01`, `PC-104`) |
| `nombre` | VARCHAR(150) | NOT NULL | Nombre descriptivo |
| `tipo` | ENUM | `SALA`, `LABORATORIO`, `EQUIPO`, `ESPACIO_ACADEMICO`, `RECURSO_TECNOLOGICO` | Tipo de bien |
| `ubicacion` | VARCHAR(200) | NOT NULL | Bloque, piso o salón |
| `estado` | ENUM | `BUENO`, `DAÑADO`, `EN_MANTENIMIENTO` | Estado físico |
| `disponibilidad` | BOOLEAN | DEFAULT true | Habilitado para reservas |
| `descripcion` | TEXT | NULL | Características técnicas |
| `imagen_url` | VARCHAR(255) | NULL | Fotografía |
| `aforo_maximo` | INT | NULL | Capacidad de personas |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creación |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Modificación |

---

### 6. `ms-reservas` (`db_reservas`)

#### Tabla `reservas`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador |
| `recurso_id` | UUID | NOT NULL | Recurso solicitado |
| `usuario_id` | UUID | NOT NULL | Solicitante |
| `fecha_reserva` | DATE | NOT NULL | Día programado |
| `hora_inicio` | TIME | NOT NULL | Hora de inicio |
| `hora_fin` | TIME | NOT NULL | Hora de finalización |
| `motivo` | TEXT | NOT NULL | Justificación académica |
| `estado_reserva` | ENUM | `PENDIENTE`, `APROBADA`, `RECHAZADA`, `CANCELADA`, `FINALIZADA` | Estado |
| `aprobado_por` | UUID | NULL | Administrativo evaluador |
| `fecha_solicitud` | TIMESTAMP | DEFAULT NOW() | Creación |
| `observaciones` | TEXT | NULL | Motivo de rechazo o nota |

> 🔒 **Algoritmo Anti-Solapamiento:** Antes de registrar una reserva en estado `PENDIENTE` o cambiarla a `APROBADA`, se verifica que:
> `WHERE recurso_id = :id AND fecha_reserva = :fecha AND estado_reserva = 'APROBADA' AND (hora_inicio < :hora_fin AND hora_fin > :hora_inicio)`
> Si existe conflicto, retorna código HTTP `409 Conflict`.

---

### 7. `ms-notificaciones` (`db_notificaciones`)

#### Tabla `notificaciones`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador |
| `usuario_id` | UUID | NOT NULL | Destinatario |
| `tipo` | ENUM | `CAMBIO_ESTADO_SOLICITUD`, `CONFIRMACION_RESERVA`, `RECHAZO_RESERVA`, `NUEVA_PQRS`, `EVENTO_NUEVO`, `ALERTA_SISTEMA` | Categoría |
| `titulo` | VARCHAR(200) | NOT NULL | Asunto breve |
| `mensaje` | TEXT | NOT NULL | Cuerpo del aviso |
| `leida` | BOOLEAN | DEFAULT false | Flag de lectura |
| `referencia_id` | UUID | NULL | ID del recurso origen |
| `referencia_tipo` | VARCHAR(50) | NULL | `solicitud`, `reserva`, `evento`, `pqrs` |
| `fecha_creacion` | TIMESTAMP | DEFAULT NOW() | Momento de emisión |
| `fecha_lectura` | TIMESTAMP | NULL | Momento de lectura |

---

### 8. `ms-eventos` (`db_eventos`)

#### Tabla `eventos`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador |
| `nombre` | VARCHAR(200) | NOT NULL | Título del evento |
| `tipo` | ENUM | `CONFERENCIA`, `SEMINARIO`, `TALLER`, `EVENTO_ACADEMICO`, `ACTIVIDAD_INSTITUCIONAL` | Formato |
| `descripcion` | TEXT | NOT NULL | Resumen temático |
| `fecha_inicio` | TIMESTAMP | NOT NULL | Apertura |
| `fecha_fin` | TIMESTAMP | NOT NULL | Clausura |
| `lugar_ubicacion` | VARCHAR(200) | NOT NULL | Auditorio o espacio |
| `organizador_id` | UUID | NOT NULL | Usuario creador |
| `aforo_maximo` | INT | NULL | Cupo límite |
| `cupos_disponibles`| INT | DEFAULT aforo | Control en tiempo real |
| `imagen_url` | VARCHAR(255) | NULL | Banner publicitario |
| `estado` | ENUM | `PROGRAMADO`, `EN_CURSO`, `FINALIZADO`, `CANCELADO` | Estado actual |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de alta |

#### Tabla `inscripciones_evento`
| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | SERIAL | PK | Registro de inscripción |
| `evento_id` | UUID | FK → `eventos.id` | Evento |
| `usuario_id` | UUID | NOT NULL | Participante |
| `asistio` | BOOLEAN | DEFAULT false | Control de asistencia |
| `fecha_inscripcion`| TIMESTAMP | DEFAULT NOW() | Registro |

---

## 5. 📡 Contrato de API y Endpoints por Microservicio

Todas las peticiones públicas se dirigen a `http://localhost:8080/api/...`. El API Gateway valida el token JWT y reenvía internamente al microservicio correspondiente.

### 🔐 `ms-usuarios` (Puerto interno: 3001)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Autenticación, retorna JWT con rol y datos |
| POST | `/api/auth/logout` | Cualquier usuario | Cierre de sesión |
| POST | `/api/auth/recuperar` | Público | Solicitud de restablecimiento de contraseña |
| GET | `/api/usuarios` | ADMIN | Listado general de usuarios |
| POST | `/api/usuarios` | ADMIN | Creación de cuenta |
| GET | `/api/usuarios/:id` | Propio / ADMIN | Consulta de perfil |
| PUT | `/api/usuarios/:id` | Propio / ADMIN | Actualización de datos |
| PUT | `/api/usuarios/:id/rol` | ADMIN | Modificación de rol del usuario |
| DELETE | `/api/usuarios/:id` | ADMIN | Desactivación de cuenta |
| GET | `/api/roles` | ADMIN | Listado de roles disponibles |

### 🏫 `ms-servicios` (Puerto interno: 3002)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/servicios` | Cualquier usuario | Catálogo de servicios para el Dashboard |
| GET | `/api/servicios/:id` | Cualquier usuario | Detalle del servicio |
| POST | `/api/servicios` | ADMIN | Creación de servicio en el catálogo |
| PUT | `/api/servicios/:id` | ADMIN | Actualización de servicio |
| DELETE | `/api/servicios/:id` | ADMIN | Ocultar o eliminar servicio |

### 📋 `ms-solicitudes` (Puerto interno: 3003)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/solicitudes` | ADMINISTRATIVO / ADMIN | Listar todas (filtrado por dependencia) |
| GET | `/api/solicitudes/mias` | Cualquier usuario | Listar trámites propios |
| GET | `/api/solicitudes/:id` | Propio / ADMINISTRATIVO / ADMIN | Ver detalle de una solicitud |
| POST | `/api/solicitudes` | Cualquier usuario | Radicar nueva solicitud |
| PUT | `/api/solicitudes/:id/estado` | ADMINISTRATIVO / ADMIN | Cambiar estado (máquina de 6 estados) |
| GET | `/api/solicitudes/:id/historial` | Propio / ADMINISTRATIVO / ADMIN | Ver trazabilidad de cambios de estado |

### 📣 `ms-pqrs` (Puerto interno: 3004)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/pqrs` | ADMINISTRATIVO / ADMIN | Listar PQRS de su dependencia |
| GET | `/api/pqrs/mias` | Cualquier usuario | Listar PQRS radicadas por el usuario |
| GET | `/api/pqrs/:id` | Propio / ADMINISTRATIVO / ADMIN | Detalle de la manifestación |
| POST | `/api/pqrs` | Cualquier usuario | Radicar Petición, Queja, Reclamo o Sugerencia |
| PUT | `/api/pqrs/:id/responder` | ADMINISTRATIVO / ADMIN | Registrar respuesta oficial y cambiar estado |

### 🏛️ `ms-recursos` (Puerto interno: 3005)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/recursos` | Cualquier usuario | Inventario físico con estado y disponibilidad |
| GET | `/api/recursos/:id` | Cualquier usuario | Ficha técnica de aula o equipo |
| POST | `/api/recursos` | ADMIN | Alta de nuevo recurso |
| PUT | `/api/recursos/:id` | ADMIN | Edición de características |
| PUT | `/api/recursos/:id/estado` | ADMINISTRATIVO / ADMIN | Marcar como Dañado / Mantenimiento |
| DELETE | `/api/recursos/:id` | ADMIN | Baja patrimonial del recurso |

### 📅 `ms-reservas` (Puerto interno: 3006)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/reservas` | ADMINISTRATIVO / ADMIN | Listado general de reservas |
| GET | `/api/reservas/mias` | Cualquier usuario | Reservas programadas del usuario |
| GET | `/api/reservas/disponibilidad` | Cualquier usuario | Verificación previa de choque de horario |
| POST | `/api/reservas` | Cualquier usuario | Crear reserva (queda en `PENDIENTE`) |
| PUT | `/api/reservas/:id/aprobar` | ADMINISTRATIVO / ADMIN | Aprobar reserva |
| PUT | `/api/reservas/:id/rechazar` | ADMINISTRATIVO / ADMIN | Rechazar reserva |
| PUT | `/api/reservas/:id/cancelar` | Propio | Cancelar reserva propia (solo si está `PENDIENTE`) |

### 🔔 `ms-notificaciones` (Puerto interno: 3007)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/notificaciones` | Cualquier usuario | Listar notificaciones del usuario autenticado |
| PUT | `/api/notificaciones/:id/leer` | Cualquier usuario | Marcar notificación individual como leída |
| PUT | `/api/notificaciones/leer-todas` | Cualquier usuario | Marcar todo el buzón como leído |
| POST | `/api/notificaciones/masiva` | ADMIN | Enviar comunicado global a toda la institución |
| POST | `/notificaciones/interna` | **Uso interno** | Endpoint para llamadas entre microservicios |

### 🎉 `ms-eventos` (Puerto interno: 3008)
| Método | Endpoint | Rol Mínimo | Descripción |
|---|---|---|---|
| GET | `/api/eventos` | Cualquier usuario | Consultar agenda de eventos activos |
| GET | `/api/eventos/:id` | Cualquier usuario | Detalle del evento y conferencistas |
| POST | `/api/eventos` | DOCENTE / ADMINISTRATIVO / ADMIN | Crear evento (Académico o Institucional) |
| PUT | `/api/eventos/:id` | Creador / ADMIN | Editar información del evento |
| DELETE | `/api/eventos/:id` | Creador / ADMIN | Cancelar evento |
| POST | `/api/eventos/:id/inscribirse` | Cualquier usuario | Inscribirse (decrementa cupo) |
| DELETE | `/api/eventos/:id/inscripcion` | Propio | Cancelar inscripción (libera cupo) |

---

## 6. 🔐 Seguridad, Autenticación y Matriz RBAC

### Jerarquía de Roles
```text
┌─────────────────────────────────┐
│   👑 ADMINISTRADOR DEL SISTEMA  │  ← Control total, gestión de roles y auditoría global
├─────────────────────────────────┤
│      🏢 ADMINISTRATIVO          │  ← Gestión de solicitudes, reservas y PQRS de su dependencia
├─────────────────────────────────┤
│        👨‍🏫 DOCENTE               │  ← Solicitudes, reservas académicas y creación de eventos
├─────────────────────────────────┤
│        🎓 ESTUDIANTE            │  ← Consumo de servicios, radicación de trámites e inscripciones
└─────────────────────────────────┘
```

### Matriz Completa de Permisos por Módulo
| Módulo / Microservicio | 🎓 Estudiante | 👨‍🏫 Docente | 🏢 Administrativo | 👑 Admin Sistema |
|---|:---:|:---:|:---:|:---:|
| **Usuarios & Auth** | Perfil propio | Perfil propio | Ver dependencias | CRUD completo + Roles |
| **Roles & Permisos** | ❌ | ❌ | ❌ | ✅ CRUD total |
| **Servicios (Dashboard)** | Lectura | Lectura | Lectura | CRUD catálogo |
| **Solicitudes** | Crear + propias | Crear + propias | Ver área + avanzar estados | Supervisar todas |
| **PQRS** | Crear + propias | Crear + propias | Ver área + responder | Supervisar todas |
| **Recursos** | Lectura | Lectura | Actualizar estado físico | CRUD completo |
| **Reservas** | Crear* + cancelar propias | Crear + cancelar propias | Aprobar / Rechazar | Supervisar todas |
| **Eventos** | Ver + inscribirse | Ver + crear académicos | Ver + crear institucionales | CRUD total |
| **Notificaciones** | Solo propias | Solo propias | Solo propias | Alertas masivas |

### Alcance Detallado por Rol
- **👑 Administrador del Sistema:** Gestión total de usuarios, roles y permisos en `ms-usuarios`; mantenimiento del catálogo de servicios; control de inventario de recursos; supervisión transversal de solicitudes y reservas; envío de notificaciones masivas.
- **🏢 Administrativo:** Atiende trámites asignados a su dependencia. Puede transicionar estados de solicitudes (`REGISTRADA` → `CERRADA`), responder PQRS oficiales, cambiar el estado operativo de recursos (Bueno → Dañado → Mantenimiento) y aprobar/rechazar solicitudes de reserva.
- **👨‍🏫 Docente:** Consulta y edita su perfil; radica solicitudes académicas; reserva aulas y laboratorios especializados; cancela sus reservas si están en estado `PENDIENTE`; crea eventos de carácter académico.
- **🎓 Estudiante:** Acceso al catálogo de servicios y Pase Digital; radicación y seguimiento de solicitudes; solicitud de reservas de recursos permitidos; inscripción a eventos del campus; radicación de PQRS.

### Flujos de Acción Reales Paso a Paso

#### Flujo 1: Radicación y Atención de una Solicitud
1. El estudiante envía el formulario desde `/solicitudes` en React.
2. Petición `POST /api/solicitudes` al API Gateway con header `Authorization: Bearer <token>`.
3. El Gateway valida firma JWT y rol (`ESTUDIANTE`) y reenvía a `ms-solicitudes`.
4. `ms-solicitudes` almacena el registro con estado `REGISTRADA`.
5. `ms-solicitudes` notifica a `ms-notificaciones` vía HTTP interno para avisar a la dependencia.
6. El funcionario administrativo consulta sus solicitudes y ejecuta `PUT /api/solicitudes/:id/estado` avanzando a `EN_REVISION`.
7. Se inserta registro en `historial_estados_solicitud` y se genera notificación automática al estudiante.

#### Flujo 2: Reserva de Recurso y Control Anti-Solapamiento
1. El docente selecciona un recurso en `/reservas`.
2. Petición `POST /api/reservas`.
3. `ms-reservas` ejecuta consulta de traslape contra reservas `APROBADA` en el mismo rango de fecha y hora.
4. Si hay cruce, responde `409 Conflict`. Si está libre, crea reserva en estado `PENDIENTE`.
5. El administrativo revisa y emite `PUT /api/reservas/:id/aprobar`.
6. Se notifica la confirmación al docente y se bloquea el bloque horario en el calendario.

#### Flujo 3: Gestión de Radicado PQRS
1. Usuario radica requerimiento vía `POST /api/pqrs` (estado inicial `RECIBIDA`).
2. Se enruta notificación a la `dependencia_destino`.
3. El funcionario cambia estado a `EN_TRAMITE`, redacta la respuesta formal y ejecuta `PUT /api/pqrs/:id/responder` (estado `RESPONDIDA`).
4. El solicitante recibe notificación y consulta el radicado oficial.

### Implementación Técnica de Seguridad (Doble Capa)
1. **Capa Front (UX):** En React, componentes como [ProtectedRoute.jsx](file:///c:/Users/david/UAJS-Smart-Campus/frontend/src/routes/ProtectedRoute.jsx) redirigen al Dashboard si el rol en sesión no cuenta con los permisos necesarios.
2. **Capa Backend Perimetral (Seguridad Real):** En Express Gateway, los middlewares `authVerify.js` y `checkRole.js` validan criptográficamente el JWT. Si un usuario intenta enviar una solicitud no autorizada por herramientas externas (como Postman o curl), el Gateway responde inmediatamente `403 Forbidden`.

---

## 7. ⚛️ Planificación y Arquitectura del Frontend (React + Vite + Tailwind)

### Técnica Híbrida: Tailwind CSS + Metodología BEM
Para satisfacer rúbricas estrictas de diseño manteniendo la alta velocidad de desarrollo de Tailwind, se implementó la directiva `@apply` dentro de archivos CSS organizados bajo la convención **BEM (Bloque, Elemento, Modificador)**:

```css
/* Ejemplo: ServiceCard.css */
.tarjeta-servicio {
  @apply bg-white dark:bg-slate-900 shadow-md rounded-2xl p-5 flex flex-col border border-slate-200 transition-all hover:shadow-xl;
}
.tarjeta-servicio__titulo {
  @apply text-lg font-bold text-slate-800 dark:text-white mb-2;
}
.tarjeta-servicio__badge--activo {
  @apply bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold;
}
```

### Las 9 Vistas Obligatorias (React Router v6)
| Ruta | Componente Vista | Propósito |
|---|---|---|
| `/` | `LandingAuth.jsx` | Pantalla de acceso Neo-SaaS, orbes de luz, conteo regresivo de 5s o login |
| `/dashboard` | `DashboardPrincipal.jsx` | Pase Digital, métricas KPI, solicitudes recientes y próximos eventos |
| `/servicios/:id` | `DetalleServicio.jsx` | Información detallada del servicio y requisitos del trámite |
| `/solicitudes` | `ListadoSolicitudes.jsx` | Historial de solicitudes del usuario con filtros de estado |
| `/solicitudes/:id`| `FlujoSolicitud.jsx` | Detalle del trámite y evolución de la máquina de 6 estados |
| `/reservas` | `PanelReservas.jsx` | Calendario interactivo y selección de aulas/laboratorios |
| `/eventos` | `AgendaEventos.jsx` | Cartelera de conferencias, seminarios y control de cupos |
| `/notificaciones`| `CentroNotificaciones.jsx`| Bandeja de entrada de alertas institucionales |
| `/perfil` | `MiPerfil.jsx` | Datos del usuario, rol en sesión y cambio de credenciales |

### Catálogo de los 10 Componentes Reutilizables
1. `Navbar`: Barra superior con logo UNIAJS, campana de alertas y menú de usuario.
2. `SidebarMenu`: Barra lateral dinámica que filtra accesos según el rol RBAC.
3. `SearchBar`: Barra de búsqueda integrada con debounce.
4. `ServiceCard`: Tarjeta del catálogo de servicios universitarios.
5. `StatusBadge`: Etiqueta semántica de estado (`REGISTRADA`, `EN_PROCESO`, `RESUELTA`, `APROBADA`).
6. `DataTable`: Tabla genérica paginada para listas de trámites y reportes.
7. `EventCard`: Tarjeta de evento con fecha, lugar y botón de inscripción.
8. `ResourceModal`: Ventana flotante de confirmación y selección horaria de reservas.
9. `NotificationItem`: Elemento individual de notificación con marca de lectura.
10. `KPIWidget`: Recuadro de métricas resumidas en el Dashboard principal.

### Custom Hooks
- **`useSmartRedirect.js`:** Ejecuta un temporizador de 5 segundos en la vista de bienvenida que redirige al Dashboard si no hay interacción del usuario.
- **`useAuth.js`:** Expone el estado global de autenticación, decodificación de JWT y rol del usuario.
- **`useFetch.js`:** Envoltorio de peticiones HTTP con inyección automática de la cabecera `Authorization: Bearer <token>`.
- **`useSolicitudes.js` & `useEventos.js`:** Hooks con tolerancia a fallos que consumen los endpoints del Gateway y proveen datos de contingencia (*fallback mock*) garantizando que la UI funcione fluidamente incluso en entornos desconectados.

---

## 8. 📋 Planificación Estratégica, Sprints y Gestión en ClickUp

El desarrollo del proyecto se estructuró en **3 Sprints / Etapas** principales y se administró en ClickUp bajo el folder `UAJS SMART CAMPUS > FRONTEND` (6 listas y 22 tareas técnicas).

### Sprints del Proyecto
- **Etapa 1: Configuración Base y API Gateway (Semana 1):** Repositorios, esqueleto Vite + React, Docker Compose base, API Gateway y autenticación con `ms-usuarios`.
- **Etapa 2: Desarrollo Core Universitario (Semanas 2 y 3):** Componentes UI, catálogo de `ms-servicios`, inventario de `ms-recursos`, agenda de `ms-eventos` y máquina de estados en `ms-solicitudes`.
- **Etapa 3: Reservas, Notificaciones y Cierre (Semana 4):** Lógica anti-solapamiento en `ms-reservas`, buzón en `ms-notificaciones`, consumo integral en React mediante hooks, despliegue y video demostrativo.

### Desglose de Listas y Tareas en ClickUp
- **Lista 1: Configuración Base & Infraestructura Frontend**
  - `FE-BASE-01`: Andamiaje del Proyecto React + Vite (`Wadid`).
  - `FE-BASE-02`: Configuración de Tailwind CSS v4 (`Wadid`).
  - `FE-BASE-03`: Dockerización del Frontend (`Wadid`).
- **Lista 2: Autenticación, JWT & Rutas RBAC**
  - `FE-AUTH-01`: Estado Global de Autenticación (`Wadid`).
  - `FE-AUTH-02`: Cliente HTTP Centralizado (`Wadid`).
  - `FE-AUTH-03`: Guardián de Rutas RBAC (`Wadid`).
  - `FE-AUTH-04`: Maquetación de Landing & Login (`Wadid`).
  - `FE-AUTH-05`: Componente Footer Institucional (`Flor`).
  - `FE-AUTH-06`: Selector de Cuentas Semilla (`Wadid`).
- **Lista 3: Dashboard Principal & Módulo de Servicios**
  - `FE-DASH-01`: Navbar con saludo y usuario (`Edimer`).
  - `FE-DASH-02`: Menú Lateral RBAC (`Edimer`).
  - `FE-DASH-03`: Tarjetas de Servicios Universitarios (`Job`).
  - `FE-DASH-04`: Consumo HTTP de Servicios (`Wadid`).
  - `FE-DASH-05`: Vista de Perfil de Usuario (`Flor`).
- **Lista 4: Módulo de Solicitudes & Trámite PQRS**
  - `FE-SOL-01`: Formulario de Radicación (`Wadid`).
  - `FE-SOL-02`: Tabla Historial de Solicitudes (`Job`).
  - `FE-SOL-03`: Componente de Insignias StatusBadge (`Job`).
  - `FE-SOL-04`: Módulo de Radicación y Consulta PQRS (`Edimer`).
- **Lista 5: Módulo de Reservas & Recursos Físicos**
  - `FE-RES-01`: Panel de Reservas & Calendario (`Wadid`).
  - `FE-RES-02`: Modal de Validación de Choques (`Flor`).
- **Lista 6: Módulo de Eventos & Notificaciones**
  - `FE-EVE-01`: Agenda y Tarjetas de Eventos (`Edimer`).
  - `FE-EVE-02`: Centro de Notificaciones y Alertas (`Job`).

### Asignación de Responsabilidades
- **Wadid (Líder / Backend Core & Integración):** 10 Tareas (Arquitectura, Gateway, Auth, Rutas RBAC, Reservas y Consumo API).
- **Flor:** 4 Tareas (Footer institucional, Vista de Perfil, Modales de Reservas y recursos).
- **Edimer:** 4 Tareas (Navbar, Sidebar dinámico, Módulo PQRS y Agenda de Eventos).
- **Job:** 4 Tareas (ServiceCard, Listado de Solicitudes, StatusBadge y Centro de Notificaciones).

### Commits Históricos Relevantes
- `1fa0f79`: Refactorización de UI (Navbar, Sidebar, Dashboard base).
- `eaf90c6`: Integración completa de tarjetas paralelas en `DashboardPrincipal.jsx`.
- `732117f`: Corrección en la extracción de payloads JSON en hooks personalizados.
- `76b4e4c`: Banners con gradientes estilizados y badges dinámicos en el Dashboard.

---

## 9. 🚀 Guía de Despliegue Local y Producción

### Requisitos Previos
- Docker Desktop (v20+ con soporte para Docker Compose).
- Node.js (v18+ recomendado si se ejecutan componentes en local sin contenedor).
- Git instalado.

### Despliegue Local con Docker Compose
1. Clonar el repositorio y posicionarse en la carpeta raíz:
   ```bash
   git clone https://github.com/WRivxs/UAJS-Smart-Campus.git
   cd UAJS-Smart-Campus
   ```

2. Construir y levantar todos los contenedores (Base de datos, Gateway, 8 Microservicios y Elasticsearch):
   ```bash
   docker-compose up --build -d
   ```

3. Verificar el estado de los contenedores en ejecución:
   ```bash
   docker-compose ps
   ```

4. Puntos de Acceso:
   - **API Gateway:** `http://localhost:8080/api`
   - **Buscador Elasticsearch:** `http://localhost:9200`
   - **Base de Datos PostgreSQL:** `localhost:5432` (Usuario: `postgres`, Password: `uajs_secure_password_2026`)
   - **Frontend React:** `http://localhost:3000` (o `http://localhost:5173` en modo desarrollo con `npm run dev`)

### Detener la Plataforma
```bash
docker-compose down
```
*(Para eliminar volúmenes y reiniciar los datos de cero: `docker-compose down -v`).*

### Recomendación de Despliegue en la Nube
- **Frontend:** Despliegue automatizado en **Vercel** conectado a la rama `main` de GitHub.
- **Microservicios y Gateway:** Web Services contenerizados en **Render.com** o **Railway.app**.
- **Base de Datos Distribuida:** Instancia PostgreSQL administrada en **Neon Cloud** o **Supabase**.

---
*Desarrollado para la Universidad Antonio José de Sucre (UNiAJS) — Sistemas Distribuidos 2026.*
