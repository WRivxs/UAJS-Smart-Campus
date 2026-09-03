# Esquema de Bases de Datos por Microservicio 🗄️

Como cada Microservicio es independiente, es ideal que cada uno tenga sus propias tablas separadas. Esto hará que la codificación con Sequelize/Prisma u ORM sea súper rápida. Basado en los campos exactos que dictan los módulos del documento, aquí tienes el diseño de las bases de datos para que el equipo ya sepa exactamente qué columnas crear:

### 1. `BD_Usuarios` (Microservicio 8.1)
*Gestión de autenticación y permisos.*
- **Tabla `Usuarios`:** `id`, `nombre`, `email`, `password_hash`, `rol` (ESTUDIANTE, DOCENTE, ADMINISTRATIVO, ADMIN), `activo` (booleano para cierres/recuperación).

### 2. `BD_Solicitudes` (Microservicio 8.3 y 8.8)
*Registro de solicitudes y PQRS.*
- **Tabla `Solicitudes`:** `id`, `usuario_id`, `tipo` (Regular, Petición, Queja, Reclamo, Sugerencia), `dependencia`, `fecha`, `descripcion`, `prioridad` (Baja, Media, Alta), `responsable_id` (quién la atiende), `estado`.
*🎯 **Regla Estricta del Estado:** Debe estar limitado SOLO a estos valores exactos:*
`REGISTRADA` → `EN REVISIÓN` → `ASIGNADA` → `EN PROCESO` → `RESUELTA` → `CERRADA`.

### 3. `BD_Recursos` (Microservicio 8.5)
*Catálogo de recursos vivos de la universidad.*
- **Tabla `Recursos`:** `id`, `codigo` (Ej: PC-001), `nombre`, `tipo` (Sala, Laboratorio, Equipo), `ubicacion`, `estado` (Bueno, Dañado, Mantenimiento), `disponibilidad` (Booleano: Disponible/No Disponible).

### 4. `BD_Reservas` (Microservicio 8.4)
*Control de espacios y equipos cruzado con disponibilidad.*
- **Tabla `Reservas`:** `id`, `recurso_id` (El código del recurso pidiendo prestado), `usuario_id` (Quién lo solicita), `fecha_reserva`, `hora_inicio`, `hora_fin`, `estado_reserva` (Pendiente, Aprobada, Rechazada, Finalizada). 

### 5. `BD_Notificaciones` (Microservicio 8.6)
*Buzón de entrada tipo campanita para cada usuario.*
- **Tabla `Notificaciones`:** `id`, `usuario_id` (A quién le llegará), `tipo` (Alerta, Confirmación de Reserva, Cambio Estado Solicitud), `mensaje`, `leida` (Booleano: true/false), `fecha_creacion`.

### 6. `BD_Eventos` (Microservicio 8.7)
*Actividades institucionales.*
- **Tabla `Eventos`:** `id`, `nombre`, `tipo` (Conferencia, Seminario, Taller), `descripcion`, `fecha_hora`, `lugar_ubicacion`, `organizador_id`.

---

### 💡 NOTA PARA EL EQUIPO DE DESARROLLO (Backend):
En la arquitectura de Microservicios, notarás que la `BD_Reservas` guarda `usuario_id` pero **NO** tiene la información del nombre ni el correo del usuario, porque esa info vive en la `BD_Usuarios`.
**¿Cómo resolvemos esto sin romper la arquitectura?** 
Cuando React pida la lista de Reservas, el API Gateway primero irá al *Microservicio de Reservas* a traer la lista de IDs, y luego irá rápido al *Microservicio de Usuarios* a buscar los nombres que coincidan con esos IDs, junta la información y se la manda a React completa. ¡Así logran la independencia de las bases de datos!
