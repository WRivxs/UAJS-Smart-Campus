# 🏛️ UAJS Smart Campus — Plataforma Distribuida de Servicios Universitarios

Plataforma distribuida monorepo diseñada e implementada para la **Universidad Antonio José de Sucre (UNiAJS)** como parte de la asignatura **Sistemas Distribuidos**.

---

## 📐 Arquitectura del Sistema

El sistema utiliza una arquitectura distribuida basada en **Microservicios** contenerizada con **Docker** y **Docker Compose**, con un **API Gateway** centralizado como único punto de entrada con seguridad **JWT (JSON Web Tokens)** y **RBAC (Control de Acceso Basado en Roles)**.

```text
                        [ Cliente Web React (Vite) ]
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
                                     ▼
                         [ PostgreSQL Centralizado ]
                 (8 Bases de Datos Lógicas Independientes)
```

---

## 📂 Estructura del Monorepo y Documentación Interna

Cada carpeta de microservicio cuenta con su propio archivo `README.md` independiente con el contrato de API, formato de JSON de entrada/salida y guía de integración para el Frontend:

```text
UAJS_Smart_Campus/
├── api-gateway/              👉 [Ver README.md](./api-gateway/README.md) (Puerto 8080 - Express Proxy)
├── microservicios/
│   ├── ms-usuarios/          👉 [Ver README.md](./microservicios/ms-usuarios/README.md) (Puerto 3001 - Auth, Usuarios, RBAC)
│   ├── ms-servicios/         👉 [Ver README.md](./microservicios/ms-servicios/README.md) (Puerto 3002 - Catálogo Servicios)
│   ├── ms-solicitudes/       👉 [Ver README.md](./microservicios/ms-solicitudes/README.md) (Puerto 3003 - Trámites & Auditoría)
│   ├── ms-pqrs/              👉 [Ver README.md](./microservicios/ms-pqrs/README.md) (Puerto 3004 - Radicados PQRS-2026-XXXX)
│   ├── ms-recursos/          👉 [Ver README.md](./microservicios/ms-recursos/README.md) (Puerto 3005 - Aulas & Equipos)
│   ├── ms-reservas/          👉 [Ver README.md](./microservicios/ms-reservas/README.md) (Puerto 3006 - Algoritmo Anti-Solapamiento)
│   ├── ms-notificaciones/   👉 [Ver README.md](./microservicios/ms-notificaciones/README.md) (Puerto 3007 - Alertas & Contador no leídas)
│   └── ms-eventos/           👉 [Ver README.md](./microservicios/ms-eventos/README.md) (Puerto 3008 - Eventos & Cupos)
├── docker/                   # Scripts de inicialización PostgreSQL (01-init-databases.sql)
└── docker-compose.yml        # Orquestador maestro de la plataforma
```

---

## 🔑 Matriz de 4 Roles (RBAC)

1. **`Estudiante`**: Acceso al portal de servicios, trámites, PQRS, reservas y eventos.
2. **`Docente`**: Mismos permisos que estudiante + creación de eventos y solicitud de recursos especiales.
3. **`Administrativo`**: Gestión de solicitudes de su área, aprobación de reservas y respuesta a PQRS.
4. **`Administrador`**: Control total del sistema, gestión de usuarios, roles y configuración global.

---

## 🚀 Despliegue Local con Docker Compose

```bash
# 1. Clonar el repositorio
git clone https://github.com/rivaspayareswadith-png/UAJS-Smart-Campus.git
cd UAJS_Smart_Campus

# 2. Levantar la plataforma completa en contenedores
docker-compose up --build
```

El API Gateway estará disponible en `http://localhost:8080/api`.

---
*Desarrollado para la Universidad Antonio José de Sucre (UNiAJS) — Sistemas Distribuidos 2026.*
