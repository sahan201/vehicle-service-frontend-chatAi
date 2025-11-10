// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Restored user from localStorage:', parsedUser); // Debug log
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email); // Debug log
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      
      console.log('Login response received:', { token: token ? 'present' : 'missing', user }); // Debug log
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Validate user role
      const validRoles = ['Customer', 'Mechanic', 'Manager'];
      if (!validRoles.includes(user.role)) {
        throw new Error('Invalid user role');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('Login successful. User set:', user); // Debug log
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration for:', email); // Debug log
      const response = await authService.register({ name, email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('Registration successful. User set:', user); // Debug log
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('Logging out user'); // Debug log
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'Customer',
    isMechanic: user?.role === 'Mechanic',
    isManager: user?.role === 'Manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};