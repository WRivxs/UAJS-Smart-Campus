import React, { useEffect } from 'react';

const ESTADOS_ORDEN = [
  { id: 'REGISTRADA', label: '1. REGISTRADA' },
  { id: 'EN_REVISION', label: '2. EN_REVISIÓN' },
  { id: 'ASIGNADA', label: '3. ASIGNADA' },
  { id: 'EN_PROCESO', label: '4. EN_PROCESO' },
  { id: 'RESUELTA', label: '5. RESUELTA' },
  { id: 'CERRADA', label: '6. CERRADA' },
];

const formatFecha = (iso) => {
  if (!iso) return 'Reciente';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const FlujoSolicitudModal = ({
  solicitud,
  historial = [],
  isOpen,
  onClose,
  onCancelar,
  actionLoading,
}) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquear scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen && solicitud) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, solicitud]);

  if (!isOpen || !solicitud) return null;

  const currentIdx = ESTADOS_ORDEN.findIndex((e) => e.id === solicitud.estado);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const codigo = solicitud.codigo || `#SOL-${String(solicitud.id).padStart(3, '0')}`;
  const puedeCancelar = solicitud.estado === 'REGISTRADA';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trace-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Trace Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-xs">
              {codigo}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight" id="trace-modal-title">
                {solicitud.asunto}
              </h3>
              <p className="text-xs text-slate-500">
                Radicado el {formatFecha(solicitud.fecha_registro)} • Dependencia: {solicitud.dependencia}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 6-State Stepped Progress Flow */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Estado del Ciclo de Vida del Trámite
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              {ESTADOS_ORDEN.map((st, idx) => {
                const isPassed = idx < activeIdx;
                const isCurrent = idx === activeIdx;

                if (isPassed) {
                  return (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-col items-center shadow-2xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                        ✓
                      </span>
                      <span className="font-bold text-slate-800 text-[10px] tracking-tight">{st.label}</span>
                      <span className="text-[9px] text-emerald-700 font-medium">Completado</span>
                    </div>
                  );
                }

                if (isCurrent) {
                  return (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-xl border-2 border-cyan-500 bg-cyan-50/80 flex flex-col items-center shadow-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-bold mb-1 animate-pulse">
                        ●
                      </span>
                      <span className="font-bold text-cyan-900 text-[10px] tracking-tight">{st.label}</span>
                      <span className="text-[9px] text-cyan-700 font-semibold">En curso</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-slate-400"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold mb-1">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[10px] tracking-tight">{st.label}</span>
                    <span className="text-[9px] text-slate-400">Pendiente</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RBAC Notice Banner */}
          {puedeCancelar ? (
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-start space-x-2.5 text-xs text-blue-900">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 16v-4m0-4h.01" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="flex-1">
                <strong>Trámite en Estado Inicial:</strong> Tu solicitud se encuentra en estado{' '}
                <span className="font-bold text-blue-700">REGISTRADA</span>. Si necesitas desistir del trámite o te equivocaste, puedes cancelarla con el botón al final de esta ventana.
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start space-x-2.5 text-xs text-amber-900">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <strong>Políticas de Cancelación Institucional:</strong> Como la solicitud ha avanzado más allá del estado{' '}
                <em>REGISTRADA</em> (actualmente en <strong>{solicitud.estado}</strong>), el trámite se encuentra bloqueado para cancelaciones autónomas. Si requiere modificaciones extraordinarias, contacte directamente a{' '}
                <span className="underline font-semibold">{solicitud.dependencia}</span>.
              </div>
            </div>
          )}

          {/* Resumen de Requerimiento */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Tipo: <strong className="text-slate-800">{solicitud.tipo}</strong></span>
              <span>Prioridad: <strong className="text-slate-800">{solicitud.prioridad || 'MEDIA'}</strong></span>
              <span>Responsable: <strong className="text-slate-800">{solicitud.responsable_nombre || 'Asignación automática'}</strong></span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-700 leading-relaxed">
              <strong className="block text-slate-900 mb-0.5">Descripción ingresada:</strong>
              {solicitud.descripcion}
            </div>
            {solicitud.respuesta_final && (
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <strong className="block text-emerald-950 font-bold mb-1">Respuesta Oficial Institucional:</strong>
                {solicitud.respuesta_final}
              </div>
            )}
          </div>

          {/* Timeline Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bitácora de Trazabilidad y Comentarios Oficiales
            </h4>
            <div className="border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs">
              {historial && historial.length > 0 ? (
                historial.map((log, i) => (
                  <div key={log.id || i} className="relative">
                    <span
                      className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                        i === historial.length - 1 ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="font-semibold text-slate-900">
                      Transición a: <span className="text-blue-700">{log.estado_nuevo}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {formatFecha(log.fecha_cambio)} — Funcionario / Actor:{' '}
                      <strong>{log.cambiado_por_nombre || 'Sistema UAJS'}</strong>
                    </div>
                    {log.observacion && (
                      <p className="mt-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{log.observacion}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-white" />
                  <div className="font-semibold text-slate-900">Radicación exitosa por el estudiante</div>
                  <div className="text-slate-500 text-[11px]">
                    {formatFecha(solicitud.fecha_registro)} — {solicitud.usuario_nombre || 'Estudiante UAJS'}
                  </div>
                  <p className="mt-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "Solicitud ingresada mediante Portal Web Estudiantil con radicado {codigo}."
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Trace Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors shadow-2xs"
              type="button"
            >
              <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Imprimir Ficha
            </button>

            {puedeCancelar && (
              <button
                onClick={() => onCancelar(solicitud.id)}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                type="button"
              >
                <svg className="w-4 h-4 mr-1 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {actionLoading ? 'Cancelando...' : 'Cancelar Solicitud'}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
            type="button"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};

export default FlujoSolicitudModal;
