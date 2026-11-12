import React, { useState, useEffect } from 'react';
import useProfile from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const PerfilAdmin = () => {
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
    if (profile) {
      setContactForm({
        celular: profile.celular || '3100000000',
        telefono: profile.telefono || '6052814502',
        email_personal: profile.email_personal || 'admin.smartcampus@uajs.edu.co',
        estado_civil: profile.estado_civil || 'Casado(a)',
      });
    }
  }, [profile]);

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

      showToast('Datos de contacto administrativo actualizados correctamente', 'success');
      setIsEditingContact(false);
      if (refetch) refetch();
    } catch (err) {
      console.error('Error al actualizar contacto:', err);
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

      showToast('Contraseña de administrador actualizada con éxito', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      showToast(err.message || 'Error al procesar la solicitud de cambio de clave', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const adminName = user?.email?.includes('admin')
    ? (profile?.nombre || user?.nombre || 'Administrador General del Sistema')
    : 'Administrador General del Sistema';
  const adminCargo = profile?.cargo || 'Director de Tecnologías e Infraestructura';
  const adminDependencia = profile?.facultad_departamento || profile?.facultad || 'Dirección de Tecnologías de la Información';
  const adminCodigo = profile?.codigo_estudiantil || 'ADM-001';
  const adminEmail = user?.email || profile?.email || 'admin@uajs.edu.co';
  const adminDoc = profile?.numero_documento || '10000001';
  const adminTipoDoc = profile?.tipo_documento || 'Cédula de Ciudadanía';
  const adminVinculacion = profile?.tipo_vinculacion || 'Tiempo Completo';

  const getInitials = (name) => {
    if (!name) return 'AG';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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

      {/* Header Banner del Perfil de Administrador */}
      <div className="bg-gradient-to-r from-[#081f56] via-[#0a47b8] to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center font-extrabold text-3xl font-space shadow-inner shrink-0">
            {getInitials(adminName)}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white font-mono tracking-wider">
                ROL: ADMINISTRADOR DEL SISTEMA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cuenta Activa • Control Total
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-space">{adminName}</h1>

            <p className="text-sm text-blue-100/90 font-medium">{adminCargo}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-blue-200 pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">business</span>
                {adminDependencia}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">badge</span>
                Cód: {adminCodigo}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">mail</span>
                {adminEmail}
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
                <span className="material-symbols-outlined text-[#0a47b8] text-xl">account_circle</span>
                <h3 className="text-base font-bold text-slate-900 font-space">
                  Información Institucional del Funcionario
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Ficha Oficial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Nombre Completo</span>
                <span className="text-slate-800 font-bold text-sm">{adminName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Cargo Institucional</span>
                <span className="text-slate-800 font-bold text-sm">{adminCargo}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Dependencia / Unidad</span>
                <span className="text-slate-800 font-semibold">{adminDependencia}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Tipo de Vinculación</span>
                <span className="text-slate-800 font-semibold">{adminVinculacion}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Documento de Identidad</span>
                <span className="text-slate-800 font-mono font-bold">
                  {adminTipoDoc} - {adminDoc}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Correo Electrónico Oficial</span>
                <span className="text-[#0a47b8] font-mono font-semibold">{adminEmail}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta: Privilegios y Matriz de Gobernanza */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-indigo-600 text-xl">security</span>
              <h3 className="text-base font-bold text-slate-900 font-space">
                Privilegios y Capacidades de Gobernanza
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { icon: 'manage_accounts', title: 'Gestión Integral de Usuarios', desc: 'Crear, consultar, actualizar roles y desactivar perfiles.' },
                { icon: 'fact_check', title: 'Gestión de Trámites y Solicitudes', desc: 'Validar y aplicar cambios de estado según el flujo oficial.' },
                { icon: 'support_agent', title: 'Atención y Respuesta de PQRS', desc: 'Emisión de respuestas oficiales y cierre de radicados.' },
                { icon: 'meeting_room', title: 'Administración de Recursos Físicos', desc: 'Creación, edición y órdenes de mantenimiento de espacios.' },
                { icon: 'verified', title: 'Auditoría y Control de Reservas', desc: 'Aprobación institucional y control de disponibilidad de horarios.' },
                { icon: 'campaign', title: 'Difusión de Alertas Masivas', desc: 'Emisión de comunicados en tiempo real a la comunidad.' },
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
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
                className="text-xs font-semibold text-[#0a47b8] hover:underline cursor-pointer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                    placeholder="Ej. 3100000000"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Teléfono Fijo / Extensión</label>
                  <input
                    type="text"
                    value={contactForm.telefono}
                    onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                    placeholder="Ej. 6052814502"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico Personal</label>
                  <input
                    type="email"
                    value={contactForm.email_personal}
                    onChange={(e) => setContactForm({ ...contactForm, email_personal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
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
                    className="px-4 py-1.5 rounded-lg bg-[#0a47b8] text-white hover:bg-[#081f56] font-semibold flex items-center gap-1"
                  >
                    {savingContact && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Celular:</span>
                  <span className="font-bold text-slate-800 font-mono">{contactForm.celular || '3100000000'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="font-bold text-slate-800 font-mono">{contactForm.telefono || '6052814502'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Email Personal:</span>
                  <span className="font-medium text-slate-800 break-all text-[11px]">{contactForm.email_personal || 'admin.smartcampus@uajs.edu.co'}</span>
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
                className="text-xs font-semibold text-[#0a47b8] hover:underline cursor-pointer"
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
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nueva Contraseña</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Confirmar Nueva Contraseña</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a47b8]/20"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white font-bold text-xs font-space transition"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs text-slate-500">
                <p>Las contraseñas de cuentas administrativas se almacenan encriptadas con algoritmo seguro bcrypt.</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>Última actualización:</span>
                  <span className="font-mono font-semibold text-slate-700">Periodo 2026-1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;

