import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const DashboardPrincipal = () => {
  const { user, logout, rol } = useAuth();

  // Helper badge color based on the 4 official system roles
  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'Administrador':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/40';
      case 'Administrativo':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/40';
      case 'Docente':
        return 'bg-sky-500/20 text-sky-700 border-sky-500/40';
      case 'Estudiante':
      default:
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#0284c7] selection:text-white">
      
      {/* Ambient Light Accent Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-15%] right-[-5%] w-[650px] h-[650px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none -z-10"></div>

      {/* Top Navbar Header (Blanco Puro con Logo Oficial PNG) */}
      <header className="w-full fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src="/Logo-SPLAVIA-5.0.png" 
            alt="Logo Corporación Universitaria Antonio José de Sucre" 
            className="h-10 md:h-11 w-auto object-contain cursor-pointer"
          />
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
          <span className="text-xs font-bold tracking-tight text-[#0284c7] uppercase font-space hidden sm:inline">Smart Campus Dashboard</span>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-space border ${getRoleBadgeStyle(rol || user?.rol_nombre)}`}>
              {rol || user?.rol_nombre || 'Estudiante'}
            </span>
            <span className="text-sm font-medium text-slate-800 hidden md:inline">{user?.nombre || user?.email}</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-space font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-grow pt-24 pb-12 px-6 md:px-12 max-w-[1380px] w-full mx-auto space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-space text-[#0284c7]">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Sesión Autenticada vía API Gateway</span>
            </div>
            <h1 className="text-3xl font-extrabold font-space text-slate-900">
              ¡Bienvenido, <span className="text-[#0284c7]">{user?.nombre || 'Usuario'}</span>!
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Has ingresado al campus con el rol de <strong className="text-slate-900">{rol || user?.rol_nombre || 'Estudiante'}</strong>. Tus credenciales han sido validadas correctamente con token JWT cifrado.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs w-full md:w-auto font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Correo:</span>
              <span className="text-slate-900 font-semibold">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Rol en Sistema:</span>
              <span className="text-[#0284c7] font-semibold">{rol || user?.rol_nombre || 'Estudiante'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Estado JWT:</span>
              <span className="text-emerald-600 font-semibold">VÁLIDO (24h)</span>
            </div>
          </div>
        </div>

        {/* Dashboard Services Placeholder Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0284c7]">apps</span>
              <span>Servicios Habilitados para {rol || user?.rol_nombre || 'Estudiante'}</span>
            </h2>
            <span className="text-xs text-slate-500">Siguiente Sprint: Header & Módulos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 hover:border-cyan-500/40 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#0284c7]">
                <span className="material-symbols-outlined text-[24px]">grade</span>
              </div>
              <h3 className="text-base font-bold font-space text-slate-900">Consulta de Notas y Materias</h3>
              <p className="text-xs text-slate-500">
                Visualiza tu historial académico, materias inscritas y promedio acumulado.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 hover:border-cyan-500/40 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="text-base font-bold font-space text-slate-900">Gestión de PQRS</h3>
              <p className="text-xs text-slate-500">
                Radica peticiones, quejas, reclamos y sugerencias ante la secretaría académica.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-3 hover:border-cyan-500/40 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <h3 className="text-base font-bold font-space text-slate-900">Búsqueda Elasticsearch</h3>
              <p className="text-xs text-slate-500">
                Buscador global en tiempo real a través de los 8 microservicios del campus.
              </p>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};

export default DashboardPrincipal;
