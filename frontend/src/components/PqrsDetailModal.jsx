import React, { useState } from 'react';

const ESTADO_CONFIG = {
  RECIBIDA: {
    label: 'RECIBIDA',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    icon: 'inbox'
  },
  EN_TRAMITE: {
    label: 'EN TRÁMITE',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'pending'
  },
  RESPONDIDA: {
    label: 'RESPONDIDA',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'check_circle'
  },
  CERRADA: {
    label: 'CERRADA',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: 'lock'
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const PqrsDetailModal = ({
  isOpen,
  onClose,
  pqrs,
  respuestas = [],
  userRole = 'Estudiante',
  onResponder,
  onReplicar,
  onCambiarEstado,
  isSubmitting = false
}) => {
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replicaTexto, setReplicaTexto] = useState('');
  const [showReplicaForm, setShowReplicaForm] = useState(false);

  // Bloquear scroll del fondo cuando el modal esté abierto
  React.useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Cierre con Escape
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pqrs) return null;

  const estadoInfo = ESTADO_CONFIG[pqrs.estado] || ESTADO_CONFIG.RECIBIDA;
  const canReply = ['Administrativo', 'Administrador'].includes(userRole);

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!respuestaTexto.trim()) return;
    await onResponder(pqrs.id, respuestaTexto);
    setRespuestaTexto('');
    setShowReplyForm(false);
  };

  const handleSendReplica = async (e) => {
    e.preventDefault();
    if (!replicaTexto.trim()) return;
    if (onReplicar) {
      await onReplicar(pqrs.id, replicaTexto);
    }
    setReplicaTexto('');
    setShowReplicaForm(false);
  };

  const handleCerrarPqrs = async () => {
    if (window.confirm('¿Deseas cerrar formalmente este radicado de PQRS? Esta acción archivará el proceso y registrará tu conformidad.')) {
      if (onCambiarEstado) {
        await onCambiarEstado(pqrs.id, 'CERRADA');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Código de Radicado */}
        <div className="bg-gradient-to-r from-[#081f56] via-[#0b2f7d] to-[#0a47b8] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-space font-mono">{pqrs.numero_ticket}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 border border-white/30 uppercase">
                  {pqrs.tipo}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-space">Ficha Oficial del Radicado • UNiAJS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-space">
          
          {/* Asunto y Estado */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Asunto</span>
              <h3 className="text-sm font-bold text-slate-900">{pqrs.asunto}</h3>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${estadoInfo.bg} ${estadoInfo.text} ${estadoInfo.border}`}>
                <span className="material-symbols-outlined text-[16px]">{estadoInfo.icon}</span>
                <span>{estadoInfo.label}</span>
              </span>
            </div>
          </div>

          {/* Ficha de Metadatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Dependencia Destino</span>
              <span className="font-semibold text-slate-800">{pqrs.dependencia_destino}</span>
            </div>

            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Radicado por</span>
              <span className="font-semibold text-slate-800">
                {pqrs.anonimo ? 'Usuario Anónimo (Protegido)' : pqrs.usuario_nombre}
              </span>
            </div>

            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Fecha de Radicación</span>
              <span className="font-mono text-slate-700">{formatDate(pqrs.fecha_registro)}</span>
            </div>

            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Fecha Límite (SLA)</span>
              <span className="font-mono text-blue-700 font-bold">{formatDate(pqrs.fecha_limite_respuesta)}</span>
            </div>
          </div>

          {/* Descripción de los hechos */}
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Descripción de los Hechos
            </span>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs font-sans">
              {pqrs.descripcion}
            </p>
          </div>

          {/* Sección de Respuestas Institucionales */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#0a47b8]">chat</span>
                <span>Pronunciamiento / Respuesta Oficial</span>
              </h4>
              
              {canReply && !showReplyForm && pqrs.estado !== 'CERRADA' && (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-[11px] transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">reply</span>
                  <span>Emitir Respuesta</span>
                </button>
              )}
            </div>

            {/* Si ya hay respuesta oficial */}
            {pqrs.respuesta ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-emerald-900 border-b border-emerald-200/60 pb-2">
                  <span className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">verified_user</span>
                    <span>Respuesta por: {pqrs.responsable_nombre || 'Funcionario Asignado'}</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700">{formatDate(pqrs.fecha_respuesta)}</span>
                </div>
                <p className="text-emerald-950 leading-relaxed whitespace-pre-line text-xs font-sans">
                  {pqrs.respuesta}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-center text-slate-400">
                <span className="material-symbols-outlined text-[28px] text-slate-300">hourglass_empty</span>
                <p className="text-xs mt-1 font-medium text-slate-600">Este radicado aún se encuentra en trámite.</p>
                <p className="text-[11px] text-slate-400">El área de {pqrs.dependencia_destino} está revisando el requerimiento.</p>
              </div>
            )}

            {/* Cuadro de Acción Interactiva para el Estudiante si está Respondida */}
            {pqrs.estado === 'RESPONDIDA' && !canReply && (
              <div className="p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl space-y-3 mt-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#0a47b8] text-[22px] shrink-0 mt-0.5">help_center</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Atención al Usuario • Conclusión del trámite</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-sans">
                      Tu radicado cuenta con respuesta institucional oficial. Si estás de acuerdo, puedes dar tu conformidad y <strong>cerrar el ticket</strong>. Si la respuesta fue incompleta o requieres aclaración, puedes <strong>enviar una réplica</strong> para que el área responsable lo revise nuevamente.
                    </p>
                  </div>
                </div>

                {!showReplicaForm ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCerrarPqrs}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Aceptar Solución y Cerrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplicaForm(true)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span>Solicitar Aclaración / Replicar</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendReplica} className="pt-2 space-y-2 border-t border-blue-200">
                    <label className="text-[11px] font-bold text-slate-800 block">
                      Motivo de inconformidad o solicitud de aclaración:
                    </label>
                    <textarea
                      rows={3}
                      value={replicaTexto}
                      onChange={(e) => setReplicaTexto(e.target.value)}
                      placeholder="Indica con claridad qué puntos de la respuesta consideras insatisfactorios o requieren revisión..."
                      required
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-blue-600 outline-hidden font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReplicaForm(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        <span>{isSubmitting ? 'Enviando...' : 'Radicar Réplica'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Historial adicional de respuestas / réplicas si existen */}
            {respuestas.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Historial de Interacciones y Réplicas ({respuestas.length})
                </span>
                {respuestas.map((r) => {
                  const isStudentReplica = String(r.respondido_por_id) === String(pqrs.usuario_id);
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-xl text-xs space-y-1 border ${
                        isStudentReplica
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className={`font-bold flex items-center gap-1 ${
                          isStudentReplica ? 'text-amber-900' : 'text-[#0a47b8]'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {isStudentReplica ? 'person' : 'support_agent'}
                          </span>
                          <span>
                            {r.respondido_por_nombre} {isStudentReplica ? '(Estudiante - Réplica)' : '(Funcionario UAJS)'}
                          </span>
                        </span>
                        <span className="text-slate-500">{formatDate(r.fecha_respuesta)}</span>
                      </div>
                      <p className="text-slate-800 font-sans">{r.mensaje}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formulario para emitir respuesta (solo roles administrativos) */}
            {showReplyForm && (
              <form onSubmit={handleSendResponse} className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <span className="font-bold text-blue-900 block text-xs">Redactar Respuesta Institucional</span>
                <textarea
                  rows={3}
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  placeholder="Escribe la respuesta oficial que será notificada al usuario..."
                  required
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-slate-800 text-xs focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Respuesta Oficial'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Pie de modal con acciones según rol */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            {canReply && pqrs.estado === 'RESPONDIDA' && (
              <button
                type="button"
                onClick={handleCerrarPqrs}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold transition text-xs font-space cursor-pointer disabled:opacity-50"
                title="Archivar y dar por concluido el ciclo de atención"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-600">lock</span>
                <span>Archivar / Cerrar Radicado</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer text-xs font-space"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};

export default PqrsDetailModal;
