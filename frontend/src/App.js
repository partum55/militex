// App.js
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext.js';
import PrivateRoute from './components/common/PrivateRoute.js';

// Import layout components
import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';

// Import page components
import HomePage from './pages/HomePage.js';
import BuyPage from './pages/BuyPage.js';
import SellPage from './pages/SellPage.js';
import CarDetailPage from './pages/CarDetailPage.js';
import ProfilePage from './components/auth/ProfilePage.js';
import Login from './components/auth/Login.js';
import Register from './components/auth/Register.js';
import ErrorPage from './components/common/ErrorPage.js';
import MaintenancePage from './components/common/MaintenancePage.js';
import axios from 'axios';
import FundraiserPage from './pages/FundraiserPage.js';

function App() {
  const { t } = useTranslation();

  useEffect(() => {
    // Simplified CSRF fetching - directly using axios
    const fetchCsrf = async () => {
      try {
        await axios.get('/csrf/', { withCredentials: true });
        console.log("CSRF cookie set successfully");
      } catch (error) {
        console.warn("CSRF cookie setup failed:", error);
        // Continue anyway - don't block rendering
      }
    };
    
    fetchCsrf();
  }, []);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route
              path="/sell"
              element={
                <PrivateRoute>
                  <SellPage />
                </PrivateRoute>
              }
            />
            <Route path="/fundraiser" element={<FundraiserPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
