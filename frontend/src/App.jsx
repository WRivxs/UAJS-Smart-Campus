import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingAuth from './views/LandingAuth';
import DashboardPrincipal from './views/DashboardPrincipal';
import DashboardAdmin from './views/DashboardAdmin';
import ProtectedRoute from './routes/ProtectedRoute';

const MainApp = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <LandingAuth />;
  }

  const userRole = user?.rol_nombre || user?.rol || user?.role;
  const isAdmin = userRole === 'Administrador' || user?.rol_id === 1;

  if (isAdmin) {
    return (
      <ProtectedRoute allowedRoles={['Administrador']}>
        <DashboardAdmin />
      </ProtectedRoute>
    );
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