import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import SidebarAdmin from '../components/SidebarAdmin/SidebarAdmin';
import AdminResumen from './admin/AdminResumen';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminSolicitudes from './admin/AdminSolicitudes';
import AdminPqrs from './admin/AdminPqrs';
import AdminRecursos from './admin/AdminRecursos';
import AdminReservas from './admin/AdminReservas';
import AdminEventos from './admin/AdminEventos';
import PerfilEstudiante from './PerfilEstudiante';
import DashboardPrincipal from './DashboardPrincipal';
import { useAuth } from '../hooks/useAuth';
import useAdminUsuarios from '../hooks/useAdminUsuarios';
import useAdminSolicitudes from '../hooks/useAdminSolicitudes';
import useAdminPqrs from '../hooks/useAdminPqrs';
import useAdminRecursos from '../hooks/useAdminRecursos';
import useAdminReservas from '../hooks/useAdminReservas';
import useAdminEventos from '../hooks/useAdminEventos';

export const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [vistaEstudiante, setVistaEstudiante] = useState(false);

  // Hooks para badges del menú
  const { usuarios } = useAdminUsuarios();
  const { solicitudes } = useAdminSolicitudes();
  const { pqrsList } = useAdminPqrs();
  const { recursos } = useAdminRecursos();
  const { reservas } = useAdminReservas();
  const { eventos } = useAdminEventos();

  const counts = {
    usuarios: usuarios?.length || 0,
    solicitudes: solicitudes?.filter((s) => s.estado === 'REGISTRADA' || s.estado === 'EN_REVISION')?.length || 0,
    pqrs: pqrsList?.filter((p) => p.estado === 'ABIERTA')?.length || 0,
    recursos: recursos?.length || 0,
    reservas: reservas?.filter((r) => r.estado === 'PENDIENTE')?.length || 0,
    eventos: eventos?.length || 0,
  };

  // Si el administrador eligió previsualizar el portal de estudiante
  if (vistaEstudiante) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md border-b border-indigo-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-amber-300">visibility</span>
            <span>Estás en modo <strong>Previsualización: Portal de Estudiante</strong> (Rol activo: Administrador)</span>
          </div>
          <button
            onClick={() => setVistaEstudiante(false)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs font-bold transition shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Volver a Módulo Admin</span>
          </button>
        </div>
        <DashboardPrincipal />
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
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-indigo-700">security</span>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Perfil de Administrador del Sistema</h4>
                  <p className="text-xs text-indigo-800">
                    Tu cuenta cuenta con privilegios totales de administración en todos los microservicios del campus.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white font-mono">
                ROL: ADMINISTRADOR
              </span>
            </div>
            <PerfilEstudiante />
          </div>
        );
      default:
        return <AdminResumen onNavigateTab={(tab) => setActiveTab(tab)} counts={counts} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Navbar Superior */}
      <Navbar
        title="UAJS Smart Campus • Módulo de Administrador"
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
          {/* Barra rápida de navegación móvil para pantallas pequeñas */}
          <div className="md:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-1.5 scrollbar-none">
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Portal Estudiante</span>
            </button>
          </div>

          {/* Renderizado de la vista administrativa activa */}
          <div className="max-w-7xl mx-auto">{renderContenido()}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;