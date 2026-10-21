import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import useProfile from '../hooks/useProfile';
import useSolicitudes from '../hooks/useSolicitudes';
import useEventos from '../hooks/useEventos';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const MiPerfil = ({ onNavigateTab = () => {} }) => {
  const { user, token, rol } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { solicitudes } = useSolicitudes();
  const { eventos, misInscripciones } = useEventos();

  // Pestaña activa dentro del perfil
  const [activeTab, setActiveTab] = useState('tab-academic');

  // Estados para el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);

  // Estado para el código QR dinámico
  const [qrToken, setQrToken] = useState('TKN-884102');
  const [isQrRefreshing, setIsQrRefreshing] = useState(false);

  // Sistema de Notificaciones Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3800);
  };

  // Datos del estudiante (con fallbacks elegantes a la sesión)
  const currentRole = rol || profile?.rol_nombre || user?.rol_nombre || 'Estudiante';
  const displayName = profile?.nombre || user?.nombre || 'Juan David Rivas Montoya';
  const displayEmail = profile?.email || user?.email || 'j.rivas@uajs.edu.co';
  const displayCodigo = profile?.codigo_estudiantil || user?.codigo_estudiantil || 'EST-2026-8841';
  const displayFacultad = profile?.facultad_departamento || profile?.facultad || user?.facultad_departamento || 'Ingeniería de Sistemas';

  // Generador de iniciales (ej. Juan David Rivas -> JD)
  const getInitials = (name) => {
    if (!name) return 'UA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // KPI counts calculados dinámicamente
  const countSolicitudes = solicitudes?.length || 3;
  const countEventos = misInscripciones?.length || eventos?.length || 4;
  const countReservas = 2;

  // Medidor de fortaleza de contraseña
  const evaluateStrength = (val) => {
    if (!val) {
      setStrengthScore(0);
      return;
    }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setStrengthScore(score);
  };

  const getStrengthInfo = () => {
    switch (strengthScore) {
      case 0:
        return { width: '0%', color: 'bg-slate-200', text: 'Fortaleza: Sin ingresar' };
      case 1:
        return { width: '25%', color: 'bg-rose-500', text: 'Fortaleza: Muy Débil' };
      case 2:
        return { width: '50%', color: 'bg-amber-500', text: 'Fortaleza: Media' };
      case 3:
        return { width: '75%', color: 'bg-blue-500', text: 'Fortaleza: Buena' };
      case 4:
      default:
        return { width: '100%', color: 'bg-emerald-500', text: 'Fortaleza: Fuerte (Óptima)' };
    }
  };

  // Enviar formulario de cambio de clave hacia el Backend (ms-usuarios a través del Gateway)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Por favor completa todos los campos de contraseña', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Las nuevas contraseñas no coinciden', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('La nueva clave debe tener al menos 8 caracteres', 'error');
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
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al actualizar la contraseña');
      }

      showToast('¡Contraseña actualizada exitosamente en ms-usuarios (PostgreSQL)!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStrengthScore(0);
    } catch (err) {
      console.warn('Error en change-password:', err.message);
      // Feedback si estamos en entorno con simulación o error de credencial anterior
      showToast(err.message || 'Error al conectar con el servicio de autenticación', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Sincronización de datos con el Gateway
  const handleRefresh = async () => {
    if (refetchProfile) await refetchProfile();
    showToast('Perfil sincronizado con ms-usuarios y Auth Service', 'success');
  };

  // Simulación de renovación de Token QR dinámico
  const handleRenewQR = () => {
    setIsQrRefreshing(true);
    setTimeout(() => {
      setQrToken('TKN-' + Math.floor(100000 + Math.random() * 900000));
      setIsQrRefreshing(false);
      showToast('Código de barras y QR dinámico regenerado (Válido por 60s)', 'success');
    }, 600);
  };

  // Simulación de exportación de carnet
  const handleDownloadCarnet = () => {
    showToast('Generando credencial digital UNIAJS en formato PDF...', 'info');
    setTimeout(() => {
      showToast(`Descarga completada: Carnet_UNIAJS_${displayCodigo.replace(/[^a-zA-Z0-9]/g, '')}.pdf`, 'success');
    }, 1200);
  };

  const strength = getStrengthInfo();

  return (
    <div className="space-y-6 pb-8" data-purpose="student-profile-view">
      
      {/* ── 1. Breadcrumbs & Status Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-purpose="breadcrumbs-and-status">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-slate-500 font-space">
          <button
            onClick={() => onNavigateTab('inicio')}
            className="hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Inicio</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{currentRole}</span>
          <span className="text-slate-300">/</span>
          <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            Mi Perfil Institucional
          </span>
        </nav>

        {/* JWT & Session Sync Status */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs shadow-xs font-space">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">Token JWT Válido • Sesión RBAC Activa</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-xs cursor-pointer"
            title="Sincronizar Datos con ms-usuarios"
          >
            <svg className={`w-4 h-4 ${profileLoading ? 'animate-spin text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 2. Hero Banner Institucional ────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-[#003366] via-[#1e3a8a] to-[#1e40af] text-white p-6 sm:p-8 shadow-lg relative overflow-hidden" data-purpose="student-hero">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 text-white/5 font-black text-8xl select-none hidden lg:block tracking-tighter font-space">
          UNIAJS
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Avatar + Datos de Identificación */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white/40 shadow-inner flex items-center justify-center text-3xl font-black text-white tracking-wider font-space">
                {getInitials(displayName)}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 border-2 border-[#003366]" title="Matrícula Activa">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 font-space">
                <span>🎓 CORPORACIÓN UNIVERSITARIA ANTONIO JOSÉ DE SUCRE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-space text-white">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-space">
                <span className="bg-blue-500/30 border border-blue-400/40 text-blue-100 px-2.5 py-0.5 rounded-md font-semibold tracking-wide">
                  🎓 {currentRole?.toUpperCase() === 'ESTUDIANTE' ? 'ESTUDIANTE PREGRADO' : `${currentRole?.toUpperCase()}`}
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cuenta Activa (Semestre 2026-1)
                </span>
                <span className="font-mono text-blue-200 bg-black/20 px-2 py-0.5 rounded text-[11px] border border-white/10">
                  Cód: {displayCodigo}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-xs text-blue-200/90 font-space">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {displayFacultad}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {displayEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de Acción Rápida en el Banner */}
          <div className="flex flex-wrap sm:flex-col lg:flex-row gap-2.5 shrink-0 self-start lg:self-center font-space">
            <button
              onClick={handleDownloadCarnet}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#003366] hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#1e40af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Descargar Carnet PDF</span>
            </button>
            <button
              onClick={handleRenewQR}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition backdrop-blur-sm active:scale-95 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${isQrRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Generar QR Acceso</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Student KPI Metrics ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="kpi-metrics">
        {/* KPI 1: Solicitudes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">Trámites y Solicitudes</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-space">{countSolicitudes}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-space">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>2 en trámite, 1 resuelta</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Eventos Campus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">Eventos Campus</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-space">{countEventos}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate font-space">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>Próximo: Seminario IA & Sistemas</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Reservas Labs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">Reservas Aulas / Labs</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-space">{countReservas}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-space">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Lab. Computación 3 (Activo)</span>
            </p>
          </div>
        </div>

        {/* KPI 4: Promedio & Estado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-space">Promedio / Estado</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-space">4.4</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-space">Ponderado</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-space">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Estudiante Regular Matriculado</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Layout en 2 Columnas (8 cols + 4 cols) ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" data-purpose="profile-body-layout">
        
        {/* COLUMNA IZQUIERDA: PESTAÑAS Y DETALLE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navegación por Tabs */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1 font-space" data-purpose="tab-navigation">
            <button
              onClick={() => setActiveTab('tab-academic')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tab-academic'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Datos Académicos</span>
            </button>

            <button
              onClick={() => setActiveTab('tab-security')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tab-security'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Seguridad y Clave</span>
            </button>

            <button
              onClick={() => setActiveTab('tab-rbac')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tab-rbac'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Permisos RBAC</span>
            </button>
          </div>

          {/* TAB 1: DATOS PERSONALES Y ACADÉMICOS */}
          {activeTab === 'tab-academic' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-space">Información Oficial del Estudiante</h3>
                  <p className="text-xs text-slate-500">Datos sincronizados con la Oficina de Admisiones y Registro Académico</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 font-space">
                  Verificado
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Nombre Completo</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-space">{displayName}</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Tipo y Documento</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-space">C.C. 1.098.765.432</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Código Estudiantil</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-blue-700">{displayCodigo}</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Facultad</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-space">Facultad de Ingeniería y Tecnologías</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 md:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Programa Académico</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-space">
                    {displayFacultad} (Pensum 2022-II) • Nivel: 7° Semestre
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Correo Institucional</span>
                  <span className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1 font-mono break-all">
                    {displayEmail}
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Correo Personal</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 font-mono break-all">juan.rivas.dev@gmail.com</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Teléfono / Celular</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 font-space">+57 312 456 7890</span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-space">Sede y Jornada</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700 font-space">Campus Principal (Edificio A) - Diurna</span>
                </div>
              </div>

              {/* Tutor y Contacto de Emergencia */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 font-space">
                  Acompañamiento y Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                    <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-space">
                      CM
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold font-space">Tutor Académico Asignado</span>
                      <span className="font-bold text-slate-800 font-space">Ing. Carlos Mendoza P.</span>
                      <span className="text-[11px] text-slate-500 block font-mono">carlos.mendoza@uajs.edu.co</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <div className="h-9 w-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-space">
                      MR
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold font-space">Contacto de Emergencia</span>
                      <span className="font-bold text-slate-800 font-space">Martha Montoya (Madre)</span>
                      <span className="text-[11px] text-slate-500 block font-mono">+57 315 987 6543</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEGURIDAD Y CAMBIO DE CONTRASEÑA */}
          {activeTab === 'tab-security' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-space">Seguridad de la Cuenta Institucional</h3>
                  <p className="text-xs text-slate-500">Actualiza tus credenciales para el Directorio Activo y SSO de UNIAJS</p>
                </div>
                <span className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 text-slate-600 rounded border border-slate-200">
                  ms-auth: bcrypt-v2
                </span>
              </div>

              <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
                {/* Contraseña Actual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-space" htmlFor="current-password">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <input
                      id="current-password"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                      required
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <svg className={`w-4 h-4 ${showCurrent ? 'text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-space" htmlFor="new-password">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        evaluateStrength(e.target.value);
                      }}
                      placeholder="Mínimo 8 caracteres, mayúscula, número y símbolo"
                      required
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <svg className={`w-4 h-4 ${showNew ? 'text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>

                  {/* Medidor visual de fortaleza */}
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-space">
                      <span>{strength.text}</span>
                      <span className="text-slate-400">Requerido: 8+ car, mayús, número y especial</span>
                    </div>
                  </div>
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-space" htmlFor="confirm-password">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      required
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <svg className={`w-4 h-4 ${showConfirm ? 'text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Nota de Encriptación bcrypt */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 font-space">
                  <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>
                    Las credenciales se encriptan con hash <strong>bcrypt (salt rounds 10)</strong> en PostgreSQL central y se sincronizan instantáneamente con el API Gateway institucional.
                  </span>
                </div>

                <div className="pt-2 flex justify-end font-space">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-[#003366] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>Actualizando en PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                        <span>Actualizar Contraseña</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Historial de Sesiones Activas */}
              <div className="mt-8 pt-6 border-t border-slate-100 font-space">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Historial de Sesiones Recientes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Navegador Web (Esta Sesión)</div>
                        <span className="text-[11px] text-slate-500 font-mono">IP: 192.168.1.45 • Sincelejo, Colombia</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Activo Ahora
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">UNIAJS Smart App (Android 14)</div>
                        <span className="text-[11px] text-slate-500 font-mono">IP: 181.135.48.12 • Último acceso: Ayer 6:30 PM</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Sesión remota desconectada', 'info')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATRIZ DE PERMISOS RBAC */}
          {activeTab === 'tab-rbac' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 font-space">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Control de Acceso Basado en Roles (RBAC)</h3>
                  <p className="text-xs text-slate-500">Políticas JWT y alcance de endpoints validados por el Auth-Service</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 font-mono">
                    ROL: {currentRole?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Endpoints Permitidos */}
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Privilegios Concedidos (Scope Token JWT)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">ver_solicitudes_propias</span>
                      <p className="text-[11px] font-mono text-slate-600">GET /api/solicitudes (Filtrado automático por claim usuario_id)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitado</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">crear_solicitudes</span>
                      <p className="text-[11px] font-mono text-slate-600">POST /api/solicitudes (Creación con estado inicial REGISTRADA)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitado</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">cancelar_solicitudes_registradas</span>
                      <p className="text-[11px] font-mono text-slate-600">DELETE /api/solicitudes/:id (Solo permitido si estado = REGISTRADA)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitado</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">inscribirse_eventos</span>
                      <p className="text-[11px] font-mono text-slate-600">POST /api/eventos/:id/inscribir (Validación de cupo concurrente)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitado</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">crear_reservas & crear_pqrs</span>
                      <p className="text-[11px] font-mono text-slate-600">POST /api/reservas • POST /api/pqrs</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Habilitado</span>
                  </div>
                </div>
              </div>

              {/* Restricciones / 403 Forbidden */}
              <div>
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Restricciones del Rol (Requieren Perfil Administrativo)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between opacity-85">
                    <div>
                      <span className="font-semibold text-slate-700">transicionar_estados_solicitud</span>
                      <p className="text-[11px] font-mono text-slate-500">PUT /api/solicitudes/:id/estado (Solo rol Administrativo / Decanatura)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">403 Prohibido</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between opacity-85">
                    <div>
                      <span className="font-semibold text-slate-700">gestionar_usuarios</span>
                      <p className="text-[11px] font-mono text-slate-500">CRUD /api/usuarios (Restringido para Administrador del Sistema)</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">403 Prohibido</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: CARNET DIGITAL INTERACTIVO (4 COLS) */}
        <div className="lg:col-span-4 space-y-4" data-purpose="digital-id-card-column">
          <div className="sticky top-20 space-y-4 font-space">
            
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Carnet Digital Institucional
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Válido 2026-1
              </span>
            </div>

            {/* Tarjeta Física Simulada */}
            <div className="bg-gradient-to-br from-[#003366] via-[#1e40af] to-[#0284c7] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/20 select-none">
              <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Cabecera del Carnet con Chip NFC */}
              <div className="relative z-10 flex items-start justify-between border-b border-white/20 pb-4">
                <div>
                  <span className="text-xl font-black tracking-wider block font-space">UNIAJS</span>
                  <span className="text-[9px] uppercase tracking-widest text-blue-200 font-semibold block font-space">
                    Smart Campus Sucre
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/20">
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span className="text-[10px] font-mono font-bold tracking-widest">NFC</span>
                </div>
              </div>

              {/* Foto + Datos del Carnet */}
              <div className="relative z-10 my-5 flex items-center space-x-4">
                <div className="relative shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-200 to-white text-[#003366] font-black text-2xl flex items-center justify-center border-2 border-white shadow-md font-space">
                    {getInitials(displayName)}
                  </div>
                  <span className="absolute bottom-1 right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-[#003366]"></span>
                </div>
                <div className="overflow-hidden space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase block font-space">
                    Estudiante Activo
                  </span>
                  <h3 className="text-sm font-bold truncate leading-tight font-space">{displayName}</h3>
                  <p className="text-[11px] text-blue-100 font-mono">{displayCodigo}</p>
                  <p className="text-[10px] text-blue-200 truncate font-space">{displayFacultad}</p>
                </div>
              </div>

              {/* Sección de Torniquetes: Código de Barras + QR Dinámico */}
              <div className="relative z-10 bg-white p-3 rounded-2xl text-slate-800 flex items-center justify-between shadow-inner">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-space">
                    Acceso a Torniquetes
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                    CC 1.098.765.432
                  </div>
                  <div className="flex items-end h-5 space-x-0.5 pt-1">
                    <div className="w-1 h-full bg-slate-900" />
                    <div className="w-0.5 h-full bg-slate-400" />
                    <div className="w-1.5 h-full bg-slate-900" />
                    <div className="w-0.5 h-full bg-slate-400" />
                    <div className="w-1 h-full bg-slate-900" />
                    <div className="w-2 h-full bg-slate-900" />
                    <div className="w-0.5 h-full bg-slate-300" />
                    <div className="w-1.5 h-full bg-slate-900" />
                    <div className="w-1 h-full bg-slate-900" />
                    <div className="w-0.5 h-full bg-slate-300" />
                    <div className="w-2 h-full bg-slate-900" />
                  </div>
                </div>

                {/* SVG QR Code */}
                <div
                  className={`p-1.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                    isQrRefreshing ? 'opacity-40 animate-pulse' : ''
                  }`}
                  onClick={handleRenewQR}
                  title="Código QR Dinámico (Haz clic para renovar)"
                >
                  <svg className="w-12 h-12 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v2h-2v-2zm2 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm4-6h2v2h-2v-2z"></path>
                  </svg>
                </div>
              </div>

              {/* Pie de Carnet */}
              <div className="relative z-10 mt-4 flex items-center justify-between text-[10px] text-blue-200/80 font-mono">
                <span>EXP: 12/2026</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {qrToken}
                </span>
              </div>
            </div>

            {/* Botones del Carnet */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 font-space">
              <button
                onClick={handleDownloadCarnet}
                className="w-full py-2.5 px-3 bg-[#003366] hover:bg-[#1e3a8a] text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Exportar Carnet (PDF / Wallet)</span>
              </button>
              <button
                onClick={handleRenewQR}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className={`w-4 h-4 text-slate-500 ${isQrRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Renovar Token QR Dinámico</span>
              </button>
            </div>

            {/* Aviso de Seguridad */}
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 font-space">
              <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Este carnet es personal e intransferible. Válido para ingreso a laboratorios, biblioteca y eventos culturales de la UNIAJS.</span>
            </div>

          </div>
        </div>

      </div>

      {/* ── 5. Toast Notification System ───────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none font-space ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <div
          className={`flex items-center space-x-3 px-4 py-3 text-white rounded-xl shadow-2xl border text-xs font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-100'
              : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}
        >
          <span className="font-bold text-sm">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ️'}
          </span>
          <span>{toast.message}</span>
        </div>
      </div>

    </div>
  );
};

export default MiPerfil;
