import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('agritech_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Set Axios default authorization header
        if (parsed.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('agritech_user', JSON.stringify(res.data.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
        return { success: true };
      }
    } catch (err) {
      // In offline / mock fallback mode for easy testing:
      if (email === 'admin@agritech.com' && password === 'admin123') {
        const mockAdmin = {
          _id: 'mock_admin_1',
          name: 'Dr. Ramesh Sharma (Admin & Agronomist)',
          email: 'admin@agritech.com',
          role: 'admin',
          token: 'mock_jwt_token_admin',
        };
        setUser(mockAdmin);
        localStorage.setItem('agritech_user', JSON.stringify(mockAdmin));
        return { success: true };
      } else if (email === 'farmer@agritech.com' && password === 'farmer123') {
        const mockFarmer = {
          _id: 'mock_farmer_1',
          name: 'Suresh Patil',
          email: 'farmer@agritech.com',
          role: 'farmer',
          location: { state: 'Maharashtra', district: 'Pune', village: 'Baramati' },
          token: 'mock_jwt_token_farmer',
        };
        setUser(mockFarmer);
        localStorage.setItem('agritech_user', JSON.stringify(mockFarmer));
        return { success: true };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, userData);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('agritech_user', JSON.stringify(res.data.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agritech_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
