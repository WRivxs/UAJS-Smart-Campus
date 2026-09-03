# Comunicación entre Microservicios — UAJS Smart Campus 🔗

> Este documento responde la pregunta clave: **¿Cómo hablan entre sí las bases de datos de distintos contenedores Docker?**

---

## 🐳 Estrategia de Bases de Datos en Docker

### La decisión: Un PostgreSQL, múltiples Bases de Datos

No levantamos 8 contenedores de PostgreSQL (uno por servicio). Levantamos **un solo contenedor PostgreSQL** que contiene **8 bases de datos lógicas separadas**, una por microservicio.

```
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

**¿Por qué así?**
- ✅ Cada microservicio se conecta SOLO a su propia BD (independencia real)
- ✅ Un solo contenedor PostgreSQL = menos RAM, más fácil de levantar con Docker Compose
- ✅ Dentro de su BD, el servicio hace JOINs normales entre sus propias tablas
- ✅ Cumple el principio de microservicios sin el costo operativo de 8 instancias

---

## 🌐 Red Interna de Docker — Cómo se "ven" los contenedores

Docker Compose crea automáticamente una **red privada interna** (`smartcampus_network`). Dentro de esta red, cada contenedor tiene un **hostname igual al nombre del servicio** definido en `docker-compose.yml`.

```yaml
# docker-compose.yml (extracto de red)
networks:
  smartcampus_network:
    driver: bridge

services:
  postgres_db:
    networks: [smartcampus_network]
    hostname: postgres_db   # ← Accesible así desde otros contenedores

  ms-usuarios:
    networks: [smartcampus_network]
    hostname: ms-usuarios   # ← Accesible en: http://ms-usuarios:3001

  ms-solicitudes:
    networks: [smartcampus_network]
    hostname: ms-solicitudes # ← Accesible en: http://ms-solicitudes:3003

  api-gateway:
    networks: [smartcampus_network]
    ports: ["8080:8080"]    # ← ÚNICO puerto expuesto al exterior
```

**Regla de oro:** Solo el `api-gateway` está expuesto al mundo exterior (puerto 8080). Los microservicios y la BD **no tienen puertos públicos** — solo pueden ser accedidos desde dentro de la red Docker.

```
EXTERIOR (Internet / React)
        ↓ Puerto 8080
   [ api-gateway ]          ← Único punto de entrada
        ↓ Red interna Docker
   ┌────┬────┬────┬────┐
   │ms-u│ms-s│ms-r│ms-n│   ← Microservicios (puertos internos)
   └────┴────┴────┴────┘
        ↓
   [ postgres_db:5432 ]     ← BD (solo accesible internamente)
```

---

## 🔗 Comunicación Entre Microservicios — El Patrón Elegido

### Patrón: HTTP Síncrono Interno (sin Message Queue)

Cuando un microservicio necesita datos de otro o necesita avisarle algo, hace una **llamada HTTP interna** usando el hostname de Docker.

**¿Por qué no RabbitMQ/Kafka?**
Para este proyecto académico, añadir un Message Broker sería sobreingeniería. HTTP síncrono es suficiente y más fácil de demostrar y depurar.

### Ejemplo Real — Solicitud crea Notificación

```javascript
// Dentro de ms-solicitudes → controllers/SolicitudController.js

const cambiarEstado = async (req, res) => {
  const { id, nuevoEstado } = req.body;

  // 1. ms-solicitudes actualiza su propia BD
  await Solicitud.update({ estado: nuevoEstado }, { where: { id } });
  await HistorialEstado.create({ solicitud_id: id, estado_nuevo: nuevoEstado });

  // 2. ms-solicitudes llama internamente a ms-notificaciones
  //    Usando el hostname de Docker → "ms-notificaciones"
  await axios.post('http://ms-notificaciones:3007/notificaciones/interna', {
    usuario_id: solicitud.usuario_id,
    tipo: 'CAMBIO_ESTADO_SOLICITUD',
    titulo: `Tu solicitud cambió a ${nuevoEstado}`,
    mensaje: `La solicitud #${id} ahora está en estado ${nuevoEstado}`,
    referencia_id: id,
    referencia_tipo: 'solicitud'
  });

  res.json({ ok: true });
};
```

### Mapa de Quién llama a Quién

```
ms-solicitudes  ──→ ms-notificaciones  (al cambiar estado)
ms-reservas     ──→ ms-notificaciones  (al aprobar/rechazar)
ms-pqrs         ──→ ms-notificaciones  (al responder PQRS)
ms-eventos      ──→ ms-notificaciones  (al crear evento nuevo)
api-gateway     ──→ ms-usuarios        (para validar token JWT)
api-gateway     ──→ [cualquier ms]     (para enrutar peticiones)
```

**Regla:** Los microservicios NUNCA acceden a la BD del otro. Solo se comunican via HTTP.

---

## 📡 Contrato de API — Endpoints por Microservicio

> El API Gateway recibe todas las peticiones en `/api/...` y las redirige internamente.

### 🔐 ms-usuarios (Puerto interno: 3001)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Iniciar sesión, devuelve JWT |
| POST | `/auth/logout` | Cualquier usuario | Cerrar sesión |
| POST | `/auth/recuperar` | Público | Solicitar recuperación de contraseña |
| GET | `/usuarios` | ADMIN | Listar todos los usuarios |
| POST | `/usuarios` | ADMIN | Crear nuevo usuario |
| GET | `/usuarios/:id` | ADMIN / Propio | Ver perfil de usuario |
| PUT | `/usuarios/:id` | ADMIN / Propio | Editar perfil |
| PUT | `/usuarios/:id/rol` | ADMIN | Cambiar rol de un usuario |
| DELETE | `/usuarios/:id` | ADMIN | Desactivar usuario |
| GET | `/roles` | ADMIN | Listar roles |

---

### 🏫 ms-servicios (Puerto interno: 3002)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/servicios` | Cualquier usuario | Listar servicios (Dashboard) |
| GET | `/servicios/:id` | Cualquier usuario | Ver detalle de servicio |
| POST | `/servicios` | ADMIN | Crear nuevo servicio |
| PUT | `/servicios/:id` | ADMIN | Editar servicio |
| DELETE | `/servicios/:id` | ADMIN | Eliminar/desactivar servicio |

---

### 📋 ms-solicitudes (Puerto interno: 3003)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/solicitudes` | ADMIN / ADMIN | Listar todas (filtrado por dependencia para Administrativo) |
| GET | `/solicitudes/mias` | Cualquier usuario | Listar solicitudes propias |
| GET | `/solicitudes/:id` | Propio / ADMINISTRATIVO | Ver detalle |
| POST | `/solicitudes` | Cualquier usuario | Crear solicitud |
| PUT | `/solicitudes/:id/estado` | ADMINISTRATIVO / ADMIN | Cambiar estado |
| GET | `/solicitudes/:id/historial` | Propio / ADMINISTRATIVO | Ver historial de estados |

---

### 📣 ms-pqrs (Puerto interno: 3004)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/pqrs` | ADMINISTRATIVO / ADMIN | Listar todas |
| GET | `/pqrs/mias` | Cualquier usuario | Listar propias |
| GET | `/pqrs/:id` | Propio / ADMINISTRATIVO | Ver detalle |
| POST | `/pqrs` | Cualquier usuario | Crear PQRS |
| PUT | `/pqrs/:id/responder` | ADMINISTRATIVO / ADMIN | Responder y cambiar estado |

---

### 🏛️ ms-recursos (Puerto interno: 3005)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/recursos` | Cualquier usuario | Listar recursos con disponibilidad |
| GET | `/recursos/:id` | Cualquier usuario | Ver detalle de recurso |
| POST | `/recursos` | ADMIN | Crear recurso |
| PUT | `/recursos/:id` | ADMIN | Editar recurso |
| PUT | `/recursos/:id/estado` | ADMINISTRATIVO / ADMIN | Cambiar estado (Dañado, Mantenimiento) |
| DELETE | `/recursos/:id` | ADMIN | Eliminar recurso |

---

### 📅 ms-reservas (Puerto interno: 3006)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/reservas` | ADMINISTRATIVO / ADMIN | Listar todas las reservas |
| GET | `/reservas/mias` | Cualquier usuario | Listar reservas propias |
| GET | `/reservas/disponibilidad` | Cualquier usuario | Verificar disponibilidad de recurso |
| POST | `/reservas` | Cualquier usuario | Crear reserva |
| PUT | `/reservas/:id/aprobar` | ADMINISTRATIVO / ADMIN | Aprobar reserva |
| PUT | `/reservas/:id/rechazar` | ADMINISTRATIVO / ADMIN | Rechazar reserva |
| PUT | `/reservas/:id/cancelar` | Propio | Cancelar reserva propia (solo PENDIENTE) |

---

### 🔔 ms-notificaciones (Puerto interno: 3007)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/notificaciones` | Cualquier usuario | Listar mis notificaciones |
| PUT | `/notificaciones/:id/leer` | Cualquier usuario | Marcar como leída |
| PUT | `/notificaciones/leer-todas` | Cualquier usuario | Marcar todas como leídas |
| POST | `/notificaciones/masiva` | ADMIN | Enviar notificación masiva |
| POST | `/notificaciones/interna` | **Solo interno** | Endpoint para llamadas entre microservicios |

---

### 🎉 ms-eventos (Puerto interno: 3008)

| Método | Endpoint | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/eventos` | Cualquier usuario | Listar eventos activos |
| GET | `/eventos/:id` | Cualquier usuario | Ver detalle de evento |
| POST | `/eventos` | DOCENTE / ADMINISTRATIVO / ADMIN | Crear evento |
| PUT | `/eventos/:id` | Creador / ADMIN | Editar evento |
| DELETE | `/eventos/:id` | Creador / ADMIN | Cancelar evento |
| POST | `/eventos/:id/inscribirse` | Cualquier usuario | Inscribirse a evento |
| DELETE | `/eventos/:id/inscripcion` | Propio | Cancelar inscripción |

---

## ⚙️ Variables de Entorno Esenciales (.env por servicio)

### api-gateway
```env
PORT=8080
JWT_SECRET=super_secreto_uajs_2025
MS_USUARIOS_URL=http://ms-usuarios:3001
MS_SERVICIOS_URL=http://ms-servicios:3002
MS_SOLICITUDES_URL=http://ms-solicitudes:3003
MS_PQRS_URL=http://ms-pqrs:3004
MS_RECURSOS_URL=http://ms-recursos:3005
MS_RESERVAS_URL=http://ms-reservas:3006
MS_NOTIFICACIONES_URL=http://ms-notificaciones:3007
MS_EVENTOS_URL=http://ms-eventos:3008
```

### Cada microservicio
```env
PORT=300X                          # Puerto interno del servicio
DATABASE_URL=postgresql://postgres:postgres@postgres_db:5432/db_[servicio]
JWT_SECRET=super_secreto_uajs_2025
MS_NOTIFICACIONES_URL=http://ms-notificaciones:3007  # Para los que notifican
```

---

## 📊 Resumen Visual — Arquitectura Completa

```
[React / Vercel]
      ↓ HTTPS (petición pública)
[api-gateway:8080]  ← ÚNICO punto expuesto al exterior
      ↓ Red interna Docker (smartcampus_network)
 ┌────────────────────────────────────────────────┐
 │  ms-usuarios:3001   ms-servicios:3002          │
 │  ms-solicitudes:3003  ms-pqrs:3004             │
 │  ms-recursos:3005   ms-reservas:3006           │
 │  ms-notificaciones:3007  ms-eventos:3008       │
 └─────────────────────┬──────────────────────────┘
                       ↓ Solo acceso interno
              [postgres_db:5432]
         ┌──────────────────────────┐
         │ db_usuarios  db_servicios│
         │ db_solicitudes  db_pqrs  │
         │ db_recursos  db_reservas │
         │ db_notificaciones        │
         │ db_eventos               │
         └──────────────────────────┘
```
