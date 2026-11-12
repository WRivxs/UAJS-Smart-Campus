import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar/Navbar';
import SidebarAdmin from '../components/SidebarAdmin/SidebarAdmin';
import AdminResumen from './admin/AdminResumen';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminSolicitudes from './admin/AdminSolicitudes';
import AdminPqrs from './admin/AdminPqrs';
import AdminRecursos from './admin/AdminRecursos';
import AdminReservas from './admin/AdminReservas';
import AdminEventos from './admin/AdminEventos';
import PerfilAdmin from './admin/PerfilAdmin';
import DashboardPrincipal from './DashboardPrincipal';
import ErrorBoundary from '../components/ErrorBoundary';

export const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [vistaEstudiante, setVistaEstudiante] = useState(false);

  const { token } = useAuth();
  const [counts, setCounts] = useState({
    usuarios: 0,
    solicitudes: 0,
    pqrs: 0,
    recursos: 0,
    reservas: 0,
    eventos: 0,
  });

  // Consultar en vivo los totales desde los microservicios a través del API Gateway
  const fetchLiveCounts = useCallback(async () => {
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    try {
      const [uRes, sRes, pRes, rRes, resvRes, eRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/users`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/solicitudes`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/pqrs`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/recursos`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/reservas`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/eventos`, { headers }).then(r => r.ok ? r.json() : null),
      ]);

      setCounts({
        usuarios: (uRes.value?.usuarios || uRes.value?.users || []).length,
        solicitudes: (sRes.value?.solicitudes || []).length,
        pqrs: (pRes.value?.pqrs || []).length,
        recursos: (rRes.value?.recursos || []).length,
        reservas: (resvRes.value?.reservas || []).length,
        eventos: (eRes.value?.eventos || []).length,
      });
    } catch (err) {
      console.warn("Error consultando contadores de administración:", err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchLiveCounts();
  }, [fetchLiveCounts, activeTab]);

  // Si el administrador eligió previsualizar el portal de estudiante
  if (vistaEstudiante) {
    return (
      <div className="relative min-h-screen">
        {/* Banner Superior Fijo por encima de todo (z-[9999]) */}
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#081f56] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xl border-b border-blue-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="material-symbols-outlined text-base text-amber-300">visibility</span>
            <span>Previsualización: <strong>Vista de Estudiante</strong> (Sesión activa: Administrador)</span>
          </div>
          <button
            type="button"
            onClick={() => setVistaEstudiante(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a47b8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer border border-blue-400/30"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Volver a Modo Administrador</span>
          </button>
        </div>

        {/* Botón Flotante Permanente en la esquina inferior derecha (z-[9999]) */}
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            type="button"
            onClick={() => setVistaEstudiante(false)}
            className="flex items-center gap-2 px-5 py-3 bg-[#081f56] hover:bg-[#0a47b8] text-white rounded-2xl shadow-2xl text-xs sm:text-sm font-bold font-space border-2 border-white transition-all transform hover:scale-105 cursor-pointer"
            title="Regresar al panel de control de administrador"
          >
            <span className="material-symbols-outlined text-lg text-amber-400">admin_panel_settings</span>
            <span>Volver al Panel Administrador</span>
          </button>
        </div>

        {/* Contenido con desplazamiento superior para que la barra no tape el Navbar de 64px */}
        <div className="pt-10">
          <DashboardPrincipal />
        </div>
      </div>
    );
  }

  // Render del contenido según la pestaña activa
  const renderContenido = () => {
    switch (activeTab) {
      case 'resumen':
        return <AdminResumen onNavigateTab={(tab) => setActiveTab(tab)} counts={counts} />;
      case 'usuarios':
        return <AdminUsuarios />;
      case 'solicitudes':
        return <AdminSolicitudes />;
      case 'pqrs':
        return <AdminPqrs />;
      case 'recursos':
        return <AdminRecursos />;
      case 'reservas':
        return <AdminReservas />;
      case 'eventos':
        return <AdminEventos />;
      case 'perfil':
        return <PerfilAdmin />;
      default:
        return <AdminResumen onNavigateTab={(tab) => setActiveTab(tab)} counts={counts} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Navbar Superior */}
      <Navbar
        title="Smart Campus • Módulo de Administrador"
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Contenedor Principal: Sidebar + Vista Dinámica */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar Administrativo */}
        <SidebarAdmin
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          counts={counts}
          onTogglePortalEstudiante={() => setVistaEstudiante(true)}
        />

        {/* Área de Trabajo / Vistas CRUD */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {/* Barra rápida de navegación móvil */}
          <div className="md:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-1.5">
            {[
              { id: 'resumen', label: 'Resumen', icon: 'dashboard' },
              { id: 'usuarios', label: 'Usuarios', icon: 'manage_accounts' },
              { id: 'solicitudes', label: 'Solicitudes', icon: 'fact_check' },
              { id: 'pqrs', label: 'PQRS', icon: 'support_agent' },
              { id: 'recursos', label: 'Recursos', icon: 'devices_other' },
              { id: 'reservas', label: 'Reservas', icon: 'calendar_month' },
              { id: 'eventos', label: 'Eventos', icon: 'campaign' },
              { id: 'perfil', label: 'Perfil', icon: 'badge' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-[#0a47b8] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <button
              onClick={() => setVistaEstudiante(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Portal Estudiante</span>
            </button>
          </div>

          {/* Renderizado con ErrorBoundary para evitar pantallas azules */}
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary key={activeTab} onReset={() => setActiveTab('resumen')}>
              {renderContenido()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
