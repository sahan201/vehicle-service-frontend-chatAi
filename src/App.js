import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import Vehicles from './pages/Vehicles';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import ManagerDashboard from './pages/ManagerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} /> : <Register />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer/vehicles" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <Vehicles />
          </ProtectedRoute>
        } />
        <Route path="/customer/book-appointment" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/customer/appointments" element={
          <ProtectedRoute allowedRoles={['Customer']}>
            <Appointments />
          </ProtectedRoute>
        } />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/appointments" element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Mechanic Routes */}
        <Route path="/mechanic/dashboard" element={
          <ProtectedRoute allowedRoles={['Mechanic']}>
            <MechanicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/mechanic/jobs" element={
          <ProtectedRoute allowedRoles={['Mechanic']}>
            <MechanicDashboard />
          </ProtectedRoute>
        } />
        
        {/* Default Route */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role.toLowerCase()}/dashboard`} /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
