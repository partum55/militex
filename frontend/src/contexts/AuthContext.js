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
          try {
            const userData = await AuthService.getCurrentUser();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (userError) {
            console.error('Error fetching user data:', userError);

            // Try to refresh token
            try {
              await AuthService.refreshToken();
              const userData = await AuthService.getCurrentUser();
              setCurrentUser(userData);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              AuthService.logout();
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
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

      const userData = await AuthService.login(username, password);
      setCurrentUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
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
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data || 'Failed to register. Please try again.');
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
      setError(err.response?.data || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check token validity periodically (every 5 minutes)
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      if (isAuthenticated && !AuthService.isAuthenticated()) {
        // Token expired, try to refresh
        AuthService.refreshToken()
          .then(() => {
            // Refresh successful, update user info
            AuthService.getCurrentUser()
              .then(userData => {
                setCurrentUser(userData);
              })
              .catch(err => {
                console.error('Failed to get current user after token refresh:', err);
                logout();
              });
          })
          .catch(() => {
            // Refresh failed, logout
            logout();
          });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(checkTokenInterval);
    };
  }, [isAuthenticated, logout]);

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
