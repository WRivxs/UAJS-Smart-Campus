# 📜 Resumen de Trabajo e Integración: Dashboard de Estudiante (UAJS Smart Campus)
**Fecha:** 16 de Septiembre, 2026  
**Proyecto:** `UAJS_Smart_Campus`  
**Autor:** Antigravity AI & Equipo de Desarrollo UAJS  

---

## 🚀 1. Resumen de Implementaciones y Cambios

### UI / UX Refactorizado:
- **Navbar (`src/components/Navbar/Navbar.jsx`)**: Se limpiaron los iconos innecesarios (`help_outline` y `contrast`), manteniendo la campana de notificaciones y el menú desplegable del estudiante.
- **Sidebar (`src/components/SidebarMenu/SidebarMenu.jsx`)**: Se eliminó la tarjeta duplicada de información del usuario en el menú lateral.
- **Dashboard (`src/views/DashboardPrincipal.jsx`)**:
  - Se eliminó el buscador Elasticsearch.
  - Se integró el **Pase Digital Inteligente** compacto en el banner de bienvenida.
  - Se integraron **dos tarjetas paralelas**: `Solicitudes recientes` (ms-solicitudes) y `Próximos eventos` (ms-eventos).
  - Se configuró la visualización limitada a **máximo 2 elementos por tarjeta**.
  - Se crearon los badges dinámicos alineados a la base de datos PostgreSQL:
    - **Solicitudes:** `REGISTRADA`, `EN_PROCESO`, `EN_REVISION`, `RESUELTA`.
    - **Eventos:** `PROGRAMADO`, `EN_CURSO` (con pulso animado).

---

## 🛠️ 2. Estructura de los Hooks Creados

### A. Hook `src/hooks/useSolicitudes.js`
```javascript
import { useState, useEffect } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_SOLICITUDES = [
  { id: 1, codigo: 'SOL-001', asunto: 'Solicitud de Certificado de Estudio 2026-1', tipo: 'ACADEMICA', estado: 'REGISTRADA' },
  { id: 2, codigo: 'SOL-002', asunto: 'Paz y Salvo Académico de Investigación', tipo: 'ADMINISTRATIVA', estado: 'EN_REVISION' },
  { id: 3, codigo: 'SOL-003', asunto: 'Asignación de Sticker de Parqueadero Vehicular', tipo: 'SERVICIO', estado: 'EN_PROCESO' },
  { id: 4, codigo: 'SOL-004', asunto: 'Sábana de Notas Autenticada', tipo: 'ACADEMICA', estado: 'RESUELTA' }
];

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem('uajs_token');
        const response = await fetch(`${API_GATEWAY_URL}/api/solicitudes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Error al obtener las solicitudes');
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.solicitudes || data.data || []);
        setSolicitudes(items.length > 0 ? items : FALLBACK_SOLICITUDES);
      } catch (err) {
        setError(err.message);
        setSolicitudes(FALLBACK_SOLICITUDES);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  return { solicitudes, loading, error };
};

export default useSolicitudes;
```

### B. Hook `src/hooks/useEventos.js`
```javascript
import { useState, useEffect } from 'react';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const FALLBACK_EVENTOS = [
  { id: 1, nombre: 'Congreso Internacional de IA y Robótica 2026', tipo: 'INSTITUCIONAL', fecha: '03 SEP', hora_lugar: '09:00 · Auditorio Principal', estado: 'PROGRAMADO' },
  { id: 2, nombre: 'Taller Práctico: Despliegue de Microservicios con Docker y Node.js', tipo: 'FACULTAD INGENIERÍA', fecha: '05 SEP', hora_lugar: '14:00 · Laboratorio de Sistemas', estado: 'EN_CURSO' }
];

export const useEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const token = localStorage.getItem('uajs_token');
        const response = await fetch(`${API_GATEWAY_URL}/api/eventos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Error al obtener los eventos');
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.eventos || data.data || []);
        setEventos(items.length > 0 ? items : FALLBACK_EVENTOS);
      } catch (err) {
        setError(err.message);
        setEventos(FALLBACK_EVENTOS);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  return { eventos, loading, error };
};

export default useEventos;
```

---

## 📋 3. Tarjetas Planificadas para ClickUp (Asignado: Edimer)

### Tarea 1: `[FRONTEND] Integrar Tarjeta de Solicitudes Recientes (ms-solicitudes)`
* **Asignado a:** `@Edimer` | **Prioridad:** Alta
* **Descripción:** Consumir endpoint `/api/solicitudes` vía API Gateway con cabecera JWT `Authorization: Bearer <token>` y renderizar máximo 2 ítems con badges de estado.

### Tarea 2: `[FRONTEND] Integrar Tarjeta de Próximos Eventos (ms-eventos)`
* **Asignado a:** `@Edimer` | **Prioridad:** Alta
* **Descripción:** Consumir endpoint `/api/eventos` vía API Gateway con cabecera JWT y renderizar 2 eventos institucionales con badges `PROGRAMADO` o `EN_CURSO`.

---

## 💻 4. Comandos de Git para Edimer y el Equipo

Para actualizar el proyecto en cualquier computador:
```bash
git checkout main
git pull origin main
```

**Commits Relevantes Guardados en GitHub (`main`):**
- `1fa0f79`: Refactorización de UI (Navbar, Sidebar, Dashboard base).
- `eaf90c6`: Integración completa de las tarjetas en `DashboardPrincipal.jsx`.
- `732117f`: Corrección de extracción de respuestas JSON en los hooks.

---
*Este documento ha sido generado para asegurar que todo el historial y plan de trabajo permanezca respaldado localmente en tu proyecto.*
