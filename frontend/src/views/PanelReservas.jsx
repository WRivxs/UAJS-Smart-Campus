import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useReservas from '../hooks/useReservas';
import CrearReservaModal from '../components/CrearReservaModal';

// Formato de hora amigable (14:00:00 -> 02:00 PM)
const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
};

// Formato de fecha en español
const formatFechaReserva = (fechaStr) => {
  if (!fechaStr) return '—';
  const datePart = String(fechaStr).split('T')[0];
  const [y, m, d] = datePart.split('-');
  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return dateObj.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Configuración visual por estado de la reserva
const ESTADO_CONFIG = {
  PENDIENTE: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: 'hourglass_empty',
    label: 'PENDIENTE',
    desc: 'En revisión por coordinación de espacios',
  },
  APROBADA: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'check_circle',
    label: 'APROBADA',
    desc: 'Espacio confirmado y reservado',
  },
  FINALIZADA: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'task_alt',
    label: 'FINALIZADA',
    desc: 'Actividad académica completada',
  },
  RECHAZADA: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: 'cancel',
    label: 'RECHAZADA',
    desc: 'Solicitud no admitida por administración',
  },
  CANCELADA: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    icon: 'do_not_disturb_on',
    label: 'CANCELADA',
    desc: 'Reserva cancelada por el solicitante',
  },
};

// Ícono según el tipo de recurso
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
      return 'calendar_today';
  }
};

export const PanelReservas = () => {
  const {
    reservas,
    recursos,
    loading,
    actionLoading,
    refetch,
    crearReserva,
    cancelarReserva,
    consultarDisponibilidad,
  } = useReservas();

  // Estados de control de modales
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [recursoPreseleccionadoId, setRecursoPreseleccionadoId] = useState(null);
  const [isCatalogoOpen, setIsCatalogoOpen] = useState(false);
  const [reservaACancelar, setReservaACancelar] = useState(null);

  // Estados de filtros
  const [tabEstado, setTabEstado] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [tipoRecursoFiltro, setTipoRecursoFiltro] = useState('');

  // ─── Bloqueo de scroll cuando cualquier modal está abierto ────────
  useEffect(() => {
    const anyOpen = isModalCrearOpen || isCatalogoOpen || !!reservaACancelar;
    if (anyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalCrearOpen, isCatalogoOpen, reservaACancelar]);

  // Sistema de Toast Flotante
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, title, desc) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── KPIs Calculados 100% sobre db_reservas ─────────────────────
  const kpis = useMemo(() => {
    const total = reservas.length;
    const aprobadas = reservas.filter((r) => r.estado_reserva === 'APROBADA').length;
    const pendientes = reservas.filter((r) => r.estado_reserva === 'PENDIENTE').length;
    const finalizadas = reservas.filter((r) => r.estado_reserva === 'FINALIZADA').length;
    const canceladas = reservas.filter((r) => r.estado_reserva === 'CANCELADA').length;

    return { total, aprobadas, pendientes, finalizadas, canceladas };
  }, [reservas]);

  // ─── Filtrado y Búsqueda de Reservas ────────────────────────────
  const reservasFiltradas = useMemo(() => {
    let result = [...reservas];

    // Filtro por Tab de Estado
    if (tabEstado !== 'TODAS') {
      result = result.filter((r) => r.estado_reserva === tabEstado);
    }

    // Filtro por Tipo de Recurso
    if (tipoRecursoFiltro) {
      result = result.filter((r) => {
        const recursoObj = recursos.find((rec) => rec.id === r.recurso_id);
        return recursoObj?.tipo === tipoRecursoFiltro;
      });
    }

    // Filtro por Buscador
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      result = result.filter((r) => {
        const nombre = (r.recurso_nombre || '').toLowerCase();
        const mot = (r.motivo || '').toLowerCase();
        const obs = (r.observaciones || '').toLowerCase();
        return nombre.includes(q) || mot.includes(q) || obs.includes(q);
      });
    }

    return result;
  }, [reservas, recursos, tabEstado, tipoRecursoFiltro, busqueda]);

  // ─── Manejador para Crear Reserva ──────────────────────────────
  const handleCrearReserva = async (payload) => {
    const res = await crearReserva(payload);
    if (res.ok) {
      showToast(
        'success',
        '¡Solicitud Radicada!',
        `Se ha apartado el recurso '${payload.recurso_nombre}' con estado PENDIENTE.`
      );
      setIsModalCrearOpen(false);
      setRecursoPreseleccionadoId(null);
      return { ok: true };
    } else {
      return res;
    }
  };

  // ─── Manejador para Cancelar Reserva ────────────────────────────
  const handleConfirmarCancelacion = async () => {
    if (!reservaACancelar) return;

    const res = await cancelarReserva(reservaACancelar.id);
    if (res.ok) {
      showToast(
        'info',
        'Reserva Cancelada',
        `La reserva #${reservaACancelar.id} ha sido cancelada y el horario ha sido liberado.`
      );
      setReservaACancelar(null);
    } else {
      showToast('error', 'Error al cancelar', res.message);
    }
  };

  // Abrir modal con espacio preseleccionado desde el catálogo
  const handleSeleccionarDesdeCatalogo = (id) => {
    setRecursoPreseleccionadoId(id);
    setIsCatalogoOpen(false);
    setIsModalCrearOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden text-slate-800">

      {/* ─── Toast Flotante de Notificaciones ──────────────────────── */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-xl shadow-xl border text-xs max-w-sm animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <div className="flex-1">
            <h4 className="font-bold font-space text-sm">{toast.title}</h4>
            <p className="mt-0.5 opacity-90 leading-relaxed">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* ─── 1. BANNER INSTITUCIONAL (rounded-xl, sin migas de pan) ── */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-space font-semibold uppercase tracking-wider text-blue-100">
            <span className="material-symbols-outlined text-[15px]">meeting_room</span>
            <span>Espacios Académicos & Recursos Físicos</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Reserva de Aulas, Laboratorios y Recursos
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl font-normal">
            Gestiona y aparta espacios académicos, laboratorios de alta tecnología y recursos audiovisuales de la Universidad Antonio José de Sucre con validación de disponibilidad en tiempo real y prevención de cruces de horario.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setRecursoPreseleccionadoId(null);
                setIsModalCrearOpen(true);
              }}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer font-space transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[18px] font-bold text-blue-600">add_circle</span>
              <span>Solicitar Nueva Reserva</span>
            </button>
            <button
              onClick={() => setIsCatalogoOpen(true)}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-200">grid_view</span>
              <span>Explorar Espacios del Campus</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. KPIS DE RESERVAS (3 Tarjetas con bordes rounded-xl) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Total Reservas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">
              Total Reservas Solicitadas
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-space group-hover:text-[#0a47b8] transition-colors">
              {loading ? '—' : kpis.total}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <span>Historial registrado en PostgreSQL</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#0a47b8] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0a47b8] group-hover:text-white transition-all shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[26px]">event_note</span>
          </div>
        </div>

        {/* KPI 2: Aprobadas y Vigentes */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">
              Reservas Aprobadas
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 font-space">
              {loading ? '—' : kpis.aprobadas}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Espacios confirmados para uso</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
        </div>

        {/* KPI 3: Pendientes de Aprobación */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">
              En Revisión / Pendientes
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600 font-space">
              {loading ? '—' : kpis.pendientes}
            </h3>
            <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">pending_actions</span>
              <span>Cancelables por el estudiante</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

      </div>

      {/* ─── 3. FILTROS Y BÚSQUEDA (rounded-xl) ───────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        
        {/* Fila Superior: Tabs por Estado */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TODAS', label: 'Todas', count: kpis.total },
              { id: 'PENDIENTE', label: 'Pendientes', count: kpis.pendientes },
              { id: 'APROBADA', label: 'Aprobadas', count: kpis.aprobadas },
              { id: 'FINALIZADA', label: 'Finalizadas', count: kpis.finalizadas },
              { id: 'CANCELADA', label: 'Canceladas', count: kpis.canceladas },
            ].map((tab) => {
              const isActive = tabEstado === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabEstado(tab.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-space font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#0a47b8] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => refetch()}
            disabled={loading}
            title="Recargar reservas desde ms-reservas"
            type="button"
            className="text-xs text-slate-500 hover:text-[#0a47b8] flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer font-space"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin text-blue-600' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Fila Inferior: Buscador e Input Tipo */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por recurso (ej: Auditorio, Laboratorio IA) o motivo..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                type="button"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <select
              value={tipoRecursoFiltro}
              onChange={(e) => setTipoRecursoFiltro(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0a47b8] cursor-pointer appearance-none"
            >
              <option value="">Todos los tipos de recurso</option>
              <option value="LABORATORIO">Laboratorios de Investigación</option>
              <option value="ESPACIO_ACADEMICO">Espacios Académicos y Auditorios</option>
              <option value="SALA">Salas de Cómputo y Conferencias</option>
              <option value="EQUIPO">Equipos y Audiovisuales</option>
              <option value="RECURSO_TECNOLOGICO">Tecnología Especializada</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-slate-400 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

      </div>

      {/* ─── 4. LISTADO DE RESERVAS ──────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200/90 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0a47b8] border-t-transparent" />
          <p className="text-xs text-slate-500 font-space font-medium">
            Consultando reservas en PostgreSQL (db_reservas)...
          </p>
        </div>
      ) : reservasFiltradas.length === 0 ? (
        /* Estado vacío formal: Cero datos simulados */
        <div className="bg-white rounded-xl p-10 sm:p-14 border border-slate-200/90 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <span className="material-symbols-outlined text-[36px]">event_busy</span>
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold font-space text-slate-800">
              {busqueda || tabEstado !== 'TODAS' || tipoRecursoFiltro
                ? 'No se encontraron reservas con los filtros aplicados'
                : 'Aún no has solicitado reservas de espacios o equipos'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {busqueda || tabEstado !== 'TODAS' || tipoRecursoFiltro
                ? 'Prueba modificando los términos de búsqueda o cambiando el estado seleccionado.'
                : 'Aparta laboratorios de IA, auditorios, salas de conferencias o proyectores 4K para tus proyectos y actividades académicas.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setBusqueda('');
                setTabEstado('TODAS');
                setTipoRecursoFiltro('');
                setIsModalCrearOpen(true);
              }}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Solicitar Primera Reserva</span>
            </button>
          </div>
        </div>
      ) : (
        /* Tarjetas de Reservas (rounded-xl) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservasFiltradas.map((reserva) => {
            const estado = ESTADO_CONFIG[reserva.estado_reserva] || ESTADO_CONFIG.PENDIENTE;
            const recursoAsociado = recursos.find((r) => r.id === reserva.recurso_id);
            const iconTipo = getTipoRecursoIcon(recursoAsociado?.tipo);
            const esCancelable = reserva.estado_reserva === 'PENDIENTE';

            return (
              <div
                key={reserva.id}
                className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-[#0a47b8] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{iconTipo}</span>
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                          #{String(reserva.id).padStart(3, '0')}
                        </span>
                        {recursoAsociado?.codigo && (
                          <span className="text-[10px] font-mono text-[#0a47b8] font-bold">
                            {recursoAsociado.codigo}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold font-space text-slate-900 leading-snug truncate" title={reserva.recurso_nombre}>
                        {reserva.recurso_nombre}
                      </h4>
                      {recursoAsociado?.ubicacion && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">pin_drop</span>
                          <span>{recursoAsociado.ubicacion}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badge de Estado con punto de color */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-space border shrink-0 ${estado.bg} ${estado.text} ${estado.border}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${estado.dot} ${reserva.estado_reserva === 'PENDIENTE' ? 'animate-pulse' : ''}`} />
                    <span>{estado.label}</span>
                  </span>
                </div>

                {/* Franja de Fecha y Horario */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="material-symbols-outlined text-[#0a47b8] text-[17px]">event</span>
                    <span className="font-semibold">{formatFechaReserva(reserva.fecha_reserva)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">schedule</span>
                    <span>
                      {formatTime12h(reserva.hora_inicio)} - {formatTime12h(reserva.hora_fin)}
                    </span>
                  </div>
                </div>

                {/* Justificación Académica (Motivo) */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-space block">
                    Motivo Académico:
                  </span>
                  <p className="text-slate-700 leading-relaxed line-clamp-2 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    "{reserva.motivo}"
                  </p>
                </div>

                {/* Observaciones de la Administración (si existen) */}
                {reserva.observaciones && (
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-blue-950 flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[15px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold font-space block text-blue-900">
                        Nota de Administración {reserva.aprobado_por_nombre ? `(${reserva.aprobado_por_nombre})` : ''}:
                      </span>
                      <p className="leading-relaxed opacity-90">{reserva.observaciones}</p>
                    </div>
                  </div>
                )}

                {/* Pie de Tarjeta: Acciones */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Radicada: {reserva.fecha_solicitud ? new Date(reserva.fecha_solicitud).toLocaleDateString('es-CO') : 'Reciente'}
                  </span>

                  {esCancelable ? (
                    <button
                      onClick={() => setReservaACancelar(reserva)}
                      disabled={actionLoading}
                      type="button"
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer font-space"
                    >
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      <span>Cancelar Reserva</span>
                    </button>
                  ) : reserva.estado_reserva === 'APROBADA' ? (
                    <span className="text-[11px] text-emerald-700 font-bold font-space flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Pase Habilitado</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-space italic">
                      {reserva.estado_reserva === 'CANCELADA' ? 'Anulada' : 'Trámite cerrado'}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL DE CREACIÓN DE RESERVA ───────────────────────────── */}
      <CrearReservaModal
        isOpen={isModalCrearOpen}
        onClose={() => {
          setIsModalCrearOpen(false);
          setRecursoPreseleccionadoId(null);
        }}
        onSubmit={handleCrearReserva}
        actionLoading={actionLoading}
        recursos={recursos}
        consultarDisponibilidad={consultarDisponibilidad}
        initialRecursoId={recursoPreseleccionadoId}
      />

      {/* ─── MODAL DE CONFIRMACIÓN DE CANCELACIÓN (rounded-xl) ────────── */}
      {reservaACancelar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => !actionLoading && setReservaACancelar(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold font-space text-slate-900">
                ¿Confirmas cancelar esta reserva?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vas a cancelar la solicitud de <strong className="text-slate-900">{reservaACancelar.recurso_nombre}</strong> para el día{' '}
                <strong className="text-slate-900">{formatFechaReserva(reservaACancelar.fecha_reserva)}</strong> de{' '}
                <strong className="text-slate-900">
                  {formatTime12h(reservaACancelar.hora_inicio)} a {formatTime12h(reservaACancelar.hora_fin)}
                </strong>. Esta acción liberará la franja horaria inmediatamente.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReservaACancelar(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer font-space"
              >
                No, mantener reserva
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelacion}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-space disabled:opacity-50"
              >
                {actionLoading ? (
                  <span>Cancelando...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Sí, cancelar reserva</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL EXPLORADOR DE ESPACIOS DEL CAMPUS (Catálogo ms-recursos) ─ */}
      {isCatalogoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setIsCatalogoOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Catálogo */}
            <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold font-space uppercase tracking-widest text-blue-200">
                  Inventario Físico Institucional • ms-recursos
                </span>
                <h3 className="text-lg font-bold font-space text-white">
                  Catálogo de Espacios, Laboratorios y Equipos
                </h3>
              </div>
              <button
                onClick={() => setIsCatalogoOpen(false)}
                type="button"
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Listado de recursos con cards */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recursos.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {rec.imagen_url ? (
                    <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={rec.imagen_url}
                        alt={rec.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        rec.disponibilidad !== false ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {rec.disponibilidad !== false ? 'Disponible' : 'Mantenimiento'}
                      </span>
                    </div>
                  ) : (
                    <div className="h-24 bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[36px]">
                        {getTipoRecursoIcon(rec.tipo)}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#0a47b8] font-bold">{rec.codigo}</span>
                        {rec.aforo_maximo && <span>Aforo: {rec.aforo_maximo}</span>}
                      </div>
                      <h4 className="text-xs font-bold font-space text-slate-900 line-clamp-2">
                        {rec.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">pin_drop</span>
                        <span className="truncate">{rec.ubicacion}</span>
                      </p>
                      {rec.descripcion && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                          {rec.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => handleSeleccionarDesdeCatalogo(rec.id)}
                        disabled={rec.disponibilidad === false}
                        type="button"
                        className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#0a47b8] text-[#0a47b8] hover:text-white border border-blue-200 hover:border-transparent font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-space disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">event_available</span>
                        <span>{rec.disponibilidad !== false ? 'Apartar este espacio' : 'No disponible'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PanelReservas;
