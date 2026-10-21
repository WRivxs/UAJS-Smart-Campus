import React, { useState, useMemo } from 'react';
import usePqrs from '../hooks/usePqrs';
import { useAuth } from '../hooks/useAuth';
import CrearPqrsModal from '../components/CrearPqrsModal';
import PqrsDetailModal from '../components/PqrsDetailModal';
import { DataTable } from '../components/DataTable';

const ESTADO_CONFIG = {
  RECIBIDA: {
    label: 'RECIBIDA',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    dot: 'bg-sky-500'
  },
  EN_TRAMITE: {
    label: 'EN TRÁMITE',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  RESPONDIDA: {
    label: 'RESPONDIDA',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  CERRADA: {
    label: 'CERRADA',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400'
  }
};

const TIPO_BADGES = {
  PETICION: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  QUEJA: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  RECLAMO: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  SUGERENCIA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

export const ListadoPqrs = () => {
  const { rol, user } = useAuth();
  const {
    pqrsList,
    loading,
    actionLoading,
    refetch,
    crearPqrs,
    obtenerDetalle,
    responderPqrs,
    replicarPqrs,
    cambiarEstado
  } = usePqrs();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('TODOS');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPqrs, setSelectedPqrs] = useState(null);
  const [respuestasPqrs, setRespuestasPqrs] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const userRole = rol || user?.rol_nombre || 'Estudiante';

  // Métricas (Respondidas incluye todas las que tienen respuesta oficial emitida)
  const metrics = useMemo(() => {
    const total = pqrsList.length;
    const tramitadas = pqrsList.filter(p => ['RECIBIDA', 'EN_TRAMITE'].includes(p.estado)).length;
    const respondidas = pqrsList.filter(p => p.estado === 'RESPONDIDA' || Boolean(p.respuesta)).length;
    const cerradas = pqrsList.filter(p => p.estado === 'CERRADA').length;
    return { total, tramitadas, respondidas, cerradas };
  }, [pqrsList]);

  // Filtrado
  const filteredPqrs = useMemo(() => {
    return pqrsList.filter(item => {
      const matchSearch =
        item.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numero_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dependencia_destino.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo = selectedTipo === 'TODOS' || item.tipo === selectedTipo;
      
      let matchEstado = true;
      if (selectedEstado === 'RESPONDIDA') {
        // Muestra todas las que tienen respuesta oficial (estén en estado RESPONDIDA o archivadas como CERRADA)
        matchEstado = item.estado === 'RESPONDIDA' || Boolean(item.respuesta);
      } else if (selectedEstado !== 'TODOS') {
        matchEstado = item.estado === selectedEstado;
      }

      return matchSearch && matchTipo && matchEstado;
    });
  }, [pqrsList, searchTerm, selectedTipo, selectedEstado]);

  // Manejador para crear PQRS
  const handleCreatePqrs = async (datos) => {
    const result = await crearPqrs(datos);
    if (result.success) {
      showToast(`¡PQRS radicada exitosamente con número ${result.data.numero_ticket}!`, 'success');
      setIsCreateOpen(false);
    } else {
      showToast(result.error || 'Error al registrar la PQRS', 'error');
    }
  };

  // Manejador para abrir detalle
  const handleOpenDetail = async (pqrs) => {
    setSelectedPqrs(pqrs);
    setIsDetailOpen(true);
    const result = await obtenerDetalle(pqrs.id);
    if (result.success) {
      setSelectedPqrs(result.pqrs);
      setRespuestasPqrs(result.respuestas);
    }
  };

  // Manejador para responder (funcionario/admin)
  const handleResponderPqrs = async (id, mensaje) => {
    const result = await responderPqrs(id, mensaje);
    if (result.success) {
      showToast('Respuesta oficial registrada correctamente', 'success');
      setSelectedPqrs(result.pqrs);
      refetch();
    } else {
      showToast(result.error || 'Error al emitir respuesta', 'error');
    }
  };

  // Manejador para emitir réplica o solicitud de aclaración (estudiante)
  const handleReplicarPqrs = async (id, mensaje) => {
    const result = await replicarPqrs(id, mensaje);
    if (result.success) {
      showToast('Tu solicitud de aclaración fue radicada. El radicado volvió al estado En Trámite.', 'success');
      setSelectedPqrs(result.pqrs);
      refetch();
      const det = await obtenerDetalle(id);
      if (det.success) {
        setSelectedPqrs(det.pqrs);
        setRespuestasPqrs(det.respuestas);
      }
    } else {
      showToast(result.error || 'Error al enviar la réplica', 'error');
    }
  };

  // Manejador para cambiar estado (ej: archivar / cerrar)
  const handleCambiarEstado = async (id, nuevoEstado) => {
    const result = await cambiarEstado(id, nuevoEstado);
    if (result.success) {
      showToast(`Radicado cambiado al estado '${nuevoEstado}' exitosamente`, 'success');
      setSelectedPqrs(result.pqrs);
      refetch();
    } else {
      showToast(result.error || 'Error al cambiar estado de la PQRS', 'error');
    }
  };

  // Columnas para DataTable (optimizadas para ajuste exacto al 100% sin scroll)
  const columns = [
    {
      key: 'numero_ticket',
      label: 'Radicado',
      width: 'w-[90px]',
      render: (row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 text-[8.5px] sm:text-[9px] tracking-tight whitespace-nowrap inline-block">
          {row.numero_ticket}
        </span>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      width: 'w-[75px]',
      render: (row) => {
        const tb = TIPO_BADGES[row.tipo] || TIPO_BADGES.PETICION;
        return (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${tb.bg} ${tb.text} ${tb.border} whitespace-nowrap inline-block`}>
            {row.tipo}
          </span>
        );
      }
    },
    {
      key: 'asunto',
      label: 'Asunto & Dependencia',
      width: 'w-auto',
      render: (row) => (
        <div className="min-w-0 pr-1">
          <p className="font-bold text-slate-800 text-[11px] truncate leading-snug" title={row.asunto}>
            {row.asunto}
          </p>
          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <span className="material-symbols-outlined text-[12px] text-slate-400 shrink-0">domain</span>
            <span className="truncate">{row.dependencia_destino}</span>
          </p>
        </div>
      )
    },
    {
      key: 'fecha_registro',
      label: 'Radicado el',
      width: 'w-[85px]',
      render: (row) => <span className="font-mono text-slate-600 text-[10px] whitespace-nowrap">{formatDate(row.fecha_registro)}</span>
    },
    {
      key: 'fecha_limite_respuesta',
      label: 'Límite SLA',
      width: 'w-[85px]',
      render: (row) => (
        <span className="font-mono text-slate-700 font-semibold text-[10px] whitespace-nowrap">
          {formatDate(row.fecha_limite_respuesta)}
        </span>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      width: 'w-[95px]',
      render: (row) => {
        const cfg = ESTADO_CONFIG[row.estado] || ESTADO_CONFIG.RECIBIDA;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            <span>{cfg.label}</span>
          </span>
        );
      }
    },
    {
      key: 'acciones',
      label: 'Acción',
      align: 'right',
      width: 'w-[75px]',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md border border-slate-200 text-[9px] font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-[11px]">visibility</span>
          <span>Ver Ficha</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0" data-purpose="listado-pqrs-view">

      {/* ── Toast Flotante (estilo consistente con Solicitudes) ──────── */}
      {toast.visible && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-xs max-w-sm animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <div className="flex-1">
            <h4 className="font-bold font-space text-sm">{toast.message}</h4>
          </div>
        </div>
      )}


      {/* ── 2. BANNER INSTITUCIONAL (IDÉNTICO AL DE EVENTOS Y SOLICITUDES) */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-200 border border-white/20">
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span className="font-space uppercase tracking-wider text-[11px]">CORPORACIÓN UNIVERSITARIA ANTONIO JOSÉ DE SUCRE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
            Peticiones, Quejas, Reclamos y Sugerencias
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed max-w-2xl font-normal">
            Canal institucional oficial para la radicación, seguimiento y respuesta de derechos de petición, quejas, reclamos y sugerencias. Cumplimiento de plazos legales SLA con trazabilidad completa.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-white text-[#0a47b8] hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer font-space transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[18px] font-bold text-blue-600">add</span>
              <span>Radicar Nueva PQRS</span>
            </button>
            <button
              onClick={() => setSelectedEstado('RESPONDIDA')}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer font-space"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-200">mark_email_read</span>
              <span>Ver Respondidas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. KPIs (ESTILO HOMOGÉNEO A EVENTOS Y SOLICITUDES) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Radicados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Total Radicados</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-space mt-1 group-hover:text-[#0a47b8] transition-colors">
              {loading ? '—' : metrics.total}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">assignment</span>
              {metrics.total} tickets registrados
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0a47b8] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0a47b8] group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">support_agent</span>
          </div>
        </div>

        {/* KPI 2: En Trámite */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">En Trámite</p>
            <h3 className="text-3xl font-extrabold text-amber-600 font-space mt-1">
              {loading ? '—' : metrics.tramitadas}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">pending_actions</span>
              {metrics.tramitadas} en atención
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

        {/* KPI 3: Respondidas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Respondidas</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 font-space mt-1 flex items-center gap-2">
              <span>{loading ? '—' : metrics.respondidas}</span>
              {metrics.respondidas > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">task_alt</span>
              {metrics.respondidas} con respuesta oficial
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
          </div>
        </div>

        {/* KPI 4: Cerradas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-space">Cerradas</p>
            <h3 className="text-3xl font-extrabold text-slate-700 font-space mt-1">
              {loading ? '—' : metrics.cerradas}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              {metrics.cerradas} archivadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-slate-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
        </div>
      </div>

      {/* ── 4. Barra de Búsqueda y Filtros ───────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por radicado, asunto o dependencia..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
          />
        </div>

        {/* Filtros Select */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="PETICION">Petición</option>
            <option value="QUEJA">Queja</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SUGERENCIA">Sugerencia</option>
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="RECIBIDA">Recibida</option>
            <option value="EN_TRAMITE">En Trámite</option>
            <option value="RESPONDIDA">Respondida (Con respuesta)</option>
            <option value="CERRADA">Cerrada</option>
          </select>
        </div>
      </div>

      {/* ── 5. Tabla de Registros ──────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filteredPqrs}
        loading={loading}
        emptyMessage="No tienes tickets de PQRS registrados con los filtros aplicados."
        emptyIcon="support_agent"
      />

      {/* ── 6. Modales ─────────────────────────────────────────────────── */}
      <CrearPqrsModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePqrs}
        isSubmitting={actionLoading}
      />

      <PqrsDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        pqrs={selectedPqrs}
        respuestas={respuestasPqrs}
        userRole={userRole}
        onResponder={handleResponderPqrs}
        onReplicar={handleReplicarPqrs}
        onCambiarEstado={handleCambiarEstado}
        isSubmitting={actionLoading}
      />

    </div>
  );
};

export default ListadoPqrs;
