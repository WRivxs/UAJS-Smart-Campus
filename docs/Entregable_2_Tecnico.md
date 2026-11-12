# PROYECTO INTEGRADOR: UAJS SMART CAMPUS
## ENTREGABLE 2: Persistencia de datos, CRUD completos e integración entre microservicios
**Corporación Universitaria Antonio José de Sucre (UNIAJS)**  
**Facultad de Ingeniería — Programa de Ingeniería de Sistemas**  
**Asignatura:** Sistemas Distribuidos  
**Docente:** Laura Paternina Álvarez  
**Año:** 2026  

---

### 👥 Integrantes del Equipo y Datos de Contacto
*(Espacio editable para personalizar con los datos completos de los miembros del equipo)*

| Nombre Completo | Código Estudiantil | Rol en el Proyecto | Correo Institucional |
| :--- | :--- | :--- | :--- |
| **Job Pérez** | *(Ingresar código)* | Líder Backend / Módulo Reservas | `jobperez@uajs.edu.co` |
| *(Nombre Integrante 2)* | *(Ingresar código)* | Desarrollador Frontend / UI | `integrante2@uajs.edu.co` |
| *(Nombre Integrante 3)* | *(Ingresar código)* | Desarrollador Backend / Base de Datos | `integrante3@uajs.edu.co` |
| *(Nombre Integrante 4)* | *(Ingresar código)* | Ingeniero de Pruebas / QA & DevOps | `integrante4@uajs.edu.co` |

**Repositorio en GitHub:** [https://github.com/WRivxs/UAJS-Smart-Campus](https://github.com/WRivxs/UAJS-Smart-Campus)  
**Tablero en ClickUp:** *(Ingresar enlace público o institucional del tablero)*

---

## 📑 Tabla de Contenido
1. [Resumen Ejecutivo y Alcance del Entregable 2](#1-resumen-ejecutivo-y-alcance-del-entregable-2)
2. [Arquitectura Objetivo y Decisiones Técnicas](#2-arquitectura-objetivo-y-decisiones-tcnicas)
3. [Modelo de Datos Relacional y Diccionario de Datos](#3-modelo-de-datos-relacional-y-diccionario-de-datos)
4. [Especificación de Microservicios y Catálogo de Endpoints](#4-especificacin-de-microservicios-y-catlogo-de-endpoints)
5. [Reglas de Negocio y Validaciones en Backend](#5-reglas-de-negocio-y-validaciones-en-backend)
6. [Integración Frontend (React) ➔ Gateway ➔ Microservicios ➔ DB](#6-integracin-frontend-react--gateway--microservicios--db)
7. [Procedimiento de Instalación, Configuración y Ejecución](#7-procedimiento-de-instalacin-configuracin-y-ejecucin)
8. [Matriz de Pruebas y Evidencias de Ejecución](#8-matriz-de-pruebas-y-evidencias-de-ejecucin)
9. [Seguridad Básica y Buenas Prácticas Aplicadas](#9-seguridad-bsica-y-buenas-prcticas-aplicadas)
10. [Limitaciones Conocidas y Proyección hacia el Entregable 3](#10-limitaciones-conocidas-y-proyeccin-hacia-el-entregable-3)
11. [Trazabilidad de Trabajo Colaborativo (GitHub y ClickUp)](#11-trazabilidad-de-trabajo-colaborativo-github-y-clickup)

---

## 1. Resumen Ejecutivo y Alcance del Entregable 2

### 1.1 Propósito de la Entrega
El Entregable 2 representa la consolidación de la plataforma distribuida **UAJS Smart Campus**, transformando los prototipos iniciales con datos simulados (mock data) del Entregable 1 en una solución robusta con:
- **Persistencia real en motor de base de datos relacional** (PostgreSQL 15+).
- **Operaciones CRUD completas** en todos los microservicios de dominio.
- **Validación estricta de reglas de negocio en el backend** (control del ciclo de vida de solicitudes y algoritmo de prevención de solapamiento en reservas).
- **Integración fluida de la interfaz de usuario en React** a través de un único punto de entrada: el **API Gateway**.

### 1.2 Alcance Desarrollado
- Configuración de esquemas y tablas normalizadas con restricciones `NOT NULL`, `UNIQUE`, `CHECK` y claves foráneas.
- Implementación de clientes de acceso a datos con consultas parametrizadas para evitar inyección SQL.
- Conexión del frontend React a los endpoints del API Gateway mediante tokens de autenticación JWT y manejo centralizado de respuestas HTTP.
- Comprobación de persistencia de datos tras el reinicio completo de contenedores.
- Elaboración de scripts DDL reproducibles (`database/schema.sql`) y carga de datos semilla ficticios (`database/seed.sql`).

---

## 2. Arquitectura Objetivo y Decisiones Técnicas

### 2.1 Arquitectura Lógica Distribuida
El sistema adopta el patrón de arquitectura de microservicios con un **API Gateway** centralizado:

```
[ Usuario Final ]
        │
        ▼ (HTTPS / HTTP)
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)              │
│       Vistas, Componentes Modulares, Hooks Axios/Fetch  │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON / REST + JWT Bearer)
                            ▼
┌────────────────────────────────────────────────────────┐
│               API Gateway (Node.js / Express)          │
│   Puerto 8080 - AuthVerify, Enrutamiento Proxy, CORS    │
└─────────┬──────────────┬──────────────┬──────────────┬─┘
          │              │              │              │
          ▼              ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ms-usuarios│  │ms-recursos│  │ms-reservas│  │ms-solicit.│
    │(Port 3001)│  │(Port 3005)│  │(Port 3006)│  │(Port 3003)│
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
          │              │              │              │
    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │db_usuarios│  │db_recursos│  │db_reservas│  │db_solicit.│
    └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

### 2.2 Justificación de Decisiones Tecnológicas

1. **Frontend (React 19 + Vite + Tailwind CSS):**
   - Renderizado reactivo rápido, componentes modulares reutilizables y comunicación asíncrona mediante Custom Hooks (`useReservas`, `useSolicitudes`, `useEventos`, `usePqrs`, `useProfile`).
2. **API Gateway (Express + `express-http-proxy`):**
   - Oculta la topología interna de la red de microservicios.
   - Centraliza la verificación de autenticación JWT (`authVerify.js`) y previene el acceso no autorizado a los servicios internos.
   - Inyecta cabeceras de contexto (`x-user-id`, `x-user-rol`) a las peticiones hacia los microservicios.
3. **Persistencia (PostgreSQL 15+ con contenedor Docker):**
   - Motor relacional ACID con soporte avanzado de tipos de datos (`TIMESTAMP`, `DATE`, `TIME`) y restricciones `CHECK`.
   - Se mantiene el principio de **Database-per-Service**: cada microservicio es dueño de su base de datos lógica (`db_usuarios`, `db_recursos`, `db_reservas`, `db_solicitudes`, `db_eventos`, `db_notificaciones`, `db_servicios`, `db_pqrs`). Ningún servicio accede directamente a las tablas de otro dominio.
4. **Contenedorización (Docker Compose):**
   - Asegura la reproducibilidad del entorno de desarrollo y ejecución en cualquier máquina con un solo comando.

---

## 3. Modelo de Datos Relacional y Diccionario de Datos

### 3.1 Diccionario de Datos por Dominio

#### A. Dominio de Usuarios y Roles (`db_usuarios`)
- **`roles`**: Catálogo de roles del campus (`id` [PK], `nombre` [UNIQUE], `descripcion`, `creado_en`).
- **`permisos`**: Privilegios granulares del sistema (`id` [PK], `nombre` [UNIQUE], `descripcion`).
- **`roles_permisos`**: Tabla intermedia N:M (`rol_id` [FK], `permiso_id` [FK]).
- **`usuarios`**: Datos de identidad y credenciales (`id` [PK], `nombre`, `email` [UNIQUE], `password_hash`, `rol_id` [FK], `facultad_departamento`, `codigo_estudiantil`, `estado` [CHECK: 'activo', 'inactivo'], campos de perfil institucional, `creado_en`, `actualizado_en`).

#### B. Dominio de Recursos Físicos (`db_recursos`)
- **`recursos`**: Aulas, laboratorios, auditorios y equipos (`id` [PK], `codigo` [UNIQUE], `nombre`, `tipo` [CHECK: 'LABORATORIO', 'ESPACIO_ACADEMICO', 'EQUIPO', 'SALA', 'RECURSO_TECNOLOGICO'], `ubicacion`, `estado` [CHECK: 'BUENO', 'EN_MANTENIMIENTO'], `disponibilidad` [BOOLEAN], `descripcion`, `imagen_url`, `aforo_maximo`).
- **`mantenimientos_recurso`**: Bitácora de mantenimiento técnico (`id` [PK], `recurso_id` [FK], `tipo_mantenimiento`, `descripcion`, `tecnico_responsable`, `fecha_inicio`, `fecha_fin`, `estado_mantenimiento`).

#### C. Dominio de Reservas (`db_reservas`)
- **`reservas`**: Solicitudes y aprobaciones de uso de espacios (`id` [PK], `recurso_id`, `recurso_nombre`, `usuario_id`, `usuario_nombre`, `usuario_email`, `fecha_reserva` [DATE], `hora_inicio` [TIME], `hora_fin` [TIME], `motivo` [TEXT], `estado_reserva` [CHECK: 'PENDIENTE', 'APROBADA', 'FINALIZADA', 'RECHAZADA', 'CANCELADA'], `aprobado_por_id`, `aprobado_por_nombre`, `observaciones`, `fecha_solicitud`, `actualizado_en`).  
  *Restricción CHECK:* `hora_fin > hora_inicio`.

#### D. Dominio de Solicitudes Académicas (`db_solicitudes`)
- **`solicitudes`**: Trámites estudiantiles y docentes (`id` [PK], `usuario_id`, `usuario_nombre`, `usuario_email`, `servicio_id`, `tipo`, `dependencia`, `asunto`, `descripcion`, `prioridad` [CHECK: 'BAJA', 'MEDIA', 'ALTA', 'URGENTE'], `responsable_id`, `responsable_nombre`, `estado` [CHECK: 'REGISTRADA', 'EN_REVISION', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'], `observaciones`, `respuesta_final`, `fecha_registro`).
- **`historial_estados_solicitud`**: Trazabilidad del ciclo de vida (`id` [PK], `solicitud_id` [FK], `estado_anterior`, `estado_nuevo`, `cambiado_por_id`, `cambiado_por_nombre`, `observacion`, `fecha_cambio`).

#### E. Dominio de Eventos Institucionales (`db_eventos`)
- **`eventos`**: Agenda académica y cultural (`id` [PK], `nombre`, `tipo`, `descripcion`, `fecha_inicio`, `fecha_fin`, `lugar_ubicacion`, `organizador_id`, `organizador_nombre`, `aforo_maximo`, `cupos_disponibles`, `imagen_url`, `estado`).
- **`inscripciones_evento`**: Registro de asistencia (`id` [PK], `evento_id` [FK], `usuario_id`, `usuario_nombre`, `usuario_email`, `facultad`, `programa`, `semestre`, `fecha_inscripcion`, `asistio`). Restricción `UNIQUE(evento_id, usuario_id)`.

#### F. Dominio de Notificaciones (`db_notificaciones`)
- **`notificaciones`**: Centro de avisos del campus (`id` [PK], `usuario_id`, `usuario_nombre`, `tipo`, `titulo`, `mensaje`, `leida` [BOOLEAN], `referencia_id`, `referencia_tipo`, `fecha_creacion`, `fecha_lectura`).

---

## 4. Especificación de Microservicios y Catálogo de Endpoints

Todas las peticiones públicas se canalizan a través del API Gateway (`http://localhost:8080/api`).

### 4.1 Microservicio de Usuarios (`/api/users` o `/api/usuarios`)
- `POST /api/auth/login`: Autenticación con email y contraseña. Devuelve token JWT firmado.
- `GET /api/users`: Listado de usuarios registrados (requiere rol Administrativo o Administrador).
- `GET /api/users/:id`: Consulta de perfil detallado de usuario.
- `PUT /api/users/:id`: Actualización de datos de perfil institucional y contacto.
- `DELETE /api/users/:id`: Desactivación de cuenta de usuario.

### 4.2 Microservicio de Recursos (`/api/recursos`)
- `GET /api/recursos`: Listado general de aulas, laboratorios y equipos disponibles.
- `GET /api/recursos/:id`: Detalle de un recurso específico por identificador.
- `POST /api/recursos`: Creación de un nuevo recurso físico (valida código único y campos requeridos).
- `PUT /api/recursos/:id`: Modificación de datos (aforo, ubicación, estado de mantenimiento).
- `DELETE /api/recursos/:id`: Eliminación física o lógica del recurso.

### 4.3 Microservicio de Reservas (`/api/reservas`)
- `GET /api/reservas`: Consulta de reservas. Los estudiantes visualizan sus reservas; los administradores visualizan todo el historial.
- `GET /api/reservas/disponibilidad?recurso_id=X&fecha_reserva=YYYY-MM-DD`: Retorna las franjas horarias ocupadas para un recurso en una fecha dada.
- `POST /api/reservas`: Solicitud de nueva reserva. Ejecuta algoritmo anti-solapamiento; retorna `201 Created` o `409 Conflict`.
- `PUT /api/reservas/:id/cancelar`: Cancelación de una reserva propia en estado `PENDIENTE`.
- `PUT /api/reservas/:id/aprobar`: Aprobación institucional de reserva (rol Administrativo/Admin).
- `PUT /api/reservas/:id/rechazar`: Rechazo fundamentado de solicitud de reserva.

### 4.4 Microservicio de Solicitudes (`/api/solicitudes`)
- `GET /api/solicitudes`: Listado de trámites académicos radicados.
- `GET /api/solicitudes/:id`: Detalle de una solicitud y su historial de transiciones.
- `POST /api/solicitudes`: Creación de trámite (nace en estado `REGISTRADA`).
- `PUT /api/solicitudes/:id/estado`: Cambio de estado controlado según máquina de estados.
- `PUT /api/solicitudes/:id/asignar`: Asignación de funcionario responsable.

### 4.5 Microservicio de Eventos (`/api/eventos`)
- `GET /api/eventos`: Catálogo de eventos institucionales y cupos disponibles.
- `POST /api/eventos`: Publicación de nuevo evento académico.
- `POST /api/eventos/:id/inscribirse`: Inscripción de estudiante al evento con decremento atómico de cupos.
- `GET /api/eventos/mis-inscripciones`: Consulta de eventos a los que el usuario se encuentra registrado.

### 4.6 Microservicio de Notificaciones (`/api/notificaciones`)
- `GET /api/notificaciones`: Consulta de notificaciones personales del usuario.
- `PUT /api/notificaciones/:id/leida`: Marcado de notificación como leída con registro de timestamp.
- `PUT /api/notificaciones/marcar-todas`: Marcado masivo de notificaciones leídas.

---

## 5. Reglas de Negocio y Validaciones en Backend

### 5.1 Ciclo de Vida de Solicitudes Académicas
El sistema implementa una máquina de estados determinista en el backend para evitar saltos arbitrarios:

```
[ REGISTRADA ]
      │ (Revisión de requisitos mínimos)
      ▼
[ EN REVISIÓN ]
      │ (Asignación de funcionario responsable)
      ▼
[ ASIGNADA ]
      │ (Inicio de trámite)
      ▼
[ EN PROCESO ]
      │ (Emisión de resolución o documento)
      ▼
[ RESUELTA ]
      │ (Confirmación y conformidad del usuario)
      ▼
[ CERRADA ]
```
*Si una petición HTTP intenta pasar directamente de `REGISTRADA` a `CERRADA`, el controlador rechaza la operación con código `400 Bad Request` o `409 Conflict` y preserva el estado actual.*

### 5.2 Prevención de Solapamiento en Reservas (Algoritmo de Cruce)
Para garantizar que un espacio no sea concedido a dos solicitantes simultáneamente, el modelo ejecuta la siguiente consulta parametrizada antes de insertar:

$$\text{Conflicto} = (\text{hora\_inicio} < \text{slot.hora\_fin}) \land (\text{hora\_fin} > \text{slot.hora\_inicio})$$

```sql
SELECT id FROM reservas
WHERE recurso_id = $1
  AND fecha_reserva = $2
  AND estado_reserva IN ('PENDIENTE', 'APROBADA')
  AND (hora_inicio < $4 AND hora_fin > $3);
```
- Si la consulta retorna registros, el servidor rechaza la transacción inmediatamente con **`HTTP 409 Conflict`** y no modifica la base de datos.
- Las reservas canceladas o rechazadas no bloquean la franja horaria, permitiendo su reutilización inmediata.

---

## 6. Integración Frontend (React) ➔ Gateway ➔ Microservicios ➔ DB

### 6.1 Manejo de Estados en la Interfaz de Usuario
Todos los componentes de React implementan el patrón de estados asíncronos:
- **Estado de Carga (`loading = true`):** Muestra indicadores animados (spinners / skeletons) e inhabilita botones para evitar envíos dobles.
- **Estado de Éxito:** Muestra mensajes Toast flotantes y refresca automáticamente las colecciones locales con los datos persistidos.
- **Estado de Conflicto (409):** Muestra banners de advertencia contextuales sugiriendo seleccionar otro horario o día.
- **Estado Vacío (Empty State):** Presenta ilustraciones e instrucciones claras cuando el usuario no tiene registros, evitando pantallas rotas.

---

## 7. Procedimiento de Instalación, Configuración y Ejecución

### 7.1 Requisitos Previos
- Docker Engine 24+ y Docker Compose v2+.
- Node.js 18+ y npm (para ejecución en modo desarrollo local del frontend).
- Git 2.30+.

### 7.2 Pasos de Despliegue con Docker Compose
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/WRivxs/UAJS-Smart-Campus.git
   cd UAJS-Smart-Campus
   ```
2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
3. **Levantar la plataforma distribuida completa:**
   ```bash
   docker-compose up --build -d
   ```
4. **Verificar estado de los contenedores:**
   ```bash
   docker-compose ps
   ```
   *Comprobar que postgres, api-gateway, frontend y los 6 microservicios se encuentren en estado `Up`.*
5. **Acceder a las aplicaciones:**
   - **Frontend Web:** `http://localhost:5173` o `http://localhost:3000`
   - **API Gateway (Health Check):** `http://localhost:8080/health`

---

## 8. Matriz de Pruebas y Evidencias de Ejecución

Se implementaron y ejecutaron satisfactoriamente las **15 pruebas técnicas requeridas** en el Entregable 2 (Casos T01 al T15). Para el desglose detallado con entradas, salidas esperadas y estado, consultar el documento complementario [`docs/matriz_pruebas.md`](./matriz_pruebas.md) y la colección de Postman en [`postman/UAJS_Smart_Campus.postman_collection.json`](../postman/UAJS_Smart_Campus.postman_collection.json).

*Resumen del resultado de pruebas:*
- **Pruebas de API (Postman / REST):** 100% de casos aprobados con códigos HTTP semánticos (`200`, `201`, `400`, `404`, `409`).
- **Prueba de Resiliencia y Persistencia (T12):** Tras ejecutar `docker-compose restart`, el 100% de los datos continuaron almacenados y disponibles para consulta en React.

---

## 9. Seguridad Básica y Buenas Prácticas Aplicadas

1. **Uso de Datos Ficticios:** Todos los nombres, cédulas, correos y números telefónicos corresponden a datos de prueba ficticios.
2. **Protección contra Inyección SQL:** Todas las consultas en los microservicios utilizan binding de parámetros (`$1, $2, ...`).
3. **Almacenamiento de Contraseñas:** Se utiliza `bcryptjs` con salt rounds = 10; nunca se almacenan contraseñas en texto claro.
4. **Protección de Secretos:** Los tokens y credenciales de conexión se inyectan mediante variables de entorno; el archivo `.env` se encuentra excluido del versionamiento en `.gitignore`.
5. **Aislamiento en Gateway:** Las peticiones del cliente pasan obligatoriamente por el middleware `authVerify` validando la firma del token antes de ser reenviadas por proxy.

---

## 10. Limitaciones Conocidas y Proyección hacia el Entregable 3

- **Comunicación Síncrona:** La interacción actual entre microservicios se realiza mediante HTTP/REST síncrono. En el Entregable 3 se proyecta evaluar mensajería asíncrona mediante broker de eventos (RabbitMQ o Redis Pub/Sub).
- **Despliegue Productivo y Observabilidad:** El entorno actual está preparado para Docker Compose local. En el Entregable 3 se implementará monitoreo avanzado, métricas y endurecimiento para despliegue final en la nube junto con la videomemoria de sustentación.

---

## 11. Trazabilidad de Trabajo Colaborativo (GitHub y ClickUp)

### 11.1 Estrategia de Ramas en GitHub
- **`main`**: Rama principal con código probado y estable.
- **Ramas de funcionalidad (`feature/*`)**: Cada estudiante desarrolla su módulo en ramas aisladas para garantizar la trazabilidad de sus aportes:
  - `feature/modulo-reservas`: Módulo completo de reservas y prevención de solapamiento.
  - `feature/modulo-pqrs`: Módulo de peticiones, quejas y reclamos con SLA.
  - `feature/modulo-perfil`: Perfil institucional y gestión de datos personales.
  - `feature/dashboard-solicitudes-eventos`: Integración del dashboard central.

### 11.2 Matriz de Aportes Individuales de los Integrantes
*(Completar con los datos y enlaces directos de los commits y Pull Requests del equipo)*

| Integrante | Tareas Asignadas en ClickUp | Ramas Trabajadas | Commits Significativos | Pull Requests Revisados / Aprobados |
| :--- | :--- | :--- | :--- | :--- |
| **Job Pérez** | 1. Implementación de persistencia en `ms-reservas`<br>2. Algoritmo de detección de solapamiento horaria<br>3. Creación de vista React y modal de reservas | `feature/modulo-reservas` | `ebbaff7`, `2a52e55` *(y más)* | PR #10 (Reservas) |
| *(Integrante 2)* | *(Listar al menos 3 tareas)* | *(Nombre de rama)* | *(Hashes de commits)* | *(Enlaces o números de PR)* |
| *(Integrante 3)* | *(Listar al menos 3 tareas)* | *(Nombre de rama)* | *(Hashes de commits)* | *(Enlaces o números de PR)* |
| *(Integrante 4)* | *(Listar al menos 3 tareas)* | *(Nombre de rama)* | *(Hashes de commits)* | *(Enlaces o números de PR)* |

---
*Documento preparado conforme a la rúbrica oficial del Proyecto Integrador UAJS Smart Campus — Entregable 2.*

