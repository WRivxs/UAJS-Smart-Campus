# 📱 Planificación Completa del Frontend (Estructura ClickUp) — UAJS Smart Campus

Este documento contiene la desglose jerárquica de carpetas, listas y tareas para gestionar la **Fase 2 (Frontend React + Vite + Tailwind CSS)** en **ClickUp**, garantizando la asignación clara de roles para **Wadid (Líder)**, **Flor**, **Edimer** y **Job**.

---

## 📁 FOLDER: UAJS SMART CAMPUS > FRONTEND

---

### 📋 LISTA 1: Configuración Base & Infraestructura Frontend
**Propósito:** Entorno de desarrollo, motor de diseño y contenedorización.

* **Tarea FE-BASE-01: Andamiaje del Proyecto React + Vite**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[x] Completada`
  * **Detalles Técnicos:** Estructura modular de carpetas (`views`, `components`, `hooks`, `context`, `routes`). Vite + React 19.

* **Tarea FE-BASE-02: Configuración del Sistema de Diseño Tailwind CSS v4**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[x] Completada`
  * **Detalles Técnicos:** Instalación de `@tailwindcss/vite`, directivas en `index.css`, configuración de fuente *Space Grotesk* y *Plus Jakarta Sans*.

* **Tarea FE-BASE-03: Dockerización y Orquestación del Frontend**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[x] Completada`
  * **Detalles Técnicos:** `Dockerfile` basado en Node 18 Alpine. Integración en `docker-compose.yml` expuesto en el puerto `3000`.

---

### 📋 LISTA 2: Autenticación, JWT & Rutas RBAC
**Propósito:** Gestión de sesión, contexto global, consumo de `ms-usuarios` y seguridad.

* **Tarea FE-AUTH-01: Estado Global de Autenticación (`AuthContext.jsx` y `useAuth.js`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] En Proceso`
  * **Detalles Técnicos:** Decodificación de token JWT, persistencia en `localStorage`, control de expiración y provisión del rol del usuario.

* **Tarea FE-AUTH-02: Cliente HTTP Centralizado (`useFetch.js`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] En Proceso`
  * **Detalles Técnicos:** Hook para peticiones hacia el API Gateway (`http://localhost:8080`). Inyección automática del header `Authorization: Bearer <token>`.

* **Tarea FE-AUTH-03: Guardián de Rutas RBAC (`ProtectedRoute.jsx`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Protección de vistas restringiendo el acceso según la matriz de roles (`Estudiante`, `Docente`, `Administrativo`, `Admin`).

* **Tarea FE-AUTH-04: Maquetación de Vista Landing & Login (`LandingAuth.jsx`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] En Proceso`
  * **Detalles Técnicos:** Diseño Neo-SaaS Glassmorphism basado en `code.html`. Orbes de luz ambiente, bento-grid de capacidades y formulario de ingreso.

* **Tarea FE-AUTH-05: Componente Footer Institucional (`Footer.jsx`)**
  * **Asignado a:** Flor
  * **Estado:** `[ ] En Proceso`
  * **Detalles Técnicos:** Pie de página con copyright de UNIAJS, badge de prototipo académico y enlaces a políticas, soporte IT y términos.

* **Tarea FE-AUTH-06: Selector Visual de Cuentas Semilla**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Botones de 1-clic para probar el sistema rápido con cuentas de Estudiante, Docente, Administrativo y Admin.

---

### 📋 LISTA 3: Dashboard Principal & Módulo de Servicios
**Propósito:** Panel de bienvenida diferenciado por rol y catálogo de servicios de la universidad (`ms-servicios`).

* **Tarea FE-DASH-01: Header & Saludo de Bienvenida (`Navbar.jsx`)**
  * **Asignado a:** Edimer
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Barra superior con logo de UNIAJS, avatar de usuario, nombre de usuario autenticado y rol activo.

* **Tarea FE-DASH-02: Menú Navegación Lateral (`SidebarMenu.jsx`)**
  * **Asignado a:** Edimer
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Menú dinámico que muestra u oculta módulos según los permisos RBAC del usuario.

* **Tarea FE-DASH-03: Tarjetas del Catálogo de Servicios (`ServiceCard.jsx`)**
  * **Asignado a:** Job
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Maquetación con Tailwind para tarjetas de trámites (Certificados, Carnetización, Parqueadero, Salud).

* **Tarea FE-DASH-04: Consumo HTTP de Servicios Universitarios**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Consumo del endpoint `GET /api/servicios` a través del API Gateway y renderizado dinámico en el Dashboard de Estudiante.

* **Tarea FE-DASH-05: Vista de Perfil de Usuario (`MiPerfil.jsx`)**
  * **Asignado a:** Flor
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Formulario de consulta de datos personales y cambio de contraseña enviando `PUT /api/usuarios/perfil`.

---

### 📋 LISTA 4: Módulo de Solicitudes & Trámite PQRS
**Propósito:** Radicación de trámites, máquina de 6 estados y PQRS (`ms-solicitudes` & `ms-pqrs`).

* **Tarea FE-SOL-01: Formulario de Radicación de Solicitud (`FlujoSolicitud.jsx`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Selección de servicio, adjunto de motivo y generación de número de radicado. `POST /api/solicitudes`.

* **Tarea FE-SOL-02: Tabla Historial de Solicitudes (`ListadoSolicitudes.jsx`)**
  * **Asignado a:** Job
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Tabla interactiva con filtros por estado (`REGISTRADA`, `EN_REVISION`, `APROBADA`, etc.) y consumo de `GET /api/solicitudes`.

* **Tarea FE-SOL-03: Componente de Insignias de Estado (`StatusBadge.jsx`)**
  * **Asignado a:** Job
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Insignia visual con colores adaptativos en Tailwind según el estado de la máquina de estados.

* **Tarea FE-SOL-04: Módulo de Gestión PQRS (Radicación y Consulta)**
  * **Asignado a:** Edimer
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Interfaz para crear peticiones/quejas y consultar respuesta oficial usando `POST /api/pqrs` y `GET /api/pqrs/:radicado`.

---

### 📋 LISTA 5: Módulo de Reservas & Recursos Físicos
**Propósito:** Calendario de disponibilidad de aulas/laboratorios y prevención de choques (`ms-recursos` & `ms-reservas`).

* **Tarea FE-RES-01: Panel de Reservas & Calendario (`PanelReservas.jsx`)**
  * **Asignado a:** Wadid (Líder)
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Selección de fecha, horario e infraestructura académica. Consumo de `GET /api/recursos` y `GET /api/reservas`.

* **Tarea FE-RES-02: Modal de Confirmación & Validación (`ResourceModal.jsx`)**
  * **Asignado a:** Flor
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Ventana emergente para confirmar reserva con alerta en tiempo real en caso de choque de horario.

---

### 📋 LISTA 6: Módulo de Eventos & Notificaciones
**Propósito:** Cartelera de eventos del campus y buzón de alertas (`ms-eventos` & `ms-notificaciones`).

* **Tarea FE-EVE-01: Agenda & Tarjetas de Eventos (`AgendaEventos.jsx` / `EventCard.jsx`)**
  * **Asignado a:** Edimer
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Catálogo de eventos académicos con botón de inscripción directa. `GET /api/eventos`.

* **Tarea FE-EVE-02: Centro de Notificaciones (`CentroNotificaciones.jsx` / `NotificationItem.jsx`)**
  * **Asignado a:** Job
  * **Estado:** `[ ] Pendiente`
  * **Detalles Técnicos:** Contador de mensajes no leídos, lista de alertas y acción de marcado masivo. `GET /api/notificaciones`.

---

## 📊 Resumen Estadístico para ClickUp

* **Total Folders:** 1 (UAJS SMART CAMPUS > FRONTEND)
* **Total Listas:** 6 Listas
* **Total Tareas:** 22 Tareas planificadas
* **Asignación:**
  * **Wadid (Líder / Core & API):** 10 Tareas
  * **Flor:** 4 Tareas (Footer, Perfil, Modal Reservas, etc.)
  * **Edimer:** 4 Tareas (Navbar, Sidebar, PQRS, Eventos)
  * **Job:** 4 Tareas (ServiceCard, ListadoSolicitudes, StatusBadge, Notificaciones)
