# Plan Estratégico: UAJS Smart Campus 🚀

Al analizar el documento PDF del proyecto integrador, queda claro que este es un reto de **Sistemas Distribuidos**, donde no buscan un solo monolito (todo en un solo proyecto), sino una **Arquitectura de Microservicios**. 

Aquí tienes el plan detallado para desglosar todo esto en **ClickUp**, justificar tu stack tecnológico, y organizar el despliegue de forma que tú y tu equipo no mueran en el intento.

---

## 1. Arquitectura General y Servicios Detectados

La arquitectura general dictada por el documento es:
`Frontend (React) -> API Gateway -> Microservicios -> Bases de Datos`

Tienes **4 roles de sistema**: *Estudiante, Docente, Administrador y Administrativo*.

Y te exigen al menos **6 microservicios independientes**:
1. **Microservicio de Usuarios:** Autenticación (JWT), roles, permisos, login, registro.
2. **Microservicio de Solicitudes:** CRUD completo de solicitudes (con estados que van desde Registrada hasta Cerrada).
3. **Microservicio de Reservas:** Gestión de reservas para salas, equipos, validación de fechas/horas.
4. **Microservicio de Recursos:** Administración del catálogo de los recursos (código, disponibilidad).
5. **Microservicio de Eventos:** Actividades de la universidad, fechas, descripciones.
6. **Microservicio de Notificaciones:** Sistema para avisar cambios de estado y confirmar reservas (por correo o alertas en la UI).
*(Opcional: Microservicio de PQRS o puede ir integrado en solicitudes).*

---

## 2. Recomendación de Base de Datos: PostgreSQL vs MySQL

El documento sugiere MySQL, **PERO** permite usar otro motor relacional "siempre y cuando se justifique". Mi recomendación absoluta para ti, si vas a usar Node.js + Express, es **PostgreSQL**.

### ¿Por qué elegir PostgreSQL y cómo justificarlo en el proyecto?
1. **Arquitectura Distribuida:** En un ecosistema de microservicios, el manejo de concurrencia y bloqueos (Locks) es vital. PostgreSQL usa concurrencia multiversión (MVCC) de manera nativa, haciéndolo increíblemente más robusto para múltiples servicios consultando y escribiendo cosas a la vez en comparación a MySQL.
2. **Manejo de JSON Nativo:** Al usar una API REST enviando puros JSON (como dicta el proyecto), PostgreSQL permite almacenar y buscar dentro de columnas tipo JSONB mucho más fácil y rápido que MySQL, por si necesitas guardar metadatos dinámicos, configuraciones o descripciones complejas.
3. **Fácil Hosteo (Despliegue gratuito):** Con servicios como **Supabase** o **Neon Cloud** o **Render**, levantar bases de datos PostgreSQL en la nube se hace con dos clics, y te quitan el enorme dolor de cabeza de configurar contenedores docker para base de datos localmente.

---

## 3. Plan de Organización en ClickUp (Para tu equipo)

Para que no te estreses viendo todo gigante, créate 3 Sprint/Etapas en ClickUp. Divídelas así y asígnales los miembros de tu equipo según sus fortalezas y debilidades.

### 📌 Etapa 1: Configuración Base y API Gateway (Semana 1)
- **Tarea 1.1 (Infraestructura):** Crear los repositorios en GitHub (1 repo para el Frontend, 1 repo para el Backend/Gateway).
- **Tarea 1.2 (Frontend):** Creación del esqueleto React en Vite. Configuración de CSS (Tailwind o BEM) y React Router V6. Configurar Vistas Vacías (Página principal, Inicio de Sesión).
- **Tarea 1.3 (Backend Core):** Levantar el API Gateway en Node.js + Express (Este será la única puerta de entrada al sistema). Crear Docker-compose básico.
- **Tarea 1.4 (Microservicio Usuarios):** Crear el Microservicio de Autenticación con JWT (Login/Roles) + Conexion a Base de Datos PostgreSQL.

### 📌 Etapa 2: Desarrollo Core de la Universidad (Semana 2 y 3)
*Cada Microservicio será una Tarea Épica en ClickUp. Divídela entre desarrolladores:*
- **Tarea 2.1 (Componentes React):** Crear componentes de UI reutilizables (Tablas, Formularios, Inputs, Botones, Dashboard estático).
- **Tarea 2.2 (Microservicio Recursos):** API CRUD en Express, conectado de forma independiente.
- **Tarea 2.3 (Microservicio Eventos):** API CRUD manejando fechas y lugares.
- **Tarea 2.4 (Microservicio Solicitudes):** API con la lógica de cambios de estados estricta (`Registrada -> Revisión -> Asignada -> Proceso -> Resuelta -> Cerrada`).
- **Tarea 2.5 (Integración Gateway):** Enrutar que desde el API Gateway se pueda llegar a estos microservicios.

### 📌 Etapa 3: Reservas, Notificaciones y Conexión Final (Semana 4)
- **Tarea 3.1 (Microservicio Reservas):** Validar cruces de fechas y comunicarse (ya sea por HTTP directo o colas tipo RabbitMQ/Redis si se animan) con el microservicio de Recursos para validar stock.
- **Tarea 3.2 (Microservicio Notificaciones):** Endpoint simple para crear notificaciones y que el Frontend lo consulte periódicamente.
- **Tarea 3.3 (Consumo Frontend):** En React, implementar `useEffect` y Custom Hooks de consulta general usando `fetch` o `axios` dirigidos hacia el API Gateway para pintar los datos de todos los microservicios en el Dashboard, Tablas de Eventos, Solicitudes.
- **Tarea 3.4 (Despliegue y Video):** Subir todo a Vercel (Front) y Render/Railway (Backend) y grabar la video memoria de 10 minutos dictada por la universidad.

---

## 4. Despliegue, Infraestructura y Docker

Como son microservicios, tratar de correr cada API en servidores en la nube separados es muy costoso y difícil. Mi recomendación:

- **Bases de Datos:** Como te recomendé, usa **Neon** o **Supabase** (Postgres como servicio en la nube, evadiendo configurarlo de cero). También puedes usar Render.
- **Frontend (React)**: Repositorio en GitHub directo a **Vercel**. ¡La mejor opción por lejos! Gratis, rápido y elegante.
- **Backend (API Gateway y Microservicios):** Usa un **Monorepo** en el Backend o usa **Docker Compose**. Si necesitas subirlo a producción (gratis/barato), súbelo como Web Services en **Render.com** o usando contenedores de Docker en **Railway.app** (te dan créditos gratis que rinden perfecto para proyectos universitarios).

### El Flujo de Trabajo ideal (Git):
Nadie debería subir código a `main` directo. Creen ramas (`feature/auth`, `feature/ui-dashboard`), aprueben entre ustedes (Pull Request) y eviten los conflictos así.
