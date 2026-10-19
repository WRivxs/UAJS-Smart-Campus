import React, { useEffect } from 'react';

const TIPO_COLORS = {
  CONFERENCIA: 'from-indigo-600 to-brand-900',
  TALLER: 'from-cyan-600 to-blue-700',
  SEMINARIO: 'from-emerald-700 to-teal-800',
  ACTIVIDAD_INSTITUCIONAL: 'from-blue-700 to-indigo-900',
  default: 'from-[#0a47b8] to-[#0284c7]',
};

const formatFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export const EventDetailModal = ({
  evento,
  isInscrito,
  onClose,
  onInscribir,
  onCancelar,
  onVerPase,
  actionLoading
}) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Contenedor compacto: max-w-lg (512px) */}
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-fade-in my-auto">

        {/* Banner Header Compacto */}
        <div className={`h-32 sm:h-36 w-full bg-gradient-to-r ${gradientClass} relative p-4 sm:p-5 flex flex-col justify-between text-white rounded-t-2xl overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white">
                {evento.tipo?.replace(/_/g, ' ') || 'EVENTO'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                evento.estado === 'EN_CURSO'
                  ? 'bg-emerald-400 text-slate-900'
                  : evento.estado === 'FINALIZADO'
                  ? 'bg-slate-400 text-white'
                  : 'bg-cyan-400 text-slate-900'
              }`}>
                {evento.estado}
              </span>
              {isInscrito && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Inscrito
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="relative z-10">
            <h2 className="text-base sm:text-lg font-bold font-space text-white leading-tight line-clamp-2">
              {evento.nombre}
            </h2>
          </div>
        </div>

        {/* Body Compacto */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[48vh] overflow-y-auto">

          {/* Metadata: Fecha y Ubicación */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0a47b8] shrink-0 mt-0.5">calendar_today</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha y Hora</p>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">{formatFecha(evento.fecha_inicio)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0 mt-0.5">pin_drop</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{evento.lugar_ubicacion || 'Campus UNiAJS'}</p>
              </div>
            </div>
          </div>

          {/* Barra de Aforo */}
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[#0a47b8] text-[15px]">group</span>
                Aforo y Capacidad
              </span>
              <span className="font-bold text-[#0a47b8]">
                {evento.cupos_disponibles ?? '—'} / {evento.aforo_maximo || '—'} disponibles
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Control en tiempo real</span>
              <span className="font-semibold text-slate-600">{pct}% ocupado</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
              {evento.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* Organizador */}
          <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0a47b8] to-[#0284c7] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {getAvatarLetters(evento.organizador_nombre)}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Organizador</p>
              <p className="font-bold text-slate-800 truncate">{evento.organizador_nombre || 'UNiAJS'}</p>
            </div>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {evento.estado === 'FINALIZADO' || evento.estado === 'CANCELADO' ? (
            <span className="text-xs text-slate-400 font-medium">Evento finalizado</span>
          ) : isInscrito ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onVerPase) onVerPase(evento);
                }}
                className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#0a47b8] hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span>Pase Digital</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancelar(evento);
                }}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">event_busy</span>
                <span>Cancelar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onInscribir(evento);
              }}
              disabled={actionLoading || sinCupos}
              className="px-4 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#0b3ba4] disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              {actionLoading ? 'Procesando...' : sinCupos ? 'Sin cupos' : 'Formulario de Inscripción'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default EventDetailModal;
