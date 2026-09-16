import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import SidebarMenu from '../components/SidebarMenu/SidebarMenu';
import useProfile from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

export const DashboardPrincipal = () => {
  const { user, rol } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [activeTab, setActiveTab] = useState('inicio');

  const currentRole = rol || profile?.rol_nombre || user?.rol_nombre || 'Estudiante';

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

        </main>
      </div>

    </div>
  );
};

export default DashboardPrincipal;
