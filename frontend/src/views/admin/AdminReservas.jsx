import React, { useState, useMemo } from 'react';
import useAdminReservas from '../../hooks/useAdminReservas';
import { useAuth } from '../../hooks/useAuth';

const ESTADOS_RESERVA = ['TODAS', 'PENDIENTE', 'APROBADA', 'FINALIZADA', 'RECHAZADA', 'CANCELADA'];

export const AdminReservas = () => {
  const {
    reservas,
    recursos,
    loading,
    actionLoading,
    error,
    refetch,
    aprobarReserva,
    rechazarReserva,
    cancelarReserva,
    eliminarReserva,
    consultarDisponibilidad,
  } = useAdminReservas();

  const { user } = useAuth();
  const currentRole = (user?.rol_nombre || user?.rol || '').trim();
  const isAdmin = currentRole === 'Administrador' || Number(user?.rol_id) === 1;
  const isAdministrativo = currentRole === 'Administrativo' || Number(user?.rol_id) === 3;

  // Filtros
  const [activeTab, setActiveTab] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecursoFilter, setSelectedRecursoFilter] = useState('TODOS');

  // Modales
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [observacionesRechazo, setObservacionesRechazo] = useState('');

  // Conflicto de Horarios (HTTP 409 Conflict)
  const [conflictAlert, setConflictAlert] = useState(null);

  // Inspector de Disponibilidad en Vivo
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false);
  const [checkerRecursoId, setCheckerRecursoId] = useState('');
  const [checkerFecha, setCheckerFecha] = useState(new Date().toISOString().slice(0, 10));
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState(null);

  // Notificación flotante de feedback
  const [feedback, setFeedback] = useState(null);

  const showFeedbackMsg = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Filtrado Seguro
  const safeReservas = useMemo(() => (Array.isArray(reservas) ? reservas : []), [reservas]);

  const filteredReservas = useMemo(() => {
    return safeReservas.filter((reserva) => {
      if (!reserva || typeof reserva !== 'object') return false;
      const estado = (reserva.estado || '').toUpperCase();
      const matchEstado = activeTab === 'TODAS' || estado === activeTab;

      const recursoNombre = reserva.recurso_nombre || reserva.recurso?.nombre || '';
      const usuarioNombre = reserva.usuario_nombre || reserva.usuario?.nombre || '';
      const usuarioEmail = reserva.usuario_correo || reserva.usuario?.correo || '';
      const motivo = reserva.motivo || '';
      const idStr = String(reserva.id || '');

      const matchSearch =
        recursoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuarioEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idStr.includes(searchTerm);

      const matchRecurso =
        selectedRecursoFilter === 'TODOS' ||
        String(reserva.recurso_id) === String(selectedRecursoFilter);

      return matchEstado && matchSearch && matchRecurso;
    });
  }, [safeReservas, activeTab, searchTerm, selectedRecursoFilter]);

  // KPIs
  const stats = useMemo(() => {
    const total = safeReservas.length;
    const pendientes = safeReservas.filter((r) => (r?.estado || '').toUpperCase() === 'PENDIENTE').length;
    const aprobadas = safeReservas.filter((r) => (r?.estado || '').toUpperCase() === 'APROBADA').length;
    const rechazadas = safeReservas.filter((r) => (r?.estado || '').toUpperCase() === 'RECHAZADA').length;
    return { total, pendientes, aprobadas, rechazadas };
  }, [safeReservas]);

  // Manejo de Aprobación con detección estricta de HTTP 409
  const handleAprobar = async (reserva) => {
    setConflictAlert(null);
    const defaultObs = isAdministrativo
      ? 'Aprobada por Coordinación Administrativa'
      : 'Aprobada por Administrador de Campus';
    const res = await aprobarReserva(reserva.id, defaultObs);

    if (res.conflict) {
      // Conflicto de solapamiento de horarios HTTP 409
      setConflictAlert({
        reservaId: reserva.id,
        recurso: reserva.recurso_nombre || `Recurso #${reserva.recurso_id}`,
        fecha: reserva.fecha_reserva,
        horario: `${reserva.hora_inicio} - ${reserva.hora_fin}`,
        message: res.message,
      });
      showFeedbackMsg('error', 'Conflicto de horario: Ya existe una reserva confirmada en esa franja.');
    } else if (res.ok) {
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Manejo de Rechazo
  const handleOpenReject = (reserva) => {
    setSelectedReserva(reserva);
    setObservacionesRechazo('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedReserva) return;
    const res = await rechazarReserva(
      selectedReserva.id,
      observacionesRechazo || 'Rechazada por indisponibilidad o mantenimiento institucional.'
    );

    if (res.ok) {
      setShowRejectModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Manejo de Cancelación
  const handleCancelar = async (reserva) => {
    if (window.confirm(`¿Deseas cancelar la reserva #${reserva.id}?`)) {
      const res = await cancelarReserva(reserva.id);
      if (res.ok) {
        showFeedbackMsg('success', res.message);
      } else {
        showFeedbackMsg('error', res.message);
      }
    }
  };

  // Manejo de Eliminación
  const handleOpenDelete = (reserva) => {
    setSelectedReserva(reserva);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReserva) return;
    const res = await eliminarReserva(selectedReserva.id);
    if (res.ok) {
      setShowDeleteModal(false);
      showFeedbackMsg('success', res.message);
    } else {
      showFeedbackMsg('error', res.message);
    }
  };

  // Consultar disponibilidad en vivo
  const handleCheckDisponibilidad = async (e) => {
    e.preventDefault();
    if (!checkerRecursoId || !checkerFecha) return;
    setCheckerLoading(true);
    const res = await consultarDisponibilidad(checkerRecursoId, checkerFecha);
    setCheckerLoading(false);
    if (res.ok) {
      setHorariosOcupados(res.horarios_ocupados);
    } else {
      showFeedbackMsg('error', res.message || 'Error al consultar disponibilidad.');
      setHorariosOcupados([]);
    }
  };

  // Render Badge de Estado
  const getBadgeEstado = (estado) => {
    const est = (estado || '').toUpperCase();
    switch (est) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDIENTE
          </span>
        );
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            APROBADA
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            RECHAZADA
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            CANCELADA
          </span>
        );
      case 'FINALIZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0a47b8] border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a47b8]" />
            FINALIZADA
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
            feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-75">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* ALERTA DE CONFLICTO DE HORARIO (Prevención de Solapamiento) */}
      {conflictAlert && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">event_busy</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-200 text-amber-900">
                  Conflicto de Horario
                </span>
                <h4 className="text-base font-bold text-amber-950">
                  Horario Solapado: Ya existe una reserva confirmada en esta franja
                </h4>
              </div>
              <p className="text-sm text-amber-900 mt-1 font-medium">
                {conflictAlert.message}
              </p>
              <div className="mt-3 p-3 bg-white/80 rounded-xl border border-amber-200 flex flex-wrap items-center gap-4 text-xs text-amber-900">
                <span>
                  <strong>Recurso:</strong> {conflictAlert.recurso}
                </span>
                <span>
                  <strong>Fecha:</strong> {conflictAlert.fecha}
                </span>
                <span>
                  <strong>Horario Solapado:</strong> {conflictAlert.horario}
                </span>
                <span>
                  <strong>Reserva ID:</strong> #{conflictAlert.reservaId}
                </span>
              </div>
            </div>
            <button
              onClick={() => setConflictAlert(null)}
              className="text-amber-800 hover:text-amber-950 p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0a47b8]">
              Auditoría y Control
            </span>
            <span className="text-xs text-slate-400">Gestión de Espacios</span>
          </div>
          <h2 className="text-2xl font-bold text-[#081f56] tracking-tight mt-1">
            Auditoría y Control de Reservas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Supervisión institucional, aprobación oportuna y gestión de franjas horarias para espacios y equipos del campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAvailabilityChecker(!showAvailabilityChecker)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              showAvailabilityChecker
                ? 'bg-blue-50 text-[#0a47b8] border-[#0a47b8]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">calendar_clock</span>
            <span>Ver Disponibilidad en Vivo</span>
          </button>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-[#0a47b8] hover:bg-blue-50 rounded-xl transition border border-slate-200"
            title="Recargar reservas"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Panel Plegable de Disponibilidad en Vivo */}
      {showAvailabilityChecker && (
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#0a47b8]">query_builder</span>
              <h4 className="text-sm font-bold text-[#081f56]">
                Consultar Disponibilidad de Horarios del Recurso
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              Consulta en Tiempo Real
            </span>
          </div>

          <form onSubmit={handleCheckDisponibilidad} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Seleccionar Recurso
              </label>
              <select
                required
                value={checkerRecursoId}
                onChange={(e) => setCheckerRecursoId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
              >
                <option value="">-- Elige un recurso físico --</option>
                {recursos.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.codigo} - {rec.nombre} ({rec.ubicacion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha de Inspección
              </label>
              <input
                type="date"
                required
                value={checkerFecha}
                onChange={(e) => setCheckerFecha(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={checkerLoading}
              className="px-4 py-2 bg-[#0a47b8] hover:bg-[#081f56] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              {checkerLoading ? (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-sm">search</span>
              )}
              <span>Ver Franjas Ocupadas</span>
            </button>
          </form>

          {horariosOcupados && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Horarios Ocupados Confirmados ({horariosOcupados.length})
              </h5>
              {horariosOcupados.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  ¡Totalmente libre! No existen reservas registradas para esta fecha.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {horariosOcupados.map((h, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">lock_clock</span>
                      {h.hora_inicio || h.hora_inicio_reserva} - {h.hora_fin || h.hora_fin_reserva}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Reservas</p>
            <h4 className="text-2xl font-bold text-[#081f56] mt-0.5">{stats.total}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0a47b8] flex items-center justify-center">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Por Aprobar</p>
            <h4 className="text-2xl font-bold text-amber-600 mt-0.5">{stats.pendientes}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Aprobadas</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.aprobadas}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Rechazadas</p>
            <h4 className="text-2xl font-bold text-rose-600 mt-0.5">{stats.rechazadas}</h4>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined">cancel</span>
          </div>
        </div>
      </div>

      {/* Tabs y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        {/* Tabs de Estado */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
          {ESTADOS_RESERVA.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#0a47b8] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Buscador y Filtro por Recurso */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por usuario, correo, recurso, motivo o ID de reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20 focus:border-[#0a47b8]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Recurso:</span>
            <select
              value={selectedRecursoFilter}
              onChange={(e) => setSelectedRecursoFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="TODOS">Todos los recursos</option>
              {recursos.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.codigo} - {rec.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Reservas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-[#0a47b8] animate-spin">
              progress_activity
            </span>
            <p className="text-sm text-slate-500 mt-3">Consultando registros de reservas...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-rose-50 border-rose-200">
            <span className="material-symbols-outlined text-4xl text-rose-500">warning</span>
            <h4 className="text-base font-bold text-rose-900 mt-2">Error al cargar reservas</h4>
            <p className="text-sm text-rose-700 mt-1">{error}</p>
          </div>
        ) : filteredReservas.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
            <h4 className="text-base font-semibold text-slate-700 mt-2">No se encontraron reservas</h4>
            <p className="text-sm text-slate-400 mt-1">
              No hay registros que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Recurso</th>
                  <th className="py-3.5 px-4">Solicitante</th>
                  <th className="py-3.5 px-4">Fecha & Horario</th>
                  <th className="py-3.5 px-4">Motivo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReservas.map((res) => {
                  const estado = (res.estado || '').toUpperCase();
                  const isPendiente = estado === 'PENDIENTE';
                  const isAprobada = estado === 'APROBADA';

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{res.id}
                      </td>

                      {/* Recurso */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {res.recurso_nombre || `Recurso #${res.recurso_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {res.recurso_codigo || res.recurso?.codigo || 'Campus UAJS'}
                        </div>
                      </td>

                      {/* Solicitante */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">
                          {res.usuario_nombre || `Usuario #${res.usuario_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {res.usuario_correo || res.usuario?.correo || 'Sin correo registrado'}
                        </div>
                      </td>

                      {/* Fecha & Horario */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-slate-400">
                            calendar_month
                          </span>
                          {res.fecha_reserva || 'Fecha N/D'}
                        </div>
                        <div className="text-[11px] font-mono text-[#0a47b8] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {res.hora_inicio} - {res.hora_fin}
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600">
                          {res.motivo || 'Uso académico institucional.'}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getBadgeEstado(res.estado)}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Botón Aprobar (Con detección 409) */}
                          {isPendiente && (
                            <button
                              onClick={() => handleAprobar(res)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                              title="Aprobar reserva"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              <span>Aprobar</span>
                            </button>
                          )}

                          {/* Botón Rechazar */}
                          {isPendiente && (
                            <button
                              onClick={() => handleOpenReject(res)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                              title="Rechazar reserva"
                            >
                              Rechazar
                            </button>
                          )}

                          {/* Botón Cancelar (si ya está aprobada) */}
                          {isAprobada && (
                            <button
                              onClick={() => handleCancelar(res)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition"
                              title="Cancelar reserva aprobada"
                            >
                              Cancelar
                            </button>
                          )}

                          {/* Ver Detalle */}
                          <button
                            onClick={() => {
                              setSelectedReserva(res);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            title="Ver detalles completos"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>

                          {/* Eliminar Definitivamente (Solo Administrador TI) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenDelete(res)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Eliminar registro"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLES DE RESERVA */}
      {showDetailModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a47b8] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">event_available</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#081f56]">
                    Reserva #{selectedReserva.id}
                  </h3>
                  <p className="text-xs text-slate-400">Auditoría institucional detallada</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Estado actual:</span>
                <div>{getBadgeEstado(selectedReserva.estado)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Recurso Reservado</span>
                  <p className="font-bold text-[#081f56] text-sm mt-0.5">
                    {selectedReserva.recurso_nombre || `Recurso #${selectedReserva.recurso_id}`}
                  </p>
                  <p className="text-slate-500">{selectedReserva.recurso_codigo || 'Campus Principal'}</p>
                </div>

                <div className="p-3 border border-slate-100 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Usuario Solicitante</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {selectedReserva.usuario_nombre || `Usuario #${selectedReserva.usuario_id}`}
                  </p>
                  <p className="text-slate-500">{selectedReserva.usuario_correo || 'N/D'}</p>
                </div>
              </div>

              <div className="p-3 border border-slate-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fecha del servicio:</span>
                  <span className="font-semibold text-slate-800">{selectedReserva.fecha_reserva}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Franja horaria:</span>
                  <span className="font-mono font-bold text-[#0a47b8]">
                    {selectedReserva.hora_inicio} a {selectedReserva.hora_fin}
                  </span>
                </div>
                {selectedReserva.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fecha de radicación:</span>
                    <span className="text-slate-600">{new Date(selectedReserva.created_at).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                  Motivo y Propósito:
                </span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                  {selectedReserva.motivo || 'No especificado.'}
                </p>
              </div>

              {selectedReserva.observaciones && (
                <div>
                  <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                    Observaciones Administrativas:
                  </span>
                  <p className="p-3 bg-amber-50/70 text-amber-900 border border-amber-200 rounded-xl">
                    {selectedReserva.observaciones}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHAZAR RESERVA (Diseño Institucional Elevado) */}
      {showRejectModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">event_busy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-space">
                    Rechazar Reserva #{selectedReserva.id}
                  </h3>
                  <p className="text-xs text-rose-100">Coordinación Institucional del Campus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Solicitante:</span>
                  <span className="font-bold text-slate-800">{selectedReserva.usuario_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Espacio Solicitado:</span>
                  <span className="font-semibold text-slate-800">{selectedReserva.recurso_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha y Horario:</span>
                  <span className="font-mono text-slate-700">
                    {selectedReserva.fecha_reserva} • {selectedReserva.hora_inicio} - {selectedReserva.hora_fin}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-space">
                  Motivo Institucional del Rechazo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={observacionesRechazo}
                  onChange={(e) => setObservacionesRechazo(e.target.value)}
                  placeholder="Ej. Espacio asignado a certamen académico rectoral o mantenimiento técnico prioritario."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Este motivo quedará registrado en el historial de la reserva para consulta del estudiante.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5 font-space cursor-pointer"
                >
                  {actionLoading && <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>}
                  <span>Confirmar Rechazo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR RESERVA (Solo Administrador TI) */}
      {isAdmin && showDeleteModal && selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
                ¿Eliminar registro de reserva #{selectedReserva.id}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción eliminará definitivamente el registro de reserva del sistema.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservas;
