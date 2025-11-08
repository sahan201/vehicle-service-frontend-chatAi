import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  appointmentService, 
  managerService, 
  inventoryService,
  feedbackService,
  reportService 
} from '../services/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'appointments') {
        const apptResponse = await appointmentService.getAll();
        const appts = apptResponse.data.appointments || [];
        setAppointments(appts);
        
        setStats({
          totalAppointments: appts.length,
          scheduled: appts.filter(a => a.status === 'Scheduled').length,
          inProgress: appts.filter(a => a.status === 'In Progress').length,
          completed: appts.filter(a => a.status === 'Completed').length
        });
      }

      if (activeTab === 'assign') {
        const [jobsRes, mechanicsRes] = await Promise.all([
          managerService.getUnassignedJobs(),
          managerService.getMechanics()
        ]);
        setUnassignedJobs(jobsRes.data.appointments || jobsRes.data.jobs || []);
        setMechanics(mechanicsRes.data.mechanics || []);
      }

      if (activeTab === 'inventory') {
        const invRes = await inventoryService.getAll();
        setInventory(invRes.data.items || invRes.data.inventory || []);
      }

      if (activeTab === 'feedback') {
        const feedRes = await feedbackService.getAll();
        setFeedback(feedRes.data.feedback || feedRes.data.feedbacks || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleAssignJob = async (jobId, mechanicId) => {
    try {
      await managerService.assignJob(jobId, mechanicId);
      setSuccess('Job assigned successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to assign job');
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

  if (loading && activeTab === 'overview') {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Manager Dashboard 👨‍💼</h2>
        <p>Welcome back, {user.name}</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
        >
          📋 All Appointments
        </button>
        <button 
          className={`btn ${activeTab === 'assign' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('assign')}
        >
          🔧 Assign Jobs
        </button>
        <button 
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('feedback')}
        >
          ⭐ Feedback
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="stats">
            <div className="stat-card">
              <h3>{stats.totalAppointments}</h3>
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

          <div className="card">
            <h3 className="card-header">Recent Appointments</h3>
            {appointments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No appointments yet</p>
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
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 10).map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.customer?.name}</td>
                      <td>
                        {apt.vehicle?.make} {apt.vehicle?.model}
                        <br />
                        <small>{apt.vehicle?.vehicleNo}</small>
                      </td>
                      <td>{apt.serviceType}</td>
                      <td>
                        {apt.date}
                        <br />
                        <small>{apt.time}</small>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>{apt.mechanic?.name || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="card">
          <h3 className="card-header">All Appointments</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : appointments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No appointments found</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
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
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td><small>{apt._id.substring(0, 8)}</small></td>
                    <td>{apt.customer?.name}</td>
                    <td>
                      {apt.vehicle?.make} {apt.vehicle?.model}
                      <br />
                      <small>{apt.vehicle?.vehicleNo}</small>
                    </td>
                    <td>{apt.serviceType}</td>
                    <td>
                      {apt.date}
                      <br />
                      <small>{apt.time}</small>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>{apt.mechanic?.name || '-'}</td>
                    <td>
                      {apt.discountEligible ? (
                        <span className="badge badge-success">5%</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assign Jobs Tab */}
      {activeTab === 'assign' && (
        <div className="card">
          <h3 className="card-header">Assign Unassigned Jobs</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : unassignedJobs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No unassigned jobs</p>
          ) : (
            <div className="grid grid-2">
              {unassignedJobs.map((job) => (
                <div key={job._id} className="card" style={{ background: '#f8f9fa' }}>
                  <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
                    {job.serviceType}
                  </h3>
                  <p><strong>Customer:</strong> {job.customer?.name}</p>
                  <p><strong>Vehicle:</strong> {job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.vehicleNo})</p>
                  <p><strong>Date:</strong> {job.date} at {job.time}</p>
                  
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Assign to Mechanic:</label>
                    <select 
                      onChange={(e) => e.target.value && handleAssignJob(job._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Select mechanic</option>
                      {mechanics.map((mech) => (
                        <option key={mech._id} value={mech._id}>
                          {mech.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="card-header" style={{ marginBottom: 0 }}>Inventory</h3>
            <button className="btn btn-primary btn-small">➕ Add Item</button>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : inventory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No inventory items</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td>{item.partName || item.name}</td>
                    <td>{item.quantity}</td>
                    <td>Rs. {item.price}</td>
                    <td>
                      <span className={`badge ${item.quantity > 10 ? 'badge-success' : 'badge-warning'}`}>
                        {item.quantity > 10 ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="card">
          <h3 className="card-header">Customer Feedback</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : feedback.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No feedback yet</p>
          ) : (
            <div className="grid grid-2">
              {feedback.map((fb) => (
                <div key={fb._id} className="card" style={{ background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{fb.customer?.name}</strong>
                    <span style={{ color: '#f39c12' }}>
                      {'⭐'.repeat(fb.rating)}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{fb.comment}</p>
                  {fb.mechanic && (
                    <small style={{ color: '#999' }}>Mechanic: {fb.mechanic.name}</small>
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
      )}
    </div>
  );
};

export default ManagerDashboard;