import React, { useState, useMemo } from 'react';
import useNotificaciones from '../hooks/useNotificaciones';

// Formato de fecha relativo o fecha completa
const formatFechaNotif = (isoDate) => {
  if (!isoDate) return 'Reciente';
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 2) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Configuración de estilo e íconos por tipo de notificación
const getTipoConfig = (tipo) => {
  switch (tipo?.toUpperCase()) {
    case 'CONFIRMACION_RESERVA':
      return {
        icon: 'event_available',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'Reserva Aprobada',
        tabTarget: 'reservas',
      };
    case 'RECHAZO_RESERVA':
      return {
        icon: 'event_busy',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'Reserva Rechazada',
        tabTarget: 'reservas',
      };
    case 'CAMBIO_ESTADO_SOLICITUD':
      return {
        icon: 'description',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'Estado de Solicitud',
        tabTarget: 'solicitudes',
      };
    case 'NUEVA_PQRS':
      return {
        icon: 'support_agent',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        badge: 'Ticket PQRS',
        tabTarget: 'pqrs',
      };
    case 'EVENTO_NUEVO':
      return {
        icon: 'event',
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        badge: 'Evento Campus',
        tabTarget: 'eventos',
      };
    default:
      return {
        icon: 'notifications',
        color: 'text-slate-700',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'Aviso Institucional',
        tabTarget: null,
      };
  }
};

export const CentroNotificaciones = ({ onNavigateTab = () => {} }) => {
  const {
    notificaciones,
    noLeidasCount,
    loading,
    actionLoading,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
    refetch,
  } = useNotificaciones();

  const [tabFiltro, setTabFiltro] = useState('TODAS'); // TODAS | NO_LEIDAS | SOLICITUDES | RESERVAS | PQRS
  const [busqueda, setBusqueda] = useState('');

  // Notificaciones filtradas
  const notificacionesFiltradas = useMemo(() => {
    let result = [...notificaciones];

    if (tabFiltro === 'NO_LEIDAS') {
      result = result.filter((n) => !n.leida);
    } else if (tabFiltro === 'SOLICITUDES') {
      result = result.filter((n) => n.tipo === 'CAMBIO_ESTADO_SOLICITUD' || n.referencia_tipo === 'solicitud');
    } else if (tabFiltro === 'RESERVAS') {
      result = result.filter((n) => n.tipo?.includes('RESERVA') || n.referencia_tipo === 'reserva');
    } else if (tabFiltro === 'PQRS') {
      result = result.filter((n) => n.tipo === 'NUEVA_PQRS' || n.referencia_tipo === 'pqrs');
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter(
        (n) => (n.titulo || '').toLowerCase().includes(q) || (n.mensaje || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [notificaciones, tabFiltro, busqueda]);

  const total = notificaciones.length;
  const leidas = total - noLeidasCount;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* ─── 1. BANNER INSTITUCIONAL ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-cyan-200 border border-white/20">
            <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            <span className="font-space uppercase tracking-wider text-[11px]">CENTRO DE AVISOS Y ALERTAS EN TIEMPO REAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Buzón de Notificaciones
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl font-normal">
            Mantente al tanto de la aprobación de tus reservas de laboratorios, cambios de estado en tus solicitudes académicas, novedades de eventos institucionales y respuestas a tus PQRS.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {noLeidasCount > 0 && (
              <button
                onClick={marcarTodasLeidas}
                disabled={actionLoading}
                type="button"
                className="px-5 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer font-space transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600">done_all</span>
                <span>Marcar todas como leídas</span>
              </button>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className={`material-symbols-outlined text-[18px] text-blue-200 ${loading ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. TARJETAS KPI (Bordes 12px) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI: Total */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-space">
              Total Notificaciones
            </span>
            <div className="text-2xl font-black font-space text-slate-800">{total}</div>
            <p className="text-[11px] text-slate-500">Historial de alertas del sistema</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0a47b8] shrink-0">
            <span className="material-symbols-outlined text-[24px]">inbox</span>
          </div>
        </div>

        {/* KPI: No Leídas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-space">
              Alertas Pendientes
            </span>
            <div className="text-2xl font-black font-space text-rose-600 flex items-center gap-2">
              <span>{noLeidasCount}</span>
              {noLeidasCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping inline-block" />
              )}
            </div>
            <p className="text-[11px] text-rose-700 font-medium">Requieren tu atención</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <span className="material-symbols-outlined text-[24px]">mark_email_unread</span>
          </div>
        </div>

        {/* KPI: Leídas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-space">
              Revisadas / Atendidas
            </span>
            <div className="text-2xl font-black font-space text-emerald-600">{leidas}</div>
            <p className="text-[11px] text-slate-500">Notificaciones archivadas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTROS Y BÚSQUEDA ─────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pestañas de estado */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'TODAS', label: 'Todas', count: total },
            { id: 'NO_LEIDAS', label: 'No leídas', count: noLeidasCount },
            { id: 'RESERVAS', label: 'Reservas' },
            { id: 'SOLICITUDES', label: 'Solicitudes' },
            { id: 'PQRS', label: 'PQRS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabFiltro(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-space transition-all cursor-pointer flex items-center gap-1.5 ${
                tabFiltro === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tabFiltro === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar notificación..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-space focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ─── 4. LISTADO DE NOTIFICACIONES ─────────────────────────── */}
      <div className="space-y-3">
        {loading && notificaciones.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200/90 shadow-xs space-y-3">
            <span className="animate-spin material-symbols-outlined text-[36px] text-blue-600">sync</span>
            <p className="text-xs font-space text-slate-500">Cargando buzón de notificaciones...</p>
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-[32px]">notifications_off</span>
            </div>
            <h3 className="text-sm font-bold font-space text-slate-700">No hay notificaciones disponibles</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {busqueda
                ? 'No se encontraron resultados para tu búsqueda.'
                : tabFiltro === 'NO_LEIDAS'
                ? '¡Estás al día! No tienes notificaciones pendientes por leer.'
                : 'Aún no has recibido alertas del sistema.'}
            </p>
          </div>
        ) : (
          notificacionesFiltradas.map((notif) => {
            const config = getTipoConfig(notif.tipo);
            const fechaStr = formatFechaNotif(notif.fecha_creacion);

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs hover:shadow-md ${
                  notif.leida
                    ? 'border-slate-200/90 opacity-90'
                    : 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-200'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Ícono de Categoría */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${config.bg} ${config.color} ${config.border}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{config.icon}</span>
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-space border ${config.bg} ${config.color} ${config.border}`}
                      >
                        {config.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {fechaStr}
                      </span>
                      {!notif.leida && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                          Nueva
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold font-space text-slate-900 leading-snug">
                      {notif.titulo}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {notif.mensaje}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {config.tabTarget && (
                    <button
                      onClick={() => {
                        if (!notif.leida) marcarLeida(notif.id);
                        onNavigateTab(config.tabTarget);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-space text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Ir a este módulo"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Ir al módulo</span>
                    </button>
                  )}

                  {!notif.leida ? (
                    <button
                      onClick={() => marcarLeida(notif.id)}
                      disabled={actionLoading}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Marcar como leída"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => eliminarNotificacion(notif.id)}
                    disabled={actionLoading}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar notificación"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CentroNotificaciones;
