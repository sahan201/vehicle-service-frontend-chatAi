import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mechanicService, inventoryService } from '../services/api';

const ALERT_TIMEOUT = 3000;

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [partsData, setPartsData] = useState({
    inventoryItemId: '',
    quantity: 1
  });
  const [laborData, setLaborData] = useState({
    description: '',
    cost: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchJobs();
    fetchInventory();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await mechanicService.getMyJobs();
      const myJobs = response.data.jobs || response.data.appointments || [];
      setJobs(myJobs);
      
      setStats({
        total: myJobs.length,
        scheduled: myJobs.filter(j => j.status === 'Scheduled').length,
        inProgress: myJobs.filter(j => j.status === 'In Progress').length,
        completed: myJobs.filter(j => j.status === 'Completed').length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryService.getAll();
      setInventory(response.data.items || response.data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleStartJob = async (id) => {
    setActionLoading(true);
    try {
      await mechanicService.startJob(id);
      setSuccess('Job started successfully!');
      fetchJobs();
      setTimeout(() => setSuccess(''), ALERT_TIMEOUT);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start job');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishJob = async (id) => {
    if (!window.confirm('Are you sure you want to mark this job as finished?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await mechanicService.finishJob(id);
      setSuccess('Job completed successfully!');
      fetchJobs();
      setTimeout(() => setSuccess(''), ALERT_TIMEOUT);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to complete job');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParts = async (e) => {
    e.preventDefault();
    
    const partDetails = getSelectedPartDetails();
    if (!partDetails) {
      setError('Please select a valid part');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
      return;
    }

    const totalCost = partsData.quantity * partDetails.price;
    
    // Confirm for expensive parts
    if (totalCost > 10000) {
      if (!window.confirm(`This will cost Rs. ${totalCost.toFixed(2)}. Are you sure?`)) {
        return;
      }
    }

    try {
      await mechanicService.addParts(selectedJob._id, partsData);
      setSuccess('Parts added successfully!');
      setShowPartsModal(false);
      setPartsData({ inventoryItemId: '', quantity: 1 });
      fetchJobs();
      fetchInventory();
      setTimeout(() => setSuccess(''), ALERT_TIMEOUT);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add parts');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
    }
  };

  const handleAddLabor = async (e) => {
    e.preventDefault();
    
    if (laborData.cost <= 0) {
      setError('Labor cost must be greater than 0');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
      return;
    }

    try {
      await mechanicService.addLabor(selectedJob._id, laborData);
      setSuccess('Labor charges added successfully!');
      setShowLaborModal(false);
      setLaborData({ description: '', cost: 0 });
      fetchJobs();
      setTimeout(() => setSuccess(''), ALERT_TIMEOUT);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add labor charges');
      setTimeout(() => setError(''), ALERT_TIMEOUT);
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

  const openPartsModal = (job) => {
    setSelectedJob(job);
    setShowPartsModal(true);
  };

  const openLaborModal = (job) => {
    setSelectedJob(job);
    setShowLaborModal(true);
  };

  const getSelectedPartDetails = () => {
    const item = inventory.find(i => i._id === partsData.inventoryItemId);
    if (!item) return null;
    return {
      name: item.name || item.partName,
      price: item.salePrice || item.price,
      available: item.quantity
    };
  };

  if (loading) return <div className="loading">Loading jobs...</div>;

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Mechanic Dashboard</h2>
        <p>Welcome back, {user.name}</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Jobs</p>
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

      {/* Jobs List */}
      <div className="card">
        <h3 className="card-header">🔧 My Jobs</h3>
        
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: '#666' }}>No jobs assigned yet</h3>
            <p style={{ color: '#999' }}>Your assigned jobs will appear here</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {jobs.map((job) => (
              <div key={job._id} className="card" style={{ background: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#667eea', margin: 0 }}>
                    {job.serviceType}
                  </h3>
                  <span className={`badge ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p><strong>Customer:</strong> {job.customer?.name}</p>
                  <p><strong>Vehicle:</strong> {job.vehicle?.make} {job.vehicle?.model}</p>
                  <p><strong>Registration:</strong> {job.vehicle?.vehicleNo}</p>
                  <p><strong>Date:</strong> {job.date}</p>
                  <p><strong>Time:</strong> {job.time}</p>
                  
                  {/* FIXED: Changed from job.notes to job.description */}
                  {job.description && (
                    <p style={{ marginTop: '0.5rem' }}>
                      <strong>Notes:</strong><br />
                      <small>{job.description}</small>
                    </p>
                  )}

                  {job.partsUsed && job.partsUsed.length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '5px' }}>
                      <strong>Parts Used:</strong>
                      {job.partsUsed.map((part, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem', color: '#666' }}>
                          • {part.name} (x{part.quantity}) - Rs. {(part.salePrice * part.quantity).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  )}

                  {job.laborItems && job.laborItems.length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '5px' }}>
                      <strong>Labor Charges:</strong>
                      {job.laborItems.map((labor, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem', color: '#666' }}>
                          • {labor.description} - Rs. {labor.cost.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.status === 'Scheduled' && (
                    <button 
                      className="btn btn-success btn-small"
                      onClick={() => handleStartJob(job._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Starting...' : '▶️ Start Job'}
                    </button>
                  )}

                  {job.status === 'In Progress' && (
                    <>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => openPartsModal(job)}
                        disabled={actionLoading}
                      >
                        🔧 Add Parts
                      </button>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => openLaborModal(job)}
                        disabled={actionLoading}
                      >
                        ⏱️ Add Labor
                      </button>
                      <button 
                        className="btn btn-success btn-small"
                        onClick={() => handleFinishJob(job._id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Finishing...' : '✅ Finish Job'}
                      </button>
                    </>
                  )}
                </div>

                <small style={{ display: 'block', marginTop: '1rem', color: '#999' }}>
                  Assigned: {new Date(job.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Parts Modal */}
      {showPartsModal && (
        <div className="modal-overlay" onClick={() => setShowPartsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowPartsModal(false)}>×</span>
            <h3>🔧 Add Parts from Inventory</h3>
            
            {inventory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <p>No parts available in inventory</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Contact the manager to add parts to inventory</p>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setShowPartsModal(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddParts}>
                <div className="form-group">
                  <label>Select Part from Inventory *</label>
                  <select
                    value={partsData.inventoryItemId}
                    onChange={(e) => setPartsData({...partsData, inventoryItemId: e.target.value})}
                    required
                  >
                    <option value="">Choose a part...</option>
                    {inventory.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name || item.partName} - Rs. {item.salePrice || item.price} (Stock: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedPartDetails() && (
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', marginBottom: '1rem' }}>
                    <p><strong>Part:</strong> {getSelectedPartDetails().name}</p>
                    <p><strong>Unit Price:</strong> Rs. {getSelectedPartDetails().price.toFixed(2)}</p>
                    <p><strong>Available Stock:</strong> {getSelectedPartDetails().available} units</p>
                  </div>
                )}

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={partsData.quantity}
                    onChange={(e) => setPartsData({...partsData, quantity: parseInt(e.target.value) || 1})}
                    required
                    min="1"
                    max={getSelectedPartDetails()?.available || 999}
                  />
                </div>

                {getSelectedPartDetails() && (() => {
                  const details = getSelectedPartDetails();
                  const totalCost = partsData.quantity * details.price;
                  return (
                    <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '5px', marginBottom: '1rem' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#667eea' }}>
                        Total Cost: Rs. {totalCost.toFixed(2)}
                      </p>
                      {totalCost > 10000 && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#f39c12' }}>
                          ⚠️ High value - confirmation will be required
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={!partsData.inventoryItemId}>
                    ✅ Add Parts
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowPartsModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Labor Modal */}
      {showLaborModal && (
        <div className="modal-overlay" onClick={() => setShowLaborModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowLaborModal(false)}>×</span>
            <h3>⏱️ Add Labor Charges</h3>
            
            <form onSubmit={handleAddLabor}>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={laborData.description}
                  onChange={(e) => setLaborData({...laborData, description: e.target.value})}
                  required
                  placeholder="e.g., Engine diagnosis and repair"
                />
              </div>

              <div className="form-group">
                <label>Total Labor Cost (Rs.) *</label>
                <input
                  type="number"
                  value={laborData.cost}
                  onChange={(e) => setLaborData({...laborData, cost: parseFloat(e.target.value) || 0})}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter total labor cost"
                />
              </div>

              <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', marginBottom: '1rem' }}>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                  💡 Enter the total cost for this labor service. This could be based on hours worked, complexity, or flat rate.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={laborData.cost <= 0}>
                  ✅ Add Labor
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowLaborModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;