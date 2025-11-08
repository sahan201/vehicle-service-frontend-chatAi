import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancel(id);
        setSuccess('Appointment cancelled successfully!');
        fetchAppointments();
        
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to cancel appointment');
      }
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

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-header" style={{ marginBottom: 0 }}>My Appointments</h2>
          <a href="/customer/book-appointment" className="btn btn-primary">
            ➕ Book New Appointment
          </a>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No appointments yet</h3>
            <p>Book your first service appointment to get started!</p>
            <a href="/customer/book-appointment" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              📅 Book Appointment
            </a>
          </div>
        ) : (
          <div className="grid grid-1">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
                      {appointment.serviceType}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Vehicle:</strong> {appointment.vehicle?.make} {appointment.vehicle?.model}
                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                          ({appointment.vehicle?.vehicleNo})
                        </span>
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Date:</strong> {appointment.date}
                      </p>
                      <p style={{ margin: '0.25rem 0' }}>
                        <strong>Time:</strong> {appointment.time}
                      </p>
                      {appointment.assignedMechanic && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Mechanic:</strong> {appointment.assignedMechanic.name}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      
                      {appointment.discountEligible && (
                        <span className="badge badge-success">
                          5% Off-Peak Discount 🎉
                        </span>
                      )}
                    </div>

                    {appointment.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff', borderRadius: '5px' }}>
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>

                  <div>
                    {appointment.status === 'Scheduled' && (
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleCancel(appointment._id)}
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd' }}>
                  <small style={{ color: '#666' }}>
                    Booked on: {new Date(appointment.createdAt).toLocaleDateString()} at{' '}
                    {new Date(appointment.createdAt).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
