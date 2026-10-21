import React, { useState, useEffect } from 'react';
import useProfile from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const PerfilEstudiante = ({ onNavigateTab = () => {} }) => {
  const { user, token, rol } = useAuth();
  const { profile, loading, refetch } = useProfile();

  // Estados locales para edición de datos de contacto
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    celular: '',
    telefono: '',
    email_personal: '',
    estado_civil: ''
  });
  const [savingContact, setSavingContact] = useState(false);

  // Estados para cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notificaciones Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Inicializar formulario de contacto cuando profile cargue
  useEffect(() => {
    if (profile) {
      setContactForm({
        celular: profile.celular || '',
        telefono: profile.telefono || '',
        email_personal: profile.email_personal || '',
        estado_civil: profile.estado_civil || 'Soltero(a)'
      });
    }
  }, [profile]);

  // Manejador para guardar datos de contacto
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'No se pudieron actualizar los datos de contacto');
      }

      showToast('Datos de contacto actualizados correctamente', 'success');
      setIsEditingContact(false);
      if (refetch) refetch();
    } catch (err) {
      console.error('Error al actualizar contacto:', err);
      showToast(err.message || 'Error de conexión al actualizar contacto', 'error');
    } finally {
      setSavingContact(false);
    }
  };

  // Manejador para cambio de contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('Por favor completa todos los campos de contraseña', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    if (passwords.newPassword.length < 8) {
      showToast('La nueva contraseña debe tener mínimo 8 caracteres', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al cambiar la contraseña');
      }

      showToast('Contraseña institucional actualizada exitosamente', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      console.error('Error al cambiar clave:', err);
      showToast(err.message || 'Error al procesar el cambio de contraseña', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Generador de iniciales
  const getInitials = (nombre, primerNombre, primerApellido) => {
    if (primerNombre && primerApellido) {
      return `${primerNombre[0]}${primerApellido[0]}`.toUpperCase();
    }
    if (nombre) {
      const parts = nombre.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return nombre.slice(0, 2).toUpperCase();
    }
    return 'UA';
  };

  // Datos consolidados con fallback seguro
  const displayName = profile?.nombre || user?.nombre || 'Juan David Rivas Payares';
  const displayRole = (rol || profile?.rol_nombre || user?.rol_nombre || 'Estudiante').toUpperCase();
  const displayCodigo = profile?.codigo_estudiantil || user?.codigo_estudiantil || 'EST-202401';
  const displayEmail = profile?.email || user?.email || 'estudiante@uajs.edu.co';
  const displayFacultad = profile?.facultad || profile?.facultad_departamento || 'Facultad de Ingenierías';
  const displayPrograma = profile?.programa_academico || 'Ingeniería de Sistemas';
  const displaySemestre = profile?.semestre_actual || 6;
  const displayEstado = (profile?.estado || 'activo').toUpperCase();

  // Datos de identificación
  const displayTipoDoc = profile?.tipo_documento || 'Tarjeta de Identidad';
  const displayNumDoc = profile?.numero_documento || '1052952641';
  const displayFechaExp = profile?.fecha_expedicion_documento || '2019-09-10';
  const displayFechaNac = profile?.fecha_nacimiento || '2005-05-27';
  const displayEdad = profile?.edad ?? 21;
  const displayGenero = profile?.genero || 'Masculino';
  const displayEstadoCivil = profile?.estado_civil || 'Soltero(a)';

  // Contacto
  const displayEmailPersonal = profile?.email_personal || 'juandavid.rivas@gmail.com';
  const displayCelular = profile?.celular || '3114270335';
  const displayTelefono = profile?.telefono || '3114270335';
  const displayVinculacion = profile?.tipo_vinculacion || 'Estudiante Regular de Pregrado';

  if (loading && !profile) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 bg-slate-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" data-purpose="perfil-estudiante-view">
      
      {/* ── Toast de Retroalimentación ─────────────────────────────────── */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-space animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── Breadcrumb & Barra Superior ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-slate-500 font-space">
          <button
            onClick={() => onNavigateTab('inicio')}
            className="hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Inicio</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Comunidad</span>
          <span className="text-slate-300">/</span>
          <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            Ficha Institucional
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch && refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs cursor-pointer font-space"
            title="Sincronizar perfil con PostgreSQL"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">sync</span>
            <span>Actualizar Ficha</span>
          </button>
        </div>
      </div>

      {/* ── A. Encabezado / Carnet Digital Institucional ────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#081f56] via-[#0b2f7d] to-[#0a47b8] text-white p-6 sm:p-8 shadow-md border border-blue-900/40">
        {/* Decoraciones de fondo */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-4 text-white/5 font-black text-7xl select-none hidden lg:block tracking-tighter font-space">
          UAJS
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circular con Iniciales */}
            <div className="relative shrink-0">
              <div className="h-22 w-22 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/40 shadow-inner flex items-center justify-center text-3xl font-black text-white font-space tracking-wider">
                {getInitials(displayName, profile?.primer_nombre, profile?.primer_apellido)}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-[#081f56]"
                title="Estado Activo"
              >
                <span className="material-symbols-outlined text-[14px] block">verified</span>
              </div>
            </div>

            {/* Datos Principales */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 text-blue-100 font-space tracking-wide">
                <span>CORPORACIÓN UNIVERSITARIA ANTONIO JOSÉ DE SUCRE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
                {displayName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-space">
                <span className="bg-white/20 border border-white/30 text-white px-2.5 py-0.5 rounded-md font-bold tracking-wide">
                  {displayRole}
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {displayEstado} (Periodo 2026-1)
                </span>
                <span className="font-mono text-blue-200 bg-black/25 px-2 py-0.5 rounded-md text-[11px] border border-white/15">
                  Cód: {displayCodigo}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-xs text-blue-100/90 font-space">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] opacity-80">account_balance</span>
                  <span>{displayFacultad}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[15px] opacity-80">mail</span>
                  <span>{displayEmail}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Badge Pase Digital */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-white/15 sm:border-t-0 pt-3 sm:pt-0 font-space text-right">
            <span className="text-[11px] uppercase font-bold text-blue-200 tracking-wider">Credencial Smart Campus</span>
            <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-xl border border-white/20 mt-1 inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">qr_code_2</span>
              Pase Digital Válido
            </span>
          </div>
        </div>
      </section>

      {/* ── Grid Principal de 2 Columnas ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ── B. Módulo 1: Información Académica (Ficha Institucional) ──── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0a47b8] border border-blue-200/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-space">Información Académica</h2>
                <p className="text-[11px] text-slate-500">Ficha curricular registrada en Registro y Control</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold font-space border border-blue-200">
              OFICIAL
            </span>
          </div>

          <div className="space-y-3.5 text-xs font-space">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Facultad
              </span>
              <span className="text-slate-800 font-bold text-xs sm:text-sm">
                {displayFacultad}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Programa Académico
              </span>
              <span className="text-slate-800 font-bold text-xs sm:text-sm">
                {displayPrograma}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nivel / Semestre
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-slate-900 font-extrabold text-sm">{displaySemestre}° Semestre</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                    Avanzado
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Código de Matrícula
                </span>
                <span className="text-blue-700 font-bold font-mono text-sm block mt-0.5">
                  {displayCodigo}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tipo de Vinculación
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-[#0a47b8]">badge</span>
                <span className="text-slate-800 font-semibold">{displayVinculacion}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── C. Módulo 2: Identificación y Datos Demográficos ─────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-space">Identificación y Demografía</h2>
                <p className="text-[11px] text-slate-500">Datos verificados en el documento de identidad</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold font-space border border-emerald-200">
              VERIFICADO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-space">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tipo de Documento
              </span>
              <span className="text-slate-800 font-bold">{displayTipoDoc}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Número de Documento
              </span>
              <span className="text-slate-900 font-bold font-mono text-sm">{displayNumDoc}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Fecha de Expedición
              </span>
              <span className="text-slate-800 font-medium font-mono">{displayFechaExp}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Fecha de Nacimiento
              </span>
              <span className="text-slate-800 font-medium font-mono">{displayFechaNac}</span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Edad Calculada (PostgreSQL)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 bg-blue-100/80 text-blue-800 rounded-md font-bold font-mono text-xs">
                  {displayEdad} años
                </span>
                <span className="text-[10px] text-slate-500">Cálculo dinámico</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Género & Estado Civil
              </span>
              <span className="text-slate-800 font-bold">{displayGenero} • {displayEstadoCivil}</span>
            </div>
          </div>
        </section>

        {/* ── D. Módulo 3: Información de Contacto y Residencia ─────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">contact_phone</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-space">Contacto y Comunicación</h2>
                <p className="text-[11px] text-slate-500">Canales personales para avisos y notificaciones</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold font-space transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isEditingContact ? 'close' : 'edit'}
              </span>
              <span>{isEditingContact ? 'Cancelar' : 'Editar Contacto'}</span>
            </button>
          </div>

          {!isEditingContact ? (
            <div className="space-y-3.5 text-xs font-space">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Correo Personal
                  </span>
                  <span className="text-slate-800 font-semibold font-mono break-all">{displayEmailPersonal}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Número Celular
                  </span>
                  <span className="text-slate-900 font-bold font-mono text-sm">{displayCelular}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">smartphone</span>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Teléfono Fijo / Contacto
                  </span>
                  <span className="text-slate-800 font-medium font-mono">{displayTelefono}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">check_circle</span>
                <span>Los avisos urgentes se enviarán a tu celular vía SMS y a tu correo personal.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveContact} className="space-y-4 text-xs font-space">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Correo Electrónico Personal</label>
                <input
                  type="email"
                  value={contactForm.email_personal}
                  onChange={(e) => setContactForm({ ...contactForm, email_personal: e.target.value })}
                  placeholder="ejemplo@correo.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Número de Celular</label>
                  <input
                    type="tel"
                    value={contactForm.celular}
                    onChange={(e) => setContactForm({ ...contactForm, celular: e.target.value })}
                    placeholder="3114270335"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono Fijo / Respaldo</label>
                  <input
                    type="tel"
                    value={contactForm.telefono}
                    onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                    placeholder="3114270335"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-4 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {savingContact ? 'hourglass_top' : 'save'}
                  </span>
                  <span>{savingContact ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ── E. Módulo 4: Seguridad y Cuenta ───────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-space">Seguridad de la Cuenta</h2>
                <p className="text-[11px] text-slate-500">Credenciales del portal institucional y contraseña</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold font-space transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {showPasswordSection ? 'expand_less' : 'key'}
              </span>
              <span>{showPasswordSection ? 'Ocultar' : 'Cambiar Clave'}</span>
            </button>
          </div>

          {!showPasswordSection ? (
            <div className="space-y-3 text-xs font-space">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Contraseña Institucional
                  </span>
                  <span className="text-slate-800 font-mono tracking-widest text-sm">••••••••••••</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Protegida con bcrypt
                </span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-600 text-[11px] leading-relaxed">
                <p className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0 mt-0.5">shield</span>
                  <span>
                    Tu contraseña te da acceso a las aulas virtuales, Wi-Fi institucional Eduroam y portal de solicitudes. Se recomienda actualizarla periódicamente.
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs font-space">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Ingresa tu clave actual"
                    required
                    className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showCurrentPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showNewPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {passwordLoading ? 'hourglass_top' : 'check'}
                  </span>
                  <span>{passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

      </div>
    </div>
  );
};

export default PerfilEstudiante;
