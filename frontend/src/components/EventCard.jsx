import React from 'react';

const TIPO_GRADIENT = {
  CONFERENCIA: 'from-indigo-600 to-blue-900',
  TALLER: 'from-cyan-600 to-blue-700',
  SEMINARIO: 'from-emerald-700 to-teal-800',
  ACTIVIDAD_INSTITUCIONAL: 'from-blue-700 to-indigo-900',
  EVENTO_ACADEMICO: 'from-[#0a47b8] to-[#0284c7]',
  default: 'from-[#0a47b8] to-[#0284c7]',
};

const TIPO_ICON = {
  CONFERENCIA: 'smart_toy',
  TALLER: 'terminal',
  SEMINARIO: 'trending_up',
  ACTIVIDAD_INSTITUCIONAL: 'diversity_3',
  EVENTO_ACADEMICO: 'school',
  default: 'event',
};

const formatFechaCorta = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase();
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
};

export const EventCard = ({ evento, isInscrito, onVerDetalle, onInscribir, onCancelar, actionLoading }) => {
  if (!evento) return null;

  const gradient = TIPO_GRADIENT[evento.tipo] || TIPO_GRADIENT.default;
  const icon = TIPO_ICON[evento.tipo] || TIPO_ICON.default;
  const cuposUsados = (evento.aforo_maximo || 0) - (evento.cupos_disponibles ?? evento.aforo_maximo ?? 0);
  const pct = evento.aforo_maximo > 0 ? Math.round((cuposUsados / evento.aforo_maximo) * 100) : 0;
  const sinCupos = (evento.cupos_disponibles ?? 1) <= 0;
  const barColor = pct >= 80 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-400' : 'bg-[#0284c7]';
  const enCurso = evento.estado === 'EN_CURSO';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col group">

      {/* Banner Superior */}
      <div
        className={`relative h-28 bg-gradient-to-br ${gradient} flex items-end p-4 overflow-hidden cursor-pointer`}
        onClick={() => onVerDetalle(evento)}
      >
        {/* Imagen de fondo si existe */}
        {evento.imagen_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${evento.imagen_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Badge de tipo arriba izq */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-sm border border-white/30 text-white uppercase tracking-wide">
            {evento.tipo?.replace(/_/g, ' ') || 'EVENTO'}
          </span>
        </div>

        {/* Badge de estado arriba der */}
        <div className="absolute top-3 right-3 z-10">
          {enCurso ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-400 text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
              EN CURSO
            </span>
          ) : evento.estado === 'FINALIZADO' ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-400 text-white">FINALIZADO</span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-300 text-slate-900">PROGRAMADO</span>
          )}
        </div>

        {/* Ícono central */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[90px] text-white">{icon}</span>
        </div>

        {/* Ícono inscrito */}
        {isInscrito && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-900">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              Inscrito
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 space-y-3 flex flex-col">
        {/* Título */}
        <h3
          className="text-sm font-bold font-space text-slate-900 line-clamp-2 cursor-pointer hover:text-[#0a47b8] transition-colors"
          onClick={() => onVerDetalle(evento)}
        >
          {evento.nombre}
        </h3>

        {/* Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
            <span>{formatFechaCorta(evento.fecha_inicio)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[15px] text-slate-400">pin_drop</span>
            <span className="truncate">{evento.lugar_ubicacion || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[15px] text-slate-400">person</span>
            <span className="truncate">{evento.organizador_nombre || 'UAJS'}</span>
          </div>
        </div>

        {/* Barra de Aforo */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Aforo disponible</span>
            <span className={`font-bold ${sinCupos ? 'text-rose-600' : 'text-slate-700'}`}>
              {evento.cupos_disponibles ?? '—'} / {evento.aforo_maximo || '—'} cupos
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-1 flex gap-2 mt-auto">
          <button
            onClick={() => onVerDetalle(evento)}
            className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
          >
            Ver detalle
          </button>

          {evento.estado !== 'FINALIZADO' && evento.estado !== 'CANCELADO' && (
            isInscrito ? (
              <button
                onClick={() => onCancelar(evento.id)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? '...' : 'Cancelar'}
              </button>
            ) : (
              <button
                onClick={() => onInscribir(evento.id)}
                disabled={actionLoading || sinCupos}
                className="flex-1 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#0b3ba4] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 shadow-sm shadow-blue-700/20"
              >
                {actionLoading ? '...' : sinCupos ? 'Sin cupos' : 'Inscribirme'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
