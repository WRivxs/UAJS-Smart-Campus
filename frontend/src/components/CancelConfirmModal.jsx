import React, { useEffect } from 'react';

export const CancelConfirmModal = ({
  evento,
  onClose,
  onConfirmarCancelacion,
  actionLoading = false
}) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !actionLoading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, actionLoading]);

  if (!evento) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-fade-in relative">
        
        {/* Ícono de Alerta */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-[30px]">event_busy</span>
        </div>

        {/* Título y Mensaje */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold font-space text-slate-900">
            ¿Cancelar tu inscripción al evento?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Estás a punto de cancelar tu cupo para:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-800">
            {evento.nombre}
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-left flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">info</span>
            <span>
              Al cancelar, tu lugar se liberará inmediatamente para que otro estudiante de la universidad pueda participar.
            </span>
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Conservar cupo
          </button>

          <button
            type="button"
            onClick={() => onConfirmarCancelacion(evento.id)}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {actionLoading ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                <span>Cancelando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Sí, cancelar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CancelConfirmModal;
