# 🏛️ UAJS Smart Campus - Plataforma Distribuida de Servicios Universitarios

Plataforma distribuida monorepo diseñada e implementada para la **Universidad Antonio José de Sucre (UNiAJS)** como parte de la asignatura **Sistemas Distribuidos**.

## 📐 Arquitectura del Sistema

El sistema utiliza una arquitectura basada en **Microservicios** contenerizada con **Docker** y **Docker Compose**.

```
                       [ Cliente Web React (Vite / Vercel) ]
                                         │
                                   HTTP / REST (JSON)
                                         ▼
                             [ API Gateway (Puerto 8080) ]
                                         │
                 ┌───────────────┬───────┴───────┬───────────────┐
                 ▼               ▼               ▼               ▼
           [ ms-usuarios ] [ ms-servicios ] [ ms-solicitudes ] [ ms-pqrs ]
           [ ms-recursos ] [ ms-reservas  ] [ ms-notificaciones] [ ms-eventos ]
                 │               │               │               │
                 └───────────────┴───────┬───────┴───────────────┘
                                         ▼
                             [ PostgreSQL Centralizado ]
                         (8 Bases de Datos Lógicas Independientes)
```

## 📂 Estructura del Proyecto Monorepo

```
UAJS_Smart_Campus/
├── api-gateway/              # API Gateway (Express.js - Puerto 8080)
├── frontend/                 # Aplicacion Frontend en React (Vite + TailwindCSS)
├── microservicios/
│   ├── ms-usuarios/          # Gestion de usuarios, auth y RBAC (Puerto 3001)
│   ├── ms-servicios/         # Catalogo de servicios universitarios (Puerto 3002)
│   ├── ms-solicitudes/       # Gestion y seguimiento de solicitudes (Puerto 3003)
│   ├── ms-pqrs/              # Peticiones, Quejas, Reclamos y Sugerencias (Puerto 3004)
│   ├── ms-recursos/          # Recursos universitarios (Puerto 3005)
│   ├── ms-reservas/          # Reservas de laboratorios y salas (Puerto 3006)
│   ├── ms-notificaciones/   # Generacion y envio de notificaciones (Puerto 3007)
│   └── ms-eventos/           # Eventos y actividades (Puerto 3008)
├── docker/                   # Configuraciones e scripts de PostgreSQL
└── docker-compose.yml        # Orquestador maestro de la plataforma
```

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, Vite, TailwindCSS (BEM), React Router V6, Axios.
- **Backend:** Node.js, Express.js (Patrón MVC).
- **Base de Datos:** PostgreSQL.
- **Contenerización:** Docker & Docker Compose.
- **Seguridad:** JWT (JSON Web Tokens), RBAC (Matriz de 4 Roles).

## 🚀 Despliegue Local

```bash
# Clonar repositorio
git clone <URL_DEL_REPOSITORIO>
cd UAJS_Smart_Campus

# Levantar todos los microservicios y base de datos con Docker
docker-compose up --build
```

---
*Desarrollado para la Universidad Antonio José de Sucre (UNiAJS).*
