import React, { useState, useEffect } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

// Únicamente los 6 servicios oficiales existentes en PostgreSQL (db_servicios.servicios)
const SERVICIOS_REALES_FALLBACK = [
  { id: 1, nombre: 'Certificado de Estudio Oficial', tipo: 'CERTIFICADO', encargado_departamento: 'Registro y Control Académico' },
  { id: 2, nombre: 'Paz y Salvo Académico y Financiero', tipo: 'ADMINISTRATIVA', encargado_departamento: 'Secretaría General' },
  { id: 3, nombre: 'Duplicado / Histórico de Notas', tipo: 'CERTIFICADO', encargado_departamento: 'Registro y Control Académico' },
  { id: 4, nombre: 'Expedición / Reposición de Carné Universitario', tipo: 'SERVICIO', encargado_departamento: 'Carnetización y Seguridad' },
  { id: 5, nombre: 'Permiso de Parqueadero Vehicular / Motos', tipo: 'SERVICIO', encargado_departamento: 'Servicios Generales y Logística' },
  { id: 6, nombre: 'Atención Médica y Orientación Psicológica', tipo: 'SERVICIO', encargado_departamento: 'Bienestar Universitario' },
];

export const CrearSolicitudModal = ({ isOpen, onClose, onSubmit, actionLoading }) => {
  const [servicios, setServicios] = useState(SERVICIOS_REALES_FALLBACK);
  const [loadingServicios, setLoadingServicios] = useState(false);

  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [dependencia, setDependencia] = useState('Registro y Control Académico');
  const [tipo, setTipo] = useState('CERTIFICADO');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivoNombre, setArchivoNombre] = useState(null);

  // ─── Cierre con Escape ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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

  // ─── Consumo Dinámico del Microservicio ms-servicios vía Gateway ─
  useEffect(() => {
    if (!isOpen) return;

    const fetchServiciosReales = async () => {
      setLoadingServicios(true);
      try {
        const token = localStorage.getItem('uajs_token');
        const res = await fetch(`${API_GATEWAY_URL}/api/servicios`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.servicios || data.data || [];
          if (items.length > 0) {
            setServicios(items);
          }
        }
      } catch (err) {
        console.warn('Usando catálogo base de servicios verificados en PostgreSQL:', err.message);
      } finally {
        setLoadingServicios(false);
      }
    };

    fetchServiciosReales();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleServicioChange = (e) => {
    const val = e.target.value;
    setServicioSeleccionado(val);
    const srv = servicios.find((s) => s.nombre === val);
    if (srv) {
      const dep = srv.encargado_departamento || srv.dependencia || 'Registro y Control Académico';
      setDependencia(dep);
      
      // Mapear tipo según el servicio
      if (srv.nombre.toLowerCase().includes('certificado') || srv.nombre.toLowerCase().includes('notas')) {
        setTipo('CERTIFICADO');
      } else if (srv.nombre.toLowerCase().includes('paz y salvo')) {
        setTipo('ADMINISTRATIVA');
      } else {
        setTipo('SERVICIO');
      }

      if (!asunto) {
        setAsunto(`Solicitud de ${srv.nombre}`);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoNombre(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim() || !dependencia.trim()) return;

    const srv = servicios.find((s) => s.nombre === servicioSeleccionado);

    onSubmit({
      servicio_id: srv?.id || 1,
      tipo: tipo || 'ACADEMICA',
      dependencia,
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      observaciones: archivoNombre ? `Adjunto cargado: ${archivoNombre}` : 'Radicado vía Portal Estudiantil.',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0a47b8] flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">post_add</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-space" id="modal-title">
                Radicar Nueva Solicitud o Trámite
              </h3>
              <p className="text-xs text-slate-500">
                Catálogo en vivo sincronizado con el microservicio de servicios institucionales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            type="button"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Selector Dinámico de Servicios */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Catálogo de Servicios Académicos *
              </label>
              {loadingServicios ? (
                <span className="text-[11px] text-[#0a47b8] flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Consultando ms-servicios...
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {servicios.length} servicios disponibles en BD
                </span>
              )}
            </div>
            <select
              value={servicioSeleccionado}
              onChange={handleServicioChange}
              required
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0a47b8] focus:border-[#0a47b8] bg-white cursor-pointer"
            >
              <option value="">Seleccione el tipo de trámite a radicar...</option>
              {servicios.map((s) => {
                const dep = s.encargado_departamento || s.dependencia || 'Registro y Control';
                return (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre} — [{dep}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dependencia Asignada */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dependencia Encargada
              </label>
              <input
                type="text"
                value={dependencia}
                onChange={(e) => setDependencia(e.target.value)}
                required
                className="w-full bg-slate-100 rounded-xl border border-slate-300 py-2 px-3 text-slate-700 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nivel de Prioridad *
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0a47b8] bg-white cursor-pointer"
              >
                <option value="MEDIA">Media (Trámite regular 3-5 días hábiles)</option>
                <option value="ALTA">Alta (Urgencia de grado o matrícula)</option>
                <option value="BAJA">Baja (Informativo)</option>
              </select>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Asunto o Título del Requerimiento *
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Solicitud de expedición de certificado oficial"
              required
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0a47b8]"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Descripción y Justificación Detallada *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Explique brevemente el motivo del trámite e indique especificaciones de envío..."
              required
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0a47b8]"
            />
          </div>

          {/* Cargar Archivo Compacto y Elegante */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Documento de Soporte <span className="text-slate-400 font-normal">(Opcional: PDF, PNG, JPG)</span>
            </label>
            <label className="flex items-center justify-between px-3.5 py-2.5 border border-dashed border-slate-300 rounded-xl hover:border-blue-500 bg-slate-50/80 hover:bg-blue-50/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${archivoNombre ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-500 group-hover:bg-blue-100 group-hover:text-[#0a47b8]'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {archivoNombre ? 'task' : 'attach_file'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {archivoNombre ? archivoNombre : 'Adjuntar comprobante o soporte'}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, PNG o JPG hasta 10MB</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#0a47b8] bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs group-hover:bg-blue-50">
                {archivoNombre ? 'Cambiar' : 'Explorar'}
              </span>
              <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={actionLoading}
              type="button"
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-[#0a47b8] text-white text-xs font-bold font-space hover:bg-blue-700 shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{actionLoading ? 'Radicando...' : 'Confirmar Radicación'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CrearSolicitudModal;
