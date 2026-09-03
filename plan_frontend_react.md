# Planificación Frontend (React) ⚛️

Este documento traduce punto por punto los requisitos de la *"Actividad Integrativa"* a la estructura de carpetas y código que crearemos en Vite + React.

## 1. El Truco Maestro: TailwindCSS + BEM 🎨
La rúbrica permite Tailwind, pero **exige metodología BEM** (Bloque, Elemento, Modificador). Como Tailwind usa miles de clases diminutas que rompen BEM, ¿cómo salvamos los puntos de la rúbrica pero trabajamos cómodos con Tailwind?
**Solución: Usaremos la directiva `@apply` de Tailwind dentro de archivos CSS con nombres BEM.**

En lugar de llenar el HTML de clases, crearemos un archivo CSS usando Tailwind por debajo pero que el profesor verá con sintaxis BEM:
```css
/* tarjeta-servicio.css */
.tarjeta-servicio { /* Esto es el Bloque BEM */
  @apply bg-white shadow-lg rounded-xl p-4 flex flex-col;
}
.tarjeta-servicio__titulo { /* Esto es el Elemento BEM */
  @apply text-xl font-bold text-gray-800;
}
```
*Así programas con Tailwind, evalúan con BEM y aseguras un 5.0.*

---

## 2. Enrutamiento: React Router V6 (Las Rutas Obligatorias) 🚦
Necesitas mínimo 4 rutas, pero la rúbrica describe más vistas. Esta es la tabla final de rutas para el `<BrowserRouter>`:

| Ruta (URL) | Vista Asignada | Requerimiento Rúbrica |
| :--- | :--- | :--- |
| `/` | `LandingAuth.jsx` | "Vista de acceso: redirect 5s o login". |
| `/dashboard` | `DashboardPrincipal.jsx` | "Panel principal, buscador, métricas". |
| `/servicios/:id` | `DetalleServicio.jsx` | "Vista de servicio universitario y detalles". |
| `/solicitudes` | `ListadoSolicitudes.jsx` | "Vista de solicitudes históricas del usuario". |
| `/solicitudes/:id`| `FlujoSolicitud.jsx` | "Detalle de solicitud y evolución (Registrada... Cerrada)". |
| `/reservas` | `PanelReservas.jsx` | "Vista de reservas, recursos, laboratorios". |
| `/notificaciones`| `CentroNotificaciones.jsx`| "Visualizar comunicaciones (alertas)". |
| `/eventos` | `AgendaEventos.jsx` | "Vista de conferencias, seminarios, fechas". |
| `/perfil` | `MiPerfil.jsx` | "Nombre, rol, dependencia, info usuario". |

---

## 3. Los 10 Componentes (Mínimo Obligatorio) 🧩
Para no perder puntos, haremos carpetas para aislar componentes con código JSX puro y BEM+Tailwind. Aquí los 10 garantizados:
1. `NavbarTop` (El menú superior de la app).
2. `SidebarMenu` (El menú lateral para navegar a solicitudes, reservas).
3. `SearchBar` (Barra de búsqueda exigida en el dashboard).
4. `ServiceCard` (Tarjeta para pintar cada servicio disponible).
5. `StatusBadge` (Una pequeña etiqueta semántica estilo: 🟢 *Resuelta*, 🔴 *Rechazada*).
6. `DataTable` (La tabla para renderizar solicitudes y notificaciones).
7. `EventCard` (Tarjeta de diseño diferente para conferencias/eventos).
8. `ResourceModal` (Ventana flotante al darle clic a reservar una sala).
9. `NotificationItem` (Bloque individual en la lista de notificaciones).
10. `KPIWidget` (Los pequeños recuadros en el dashboard que muestran "5 Reservas Activas" o "2 Solicitudes").

---

## 4. El Custom Hook y Efectos (La magia de React) ⚡

### El requisito del Custom Hook:
Crearemos y documentaremos un custom hook estratégico: `useSmartRedirect`. 
- **¿Por qué?** La rúbrica pide que la Vista de Acceso cuente 5 segundos y redireccione sola si no se oprime nada.
- En este hook empaquetaremos un `useEffect` que haga un `setTimeout` y utilice el `useNavigate()` de React Router v6 para enviar al usuario al Dashboard.

### El requisito de los Hooks Clásicos:
- `useState`: Lo usaremos en la `SearchBar` para guardar lo que el usuario escribe, y en modales para abrirlos/cerrarlos (`isOpen`, `setIsOpen`).
- `useEffect`: Fundamental al montar el `DashboardPrincipal`. Dispararemos un *fetch* de datos al API Gateway para traer los servicios tan pronto el componente aparezca en pantalla.
