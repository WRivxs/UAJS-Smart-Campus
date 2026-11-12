import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const AdminResumen = ({ onNavigateTab = () => {}, counts = {} }) => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const checkGatewayHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      } else {
        setHealthStatus({ status: 'ERROR', microservicios: {} });
      }
    } catch {
      setHealthStatus({ status: 'OFFLINE', microservicios: {} });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkGatewayHealth();
  }, []);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">
      
      {/* ── Banner Principal de Administrador ───────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-700 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-space font-semibold uppercase tracking-wider text-blue-100">
            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
            <span>Módulo de Control y Gobernanza • Rol Administrador</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Panel de Administración del Campus
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
            Bienvenido, <strong className="text-white font-semibold">{user?.nombre || 'Administrador General del Sistema'}</strong>. Gestión institucional centralizada, supervisión operativa de servicios, control de reservas de espacios y seguimiento del ciclo de vida de trámites universitarios.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('solicitudes')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Auditar Solicitudes ({counts.solicitudes || 0})</span>
            </button>
            <button
              onClick={() => onNavigateTab('reservas')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Revisar Reservas ({counts.reservas || 0})</span>
            </button>
            <button
              onClick={() => onNavigateTab('recursos')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Nuevo Recurso Físico</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPIs Principales del Sistema ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Usuarios */}
        <div
          onClick={() => onNavigateTab('usuarios')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">
              Usuarios del Campus
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 font-space group-hover:text-[#0a47b8] transition-colors">
              {counts.usuarios ?? '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Estudiantes, docentes y personal institucional</p>
          </div>
        </div>

        {/* KPI 2: Solicitudes */}
        <div
          onClick={() => onNavigateTab('solicitudes')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">
              Trámites Radicados
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 font-space group-hover:text-[#0a47b8] transition-colors">
              {counts.solicitudes ?? '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Trámites y certificaciones en curso</p>
          </div>
        </div>

        {/* KPI 3: Reservas */}
        <div
          onClick={() => onNavigateTab('reservas')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">
              Reservas Totales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">event_available</span>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-emerald-600 font-space">
              {counts.reservas ?? '—'}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Control de horarios y disponibilidad</p>
          </div>
        </div>

        {/* KPI 4: Recursos Físicos */}
        <div
          onClick={() => onNavigateTab('recursos')}
          className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">
              Recursos Inventariados
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">meeting_room</span>
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 font-space group-hover:text-[#0a47b8] transition-colors">
              {counts.recursos ?? '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Aulas, laboratorios y equipos disponibles</p>
          </div>
        </div>

      </div>

      {/* ── Monitoreo de Estado de Servicios del Sistema ───────────── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold font-space text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0a47b8] text-[20px]">monitor_heart</span>
              <span>Telemetría y Estado Operativo de Servicios</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Monitoreo en tiempo real de los servicios independientes y conectividad con bases de datos del campus.
            </p>
          </div>

          <button
            onClick={checkGatewayHealth}
            disabled={loadingHealth}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold font-space flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingHealth ? 'animate-spin text-blue-600' : ''}`}>
              refresh
            </span>
            <span>Verificar Salud</span>
          </button>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { name: 'Seguridad & Acceso', desc: 'Autenticación Centralizada' },
            { name: 'Directorio de Usuarios', desc: 'Gestión Institucional' },
            { name: 'Trámites y Certificaciones', desc: 'Atención de Solicitudes' },
            { name: 'Atención al Ciudadano', desc: 'PQRS y Peticiones' },
            { name: 'Inventario de Espacios', desc: 'Aulas y Laboratorios' },
            { name: 'Control de Reservas', desc: 'Disponibilidad de Horarios' },
            { name: 'Centro de Alertas', desc: 'Notificaciones Oficiales' },
            { name: 'Agenda Universitaria', desc: 'Eventos del Campus' },
          ].map((srv) => (
            <div
              key={srv.name}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold font-space text-slate-800 block truncate">
                  {srv.name}
                </span>
                <span className="text-[10px] text-slate-500 font-space block truncate">
                  {srv.desc}
                </span>
              </div>
              <span className="flex h-2.5 w-2.5 relative shrink-0 ml-2" title="Operativo">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminResumen;

