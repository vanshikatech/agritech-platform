import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthAPI } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("agritech_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Set Axios default authorization header
        if (parsed.token) {
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem("agritech_user", JSON.stringify(res.data.data));
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${res.data.data.token}`;
        return { success: true };
      }
      return {
        success: false,
        message: "Login failed. Please check your credentials.",
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Cannot reach the AgriTech server. Check that the backend is running.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, userData);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem("agritech_user", JSON.stringify(res.data.data));
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${res.data.data.token}`;
        return { success: true };
      }
      return {
        success: false,
        message: "Registration failed. Please review your details.",
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Registration failed. Try again.",
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await AuthAPI.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem("agritech_user", JSON.stringify(updatedUser));
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${updatedUser.token}`;
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Could not update your profile.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agritech_user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
