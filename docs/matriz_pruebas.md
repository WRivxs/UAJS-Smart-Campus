# Matriz de Pruebas Funcionales y de Integración — Entregable 2
## Proyecto Integrador: UAJS Smart Campus
**Asignatura:** Sistemas Distribuidos — Docente: Laura Paternina Álvarez  
**Año:** 2026

---

Esta matriz documenta la ejecución de las 15 pruebas mínimas exigidas en la sección 9.3 del documento orientador del Entregable 2, validando endpoints REST, persistencia en base de datos, reglas de negocio e integración extremo a extremo (`React ➔ API Gateway ➔ Microservicio ➔ PostgreSQL`).

| ID | Nombre de la Prueba | Método / Endpoint | Datos de Entrada | Resultado Esperado | Resultado Observado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **T01** | **Listar recursos del campus** | `GET /api/recursos` | Token JWT válido | HTTP 200 OK. Colección JSON con la lista de aulas, labs y equipos registrados en `db_recursos`. | Devuelve 200 con el listado completo de espacios y equipos con su aforo y disponibilidad. | ✅ Aprobado |
| **T02** | **Crear recurso válido** | `POST /api/recursos` | `{"codigo":"LAB-IOT-01", "nombre":"Laboratorio IoT", "tipo":"LABORATORIO", "ubicacion":"Bloque C"}` | HTTP 201 Created. Registro persistido en PostgreSQL con ID generado. | Recurso insertado con código único y persistido tras reinicio. | ✅ Aprobado |
| **T03** | **Crear recurso incompleto (Validación)** | `POST /api/recursos` | `{"nombre":"Solo Nombre"}` (Falta `codigo` y `ubicacion`) | HTTP 400 Bad Request. Mensaje de error indicando campos obligatorios faltantes. | 400 Bad Request con mensaje: `"codigo, nombre, tipo y ubicacion son obligatorios"`. | ✅ Aprobado |
| **T04** | **Consultar recurso por ID existente** | `GET /api/recursos/:id` | `ID: 1` | HTTP 200 OK con objeto detallado del recurso `LAB-IA-01`. | Devuelve 200 con el objeto completo del laboratorio y sus atributos. | ✅ Aprobado |
| **T05** | **Consultar recurso por ID inexistente** | `GET /api/recursos/:id` | `ID: 99999` | HTTP 404 Not Found controlado. | 404 Not Found con mensaje: `"Recurso no encontrado"`. | ✅ Aprobado |
| **T06** | **Actualizar recurso existente** | `PUT /api/recursos/:id` | `{"disponibilidad": false, "estado":"EN_MANTENIMIENTO"}` | HTTP 200 OK con los cambios persistidos en la base de datos. | 200 OK; el recurso cambia a no disponible y se actualiza `actualizado_en`. | ✅ Aprobado |
| **T07** | **Eliminar / Desactivar recurso** | `DELETE /api/recursos/:id` | `ID` válido sin conflicto de integridad | HTTP 200 / 204 con confirmación de eliminación o desactivación lógica. | Recurso eliminado o desactivado según reglas de integridad referencial. | ✅ Aprobado |
| **T08** | **Crear solicitud con estado inicial** | `POST /api/solicitudes` | `{"asunto":"Paz y Salvo", "tipo":"ACADEMICA", "descripcion":"Para grado", "dependencia":"Registro"}` | HTTP 201 Created. La solicitud debe crearse obligatoriamente con estado `REGISTRADA`. | 201 Created; la solicitud tiene estado `REGISTRADA` y se guarda registro en `historial_estados_solicitud`. | ✅ Aprobado |
| **T09** | **Transición inválida de solicitud** | `PUT /api/solicitudes/:id/estado` | Intentar cambiar de `REGISTRADA` directamente a `CERRADA` | HTTP 400 o 409 Conflict. El backend debe rechazar la transición ilegal del ciclo de vida. | 400 Bad Request; backend bloquea la transición no permitida y mantiene el estado original. | ✅ Aprobado |
| **T10** | **Crear reserva válida** | `POST /api/reservas` | `recurso_id: 1`, `fecha_reserva: mañana`, `hora_inicio: 14:00`, `hora_fin: 16:00` (Franja libre) | HTTP 201 Created. Reserva registrada con estado `PENDIENTE`. | 201 Created; reserva insertada correctamente en `db_reservas`. | ✅ Aprobado |
| **T11** | **Reserva solapada (Conflicto de horario)** | `POST /api/reservas` | Mismo recurso (1), misma fecha, franja `14:30` a `15:30` (Interseca la anterior) | HTTP 409 Conflict. El backend debe rechazar el choque y no duplicar franjas. | 409 Conflict con mensaje explicativo: `"El recurso ya cuenta con una reserva activa o aprobada en el rango solicitado"`. | ✅ Aprobado |
| **T12** | **Persistencia de datos tras reinicio** | `GET /api/reservas` y `GET /api/solicitudes` | Reiniciar los contenedores con `docker-compose restart` y volver a consultar | HTTP 200 OK. Todos los registros creados previamente deben permanecer intactos en PostgreSQL. | Los registros permanecen intactos en los volúmenes persistentes de PostgreSQL. | ✅ Aprobado |
| **T13** | **Integración React ➔ Gateway ➔ DB** | UI Formulario de Reserva / Solicitud | Enviar formulario desde React en el navegador | La interfaz muestra estado de carga (`loading`), confirma éxito con Toast y actualiza el listado. | La vista consume la API del Gateway en tiempo real y muestra los registros guardados en BD. | ✅ Aprobado |
| **T14** | **Error de conexión / Caída de servicio** | Detener un contenedor (ej. `ms-recursos`) | El usuario intenta listar o reservar | La interfaz de React no se bloquea ni genera pantalla blanca; muestra mensaje de fallo controlado. | Toast de error informativo en pantalla; la app continúa operativa para las demás secciones. | ✅ Aprobado |
| **T15** | **Comprobación de Salud (Health Checks)** | `GET /health` en Gateway y microservicios | Petición HTTP GET | HTTP 200 OK con JSON indicando `status: "OK"` y timestamp de cada servicio. | Todos los microservicios y el API Gateway responden 200 con su estado operativo. | ✅ Aprobado |

---

## 📌 Resumen de Cumplimiento
- **Total de pruebas ejecutadas:** 15 / 15
- **Pruebas aprobadas:** 15 (100%)
- **Tolerancia a fallos:** Verificada con respuestas HTTP normalizadas (`400`, `404`, `409`, `500`) y componentes de React con captura de errores.

