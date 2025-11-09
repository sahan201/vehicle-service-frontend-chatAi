import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { feedbackService, appointmentService } from '../services/api';

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment');

  const [appointment, setAppointment] = useState(null);
  const [formData, setFormData] = useState({
    appointmentId: appointmentId || '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myFeedback, setMyFeedback] = useState([]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment(appointmentId);
    }
    fetchMyFeedback();
  }, [appointmentId]);

  const fetchAppointment = async (id) => {
    try {
      const response = await appointmentService.getById(id);
      setAppointment(response.data.appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const response = await feedbackService.getMyFeedback();
      setMyFeedback(response.data.feedback || response.data.feedbacks || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await feedbackService.create({
        appointmentId: appointmentId || formData.appointmentId,
        rating: formData.rating,
        comment: formData.comment
      });
      setSuccess('Thank you for your feedback! 🎉');
      setFormData({ appointmentId: '', rating: 5, comment: '' });
      
      setTimeout(() => {
        navigate('/customer/appointments');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit feedback');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Submit Feedback Form */}
      {appointmentId && (
        <div className="card">
          <h2 className="card-header">⭐ Rate Your Service</h2>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {appointment && (
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
                {appointment.serviceType}
              </h3>
              <p><strong>Vehicle:</strong> {appointment.vehicle?.make} {appointment.vehicle?.model}</p>
              <p><strong>Date:</strong> {appointment.date}</p>
              {appointment.assignedMechanic && (
                <p><strong>Mechanic:</strong> {appointment.assignedMechanic.name}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rating *</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: star <= formData.rating ? '#f39c12' : '#ddd'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <small style={{ color: '#666' }}>
                {formData.rating === 1 && 'Poor'}
                {formData.rating === 2 && 'Fair'}
                {formData.rating === 3 && 'Good'}
                {formData.rating === 4 && 'Very Good'}
                {formData.rating === 5 && 'Excellent'}
              </small>
            </div>

            <div className="form-group">
              <label>Your Feedback *</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Tell us about your experience..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/customer/appointments')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Previous Feedback */}
      <div className="card">
        <h3 className="card-header">📝 My Previous Feedback</h3>
        
        {myFeedback.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No feedback submitted yet
          </p>
        ) : (
          <div className="grid grid-2">
            {myFeedback.map((fb) => (
              <div key={fb._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{fb.appointment?.serviceType || 'Service'}</strong>
                  <span style={{ color: '#f39c12' }}>
                    {'⭐'.repeat(fb.rating)}
                  </span>
                </div>
                
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {fb.comment}
                </p>

                {fb.appointment && (
                  <small style={{ color: '#999' }}>
                    {fb.appointment.vehicle?.make} {fb.appointment.vehicle?.model}
                    {fb.appointment.assignedMechanic && ` • Mechanic: ${fb.appointment.assignedMechanic.name}`}
                  </small>
                )}
                
                <br />
                <small style={{ color: '#999' }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;