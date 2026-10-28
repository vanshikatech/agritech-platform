import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmManagement from './pages/FarmManagement';
import CropMonitoring from './pages/CropMonitoring';
import SoilAnalysis from './pages/SoilAnalysis';
import WeatherForecast from './pages/WeatherForecast';
import Marketplace from './pages/Marketplace';
import OrderHistory from './pages/OrderHistory';
import CommunityForum from './pages/CommunityForum';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSettings from './pages/ProfileSettings';

import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app-layout">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Authenticated Farmer & Shared Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <FarmerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farms"
                    element={
                      <ProtectedRoute>
                        <FarmManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crops"
                    element={
                      <ProtectedRoute>
                        <CropMonitoring />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/soil"
                    element={
                      <ProtectedRoute>
                        <SoilAnalysis />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/weather"
                    element={
                      <ProtectedRoute>
                        <WeatherForecast />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace"
                    element={
                      <ProtectedRoute>
                        <Marketplace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                  <Route
                    path="/community"
                    element={
                      <ProtectedRoute>
                        <CommunityForum />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Route */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
