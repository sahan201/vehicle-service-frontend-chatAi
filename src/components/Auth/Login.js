// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      console.log('Login successful. User role:', role); // Debug log
      
      if (role === 'Customer') {
        navigate('/customer/dashboard');
      } else if (role === 'Mechanic') {
        navigate('/mechanic/dashboard');
      } else if (role === 'Manager') {
        navigate('/manager/dashboard');
      } else {
        // Fallback for any unexpected role
        setError('Invalid user role. Please contact support.');
        setLoading(false);
        return;
      }
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🚗 Vehicle Service Center</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>Login</h3>
        
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link" style={{ marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            <strong>Note:</strong> Customers can register. Mechanics and Managers are created by the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;