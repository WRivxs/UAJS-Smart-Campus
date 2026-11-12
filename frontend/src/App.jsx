import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingAuth from './views/LandingAuth';
import DashboardPrincipal from './views/DashboardPrincipal';
import DashboardAdmin from './views/DashboardAdmin';

const MainApp = () => {
  const { user, authLoading } = useContext(AuthContext);

  // While JWT is being decoded, show a simple loading screen
  // (avoids flashing LandingAuth for logged-in users)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02132d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0a47b8] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl animate-spin">
              progress_activity
            </span>
          </div>
          <p className="text-sm text-blue-200 font-medium">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show login page
  if (!user) {
    return <LandingAuth />;
  }

  // Enrutamiento definitivo por identidad de cuenta
  const userEmail = (user?.email || '').trim().toLowerCase();
  const isAdmin = userEmail.includes('admin') || user?.rol_nombre === 'Administrador' || Number(user?.rol_id) === 1;

  if (isAdmin && !userEmail.includes('estudiante')) {
    return <DashboardAdmin />;
  }

  return <DashboardPrincipal />;
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
