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

  const login = useCallback(async (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setError(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        if (AuthService.isAuthenticated()) {
          console.log("Valid token found, getting user data");
          try {

            const userData = await AuthService.getCurrentUser();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (userError) {
            console.error('Error fetching user data:', userError);

            try {
              const newToken = await AuthService.refreshToken();
              if (newToken) {
                const userData = await AuthService.getCurrentUser();
                setCurrentUser(userData);
                setIsAuthenticated(true);
              } else {
                throw new Error("Token refresh failed");
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              AuthService.logout();
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log("No valid token found");
          try {
            const newToken = await AuthService.refreshToken();
            if (newToken) {
              const userData = await AuthService.getCurrentUser();
              setCurrentUser(userData);
              setIsAuthenticated(true);
            }
          } catch (refreshError) {
            console.log("Token refresh failed, logging out");
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
    // Force a page reload to clear any remaining state
    window.location.href = '/';
  }, []);

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
