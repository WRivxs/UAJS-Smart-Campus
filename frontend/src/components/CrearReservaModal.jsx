import React, { useState, useEffect, useId } from 'react';

// Formato de hora amigable (14:00:00 -> 02:00 PM)
const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
};

// Ícono según el tipo de recurso físico en el campus
const getTipoRecursoIcon = (tipo) => {
  switch (tipo?.toUpperCase()) {
    case 'LABORATORIO':
      return 'science';
    case 'ESPACIO_ACADEMICO':
      return 'theater_comedy';
    case 'EQUIPO':
      return 'videocam';
    case 'SALA':
      return 'groups';
    case 'RECURSO_TECNOLOGICO':
      return 'precision_manufacturing';
    default:
      return 'meeting_room';
  }
};

export const CrearReservaModal = ({
  isOpen,
  onClose,
  onSubmit,
  actionLoading = false,
  recursos = [],
  consultarDisponibilidad,
  initialRecursoId = null,
}) => {
  const resourceSelectId = useId();
  const dateInputId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const motiveId = useId();
  const obsId = useId();

  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Estados del formulario
  const [recursoId, setRecursoId] = useState(() => {
    if (initialRecursoId) return String(initialRecursoId);
    const primero = recursos.find((r) => r.disponibilidad !== false) || recursos[0];
    return primero ? String(primero.id) : '';
  });
  const [fechaReserva, setFechaReserva] = useState(getTomorrowStr);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Franjas horarias ocupadas obtenidas dinámicamente de ms-reservas
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  // Alertas de validación y de conflicto (409)
  const [conflictError, setConflictError] = useState(null);
  const [formError, setFormError] = useState('');

  // Fecha mínima: Hoy
  const todayStr = new Date().toISOString().split('T')[0];

  // ─── Bloquear scroll del fondo cuando el modal esté abierto ───────
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // ─── Cierre con la tecla Escape ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ─── Sincronización al abrir o cambiar recurso preseleccionado ─────
  useEffect(() => {
    if (isOpen) {
      setConflictError(null);
      setFormError('');

      if (initialRecursoId) {
        setRecursoId(String(initialRecursoId));
      } else {
        setRecursoId((prev) => {
          if (prev) return prev;
          const primero = recursos.find((r) => r.disponibilidad !== false) || recursos[0];
          return primero ? String(primero.id) : '';
        });
      }

      setFechaReserva((prev) => prev || getTomorrowStr());
    }
  }, [isOpen, initialRecursoId, recursos]);

  // Recurso seleccionado actual
  const recursoSeleccionado = recursos.find((r) => String(r.id) === String(recursoId));

  // ─── Consulta automática de disponibilidad horaria ─────────────
  useEffect(() => {
    if (!isOpen || !recursoId || !fechaReserva) {
      return;
    }

    let isMounted = true;
    const fetchFranjas = async () => {
      setLoadingDisponibilidad(true);
      try {
        const res = await consultarDisponibilidad(recursoId, fechaReserva);
        if (isMounted) {
          setHorariosOcupados(res?.ok ? res.horarios_ocupados || [] : []);
        }
      } catch {
        if (isMounted) setHorariosOcupados([]);
      } finally {
        if (isMounted) setLoadingDisponibilidad(false);
      }
    };

    fetchFranjas();

    return () => {
      isMounted = false;
    };
  }, [isOpen, recursoId, fechaReserva, consultarDisponibilidad]);

  // ─── Verificación en tiempo real de cruce de horario ─────────────
  const isHorarioEnConflicto = () => {
    if (!horaInicio || !horaFin || horariosOcupados.length === 0) return false;

    // Normalizar a formato HH:MM:SS para comparar
    const start = horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio;
    const end = horaFin.length === 5 ? `${horaFin}:00` : horaFin;

    return horariosOcupados.some((slot) => {
      // Algoritmo solapamiento: (start < slot.hora_fin AND end > slot.hora_inicio)
      return start < slot.hora_fin && end > slot.hora_inicio;
    });
  };

  const hayCruceLocal = isHorarioEnConflicto();

  // ─── Manejo de Envío ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    setFormError('');

    if (!recursoId) {
      setFormError('Por favor selecciona un aula, laboratorio o equipo.');
      return;
    }

    if (!fechaReserva) {
      setFormError('Por favor selecciona la fecha de la reserva.');
      return;
    }

    if (!horaInicio || !horaFin) {
      setFormError('Debes especificar la hora de inicio y fin.');
      return;
    }

    if (horaInicio >= horaFin) {
      setFormError('La hora de inicio debe ser anterior a la hora de finalización.');
      return;
    }

    if (!motivo.trim() || motivo.trim().length < 10) {
      setFormError('El motivo académico debe tener al menos 10 caracteres explicativos.');
      return;
    }

    const startWithSeconds = horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio;
    const endWithSeconds = horaFin.length === 5 ? `${horaFin}:00` : horaFin;

    const payload = {
      recurso_id: parseInt(recursoId, 10),
      recurso_nombre: recursoSeleccionado?.nombre || 'Recurso Universitario',
      fecha_reserva: fechaReserva,
      hora_inicio: startWithSeconds,
      hora_fin: endWithSeconds,
      motivo: motivo.trim(),
      observaciones: observaciones.trim() || null,
    };

    const result = await onSubmit(payload);

    if (!result?.ok) {
      if (result?.conflict) {
        setConflictError(
          result.message || 'El recurso ya cuenta con una reserva activa o aprobada en el rango solicitado.'
        );
      } else {
        setFormError(result?.message || 'Error al registrar la solicitud de reserva.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reserva-titulo"
    >
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden transform transition-all my-auto">
        
        {/* ── Encabezado Institucional ──────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 p-5 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-space font-semibold uppercase tracking-wider text-blue-100">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                <span>Módulo de Reservas • UAJS Smart Campus</span>
              </div>
              <h2 id="modal-reserva-titulo" className="text-lg sm:text-xl font-bold font-space text-white tracking-tight">
                Solicitar Reserva de Espacio o Recurso
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
                Aparta aulas, laboratorios y equipos tecnológicos con validación de disponibilidad en tiempo real.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={actionLoading}
              type="button"
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Cuerpo del Formulario ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Banner de Conflicto de Solapamiento (409) */}
          {conflictError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
              <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
                warning
              </span>
              <div className="space-y-1">
                <strong className="font-space text-xs font-bold block text-amber-950">
                  ⚠️ Conflicto de Choque de Horario (409)
                </strong>
                <p className="leading-relaxed">{conflictError}</p>
                <p className="text-[11px] text-amber-800">
                  Por favor selecciona otra hora u otro día en el que el recurso se encuentre disponible.
                </p>
              </div>
            </div>
          )}

          {/* Banner de Error General */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">error</span>
              <span className="font-medium">{formError}</span>
            </div>
          )}

          {/* 1. Selector de Recurso (db_recursos) */}
          <div className="space-y-2">
            <label htmlFor={resourceSelectId} className="block text-xs font-bold text-slate-800 font-space uppercase tracking-wider">
              1. Selecciona el Espacio o Equipo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id={resourceSelectId}
                value={recursoId}
                onChange={(e) => {
                  setRecursoId(e.target.value);
                  setConflictError(null);
                }}
                disabled={actionLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] focus:border-transparent transition-all cursor-pointer appearance-none"
              >
                {recursos.map((rec) => (
                  <option
                    key={rec.id}
                    value={rec.id}
                    disabled={rec.disponibilidad === false}
                  >
                    {rec.nombre} ({rec.codigo}) {rec.disponibilidad === false ? '— [EN MANTENIMIENTO]' : ''}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px] pointer-events-none">
                {getTipoRecursoIcon(recursoSeleccionado?.tipo)}
              </span>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Ficha rápida informativa del recurso seleccionado */}
            {recursoSeleccionado && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700 min-w-0">
                  <span className="material-symbols-outlined text-[#0a47b8] text-[18px] shrink-0">pin_drop</span>
                  <span className="truncate font-medium">{recursoSeleccionado.ubicacion}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                  {recursoSeleccionado.aforo_maximo && (
                    <span className="inline-flex items-center gap-1 text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-mono">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">group</span>
                      <span>Aforo: {recursoSeleccionado.aforo_maximo} pers.</span>
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-semibold text-[10px] uppercase ${
                    recursoSeleccionado.disponibilidad !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${recursoSeleccionado.disponibilidad !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {recursoSeleccionado.disponibilidad !== false ? 'Habilitado' : 'Mantenimiento'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Selector de Fecha y Disponibilidad en Vivo */}
          <div className="space-y-2">
            <label htmlFor={dateInputId} className="block text-xs font-bold text-slate-800 font-space uppercase tracking-wider">
              2. Fecha de la Reserva <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id={dateInputId}
                type="date"
                min={todayStr}
                value={fechaReserva}
                onChange={(e) => {
                  setFechaReserva(e.target.value);
                  setConflictError(null);
                }}
                disabled={actionLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] focus:border-transparent transition-all"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px] pointer-events-none">
                event
              </span>
            </div>

            {/* Monitor de Franjas Ocupadas en esa fecha */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold font-space text-[11px] text-[#081f56] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#0a47b8]">timelapse</span>
                  <span>Disponibilidad en Vivo ({fechaReserva || 'Fecha no seleccionada'}):</span>
                </span>
                {loadingDisponibilidad && (
                  <span className="text-[10px] text-blue-600 flex items-center gap-1 font-mono">
                    <span className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent" />
                    <span>Consultando franjas...</span>
                  </span>
                )}
              </div>

              {loadingDisponibilidad ? (
                <p className="text-[11px] text-slate-500 italic">Verificando agenda en base de datos db_reservas...</p>
              ) : horariosOcupados.length === 0 ? (
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                  <span>¡Excelente! No hay reservas registradas para este recurso en esta fecha. Toda la jornada está libre.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-600">
                    Las siguientes franjas ya se encuentran ocupadas. Selecciona un horario diferente:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {horariosOcupados.map((slot) => (
                      <span
                        key={slot.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold"
                        title={slot.motivo ? `Motivo: ${slot.motivo}` : 'Horario ocupado'}
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-700">lock_clock</span>
                        <span>
                          {formatTime12h(slot.hora_inicio)} - {formatTime12h(slot.hora_fin)}
                        </span>
                        <span className="text-[9px] bg-amber-200/80 text-amber-800 px-1 rounded uppercase font-space font-semibold ml-0.5">
                          {slot.estado_reserva}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Selector de Horarios (Inicio y Fin) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={startTimeId} className="block text-xs font-bold text-slate-800 font-space uppercase tracking-wider">
                3. Franja Horaria Solicitada <span className="text-rose-500">*</span>
              </label>
              {hayCruceLocal && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>¡Horario con solapamiento!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Hora de Inicio:</span>
                <div className="relative">
                  <input
                    id={startTimeId}
                    type="time"
                    step="1800"
                    value={horaInicio}
                    onChange={(e) => {
                      setHoraInicio(e.target.value);
                      setConflictError(null);
                    }}
                    disabled={actionLoading}
                    className={`w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                      hayCruceLocal
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-[#0a47b8]'
                    }`}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px] pointer-events-none">
                    schedule
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500">Hora de Finalización:</span>
                <div className="relative">
                  <input
                    id={endTimeId}
                    type="time"
                    step="1800"
                    value={horaFin}
                    onChange={(e) => {
                      setHoraFin(e.target.value);
                      setConflictError(null);
                    }}
                    disabled={actionLoading}
                    className={`w-full pl-10 pr-3 py-2 bg-slate-50 border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                      hayCruceLocal
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-[#0a47b8]'
                    }`}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px] pointer-events-none">
                    update
                  </span>
                </div>
              </div>
            </div>

            {/* Aviso en vivo de choque detectado antes de enviar */}
            {hayCruceLocal && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0">error</span>
                <span>
                  El rango {formatTime12h(horaInicio)} a {formatTime12h(horaFin)} colisiona con una reserva existente. La API responderá 409 Conflict. Por favor ajusta la hora.
                </span>
              </div>
            )}
          </div>

          {/* 4. Motivo Académico (Obligatorio, mín. 10 chars) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={motiveId} className="block text-xs font-bold text-slate-800 font-space uppercase tracking-wider">
                4. Motivo Académico / Justificación <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] font-mono ${motivo.length < 10 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {motivo.length} / mín. 10 car.
              </span>
            </div>
            <textarea
              id={motiveId}
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={actionLoading}
              placeholder="Ej: Práctica de laboratorio para el proyecto de Redes Neuronales y Procesamiento de Lenguaje Natural de Ingeniería de Sistemas..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] focus:border-transparent transition-all resize-none leading-relaxed"
            />
          </div>

          {/* 5. Observaciones y Requerimientos Adicionales (Opcional) */}
          <div className="space-y-1.5">
            <label htmlFor={obsId} className="block text-xs font-bold text-slate-800 font-space uppercase tracking-wider">
              5. Observaciones o Requerimientos Técnicos <span className="text-slate-400 text-[10px] font-normal lowercase">(opcional)</span>
            </label>
            <textarea
              id={obsId}
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={actionLoading}
              placeholder="Ej: Requerimos proyector láser, conexión HDMI y acceso a internet por cable LAN..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] focus:border-transparent transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Pie de Acciones del Modal */}
          <div className="pt-2 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer font-space text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading || hayCruceLocal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-space disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Registrando reserva en PostgreSQL...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Confirmar y Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CrearReservaModal;
