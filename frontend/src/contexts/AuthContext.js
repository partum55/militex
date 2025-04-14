import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Check for valid token
        if (AuthService.isAuthenticated()) {
          // Get user data
          const userData = await AuthService.getCurrentUser();
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          // Try to refresh token
          try {
            await AuthService.refreshToken();
            const userData = await AuthService.getCurrentUser();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (refreshError) {
            // Refresh failed, ensure logout
            AuthService.logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        AuthService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.login(username, password);
      const userData = await AuthService.getCurrentUser();

      setCurrentUser(userData);
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      console.error('Login error:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.register(userData);

      return response;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.updateProfile(updatedData);
      setCurrentUser(response);

      return response;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check token validity periodically (every 5 minutes)
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      if (currentUser && !AuthService.isAuthenticated()) {
        // Token expired, try to refresh
        AuthService.refreshToken()
          .catch(() => {
            // Refresh failed, logout
            logout();
          });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(checkTokenInterval);
    };
  }, [currentUser, logout]);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
