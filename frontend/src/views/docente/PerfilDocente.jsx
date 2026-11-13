import React, { useState, useEffect } from 'react';
import useProfile from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const PerfilDocente = () => {
  const { user, token } = useAuth();
  const { profile, loading, refetch } = useProfile();

  // Estados locales para edición de datos de contacto
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    celular: '',
    telefono: '',
    email_personal: '',
    estado_civil: '',
  });
  const [savingContact, setSavingContact] = useState(false);

  // Estados para cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  useEffect(() => {
    const dataSource = profile || user;
    if (dataSource) {
      setContactForm({
        celular: dataSource.celular || '3124567890',
        telefono: dataSource.telefono || '6052814510',
        email_personal: dataSource.email_personal || 'ana.gomez@gmail.com',
        estado_civil: dataSource.estado_civil || 'Casado(a)',
      });
    }
  }, [profile, user]);

  // Guardar datos de contacto
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'No se pudieron actualizar los datos de contacto');
      }

      showToast('Datos de contacto docente actualizados correctamente', 'success');
      setIsEditingContact(false);
      if (refetch) refetch();
    } catch (err) {
      console.error('Error al actualizar contacto docente:', err);
      showToast(err.message || 'Error de conexión al actualizar contacto', 'error');
    } finally {
      setSavingContact(false);
    }
  };

  // Cambio de contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('La confirmación no coincide con la nueva contraseña', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al cambiar la contraseña');
      }

      showToast('Contraseña de docente actualizada con éxito', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      showToast(err.message || 'Error al procesar la solicitud de cambio de clave', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const docenteName = profile?.nombre || user?.nombre || 'Ana María Gómez Herrera';
  const docenteCargo = profile?.cargo || user?.cargo || 'Docente Investigador';
  const docenteFacultad = profile?.facultad_departamento || profile?.facultad || user?.facultad_departamento || user?.facultad || 'Facultad de Ingenierías';
  const docenteCodigo = profile?.codigo_estudiantil || user?.codigo_estudiantil || 'DOC-102';
  const docenteEmail = profile?.email || user?.email || 'docente@uajs.edu.co';
  const docenteDoc = profile?.numero_documento || user?.numero_documento || '45678912';
  const docenteTipoDoc = profile?.tipo_documento || user?.tipo_documento || 'Cédula de Ciudadanía';
  const docenteVinculacion = profile?.tipo_vinculacion || user?.tipo_vinculacion || 'Tiempo Completo';

  const getInitials = (name) => {
    if (!name) return 'AG';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-slate-800">
      {/* Toast Feedback */}
      {toast.visible && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner del Perfil Docente */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center font-extrabold text-3xl font-space shadow-inner shrink-0">
            {getInitials(docenteName)}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white font-mono tracking-wider">
                ROL: DOCENTE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cuenta Activa • Portal Académico
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-space">{docenteName}</h1>

            <p className="text-sm text-blue-100/90 font-medium">{docenteCargo}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-blue-200 pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">school</span>
                {docenteFacultad}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">badge</span>
                Cód: {docenteCodigo}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {docenteEmail}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información Institucional y Atributos de Rol */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta: Datos Institucionales Oficiales */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-600 text-xl">account_circle</span>
                <h3 className="text-base font-bold text-slate-900 font-space">
                  Información Institucional Docente
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Ficha Académica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Nombre Completo</span>
                <span className="text-slate-800 font-bold text-sm">{docenteName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Cargo Académico</span>
                <span className="text-slate-800 font-bold text-sm">{docenteCargo}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Facultad / Departamento</span>
                <span className="text-slate-800 font-semibold">{docenteFacultad}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Tipo de Vinculación</span>
                <span className="text-slate-800 font-semibold">{docenteVinculacion}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Documento de Identidad</span>
                <span className="text-slate-800 font-mono font-bold">
                  {docenteTipoDoc} - {docenteDoc}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Correo Electrónico Institucional</span>
                <span className="text-[#0a47b8] font-mono font-semibold">{docenteEmail}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta: Privilegios y Matriz de Rol Docente */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-violet-600 text-xl">verified_user</span>
              <h3 className="text-base font-bold text-slate-900 font-space">
                Privilegios y Capacidades del Rol Docente
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  icon: 'event_available',
                  title: 'Publicación de Eventos Académicos',
                  desc: 'Creación y coordinación de talleres, seminarios y conferencias con aforo institucional.',
                },
                {
                  icon: 'calendar_month',
                  title: 'Reserva de Aulas y Laboratorios',
                  desc: 'Solicitud autónoma de espacios físicos y equipamiento especializado para docencia.',
                },
                {
                  icon: 'fact_check',
                  title: 'Solicitudes y Trámites Académicos',
                  desc: 'Radicación de certificaciones, comisiones académicas y seguimiento en tiempo real.',
                },
                {
                  icon: 'support_agent',
                  title: 'Atención y Formulación de PQRS',
                  desc: 'Canal oficial de peticiones, quejas y sugerencias institucionales con trazabilidad.',
                },
                {
                  icon: 'campaign',
                  title: 'Agenda Universitaria General',
                  desc: 'Acceso a la agenda completa de eventos y fechas clave del calendario institucional.',
                },
                {
                  icon: 'notifications',
                  title: 'Centro de Alertas y Novedades',
                  desc: 'Recepción de comunicaciones oficiales, cambios de estado y avisos importantes.',
                },
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">{p.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{p.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Datos de Contacto y Seguridad */}
        <div className="space-y-6">
          {/* Tarjeta: Datos de Contacto */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700 text-lg">call</span>
                <h3 className="text-sm font-bold text-slate-900 font-space">Contacto</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="text-xs font-semibold text-violet-600 hover:underline cursor-pointer"
              >
                {isEditingContact ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {isEditingContact ? (
              <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={contactForm.celular}
                    onChange={(e) => setContactForm({ ...contactForm, celular: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Ej. 3124567890"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Teléfono Fijo / Extensión</label>
                  <input
                    type="text"
                    value={contactForm.telefono}
                    onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Ej. 6052814510"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico Personal</label>
                  <input
                    type="email"
                    value={contactForm.email_personal}
                    onChange={(e) => setContactForm({ ...contactForm, email_personal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingContact}
                    className="px-4 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-semibold flex items-center gap-1"
                  >
                    {savingContact && (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    )}
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Celular:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {contactForm.celular || '3124567890'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {contactForm.telefono || '6052814510'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Email Personal:</span>
                  <span className="font-medium text-slate-800 break-all text-[11px]">
                    {contactForm.email_personal || 'ana.gomez@gmail.com'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta: Seguridad y Cambio de Clave */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700 text-lg">lock</span>
                <h3 className="text-sm font-bold text-slate-900 font-space">Seguridad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-xs font-semibold text-violet-600 hover:underline cursor-pointer"
              >
                {showPasswordSection ? 'Cerrar' : 'Cambiar Clave'}
              </button>
            </div>

            {showPasswordSection ? (
              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contraseña Actual</label>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nueva Contraseña</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs font-space transition"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs text-slate-500">
                <p>Las contraseñas institucionales se resguardan de forma segura utilizando cifrado bcrypt con salt dinámico.</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>Estado de cuenta:</span>
                  <span className="font-mono font-semibold text-emerald-600">Verificada</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilDocente;

