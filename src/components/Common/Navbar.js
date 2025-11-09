import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>🚗 Vehicle Service Center</h1>
      
      <div className="navbar-links">
        {user && (
          <>
            <span style={{ color: '#666' }}>
              Welcome, <strong>{user.name}</strong> ({user.role})
            </span>
            
            {user.role === 'Customer' && (
              <>
                <Link to="/customer/dashboard">Dashboard</Link>
                <Link to="/customer/vehicles">My Vehicles</Link>
                <Link to="/customer/appointments">Appointments</Link>
                <Link to="/customer/complaints">Complaints</Link>
              </>
            )}
            
            {user.role === 'Mechanic' && (
              <>
                <Link to="/mechanic/dashboard">Dashboard</Link>
                <Link to="/mechanic/jobs">My Jobs</Link>
              </>
            )}
            
            {user.role === 'Manager' && (
              <>
                <Link to="/manager/dashboard">Dashboard</Link>
                <Link to="/manager/appointments">All Appointments</Link>
                <Link to="/manager/reports">Reports</Link>
              </>
            )}
            
            <button onClick={handleLogout} className="btn btn-secondary btn-small">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
