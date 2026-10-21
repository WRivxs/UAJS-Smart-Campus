import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const TIPO_COLORS = {
  CONFERENCIA: 'from-indigo-600 via-blue-700 to-[#081f56]',
  TALLER: 'from-cyan-600 via-blue-700 to-[#081f56]',
  SEMINARIO: 'from-emerald-700 via-teal-800 to-[#081f56]',
  ACTIVIDAD_INSTITUCIONAL: 'from-blue-700 via-indigo-800 to-[#081f56]',
  EVENTO_ACADEMICO: 'from-[#0a47b8] via-blue-700 to-[#081f56]',
  default: 'from-[#0a47b8] via-blue-700 to-[#081f56]',
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

export const InscripcionEventoModal = ({
  evento,
  onClose,
  onConfirmarInscripcion,
  actionLoading = false,
  modoInicial = 'FORM' // 'FORM' | 'TICKET'
}) => {
  const { user } = useAuth();

  const [step, setStep] = useState(modoInicial); // 'FORM' | 'TICKET'
  const programaOficial = user?.programa_academico || user?.facultad_departamento || 'Ingeniería de Sistemas';
  const facultadOficial = user?.facultad || 'Facultad de Ingenierías';
  const semestreNumero = user?.semestre_actual || 6;
  const semestreOficial = `${semestreNumero}° Semestre`;

  const [solicitaCertificado, setSolicitaCertificado] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [errorLocal, setErrorLocal] = useState('');

  // Cerrar con tecla Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !actionLoading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, actionLoading]);

  // Bloquear scroll de la pantalla de fondo mientras el modal esté abierto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Si abrimos en modo TICKET, recuperar datos guardados en localStorage o generarlos
  useEffect(() => {
    if (modoInicial === 'TICKET' && evento) {
      const storageKey = `uajs_ticket_${evento.id}_${user?.id || 'est'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setTicketData(JSON.parse(saved));
        } catch {
          setTicketData(buildTicketPayload());
        }
      } else {
        setTicketData(buildTicketPayload());
      }
    }
  }, [modoInicial, evento, user]);

  if (!evento) return null;

  const gradientClass = TIPO_COLORS[evento.tipo] || TIPO_COLORS.default;
  const sinCupos = (evento.cupos_disponibles ?? 1) <= 0;
  const cuposRestantes = evento.cupos_disponibles ?? '—';
  const aforoMax = evento.aforo_maximo || 100;
  const pctOcupacion = aforoMax > 0 ? Math.round((((aforoMax - (evento.cupos_disponibles ?? aforoMax)) / aforoMax) * 100)) : 0;

  const buildTicketPayload = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    return {
      codigoRadicado: `INS-2026-${evento.id}-${randomCode}`,
      eventoId: evento.id,
      eventoNombre: evento.nombre,
      eventoTipo: evento.tipo,
      fechaEvento: evento.fecha_inicio,
      lugarEvento: evento.lugar_ubicacion,
      estudianteNombre: user?.nombre || 'Estudiante UAJS',
      estudianteEmail: user?.email || 'estudiante@uajs.edu.co',
      estudianteCodigo: user?.codigo_estudiantil || `EST-${user?.id || '2026'}`,
      facultad: facultadOficial,
      programa: programaOficial,
      semestre: semestreOficial,
      semestreNumero: semestreNumero,
      solicitaCertificado,
      observaciones,
      fechaEmision: new Date().toISOString()
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!aceptoCompromiso) {
      setErrorLocal('Debes aceptar el compromiso de asistencia para reservar tu cupo.');
      return;
    }

    if (sinCupos) {
      setErrorLocal('Lo sentimos, este evento ya no cuenta con cupos disponibles.');
      return;
    }

    const payload = buildTicketPayload();
    const result = await onConfirmarInscripcion(evento.id, {
      ...payload,
      facultad: facultadOficial,
      programa: programaOficial,
      semestre: semestreNumero
    });

    if (result && result.ok) {
      const storageKey = `uajs_ticket_${evento.id}_${user?.id || 'est'}`;
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setTicketData(payload);
      setStep('TICKET');
    } else {
      setErrorLocal(result?.message || 'Error al procesar la inscripción.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) onClose();
      }}
    >
      {/* Contenedor compacto: max-w-lg (512px) y márgenes ajustados */}
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fade-in my-auto">
        
        {/* ========================================================= */}
        {/* PASO 1: FORMULARIO DE INSCRIPCIÓN                         */}
        {/* ========================================================= */}
        {step === 'FORM' && (
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Header compacto con degradado */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${gradientClass} text-white relative overflow-hidden`}>
              <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-cyan-200 border border-white/20">
                    <span className="material-symbols-outlined text-[13px]">how_to_reg</span>
                    <span>INSCRIPCIÓN A EVENTO</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-space text-white leading-tight truncate">
                    {evento.nombre}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={actionLoading}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Cerrar modal"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {/* Resumen rápido de fecha y cupos */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px] text-blue-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-cyan-300 text-[15px]">calendar_month</span>
                  <span className="truncate">{formatFecha(evento.fecha_inicio)}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-cyan-300 text-[15px]">pin_drop</span>
                  <span className="truncate">{evento.lugar_ubicacion || 'Campus UNiAJS'}</span>
                </div>
              </div>
            </div>

            {/* Barra de aforo y cupos en vivo */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                <span>Disponibilidad:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${sinCupos ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                  {sinCupos ? 'Agotado' : `${cuposRestantes} de ${aforoMax} cupos`}
                </span>
              </div>
              <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${pctOcupacion >= 85 ? 'bg-rose-500' : 'bg-[#0a47b8]'}`}
                  style={{ width: `${Math.min(pctOcupacion, 100)}%` }}
                />
              </div>
            </div>

            {/* Cuerpo del Formulario con scroll vertical compacto */}
            <div className="p-4 sm:p-5 space-y-3.5 max-h-[46vh] overflow-y-auto">
              
              {/* Alerta de error si ocurre */}
              {errorLocal && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0">error</span>
                  <span className="font-medium text-[11px]">{errorLocal}</span>
                </div>
              )}

              {/* 1. Datos del Estudiante (Autocompletados desde sesión JWT) */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#0a47b8] uppercase tracking-wider flex items-center gap-1 font-space">
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    Estudiante en Sesión
                  </span>
                  <span className="text-[9px] bg-blue-100 text-[#0a47b8] font-bold px-1.5 py-0.5 rounded uppercase">
                    {user?.rol_nombre || 'ESTUDIANTE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block">Nombre</label>
                    <input
                      type="text"
                      disabled
                      value={user?.nombre || 'Estudiante Activo'}
                      className="mt-0.5 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-not-allowed text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block">Correo Institucional</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'estudiante@uajs.edu.co'}
                      className="mt-0.5 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-not-allowed text-[11px] truncate"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Información Académica Oficial (Lectura desde la Sesión del Estudiante) */}
              <div className="space-y-3">
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 font-space">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                      Información Académica Oficial
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Facultad */}
                    <div>
                      <label className="text-[10px] font-medium text-slate-500 block">Facultad</label>
                      <input
                        type="text"
                        disabled
                        value={facultadOficial}
                        className="mt-0.5 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-not-allowed text-[11px] truncate"
                      />
                    </div>

                    {/* Programa Académico */}
                    <div>
                      <label className="text-[10px] font-medium text-slate-500 block">Programa Académico</label>
                      <input
                        type="text"
                        disabled
                        value={programaOficial}
                        className="mt-0.5 w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-not-allowed text-[11px] truncate"
                      />
                    </div>

                    {/* Semestre */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-medium text-slate-500 block">Semestre Actual Matriculado</label>
                      <div className="mt-0.5 flex items-center gap-2">
                        <input
                          type="text"
                          disabled
                          value={semestreOficial}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-not-allowed text-[11px]"
                        />
                        <span className="text-[10px] text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap">
                          Periodo 2026-1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox de Certificado */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={solicitaCertificado}
                      onChange={(e) => setSolicitaCertificado(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#0a47b8] focus:ring-[#0a47b8] cursor-pointer"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800 block">Solicitar Certificado de Asistencia Digital</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Constancia oficial emitida tras validar asistencia presencial.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Observaciones / Requerimientos */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Requerimientos o notas <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej. Movilidad reducida, requerimiento técnico..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a47b8] transition-all"
                  />
                </div>

                {/* 3. Cláusula de Compromiso Ético */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceptoCompromiso}
                      onChange={(e) => setAceptoCompromiso(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-amber-400 text-[#0a47b8] focus:ring-[#0a47b8] cursor-pointer"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-amber-900 block flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-600">verified_user</span>
                        Compromiso de Asistencia Puntual
                      </span>
                      <p className="text-[10px] text-amber-800 mt-0.5 leading-snug">
                        Entiendo que el aforo es limitado. Me comprometo a asistir o cancelar mi inscripción previamente si surge algún inconveniente para liberar el cupo.
                      </p>
                    </div>
                  </label>
                </div>

              </div>

            </div>

            {/* Footer de Acciones */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={actionLoading || sinCupos || !aceptoCompromiso}
                className="px-4 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#0b3ba4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                    <span>Procesando...</span>
                  </>
                ) : sinCupos ? (
                  <>
                    <span className="material-symbols-outlined text-[15px]">block</span>
                    <span>Agotado</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>Confirmar Inscripción</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* ========================================================= */}
        {/* PASO 2: TICKET / PASE DIGITAL DE ACCESO                   */}
        {/* ========================================================= */}
        {step === 'TICKET' && ticketData && (
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Mensaje de Confirmación Compacto */}
            <div className="text-center space-y-0.5">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-space text-slate-900 mt-1">
                ¡Pase Digital Confirmado!
              </h2>
              <p className="text-[11px] text-slate-500">
                Tu cupo ha sido reservado. Presenta este código QR al ingresar.
              </p>
            </div>

            {/* Tarjeta de Pase Digital Compacta */}
            <div className="bg-gradient-to-br from-[#081f56] via-[#0a47b8] to-blue-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden border border-blue-400/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

              {/* Encabezado del Ticket */}
              <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-cyan-300 text-[18px]">school</span>
                  <span className="text-[11px] font-bold tracking-wider font-space text-cyan-200">
                    UNiAJS • PASE DIGITAL
                  </span>
                </div>
                <span className="bg-emerald-400 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  VÁLIDO
                </span>
              </div>

              {/* Título del Evento */}
              <div className="py-2.5">
                <span className="text-[9px] uppercase font-bold text-cyan-200 tracking-wider">
                  {ticketData.eventoTipo?.replace(/_/g, ' ') || 'EVENTO'}
                </span>
                <h3 className="text-sm sm:text-base font-bold font-space text-white leading-tight line-clamp-1">
                  {ticketData.eventoNombre}
                </h3>
              </div>

              {/* Grid Compacto */}
              <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/15 text-[11px]">
                <div>
                  <span className="text-[9px] font-medium text-blue-200 uppercase block">Titular</span>
                  <span className="font-bold text-white truncate block">{ticketData.estudianteNombre}</span>
                </div>
                <div>
                  <span className="text-[9px] font-medium text-blue-200 uppercase block">Código / ID</span>
                  <span className="font-bold text-white font-mono block">{ticketData.estudianteCodigo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-medium text-blue-200 uppercase block">Fecha</span>
                  <span className="font-bold text-white block text-[10px]">{formatFecha(ticketData.fechaEvento)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-medium text-blue-200 uppercase block">Lugar</span>
                  <span className="font-bold text-white block truncate text-[10px]">{ticketData.lugarEvento}</span>
                </div>
              </div>

              {/* Sección QR y Radicado */}
              <div className="pt-2.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-blue-200 font-mono uppercase block">Radicado Oficial:</span>
                  <span className="text-[11px] font-mono font-bold text-cyan-200 bg-white/10 px-2 py-0.5 rounded border border-white/20 inline-block">
                    {ticketData.codigoRadicado}
                  </span>
                </div>

                {/* QR Code Simulado SVG */}
                <div className="w-12 h-12 bg-white p-1 rounded-lg shadow shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4-2h2v4h-2v-4zm2 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h4v2h-4v-2zm2-4h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Footer de Acciones del Pase */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Imprimir / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#0b3ba4] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">done</span>
                <span>Listo</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default InscripcionEventoModal;
