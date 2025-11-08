import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleService, appointmentService } from '../services/api';
import VirtualAssistant from '../components/Common/VirtualAssistant';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedServices: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, appointmentsRes] = await Promise.all([
        vehicleService.getAll(),
        appointmentService.getMyAppointments()
      ]);

      setVehicles(vehiclesRes.data.vehicles || []);
      setAppointments(appointmentsRes.data.appointments || []);

      // Calculate stats
      const appts = appointmentsRes.data.appointments || [];
      setStats({
        totalVehicles: vehiclesRes.data.count || 0,
        totalAppointments: appts.length,
        upcomingAppointments: appts.filter(a => a.status === 'Scheduled').length,
        completedServices: appts.filter(a => a.status === 'Completed').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {user.name}! 👋</h2>
        <p>Here's an overview of your vehicles and service appointments</p>
      </div>

      <VirtualAssistant />

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.totalVehicles}</h3>
          <p>My Vehicles</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalAppointments}</h3>
          <p>Total Appointments</p>
        </div>
        <div className="stat-card">
          <h3>{stats.upcomingAppointments}</h3>
          <p>Upcoming</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completedServices}</h3>
          <p>Completed</p>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="card-header">Recent Appointments</div>
        {appointments.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No appointments yet. Book your first service!
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment._id}>
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
                    <span className={`badge ${
                      appointment.status === 'Scheduled' ? 'badge-info' :
                      appointment.status === 'In Progress' ? 'badge-warning' :
                      appointment.status === 'Completed' ? 'badge-success' :
                      'badge-danger'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.discountEligible ? (
                      <span className="badge badge-success">5% Off 🎉</span>
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
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>🚗 My Vehicles</h3>
          {vehicles.length === 0 ? (
            <p style={{ color: '#666' }}>No vehicles added yet.</p>
          ) : (
            <div>
              {vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle._id} style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}>
                  <strong>{vehicle.make} {vehicle.model}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {vehicle.year} • {vehicle.vehicleNo}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>📅 Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="/customer/vehicles" className="btn btn-primary">
              ➕ Add New Vehicle
            </a>
            <a href="/customer/book-appointment" className="btn btn-success">
              📅 Book Appointment
            </a>
            <a href="/customer/appointments" className="btn btn-secondary">
              📋 View All Appointments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
