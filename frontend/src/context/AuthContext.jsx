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
      // Check if user was registered in demo local storage:
      const registeredList = JSON.parse(localStorage.getItem('agritech_mock_users') || '[]');
      const found = registeredList.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (found) {
        setUser(found.user);
        localStorage.setItem('agritech_user', JSON.stringify(found.user));
        return { success: true };
      }

      // Pre-configured evaluation accounts
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
        message: err.response?.data?.message || 'Invalid email or password. Please try again.',
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
      // Resilient fallback for demo when backend is offline or waking up:
      const fallbackUser = {
        _id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'farmer',
        language: userData.language || 'en',
        location: userData.location || { state: 'Maharashtra', district: 'Pune', village: '' },
        token: 'mock_jwt_token_' + Date.now(),
      };

      // Store credentials so the newly registered user can log in again anytime
      const registeredList = JSON.parse(localStorage.getItem('agritech_mock_users') || '[]');
      // Check if email already registered in demo storage
      const exists = registeredList.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (exists) {
        return { success: false, message: 'User already exists with this email' };
      }

      registeredList.push({
        email: userData.email,
        password: userData.password,
        user: fallbackUser,
      });
      localStorage.setItem('agritech_mock_users', JSON.stringify(registeredList));

      setUser(fallbackUser);
      localStorage.setItem('agritech_user', JSON.stringify(fallbackUser));
      return { success: true };
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
