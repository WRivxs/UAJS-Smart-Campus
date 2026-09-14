import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer/Footer';

export const LandingAuth = () => {
  const { login } = useAuth();
  
  // State variables for form inputs and feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // API Gateway Base URL with environment variable fallback
  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

  // Form submission handler with institutional rules and validation
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Rule 1: Required fields check
    if (!email || !password) {
      setErrorMessage('Por favor completa el correo institucional y la contraseña.');
      return;
    }

    // Rule 2: Institutional Domain validation (@uajs.edu.co)
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@uajs.edu.co')) {
      setErrorMessage('El correo debe tener el dominio institucional @uajs.edu.co');
      return;
    }

    // Rule 3: Password minimum length
    if (password.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Connect to API Gateway
      const response = await fetch(`${API_GATEWAY_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: normalizedEmail, 
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Credenciales de acceso inválidas');
      }

      setSuccessMessage('¡Autenticación exitosa! Iniciando sesión en el Campus...');
      
      // Save session token in AuthContext
      if (data.token) {
        login(data.token, data.user);
      }

    } catch (err) {
      console.error('Error de autenticación:', err);
      
      // Handle fallback for offline backend during frontend development
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMessage('Servidor Gateway inactivo. Iniciando sesión en modo desarrollo local...');
        setTimeout(() => {
          login('mock_jwt_token_demo', {
            nombre: normalizedEmail.split('@')[0],
            email: normalizedEmail,
            rol_nombre: normalizedEmail.includes('admin') ? 'Administrador' : normalizedEmail.includes('docente') ? 'Docente' : 'Estudiante'
          });
        }, 1200);
      } else {
        setErrorMessage(err.message || 'Error al conectar con el servidor de autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#0284c7] selection:text-white">
      
      {/* Ambient Light Accent Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-15%] right-[-5%] w-[650px] h-[650px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none -z-10"></div>

      {/* Top Navbar Header (Blanco Puro con Logo Oficial PNG) */}
      <header className="w-full fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            
            {/* Logo Oficial de la Universidad Antonio José de Sucre */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <img 
                src="/Logo-SPLAVIA-5.0.png" 
                alt="Logo Corporación Universitaria Antonio José de Sucre" 
                className="h-10 md:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-[#0284c7] uppercase font-space">UAJS Smart Campus</span>
              <span className="text-[10px] text-slate-500 hidden md:inline font-space">Campus Digital Institucional</span>
            </div>
          </div>
        </div>

        {/* Telemetry and Help Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-mono font-medium">Gateway Online</span>
          </div>

          <a href="#soporte" className="text-xs text-slate-600 hover:text-[#0284c7] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100">
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            <span className="hidden sm:inline">Mesa de Ayuda</span>
          </a>
        </div>
      </header>

      {/* Main Split-Screen Canvas */}
      <main className="flex-grow pt-20 pb-8 px-4 md:px-12 flex items-center justify-center relative z-10">
        <div className="w-full max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Hero & Platform Vision */}
          <section className="lg:col-span-7 flex flex-col justify-center space-y-5 lg:pr-6">
            
            {/* Identity Capsule */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 w-fit backdrop-blur-md shadow-sm">
              <span className="material-symbols-outlined text-[#0284c7] text-[15px]">school</span>
              <span className="text-[11px] font-bold text-[#0284c7] uppercase tracking-widest font-space">PLATAFORMA UNIVERSITARIA</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7]"></span>
              <span className="text-[11px] text-slate-600 font-medium">UNIAJS 2026</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold font-space tracking-tight text-slate-900 leading-tight">
                UAJS <span className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#025a9e] bg-clip-text text-transparent">Smart Campus</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
                Una plataforma integrada para consultar y gestionar los servicios universitarios desde un solo lugar con autenticación segura y telemetría en tiempo real.
              </p>
            </div>

            {/* Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-md group">
                <div className="h-7 w-7 rounded-lg bg-cyan-50 flex items-center justify-center text-[#0284c7] mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-space">
                  <span className="text-[#0284c7]">✓</span>
                  <span>Acceso centralizado</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Portal único con credenciales sincronizadas.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-md group">
                <div className="h-7 w-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">dns</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-space">
                  <span className="text-[#0284c7]">✓</span>
                  <span>Servicios campus</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Notas, PQRS, solicitudes y reservas.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-md group">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-space">
                  <span className="text-[#0284c7]">✓</span>
                  <span>Búsqueda Inteligente</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Motor Elasticsearch integrado en vivo.
                </p>
              </div>
            </div>

            {/* Diagnostic Telemetry Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 border-t border-slate-200 font-space">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0284c7]">security</span>
                <span>Cifrado JWT / SHA-256</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0284c7]">cloud_done</span>
                <span>Nodo Central Sucre DC-01</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0284c7]">bolt</span>
                <span>Disponibilidad 99.98%</span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Futuristic Compact Light Login Card */}
          <section className="lg:col-span-5 w-full">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
              
              {/* Top Cyan Accent Blur */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Module Header */}
              <div className="mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-widest font-space">BIENVENIDO</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-600 font-mono">SSO Institucional</span>
                </div>
                <h2 className="text-xl font-bold font-space text-slate-900 tracking-tight">Ingresa a Smart Campus</h2>
                <p className="text-xs text-slate-500">
                  Accede a los servicios de la Universidad Antonio José de Sucre.
                </p>
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold font-space text-slate-700" htmlFor="institutional_email">
                    Correo institucional
                  </label>
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                    </div>
                    <input
                      id="institutional_email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@uajs.edu.co"
                      className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-300 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] text-[#0284c7] font-semibold font-mono">
                      @uajs.edu.co
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold font-space text-slate-700" htmlFor="account_password">
                      Contraseña
                    </label>
                    <a href="#olvide-password" className="text-[10px] text-[#0284c7] hover:text-[#0369a1] transition-colors underline-offset-2 hover:underline">
                      Olvidé mi contraseña
                    </a>
                  </div>
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </div>
                    <input
                      id="account_password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Mostrar u ocultar contraseña"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Session Persistence */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]"
                    />
                    <span className="text-[11px] text-slate-600">Mantener sesión iniciada</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px] text-[#0284c7] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-mono">
                    <span className="material-symbols-outlined text-[12px] text-[#0284c7]">lock_clock</span>
                    <span>SSL 256-bit</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#025a9e] font-space text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Campus</span>
                      <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward</span>
                    </>
                  )}
                </button>

              </form>

              {/* Help Desk Callout */}
              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl">
                <span className="material-symbols-outlined text-[#0284c7] text-[18px] mt-0.5">contact_support</span>
                <div className="text-[11px]">
                  <p className="text-slate-800 font-semibold">¿Problemas de acceso?</p>
                  <p className="text-slate-500">
                    Mesa de ayuda: <a href="mailto:soporte@uajs.edu.co" className="text-[#0284c7] hover:underline font-medium">soporte@uajs.edu.co</a> • Ext. 1042
                  </p>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* Institutional Footer */}
      <Footer />

    </div>
  );
};

export default LandingAuth;
