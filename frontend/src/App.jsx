import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingAuth from './views/LandingAuth';
import DashboardPrincipal from './views/DashboardPrincipal';

const MainApp = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <DashboardPrincipal />;
  }

  return <LandingAuth />;
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
