import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAll();
      const appts = response.data.appointments || [];
      setAppointments(appts);

      setStats({
        assigned: appts.filter(a => a.status === 'Scheduled').length,
        inProgress: appts.filter(a => a.status === 'In Progress').length,
        completed: appts.filter(a => a.status === 'Completed').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Scheduled': 'badge-info',
      'In Progress': 'badge-warning',
      'Completed': 'badge-success',
      'Cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Mechanic Dashboard 🔧</h2>
        <p>Welcome, {user.name}! Here are your assigned jobs</p>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.assigned}</h3>
          <p>Assigned Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      {/* My Jobs */}
      <div className="card">
        <h3 className="card-header">My Assigned Jobs</h3>
        
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No jobs assigned yet</h3>
            <p>Wait for the manager to assign jobs to you</p>
          </div>
        ) : (
          <div className="grid grid-1">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
                      {appointment.serviceType}
                    </h3>
                    
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Customer:</strong> {appointment.customer?.name}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Vehicle:</strong> {appointment.vehicle?.make} {appointment.vehicle?.model}
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                        ({appointment.vehicle?.vehicleNo})
                      </span>
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Scheduled:</strong> {appointment.date} at {appointment.time}
                    </p>

                    <div style={{ marginTop: '1rem' }}>
                      <span className={`badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button className="btn btn-secondary btn-small" disabled>
                      🔧 Start Job (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>⚙️ Mechanic Actions</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Advanced features like updating job status, adding parts/labor, and generating bills will be added in Phase 2.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" disabled>
            ▶️ Start Job (Coming Soon)
          </button>
          <button className="btn btn-secondary" disabled>
            ➕ Add Parts (Coming Soon)
          </button>
          <button className="btn btn-secondary" disabled>
            💰 Calculate Bill (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
