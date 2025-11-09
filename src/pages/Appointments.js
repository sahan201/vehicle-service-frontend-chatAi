import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data.appointments || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentService.cancel(id);
      setSuccess('Appointment cancelled successfully');
      fetchAppointments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel appointment');
      setTimeout(() => setError(''), 3000);
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

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-header" style={{ marginBottom: 0 }}>📋 My Appointments</h2>
          <a href="/customer/book-appointment" className="btn btn-primary">
            ➕ Book New
          </a>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Filter */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-small`}
            onClick={() => setFilter('all')}
          >
            All ({appointments.length})
          </button>
          <button 
            className={`btn ${filter === 'Scheduled' ? 'btn-primary' : 'btn-secondary'} btn-small`}
            onClick={() => setFilter('Scheduled')}
          >
            Scheduled ({appointments.filter(a => a.status === 'Scheduled').length})
          </button>
          <button 
            className={`btn ${filter === 'In Progress' ? 'btn-primary' : 'btn-secondary'} btn-small`}
            onClick={() => setFilter('In Progress')}
          >
            In Progress ({appointments.filter(a => a.status === 'In Progress').length})
          </button>
          <button 
            className={`btn ${filter === 'Completed' ? 'btn-primary' : 'btn-secondary'} btn-small`}
            onClick={() => setFilter('Completed')}
          >
            Completed ({appointments.filter(a => a.status === 'Completed').length})
          </button>
        </div>

        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No appointments found</h3>
            <p>Book your first service appointment today!</p>
            <a href="/customer/book-appointment" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Book Appointment
            </a>
          </div>
        ) : (
          <div className="grid grid-2">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#667eea', margin: 0 }}>
                    {appointment.serviceType}
                  </h3>
                  <span className={`badge ${getStatusBadge(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p><strong>🚗 Vehicle:</strong> {appointment.vehicle?.make} {appointment.vehicle?.model}</p>
                  <p><strong>🔢 Reg No:</strong> {appointment.vehicle?.vehicleNo}</p>
                  <p><strong>📅 Date:</strong> {appointment.date}</p>
                  <p><strong>🕐 Time:</strong> {appointment.time}</p>
                  
                  {appointment.discountEligible && (
                    <div className="alert alert-success" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>
                      🎉 5% Off-peak Discount Applied!
                    </div>
                  )}

                  {appointment.description && (
                    <p style={{ marginTop: '0.5rem' }}>
                      <strong>Notes:</strong><br />
                      <small>{appointment.description}</small>
                    </p>
                  )}

                  {appointment.mechanic && (
                    <p style={{ marginTop: '0.5rem' }}>
                      <strong>👨‍🔧 Mechanic:</strong> {appointment.mechanic.name}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a 
                    href={`/customer/track/${appointment._id}`}
                    className="btn btn-primary btn-small"
                  >
                    🔍 Track Service
                  </a>

                  {appointment.status === 'Scheduled' && (
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </button>
                  )}
                  
                  {appointment.status === 'Completed' && (
                    <a 
                      href={`/customer/feedback?appointment=${appointment._id}`}
                      className="btn btn-success btn-small"
                    >
                      Leave Feedback
                    </a>
                  )}
                </div>

                <small style={{ display: 'block', marginTop: '1rem', color: '#999' }}>
                  Booked on: {new Date(appointment.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;