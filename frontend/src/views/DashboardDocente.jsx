import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar/Navbar';
import SidebarDocente from '../components/SidebarDocente/SidebarDocente';
import ResumenDocente from './docente/ResumenDocente';
import MisEventos from './docente/MisEventos';
import PerfilDocente from './docente/PerfilDocente';
import ListadoSolicitudes from './ListadoSolicitudes';
import PanelReservas from './PanelReservas';
import AgendaEventos from './AgendaEventos';
import ListadoPqrs from './ListadoPqrs';
import CentroNotificaciones from './CentroNotificaciones';
import ErrorBoundary from '../components/ErrorBoundary';

export const DashboardDocente = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { token, user } = useAuth();

  const [counts, setCounts] = useState({
    solicitudes: 0,
    reservas: 0,
    misEventos: 0,
    eventos: 0,
    pqrs: 0,
    notificaciones: 0,
  });

  const fetchLiveCounts = useCallback(async () => {
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const [sRes, rRes, eRes, pRes, nRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/solicitudes/mias`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_URL}/api/reservas/mias`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_URL}/api/eventos`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_URL}/api/pqrs/mias`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_URL}/api/notificaciones`, { headers }).then((r) => (r.ok ? r.json() : null)),
      ]);

      const allEventos = Array.isArray(eRes.value?.eventos)
        ? eRes.value.eventos
        : Array.isArray(eRes.value)
        ? eRes.value
        : [];
      const userId = user?.id || user?.user_id;
      const misEventos = userId
        ? allEventos.filter((ev) => String(ev.organizador_id) === String(userId))
        : allEventos;

      setCounts({
        solicitudes: (sRes.value?.solicitudes || []).length,
        reservas: (rRes.value?.reservas || []).length,
        misEventos: misEventos.length,
        eventos: allEventos.length,
        pqrs: (pRes.value?.pqrs || []).length,
        notificaciones: (nRes.value?.notificaciones || []).filter((n) => !n.leida).length,
      });
    } catch (err) {
      console.warn('Error consultando contadores docente:', err.message);
    }
  }, [token, user]);

  useEffect(() => {
    fetchLiveCounts();
  }, [fetchLiveCounts, activeTab]);

  const renderContenido = () => {
    switch (activeTab) {
      case 'inicio':
        return <ResumenDocente onNavigateTab={(tab) => setActiveTab(tab)} counts={counts} />;
      case 'solicitudes':
        return <ListadoSolicitudes />;
      case 'reservas':
        return <PanelReservas />;
      case 'mis-eventos':
        return <MisEventos />;
      case 'eventos':
        return <AgendaEventos />;
      case 'pqrs':
        return <ListadoPqrs />;
      case 'notificaciones':
        return <CentroNotificaciones />;
      case 'perfil':
        return <PerfilDocente />;
      default:
        return <ResumenDocente onNavigateTab={(tab) => setActiveTab(tab)} counts={counts} />;
    }
  };

  const mobileNavItems = [
    { id: 'inicio',         label: 'Inicio',        icon: 'school' },
    { id: 'solicitudes',    label: 'Solicitudes',   icon: 'fact_check' },
    { id: 'reservas',       label: 'Reservas',      icon: 'calendar_month' },
    { id: 'mis-eventos',    label: 'Mis Eventos',   icon: 'event_available' },
    { id: 'eventos',        label: 'Agenda',        icon: 'campaign' },
    { id: 'pqrs',           label: 'PQRS',          icon: 'support_agent' },
    { id: 'notificaciones', label: 'Alertas',       icon: 'notifications' },
    { id: 'perfil',         label: 'Perfil',        icon: 'badge' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Navbar Superior */}
      <Navbar
        title="Smart Campus • Portal Académico Docente"
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Contenedor Principal: Sidebar + Vista Dinámica */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar Docente */}
        <SidebarDocente
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          counts={counts}
        />

        {/* Área de Trabajo */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {/* Barra rápida de navegación móvil */}
          <div className="md:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-1.5">
            {mobileNavItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Renderizado con ErrorBoundary */}
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary key={activeTab} onReset={() => setActiveTab('inicio')}>
              {renderContenido()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDocente;

