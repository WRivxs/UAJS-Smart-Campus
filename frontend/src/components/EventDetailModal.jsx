import React, { useEffect } from 'react';

const TIPO_COLORS = {
  CONFERENCIA: 'from-indigo-600 to-brand-900',
  TALLER: 'from-cyan-600 to-blue-700',
  SEMINARIO: 'from-emerald-700 to-teal-800',
  ACTIVIDAD_INSTITUCIONAL: 'from-blue-700 to-indigo-900',
  default: 'from-[#0a47b8] to-[#0284c7]',
};

const TIPO_ICONS = {
  CONFERENCIA: 'smart_toy',
  TALLER: 'terminal',
  SEMINARIO: 'trending_up',
  ACTIVIDAD_INSTITUCIONAL: 'diversity_3',
  default: 'event',
};

const formatFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getAvatarLetters = (nombre) => {
  if (!nombre) return 'UN';
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const EventDetailModal = ({ evento, isInscrito, onClose, onInscribir, onCancelar, actionLoading }) => {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!evento) return null;

  const gradientClass = TIPO_COLORS[evento.tipo] || TIPO_COLORS.default;
  const cuposUsados = (evento.aforo_maximo || 0) - (evento.cupos_disponibles ?? evento.aforo_maximo ?? 0);
  const pct = evento.aforo_maximo > 0 ? Math.round((cuposUsados / evento.aforo_maximo) * 100) : 0;
  const sinCupos = (evento.cupos_disponibles ?? 1) <= 0;

  const barColor = pct >= 80 ? 'from-rose-500 to-red-600' : pct >= 50 ? 'from-amber-400 to-orange-500' : 'from-[#0a47b8] to-[#0284c7]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative">

        {/* Banner Header */}
        <div className={`h-44 w-full bg-gradient-to-r ${gradientClass} relative p-6 flex flex-col justify-between text-white rounded-t-3xl overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white">
                {evento.tipo?.replace(/_/g, ' ') || 'EVENTO'}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                evento.estado === 'EN_CURSO'
                  ? 'bg-emerald-400 text-slate-900'
                  : evento.estado === 'FINALIZADO'
                  ? 'bg-slate-400 text-white'
                  : 'bg-cyan-400 text-slate-900'
              }`}>
                {evento.estado}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold font-space text-white leading-tight line-clamp-2">
              {evento.nombre}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Metadata: Fecha y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a47b8] flex items-center justify-center shrink-0 border border-blue-100">
                <span className="material-symbols-outlined text-[22px]">calendar_today</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Fecha y Horario</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{formatFecha(evento.fecha_inicio)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <span className="material-symbols-outlined text-[22px]">pin_drop</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Ubicación Física</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{evento.lugar_ubicacion || '—'}</p>
              </div>
            </div>
          </div>

          {/* Barra de Aforo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0a47b8] text-[18px]">group</span>
                Control de Capacidad y Aforo
              </span>
              <span className="font-bold text-[#0a47b8]">
                {evento.cupos_disponibles ?? '—'} de {evento.aforo_maximo || '—'} cupos disponibles
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Inscripción inmediata vinculada al carnet digital</span>
              <span className="font-semibold text-slate-600">{pct}% ocupado</span>
            </p>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descripción de la Actividad</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60">
              {evento.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* Organizador */}
          <div className="border-t border-slate-200 pt-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0a47b8] to-[#0284c7] text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
              {getAvatarLetters(evento.organizador_nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Organizador / Ponente</p>
              <p className="text-sm font-bold text-slate-800 truncate">{evento.organizador_nombre || 'UAJS'}</p>
              <p className="text-xs text-slate-500">Corporación Universitaria Antonio José de Sucre</p>
            </div>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 rounded-b-3xl flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {evento.estado === 'FINALIZADO' || evento.estado === 'CANCELADO' ? (
            <span className="text-xs text-slate-400 font-medium">Este evento ya finalizó</span>
          ) : isInscrito ? (
            <button
              onClick={() => onCancelar(evento.id)}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
              {actionLoading ? 'Cancelando...' : 'Cancelar Inscripción'}
            </button>
          ) : (
            <button
              onClick={() => onInscribir(evento.id)}
              disabled={actionLoading || sinCupos}
              className="px-5 py-2.5 rounded-xl bg-[#0a47b8] hover:bg-[#0b3ba4] disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-blue-700/25 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              {actionLoading ? 'Procesando...' : sinCupos ? 'Sin cupos disponibles' : 'Inscribirme ahora'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default EventDetailModal;
