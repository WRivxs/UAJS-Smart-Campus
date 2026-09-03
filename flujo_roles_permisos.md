# Flujo de Roles y Permisos — UAJS Smart Campus 🔐

> **Referencia oficial de RBAC del proyecto.** Este documento define qué puede hacer cada rol en cada módulo, los flujos de acción completos y las reglas de negocio que el equipo debe respetar al codificar backend y frontend.

---

## 🏛️ Jerarquía de Roles (Mayor → Menor Privilegio)

```
┌─────────────────────────────────┐
│   👑 ADMINISTRADOR DEL SISTEMA  │  ← Acceso total, configura el sistema
├─────────────────────────────────┤
│      🏢 ADMINISTRATIVO          │  ← Gestiona solicitudes, reservas, PQRS
├─────────────────────────────────┤
│        👨‍🏫 DOCENTE               │  ← Crea solicitudes, reservas, eventos
├─────────────────────────────────┤
│        🎓 ESTUDIANTE            │  ← Consume servicios, crea solicitudes básicas
└─────────────────────────────────┘
```

**Regla de oro:** Ningún rol puede hacer lo que hace el nivel superior. El backend valida SIEMPRE con JWT, el frontend solo oculta botones como capa de UX.

---

## 📊 Matriz Completa de Permisos por Módulo

| Módulo / Microservicio | 🎓 Estudiante | 👨‍🏫 Docente | 🏢 Administrativo | 👑 Admin Sistema |
|---|---|---|---|---|
| **Usuarios & Auth** | Perfil propio | Perfil propio | Ver usuarios de su dependencia | CRUD completo + asignar roles |
| **Roles & Permisos** | ❌ Sin acceso | ❌ Sin acceso | ❌ Sin acceso | ✅ CRUD total |
| **Servicios (Dashboard)** | Solo lectura | Solo lectura | Solo lectura | CRUD catálogo |
| **Solicitudes** | Crear + ver propias | Crear + ver propias | Ver dependencia + cambiar estados | Supervisar todas |
| **PQRS** | Crear + ver propias | Crear + ver propias | Ver dependencia + responder | Supervisar todas |
| **Recursos** | Solo lectura | Solo lectura | Actualizar estado | CRUD completo |
| **Reservas** | Crear propias* + ver propias | Crear + cancelar propias | Aprobar / Rechazar todas | Supervisar + gestionar |
| **Eventos** | Ver + inscribirse | Ver + inscribirse + crear (académicos) | Crear + gestionar institucionales | CRUD total |
| **Notificaciones** | Solo propias | Solo propias | Solo propias | Enviar alertas masivas |

> *Las reservas de Estudiantes pueden requerir aprobación según el tipo de recurso.

---

## 👑 ADMINISTRADOR DEL SISTEMA — Detalle completo

**Descripción:** Es el superusuario. Configura, supervisa y mantiene toda la plataforma.

### ✅ Qué puede hacer
- **Usuarios:** Crear, editar, desactivar/reactivar cualquier cuenta. Asignar y cambiar roles.
- **Roles & Permisos:** Único rol con acceso a las tablas `roles`, `permisos`, `roles_permisos`. Puede crear nuevos roles o modificar permisos de los existentes.
- **Servicios universitarios:** Gestiona el catálogo que ven todos los roles en el Dashboard. Puede agregar, editar, ocultar servicios.
- **Solicitudes:** Ve el universo completo de solicitudes. Puede reasignar responsables, forzar cambios de estado.
- **PQRS:** Ve y responde todas. Asigna responsables entre administrativos.
- **Recursos:** CRUD completo. Puede crear nuevas salas, laboratorios, equipos. Cambia estados (Bueno → Dañado → En Mantenimiento).
- **Reservas:** Aprueba o rechaza. Ve el calendario global de todos los recursos.
- **Eventos:** CRUD total. Puede cancelar cualquier evento creado por otros.
- **Notificaciones:** Puede enviar alertas masivas a todos los usuarios o a un rol específico.

### 🛑 Restricciones
- Ninguna técnica, pero por buenas prácticas: no debería eliminar datos históricos de solicitudes ni reservas, solo archivarlos.

---

## 🏢 ADMINISTRATIVO — Detalle completo

**Descripción:** Operador del día a día. Atiende lo que genera la comunidad universitaria dentro de su dependencia.

### ✅ Qué puede hacer
- **Usuarios:** Solo puede consultar usuarios. No puede cambiar roles ni contraseñas de otros.
- **Solicitudes:** Ve las solicitudes cuya `dependencia` corresponde a la suya. Ejecuta las transiciones de estado:
  - `REGISTRADA` → `EN_REVISION`
  - `EN_REVISION` → `ASIGNADA` (asigna `responsable_id`)
  - `ASIGNADA` → `EN_PROCESO`
  - `EN_PROCESO` → `RESUELTA`
  - `RESUELTA` → `CERRADA`
- **PQRS:** Recibe por `dependencia_destino`. Puede escribir la `respuesta` y cambiar estado a `RESPONDIDA` o `CERRADA`.
- **Recursos:** Puede cambiar el campo `estado` de un recurso (Bueno/Dañado/En Mantenimiento). No puede crear ni eliminar.
- **Reservas:** **Aprueba o rechaza** todas las reservas pendientes. Ve el calendario completo.
- **Eventos:** Puede crear eventos institucionales y modificar los propios.
- **Notificaciones:** El sistema le envía automáticamente cuando llega una nueva solicitud o PQRS a su dependencia.

### 🛑 Restricciones
- No puede ver solicitudes ni PQRS de otras dependencias.
- No puede cambiar roles de usuarios.
- No puede eliminar recursos, solo cambiarles el estado.

---

## 👨‍🏫 DOCENTE — Detalle completo

**Descripción:** Usuario activo de la plataforma. Consume y genera servicios dentro de su alcance académico.

### ✅ Qué puede hacer
- **Perfil:** Ver y editar su propio perfil (nombre, contacto). No puede cambiar su propio rol.
- **Solicitudes:** Crea solicitudes propias (tipo `ACADÉMICA` o `ADMINISTRATIVA`). Ve el estado e historial de las suyas. No puede cambiar estados, solo hacer seguimiento.
- **PQRS:** Crea peticiones, quejas, reclamos o sugerencias. Ve las respuestas a las suyas.
- **Recursos:** Ve el catálogo completo y la disponibilidad de cada recurso.
- **Reservas:** Puede crear reservas de salas, laboratorios y equipos. Ve y puede cancelar sus propias reservas (solo si están en `PENDIENTE`).
- **Eventos:** Ve todos los eventos disponibles. Puede inscribirse. Puede **crear eventos de tipo académico** relacionados a su área.
- **Notificaciones:** Recibe confirmaciones de reservas, cambios de estado de sus solicitudes y recordatorios de eventos.

### 🛑 Restricciones
- No puede aprobar reservas de otros.
- No puede ver solicitudes de otros usuarios.
- No puede cancelar una reserva `APROBADA` (debe contactar al Administrativo).
- No puede crear eventos de tipo `INSTITUCIONAL`.

---

## 🎓 ESTUDIANTE — Detalle completo

**Descripción:** Rol con menor privilegio. Consume los servicios universitarios disponibles.

### ✅ Qué puede hacer
- **Perfil:** Ver y editar su propio perfil. No puede cambiar su propio rol.
- **Dashboard:** Ve el catálogo de servicios disponibles, sus solicitudes pendientes, sus reservas próximas, las notificaciones sin leer y los eventos disponibles.
- **Solicitudes:** Crea solicitudes propias. Ve el estado de las suyas en tiempo real. Solo lectura de estados (no puede moverlos).
- **PQRS:** Puede registrar peticiones, quejas, reclamos y sugerencias. Ve las respuestas a las suyas.
- **Recursos:** Solo lectura. Ve qué recursos existen y si están disponibles.
- **Reservas:** Puede crear reservas de algunos recursos según política (ej: equipos de préstamo). Ve y puede cancelar las suyas en estado `PENDIENTE`.
- **Eventos:** Ve el listado de todos los eventos. Puede inscribirse. **No puede crear eventos**.
- **Notificaciones:** Solo recibe las propias: confirmación/rechazo de reservas, cambios de estado de solicitudes, avisos de eventos.

### 🛑 Restricciones
- No puede ver solicitudes, reservas ni PQRS de otros usuarios.
- No puede acceder a ninguna vista de gestión o administración.
- No puede crear eventos.
- No puede cambiar el estado de ninguna solicitud.

---

## 🔄 Flujos de Acción — Ejemplos Completos

### Flujo 1: Estudiante registra una Solicitud
```
1. Estudiante llena formulario en /solicitudes (frontend)
2. React → POST /api/ms-solicitudes con JWT
3. API Gateway valida token → extrae rol = ESTUDIANTE → permite POST
4. ms-solicitudes guarda en BD: estado = REGISTRADA
5. ms-notificaciones recibe evento → crea notificación para el Administrativo de esa dependencia
6. Administrativo ve nueva solicitud en su panel
7. Administrativo cambia estado REGISTRADA → EN_REVISION
   → BD guarda en historial_estados_solicitud
   → ms-notificaciones crea notificación para el Estudiante
8. Flujo continúa hasta CERRADA
9. Estudiante ve cada cambio en su Dashboard en tiempo real
```

### Flujo 2: Docente crea una Reserva
```
1. Docente elige recurso disponible en /reservas (frontend)
2. React → POST /api/ms-reservas con JWT
3. API Gateway valida token → rol = DOCENTE → permite POST
4. ms-reservas verifica disponibilidad: 
   ¿Existe otra reserva APROBADA para este recurso en ese bloque de tiempo?
   → SÍ: devuelve error 409 Conflict
   → NO: guarda reserva con estado = PENDIENTE
5. ms-notificaciones avisa al Administrativo sobre nueva reserva pendiente
6. Administrativo aprueba → estado = APROBADA
7. ms-notificaciones avisa al Docente: "Tu reserva fue aprobada"
8. Docente ve la reserva confirmada en su Dashboard
```

### Flujo 3: Administrativo gestiona una PQRS
```
1. Estudiante/Docente crea PQRS → estado = RECIBIDA
2. ms-notificaciones avisa al Administrativo de la dependencia_destino
3. Administrativo abre la PQRS, cambia estado = EN_TRAMITE
4. Administrativo redacta respuesta, cambia estado = RESPONDIDA
5. ms-notificaciones avisa al usuario que creó la PQRS
6. Usuario ve la respuesta en su historial de PQRS
7. Sistema cierra automáticamente después de X días → estado = CERRADA
```

---

## 🛠️ Implementación RBAC en el Código

### Backend (API Gateway + Middlewares)
```javascript
// middlewares/auth.js → Verifica que el JWT sea válido
// middlewares/checkRole.js → Verifica que el rol tenga permiso para esa ruta

// Ejemplo de ruta protegida:
router.put('/solicitudes/:id/estado',
  authMiddleware,                          // ¿Token válido?
  checkRole(['ADMINISTRATIVO', 'ADMIN']),  // ¿Tiene el rol correcto?
  SolicitudController.cambiarEstado        // Ejecuta el controlador
);
```

### Frontend (React Router V6 + Composición)
```jsx
// ProtectedRoute.jsx → Redirige si el rol no coincide
<Route path="/admin/usuarios"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <GestionUsuariosPage />
    </ProtectedRoute>
  }
/>

// Inyección de componentes por rol en la misma vista
const ReservasPage = () => {
  const { rol } = useAuth();
  return (
    <Layout>
      {rol === 'ADMINISTRATIVO' ? <AdminReservasPanel /> : <UserReservasPanel />}
    </Layout>
  );
};
```

---

## 🗂️ Resumen Rápido — ¿Quién puede qué?

| Acción | Estudiante | Docente | Administrativo | Admin |
|---|:---:|:---:|:---:|:---:|
| Ver su perfil | ✅ | ✅ | ✅ | ✅ |
| Crear solicitud | ✅ | ✅ | ✅ | ✅ |
| Cambiar estado solicitud | ❌ | ❌ | ✅ | ✅ |
| Crear reserva | ✅* | ✅ | ✅ | ✅ |
| Aprobar/rechazar reserva | ❌ | ❌ | ✅ | ✅ |
| Crear PQRS | ✅ | ✅ | ✅ | ✅ |
| Responder PQRS | ❌ | ❌ | ✅ | ✅ |
| Ver recursos | ✅ | ✅ | ✅ | ✅ |
| Gestionar recursos (CRUD) | ❌ | ❌ | Parcial | ✅ |
| Crear eventos | ❌ | Académicos | Institucionales | ✅ |
| Inscribirse a eventos | ✅ | ✅ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |
| Configurar roles/permisos | ❌ | ❌ | ❌ | ✅ |
| Enviar alertas masivas | ❌ | ❌ | ❌ | ✅ |

> *Sujeto a política de disponibilidad del recurso.
