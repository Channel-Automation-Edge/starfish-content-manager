import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Check localStorage for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const startSessionTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId); // Clear existing timeout
    }
    const id = setTimeout(() => {
      logout(); // Log out after session timeout
    }, SESSION_TIMEOUT);
    setTimeoutId(id);
  };

  const resetSessionTimeout = () => {
    if (isAuthenticated) {
      startSessionTimeout(); // Reset timeout on user activity
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    startSessionTimeout(); // Start timeout after login
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    if (timeoutId) {
      clearTimeout(timeoutId); // Clear timeout on logout
    }
  };

  // Listen for user activity to reset the session timeout
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll'];
    const handleActivity = () => resetSessionTimeout();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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