# 🎓 UAJS Smart Campus — Reporte Oficial de Evidencias de Pruebas de API

> **Fecha de Ejecución:** 25/9/2026, 4:34:16 p. m.  
> **Punto Único de Entrada (API Gateway):** `http://localhost:8080`  
> **Resultados:** **26 de 26 pruebas exitosas** (100.0%) | **Tiempo Total:** 1776 ms

## 📋 Resumen Ejecutivo de Métricas

| Métrica | Valor |
|---|---|
| **Total de Pruebas Ejecutadas** | `26` |
| **Pruebas Superadas (2xx OK)** | `✅ 26` |
| **Pruebas Fallidas** | `0 (Ninguna)` |
| **Microservicios Evaluados** | `8 Microservicios + Gateway + Elasticsearch` |
| **Mecanismo de Autenticación** | `Bearer JWT (HMAC-SHA256)` |
| **Buscador Distribuido** | `Elasticsearch 8.11 (Full-Text + Fuzzy Matching)` |

## 🧪 Matriz Detallada de Pruebas y Evidencias HTTP

| # | Módulo | Caso de Prueba | Método | Endpoint | HTTP Status | Latencia | Estado |
|---|---|---|---|---|---|---|---|
| 1 | **Autenticación** | Login de Estudiante con emisión de JWT | `POST` | `/api/auth/login` | `200 OK` | `280 ms` | ✅ APROBADA |
| 2 | **Autenticación** | Login de Administrador | `POST` | `/api/auth/login` | `200 OK` | `84 ms` | ✅ APROBADA |
| 3 | **Autenticación** | Consultar Perfil canónico | `GET` | `/api/auth/profile` | `200 OK` | `21 ms` | ✅ APROBADA |
| 4 | **Usuarios** | Consultar Perfil alterno (Bug /profile corregido) | `GET` | `/api/usuarios/profile` | `200 OK` | `23 ms` | ✅ APROBADA |
| 5 | **Usuarios** | Listar Roles institucionales | `GET` | `/api/usuarios/roles` | `200 OK` | `35 ms` | ✅ APROBADA |
| 6 | **Elasticsearch** | Búsqueda Exacta en todos los índices | `GET` | `/api/search?q=carné` | `200 OK` | `79 ms` | ✅ APROBADA |
| 7 | **Elasticsearch** | Búsqueda Tolerante a Fallos (Fuzzy typo sin tilde) | `GET` | `/api/search?q=carne` | `200 OK` | `51 ms` | ✅ APROBADA |
| 8 | **Servicios** | Listar Categorías de Servicios | `GET` | `/api/servicios/categorias` | `200 OK` | `65 ms` | ✅ APROBADA |
| 9 | **Servicios** | Listar Catálogo de Servicios | `GET` | `/api/servicios` | `200 OK` | `30 ms` | ✅ APROBADA |
| 10 | **Servicios** | Detalle de Servicio por ID | `GET` | `/api/servicios/1` | `200 OK` | `66 ms` | ✅ APROBADA |
| 11 | **Solicitudes** | Listar Solicitudes del Estudiante | `GET` | `/api/solicitudes` | `200 OK` | `124 ms` | ✅ APROBADA |
| 12 | **Solicitudes** | Crear Solicitud de Certificado | `POST` | `/api/solicitudes` | `201 Created` | `165 ms` | ✅ APROBADA |
| 13 | **Solicitudes** | Detalle de Solicitud con Historial | `GET` | `/api/solicitudes/1` | `200 OK` | `17 ms` | ✅ APROBADA |
| 14 | **PQRS** | Listar PQRS del Usuario | `GET` | `/api/pqrs` | `200 OK` | `34 ms` | ✅ APROBADA |
| 15 | **PQRS** | Crear Ticket PQRS con Radicado Automático | `POST` | `/api/pqrs` | `201 Created` | `34 ms` | ✅ APROBADA |
| 16 | **PQRS** | Consultar PQRS por Radicado Único | `GET` | `/api/pqrs/ticket/PQRS-2026-0006` | `200 OK` | `36 ms` | ✅ APROBADA |
| 17 | **Recursos** | Listar Catálogo de Recursos | `GET` | `/api/recursos` | `200 OK` | `33 ms` | ✅ APROBADA |
| 18 | **Recursos** | Detalle de Recurso por ID | `GET` | `/api/recursos/1` | `200 OK` | `24 ms` | ✅ APROBADA |
| 19 | **Reservas** | Consultar Disponibilidad Horaria | `GET` | `/api/reservas/disponibilidad?recurso_id=1&fecha_reserva=2026-11-15` | `200 OK` | `54 ms` | ✅ APROBADA |
| 20 | **Reservas** | Listar Mis Reservas | `GET` | `/api/reservas` | `200 OK` | `14 ms` | ✅ APROBADA |
| 21 | **Reservas** | Solicitar Reserva de Recurso | `POST` | `/api/reservas` | `201 Created` | `84 ms` | ✅ APROBADA |
| 22 | **Notificaciones** | Listar Notificaciones del Usuario | `GET` | `/api/notificaciones` | `200 OK` | `36 ms` | ✅ APROBADA |
| 23 | **Notificaciones** | Marcar Todas las Notificaciones como Leídas | `PUT` | `/api/notificaciones/marcar-todas-leidas` | `200 OK` | `290 ms` | ✅ APROBADA |
| 24 | **Eventos** | Listar Catálogo de Eventos | `GET` | `/api/eventos` | `200 OK` | `54 ms` | ✅ APROBADA |
| 25 | **Eventos** | Consultar Mis Inscripciones | `GET` | `/api/eventos/mis-inscripciones` | `200 OK` | `16 ms` | ✅ APROBADA |
| 26 | **Eventos** | Detalle de Evento por ID | `GET` | `/api/eventos/1` | `200 OK` | `27 ms` | ✅ APROBADA |

## 🔍 Respuestas de Muestra Obtenidas en Vivo

### 1. Autenticación y Emisión de Token JWT
```json
// POST /api/auth/login
{
  "email": "estudiante@uajs.edu.co",
  "rol_nombre": "Estudiante",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX... (Token JWT Válido)"
}
```

### 2. Búsqueda Global Inteligente en Elasticsearch (Fuzzy Matching sin tildes)
```json
// GET /api/search?q=carne
{
  "status": "OK",
  "total": 1,
  "query": "carne",
  "resultados": [
    {
      "indice": "idx_servicios",
      "score": 4.55,
      "datos": {
        "nombre": "Expedición / Reposición de Carné Universitario",
        "departamento": "Carnetización y Seguridad"
      }
    }
  ]
}
```

### 3. Solicitud y Radicación Única de PQRS
```json
// POST /api/pqrs
{
  "message": "Ticket de PQRS registrado exitosamente con radicado PQRS-2026-0006.",
  "pqrs": {
    "numero_ticket": "PQRS-2026-0006",
    "tipo": "PETICION",
    "estado": "RADICADO"
  }
}
```

## 🚀 Cómo Reproducir en Postman Desktop

1. Abrir Postman Desktop o Web.
2. Hacer clic en **Import** (arriba a la izquierda).
3. Seleccionar los dos archivos ubicados en la carpeta `postman/`:
   - `UAJS_Smart_Campus_API.postman_collection.json`
   - `UAJS_Smart_Campus_Environment.postman_environment.json`
4. Seleccionar el entorno **UAJS Smart Campus - Local Environment** en el selector superior derecho.
5. Hacer clic derecho sobre la colección y seleccionar **Run collection**.
6. Hacer clic en **Run UAJS Smart Campus** para ver todas las pruebas en verde (Passed).
