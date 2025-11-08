import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService, appointmentService } from '../services/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicle: '',
    serviceType: 'Regular Service',
    date: '',
    time: '09:00',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const serviceTypes = [
    'Regular Service',
    'Full Service',
    'Oil Change',
    'Brake Service',
    'Battery Replacement',
    'Tire Service',
    'Engine Repair',
    'Transmission Service',
    'AC Service',
    'Electrical Work'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      setError('Failed to load vehicles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await appointmentService.create(formData);
      setSuccess('Appointment booked successfully! 🎉');
      
      setTimeout(() => {
        navigate('/customer/appointments');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if selected date is off-peak (Monday-Friday)
  const isOffPeak = () => {
    if (!formData.date) return false;
    const date = new Date(formData.date);
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card">
        <h2 className="card-header">📅 Book Service Appointment</h2>

        {vehicles.length === 0 && (
          <div className="alert alert-info">
            You need to add a vehicle first. <a href="/customer/vehicles">Add Vehicle</a>
          </div>
        )}

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {isOffPeak() && (
          <div className="alert alert-success">
            🎉 Off-peak discount! You'll get 5% off by booking on a weekday!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Vehicle *</label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
              disabled={vehicles.length === 0}
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.make} {vehicle.model} - {vehicle.vehicleNo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Preferred Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                required
              />
            </div>

            <div className="form-group">
              <label>Preferred Time *</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Any specific issues or requirements..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || vehicles.length === 0}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/customer/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>💡 Tips</h3>
        <ul style={{ paddingLeft: '1.5rem', color: '#666' }}>
          <li>Book on weekdays (Monday-Friday) to get 5% discount</li>
          <li>Arrive 10 minutes early for your appointment</li>
          <li>Regular service is recommended every 5,000 km</li>
          <li>You'll receive a confirmation email after booking</li>
        </ul>
      </div>
    </div>
  );
};

export default BookAppointment;