import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import SidebarMenu from '../components/SidebarMenu/SidebarMenu';
import useProfile from '../hooks/useProfile';
import useSolicitudes from '../hooks/useSolicitudes';
import useEventos from '../hooks/useEventos';
import { useAuth } from '../hooks/useAuth';

export const DashboardPrincipal = () => {
  const { user, rol } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { solicitudes, loading: solicitudesLoading } = useSolicitudes();
  const { eventos, loading: eventosLoading } = useEventos();

  const [activeTab, setActiveTab] = useState('inicio');

  const currentRole = rol || profile?.rol_nombre || user?.rol_nombre || 'Estudiante';

  // Helper para badges de estado de solicitudes (Alineado con DB ms-solicitudes)
  const getBadgeEstadoSolicitud = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'REGISTRADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
            REGISTRADA
          </span>
        );
      case 'EN_PROCESO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            EN PROCESO
          </span>
        );
      case 'EN_REVISION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            EN REVISIÓN
          </span>
        );
      case 'RESUELTA':
      case 'COMPLETADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            RESUELTA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            {estado || 'PENDIENTE'}
          </span>
        );
    }
  };

  // Helper para badges de estado de eventos (Alineado con DB ms-eventos)
  const getBadgeEstadoEvento = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'EN_CURSO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            EN CURSO
          </span>
        );
      case 'PROGRAMADO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            PROGRAMADO
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#0284c7] selection:text-white">
      
      {/* Top Navbar Header */}
      <Navbar title="Smart Campus" />

      {/* Main Workspace Layout */}
      <div className="flex flex-grow pt-16">
        
        {/* Sidebar Navigation */}
        <SidebarMenu activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Workspace */}
        <main className="flex-grow md:ml-64 p-4 md:p-6 max-w-[1400px] w-full mx-auto space-y-4">
          
          {/* Welcome Student Banner (Compacto) */}
          <div className="bg-white border border-slate-200/90 rounded-sm p-4 md:p-5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
            
            {/* Ambient Cyan Gradient Blur */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-1.5 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-cyan-50 border border-cyan-200/80 text-[11px] font-space text-[#0284c7]">
                <span className="material-symbols-outlined text-[14px]">school</span>
                <span>Portal Estudiantil Institucional</span>
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold font-space text-slate-900 tracking-tight">
                ¡Bienvenido(a), <span className="bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">{profile?.nombre || user?.nombre || 'Estudiante UAJS'}</span>!
              </h1>
              
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Has ingresado con el rol de <strong className="text-slate-900">{currentRole}</strong>. Consulta tus notas, radica solicitudes <br className="hidden sm:inline" /> y gestiona tus recursos universitarios desde este panel.
              </p>
            </div>

            {/* Badge Pase Digital Inteligente (Ultracompacto al borde inferior) */}
            <div className="bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-sm flex items-center gap-2 shrink-0 z-10 self-end mt-auto">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
              <div className="flex items-center gap-1.5 font-space">
                <span className="text-[11px] font-bold text-slate-900">Pase Digital Inteligente:</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Habilitado
                </span>
              </div>
            </div>

          </div>

          {/* Student Campus Services Grid (Alineado a Matriz de Roles) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-space text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7]">widgets</span>
                <span>Servicios Universitarios Habilitados para {currentRole}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Rol RBAC: {currentRole}</span>
            </div>

            {/* Grid for Estudiante Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Consulta de Notas */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-5 hover:border-cyan-500/50 hover:shadow-md transition-all space-y-3 group cursor-pointer">
                <div className="h-10 w-10 rounded-sm bg-cyan-50 flex items-center justify-center text-[#0284c7] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-space text-slate-900">Notas & Materias</h3>
                  <p className="text-xs text-slate-500">
                    Consulta tu promedio acumulado, materias inscritas y calificaciones en tiempo real.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-[#0284c7] font-semibold font-space">
                  <span>Consultar notas</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

              {/* Card 2: Mis Solicitudes */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-5 hover:border-cyan-500/50 hover:shadow-md transition-all space-y-3 group cursor-pointer">
                <div className="h-10 w-10 rounded-sm bg-sky-50 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-space text-slate-900">Mis Solicitudes</h3>
                  <p className="text-xs text-slate-500">
                    Registra certicados, supletorios y cancelaciones de materia con seguimiento de estado.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-sky-700 font-semibold font-space">
                  <span>Ver mis trámites</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

              {/* Card 3: Mis PQRS */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-5 hover:border-cyan-500/50 hover:shadow-md transition-all space-y-3 group cursor-pointer">
                <div className="h-10 w-10 rounded-sm bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-space text-slate-900">Atención PQRS</h3>
                  <p className="text-xs text-slate-500">
                    Radica peticiones, quejas y sugerencias dirigidas a las dependencias universitarias.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-blue-700 font-semibold font-space">
                  <span>Radicar PQRS</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

              {/* Card 4: Reservas de Equipos */}
              <div className="bg-white border border-slate-200/90 rounded-sm p-5 hover:border-cyan-500/50 hover:shadow-md transition-all space-y-3 group cursor-pointer">
                <div className="h-10 w-10 rounded-sm bg-indigo-50 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-space text-slate-900">Reservas de Recursos</h3>
                  <p className="text-xs text-slate-500">
                    Solicita préstamo de portátiles, salas de estudio y laboratorios académicos.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-indigo-700 font-semibold font-space">
                  <span>Reservar espacio</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>

            </div>
          </section>

          {/* 🚀 Sección Doble Columna: Solicitudes Recientes & Próximos Eventos (Microservicios en Vivo - Máx 2 items) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            
            {/* 📄 Tarjeta 1: Solicitudes Recientes (ms-solicitudes) */}
            <div className="bg-white border border-slate-200/90 rounded-sm p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0284c7]">description</span>
                  <h3 className="text-sm font-bold font-space text-slate-900">Solicitudes recientes</h3>
                </div>
                <a href="#solicitudes" className="text-xs text-[#0284c7] font-semibold hover:underline flex items-center gap-1">
                  <span>Ver todas</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>

              {solicitudesLoading ? (
                <div className="py-8 flex justify-center items-center text-slate-400 gap-2 text-xs">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#0284c7] border-t-transparent"></span>
                  <span>Cargando solicitudes desde ms-solicitudes...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {solicitudes.slice(0, 2).map((sol, index) => (
                    <div key={sol.id || index} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-sm flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-8 w-8 rounded-sm bg-cyan-100 text-[#0284c7] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 font-mono block leading-tight">
                            {sol.codigo || ('SOL-00' + (sol.id || index + 1))}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800 truncate">{sol.asunto || sol.descripcion}</h4>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getBadgeEstadoSolicitud(sol.estado)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📅 Tarjeta 2: Próximos Eventos (ms-eventos) */}
            <div className="bg-white border border-slate-200/90 rounded-sm p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0284c7]">event</span>
                  <h3 className="text-sm font-bold font-space text-slate-900">Próximos eventos</h3>
                </div>
                <a href="#eventos" className="text-xs text-[#0284c7] font-semibold hover:underline flex items-center gap-1">
                  <span>Ver todos</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>

              {eventosLoading ? (
                <div className="py-8 flex justify-center items-center text-slate-400 gap-2 text-xs">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#0284c7] border-t-transparent"></span>
                  <span>Cargando eventos desde ms-eventos...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {eventos.slice(0, 2).map((ev, index) => (
                    <div key={ev.id || index} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-sm flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-sm bg-cyan-50 border border-cyan-200/80 flex flex-col items-center justify-center text-[#0284c7] shrink-0 font-space leading-none">
                          <span className="text-xs font-bold">{ev.fecha ? ev.fecha.split(' ')[0] : (index === 0 ? '03' : '05')}</span>
                          <span className="text-[9px] uppercase font-semibold text-slate-500 mt-0.5">{ev.fecha ? ev.fecha.split(' ')[1] : 'SEP'}</span>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-[9px] font-bold text-cyan-700 bg-cyan-100/80 px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-space">
                            {ev.tipo || 'INSTITUCIONAL'}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800 truncate">{ev.nombre}</h4>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                            <span>{ev.hora_lugar || ev.lugar_ubicacion || 'Auditorio Principal'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getBadgeEstadoEvento(ev.estado)}
                        <button className="text-slate-400 hover:text-[#0284c7] transition-colors cursor-pointer p-1">
                          <span className="material-symbols-outlined text-[18px]">bookmark</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

        </main>
      </div>

    </div>
  );
};

export default DashboardPrincipal;
