import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const ResumenDocente = ({ onNavigateTab = () => {}, counts = {} }) => {
  const { user, token } = useAuth();

  const docenteName = user?.nombre || 'Ana María Gómez Herrera';
  const docenteCargo = user?.cargo || 'Docente Investigador';
  const docenteFacultad = user?.facultad_departamento || 'Facultad de Ingenierías';

  const [proximasReservas, setProximasReservas] = useState([]);
  const [misEventos, setMisEventos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const userId = user?.id || user?.user_id;

    Promise.allSettled([
      fetch(`${API_GATEWAY_URL}/api/reservas/mias`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API_GATEWAY_URL}/api/eventos`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
    ]).then(([rRes, eRes]) => {
      const reservas = rRes.value?.reservas || [];
      setProximasReservas(
        reservas
          .filter((r) => r.estado !== 'CANCELADA')
          .sort((a, b) => new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0))
          .slice(0, 3)
      );

      const allEventos = Array.isArray(eRes.value?.eventos)
        ? eRes.value.eventos
        : Array.isArray(eRes.value)
        ? eRes.value
        : [];
      const propios = userId
        ? allEventos.filter((ev) => 
            String(ev.organizador_id) === String(userId) ||
            String(ev.creado_por) === String(userId) ||
            (ev.organizador && ev.organizador.trim().toLowerCase() === docenteName.trim().toLowerCase())
          )
        : [];
      setMisEventos(propios.slice(0, 3));
      setLoadingData(false);
    });
  }, [token, user]);

  const estadoBadge = (estado = '') => {
    const map = {
      CONFIRMADA: 'bg-emerald-100 text-emerald-700',
      PENDIENTE: 'bg-amber-100 text-amber-700',
      CANCELADA: 'bg-rose-100 text-rose-700',
      PROGRAMADO: 'bg-blue-100 text-blue-700',
      EN_CURSO: 'bg-violet-100 text-violet-700',
      FINALIZADO: 'bg-slate-100 text-slate-600',
    };
    return map[estado.toUpperCase()] || 'bg-slate-100 text-slate-600';
  };

  const kpis = [
    {
      tab: 'solicitudes',
      label: 'Mis Solicitudes',
      value: counts.solicitudes ?? '—',
      icon: 'fact_check',
      color: 'bg-blue-50 text-blue-600',
      desc: 'Trámites y certificaciones en curso',
    },
    {
      tab: 'reservas',
      label: 'Mis Reservas',
      value: counts.reservas ?? '—',
      icon: 'calendar_month',
      color: 'bg-emerald-50 text-emerald-600',
      desc: 'Reservas de espacios confirmadas',
    },
    {
      tab: 'mis-eventos',
      label: 'Eventos Creados',
      value: counts.misEventos ?? '—',
      icon: 'event_available',
      color: 'bg-violet-50 text-violet-600',
      desc: 'Eventos académicos publicados',
    },
    {
      tab: 'pqrs',
      label: 'PQRS Radicadas',
      value: counts.pqrs ?? '—',
      icon: 'support_agent',
      color: 'bg-amber-50 text-amber-600',
      desc: 'Peticiones, quejas y reclamos',
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">

      {/* ── Banner Principal Docente ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-violet-700 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-space font-semibold uppercase tracking-wider text-blue-100">
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span>Portal Académico — {docenteCargo}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Panel de Gestión Académica Docente
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
            Bienvenida,{' '}
            <strong className="text-white font-semibold">{docenteName}</strong>. Gestión de
            solicitudes académicas, reserva de espacios del campus, publicación de eventos académicos
            y seguimiento de PQRS institucionales — {docenteFacultad}.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('mis-eventos')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Publicar Evento Académico</span>
            </button>
            <button
              onClick={() => onNavigateTab('reservas')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Reservar Espacio ({counts.reservas || 0})</span>
            </button>
            <button
              onClick={() => onNavigateTab('solicitudes')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Mis Solicitudes ({counts.solicitudes || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.tab}
            onClick={() => onNavigateTab(kpi.tab)}
            className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">
                {kpi.label}
              </span>
              <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-[22px]">{kpi.icon}</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl font-extrabold text-slate-900 font-space group-hover:text-violet-600 transition-colors">
                {kpi.value}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Próximas Reservas y Mis Eventos ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Próximas Reservas */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold font-space text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">calendar_month</span>
              <span>Próximas Reservas</span>
            </h2>
            <button
              onClick={() => onNavigateTab('reservas')}
              className="text-xs font-semibold text-[#0a47b8] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-6">
              <span className="material-symbols-outlined animate-spin text-slate-300 text-3xl">progress_activity</span>
            </div>
          ) : proximasReservas.length === 0 ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-slate-200 text-5xl block mb-2">event_busy</span>
              <p className="text-xs text-slate-400 font-medium">Sin reservas próximas</p>
              <button
                onClick={() => onNavigateTab('reservas')}
                className="mt-3 text-xs font-bold text-violet-600 hover:underline cursor-pointer"
              >
                Reservar un espacio →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {proximasReservas.map((r, idx) => (
                <div key={r.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{r.recurso_nombre || r.recurso || 'Espacio reservado'}</p>
                    <p className="text-[11px] text-slate-500">
                      {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}
                      {r.hora_inicio ? ` · ${r.hora_inicio}` : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${estadoBadge(r.estado)}`}>
                    {r.estado || 'PENDIENTE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eventos Recientes Creados */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold font-space text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-600 text-[20px]">event_available</span>
              <span>Mis Eventos Recientes</span>
            </h2>
            <button
              onClick={() => onNavigateTab('mis-eventos')}
              className="text-xs font-semibold text-[#0a47b8] hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-6">
              <span className="material-symbols-outlined animate-spin text-slate-300 text-3xl">progress_activity</span>
            </div>
          ) : misEventos.length === 0 ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-slate-200 text-5xl block mb-2">event_note</span>
              <p className="text-xs text-slate-400 font-medium">Aún no has publicado eventos</p>
              <button
                onClick={() => onNavigateTab('mis-eventos')}
                className="mt-3 text-xs font-bold text-violet-600 hover:underline cursor-pointer"
              >
                Publicar primer evento →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {misEventos.map((ev, idx) => (
                <div key={ev.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{ev.titulo || 'Evento'}</p>
                    <p className="text-[11px] text-slate-500">
                      {ev.tipo || 'ACADEMICO'}
                      {ev.lugar ? ` · ${ev.lugar}` : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${estadoBadge(ev.estado || 'PROGRAMADO')}`}>
                    {ev.estado || 'PROGRAMADO'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Capacidades del Portal Docente ──────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="material-symbols-outlined text-violet-600 text-[20px]">verified</span>
          <h2 className="text-base font-bold font-space text-slate-900">Capacidades del Portal Académico</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: 'fact_check', title: 'Gestión de Solicitudes', desc: 'Radicación y seguimiento de trámites y certificaciones académicas.', color: 'bg-blue-50 text-blue-700' },
            { icon: 'calendar_month', title: 'Reserva de Espacios', desc: 'Solicitar disponibilidad de aulas, laboratorios y salas especializadas.', color: 'bg-emerald-50 text-emerald-700' },
            { icon: 'event_available', title: 'Creación de Eventos', desc: 'Publicar talleres, seminarios, conferencias y eventos académicos.', color: 'bg-violet-50 text-violet-700' },
            { icon: 'campaign', title: 'Agenda del Campus', desc: 'Consultar la agenda institucional completa de eventos universitarios.', color: 'bg-indigo-50 text-indigo-700' },
            { icon: 'support_agent', title: 'Canal de PQRS', desc: 'Radicar peticiones, quejas, reclamos y sugerencias institucionales.', color: 'bg-amber-50 text-amber-700' },
            { icon: 'notifications', title: 'Centro de Alertas', desc: 'Recibir notificaciones sobre respuestas, cambios y novedades del campus.', color: 'bg-rose-50 text-rose-700' },
          ].map((cap, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${cap.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-lg">{cap.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{cap.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResumenDocente;

