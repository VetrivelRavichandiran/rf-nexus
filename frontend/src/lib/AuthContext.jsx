import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Provide dummy "success" states to bypass Base44 authentication completely
  const [user] = useState({ name: "RF Engineer", email: "admin@local.dev" });
  const isAuthenticated = true;
  const isLoadingAuth = false;
  const isLoadingPublicSettings = false;
  const authError = null;
  const appPublicSettings = { id: "local-dev", public_settings: {} };

  // Dummy functions to prevent crashes if other components call them
  const checkAppState = async () => { return true; };
  const logout = () => { console.log("Simulated logout"); };
  const navigateToLogin = () => { console.log("Simulated navigation to login"); };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};