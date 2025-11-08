import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
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
        total: appts.length,
        scheduled: appts.filter(a => a.status === 'Scheduled').length,
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
        <h2>Manager Dashboard 👨‍💼</h2>
        <p>Welcome, {user.name}! Manage all appointments and operations</p>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Appointments</p>
        </div>
        <div className="stat-card">
          <h3>{stats.scheduled}</h3>
          <p>Scheduled</p>
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

      {/* All Appointments */}
      <div className="card">
        <h3 className="card-header">All Appointments</h3>
        
        {appointments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No appointments yet
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Mechanic</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {appointment.customer?.name}
                    <br />
                    <small style={{ color: '#666' }}>
                      {appointment.customer?.email}
                    </small>
                  </td>
                  <td>
                    {appointment.vehicle?.make} {appointment.vehicle?.model}
                    <br />
                    <small style={{ color: '#666' }}>
                      {appointment.vehicle?.vehicleNo}
                    </small>
                  </td>
                  <td>{appointment.serviceType}</td>
                  <td>
                    {appointment.date}
                    <br />
                    <small style={{ color: '#666' }}>{appointment.time}</small>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.assignedMechanic ? (
                      <span>{appointment.assignedMechanic.name}</span>
                    ) : (
                      <span style={{ color: '#999' }}>Not assigned</span>
                    )}
                  </td>
                  <td>
                    {appointment.discountEligible ? (
                      <span className="badge badge-success">5% Off</span>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>🔧 Manager Actions</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Advanced features like assigning mechanics, inventory management, and reports will be added in Phase 2.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" disabled>
            👥 Assign Mechanic (Coming Soon)
          </button>
          <button className="btn btn-secondary" disabled>
            📦 Manage Inventory (Coming Soon)
          </button>
          <button className="btn btn-secondary" disabled>
            📊 Generate Reports (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
