import React, { useState, useEffect } from 'react';

const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const TIPOS_PQRS = [
  {
    tipo: 'PETICION',
    label: 'Petición',
    sla: '15 días hábiles',
    desc: 'Solicitud formal para requerir información, copias o acción institucional.',
    icon: 'mail',
    color: 'border-blue-300 bg-blue-50/60 text-blue-800'
  },
  {
    tipo: 'QUEJA',
    label: 'Queja',
    sla: '10 días hábiles',
    desc: 'Inconformidad con la conducta de funcionarios o prestación de un servicio.',
    icon: 'report_problem',
    color: 'border-amber-300 bg-amber-50/60 text-amber-800'
  },
  {
    tipo: 'RECLAMO',
    label: 'Reclamo',
    sla: '10 días hábiles',
    desc: 'Exigencia por incumplimiento, cobro indebido o falla académica/técnica.',
    icon: 'assignment_late',
    color: 'border-rose-300 bg-rose-50/60 text-rose-800'
  },
  {
    tipo: 'SUGERENCIA',
    label: 'Sugerencia',
    sla: '30 días hábiles',
    desc: 'Idea, propuesta o recomendación para mejorar procesos o infraestructura.',
    icon: 'lightbulb',
    color: 'border-emerald-300 bg-emerald-50/60 text-emerald-800'
  }
];

// Fallback estático en caso de que ms-servicios no responda
const DEPENDENCIAS_FALLBACK = [
  'Registro y Control Académico',
  'Secretaría General',
  'Carnetización y Seguridad',
  'Servicios Generales y Logística',
  'Bienestar Universitario',
  'Infraestructura y TI',
  'Servicios Financieros y Cartera',
  'Decanatura de Ingeniería y Tecnologías',
  'Biblioteca General y Recursos de Aprendizaje',
  'Dirección de Admisiones'
];

export const CrearPqrsModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    tipo: 'PETICION',
    dependencia_destino: 'Registro y Control Académico',
    asunto: '',
    descripcion: '',
    anonimo: false
  });

  const [errors, setErrors] = useState({});
  const [dependencias, setDependencias] = useState(DEPENDENCIAS_FALLBACK);
  const [loadingDeps, setLoadingDeps] = useState(false);

  // Bloquear scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Cierre con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ─── Cargar dependencias dinámicas desde ms-servicios ─────────────
  useEffect(() => {
    if (!isOpen) return;

    const fetchDependencias = async () => {
      setLoadingDeps(true);
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
            // Extraer encargado_departamento únicos y ordenarlos
            const deps = [...new Set(
              items
                .map((s) => s.encargado_departamento)
                .filter(Boolean)
            )].sort();
            setDependencias(deps);
            // Asignar la primera dependencia por defecto si el form aún tiene la inicial
            setForm((prev) => ({
              ...prev,
              dependencia_destino: deps[0] || prev.dependencia_destino,
            }));
          }
        }
      } catch (err) {
        console.warn('Usando dependencias locales como fallback:', err.message);
      } finally {
        setLoadingDeps(false);
      }
    };

    fetchDependencias();
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.asunto.trim()) errs.asunto = 'El asunto es obligatorio.';
    else if (form.asunto.length < 5) errs.asunto = 'El asunto debe tener al menos 5 caracteres.';

    if (!form.descripcion.trim()) errs.descripcion = 'La descripción es obligatoria.';
    else if (form.descripcion.length < 15) errs.descripcion = 'Describe los hechos con más detalle (mínimo 15 caracteres).';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const selectedTipoObj = TIPOS_PQRS.find(t => t.tipo === form.tipo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Institucional */}
        <div className="bg-gradient-to-r from-[#081f56] via-[#0b2f7d] to-[#0a47b8] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold font-space">Radicar Nueva PQRS</h2>
              <p className="text-[11px] text-blue-100 font-space">Sistema Oficial de Atención al Usuario UNiAJS</p>
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

        {/* Cuerpo del Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs font-space">
          
          {/* Selector de Tipo */}
          <div>
            <label className="block text-slate-700 font-bold mb-2">
              Tipo de Manifestación <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TIPOS_PQRS.map((t) => {
                const isSelected = form.tipo === t.tipo;
                return (
                  <button
                    key={t.tipo}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: t.tipo })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${t.color} border-2 shadow-xs scale-[1.02]`
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="block font-bold text-xs">{t.label}</span>
                      <span className="text-[9px] text-slate-500 font-mono">SLA: {t.sla}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedTipoObj && (
              <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-blue-600 mt-0.5">info</span>
                <span>{selectedTipoObj.desc} <strong>Plazo legal de resolución: {selectedTipoObj.sla}.</strong></span>
              </p>
            )}
          </div>

          {/* Dependencia Destino */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">
                Dependencia / Área Responsable <span className="text-rose-500">*</span>
              </label>
              {loadingDeps ? (
                <span className="text-[11px] text-[#0a47b8] flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Consultando ms-servicios...
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {dependencias.length} áreas disponibles en BD
                </span>
              )}
            </div>
            <select
              value={form.dependencia_destino}
              onChange={(e) => setForm({ ...form, dependencia_destino: e.target.value })}
              disabled={loadingDeps}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {dependencias.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Asunto / Título de la PQRS <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.asunto}
              onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              placeholder="Ej: Inconveniente con validación de pago de matrícula"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors ${
                errors.asunto ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.asunto && <p className="text-[11px] text-rose-600 mt-1">{errors.asunto}</p>}
          </div>

          {/* Descripción de los hechos */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Exposición Detallada de los Hechos <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe claramente la situación, indicando fechas, personas involucradas y la solicitud concreta..."
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors ${
                errors.descripcion ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.descripcion && <p className="text-[11px] text-rose-600 mt-1">{errors.descripcion}</p>}
          </div>

          {/* Opción Anónima */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/90 rounded-xl flex items-center justify-between">
            <div className="flex items-start gap-2.5 pr-4">
              <span className="material-symbols-outlined text-amber-700 text-[20px] mt-0.5">visibility_off</span>
              <div>
                <span className="block font-bold text-amber-900">Radicación Anónima</span>
                <span className="text-[11px] text-amber-800 leading-tight">
                  Tus datos personales no serán visibles para el funcionario que atienda el trámite.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="anonimo-check"
              checked={form.anonimo}
              onChange={(e) => setForm({ ...form, anonimo: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? 'hourglass_top' : 'send'}
              </span>
              <span>{isSubmitting ? 'Radicando...' : 'Radicar PQRS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPqrsModal;
