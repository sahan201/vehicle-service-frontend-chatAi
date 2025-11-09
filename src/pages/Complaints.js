import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { complaintService, appointmentService } from '../services/api';

const Complaints = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment');

  const [myComplaints, setMyComplaints] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    appointmentId: appointmentId || '',
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, appointmentsRes] = await Promise.all([
        complaintService.getMyComplaints(),
        appointmentService.getMyAppointments(),
      ]);
      
      setMyComplaints(complaintsRes.data.complaints || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.subject || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await complaintService.create({
        subject: formData.subject,
        description: formData.description,
        appointmentId: formData.appointmentId || undefined,
        priority: formData.priority,
      });

      setSuccess('Complaint submitted successfully! A manager will review it soon.');
      setFormData({
        subject: '',
        description: '',
        appointmentId: '',
        priority: 'Medium',
      });
      setShowForm(false);
      fetchData();

      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit complaint');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'badge-warning',
      'In Review': 'badge-info',
      'Resolved': 'badge-success',
      'Closed': 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'Low': 'badge-info',
      'Medium': 'badge-warning',
      'High': 'badge-danger',
      'Urgent': 'badge-danger',
    };
    return badges[priority] || 'badge-info';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="card-header" style={{ marginBottom: 0 }}>📝 My Complaints</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '➕ New Complaint'}
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Complaint Form */}
        {showForm && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Submit New Complaint</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Related Appointment (Optional)</label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleChange}
                >
                  <option value="">General Complaint (Not related to specific appointment)</option>
                  {appointments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      {apt.serviceType} - {apt.vehicle?.make} {apt.vehicle?.model} ({apt.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief summary of your complaint"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please describe your complaint in detail..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Submit Complaint
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <strong>💡 Note:</strong> Your complaints will be reviewed by our management team. 
          You'll receive updates via email and you can track the status here.
        </div>
      </div>

      {/* My Complaints List */}
      <div className="card">
        <h3 className="card-header">My Previous Complaints</h3>

        {myComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No complaints submitted yet</h3>
            <p>If you have any issues or concerns, please feel free to submit a complaint.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ marginTop: '1rem' }}
            >
              Submit First Complaint
            </button>
          </div>
        ) : (
          <div className="grid grid-2">
            {myComplaints.map((complaint) => (
              <div key={complaint._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#667eea' }}>{complaint.subject}</strong>
                  <span className={`badge ${getStatusBadge(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span className={`badge ${getPriorityBadge(complaint.priority)}`}>
                    {complaint.priority} Priority
                  </span>
                </div>

                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {complaint.description}
                </p>

                {complaint.appointment && (
                  <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>
                    <strong>Related to:</strong> {complaint.appointment.serviceType} on {complaint.appointment.date}
                  </p>
                )}

                {complaint.response && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    background: '#e7f3ff', 
                    borderLeft: '3px solid #667eea',
                    borderRadius: '4px'
                  }}>
                    <strong style={{ color: '#667eea', fontSize: '0.9rem' }}>
                      Manager Response:
                    </strong>
                    <p style={{ fontSize: '0.9rem', color: '#555', margin: '0.25rem 0 0 0' }}>
                      {complaint.response}
                    </p>
                    {complaint.resolvedBy && (
                      <small style={{ color: '#999' }}>
                        - Responded by {complaint.resolvedBy.name}
                      </small>
                    )}
                  </div>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd' }}>
                  <small style={{ color: '#999' }}>
                    Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                  </small>
                  {complaint.resolvedAt && (
                    <>
                      <br />
                      <small style={{ color: '#999' }}>
                        Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}
                      </small>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;