import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  appointmentService, 
  managerService, 
  inventoryService,
  feedbackService,
  complaintService,
} from '../services/api';
import Reports from './Reports';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [complaints, setComplaints] = useState([]); // NEW
  const [complaintStats, setComplaintStats] = useState(null); // NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Inventory Modal State
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    partNumber: '',
    supplier: '',
    quantity: 0,
    unit: 'units',
    costPrice: 0,
    salePrice: 0,
    lowStockThreshold: 5
  });

  // Complaint Response Modal State (NEW)
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintResponse, setComplaintResponse] = useState({
    status: '',
    response: '',
    priority: '',
  });
  
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

      if (activeTab === 'complaints') { // NEW
        const [complaintsRes, statsRes] = await Promise.all([
          complaintService.getAll(),
          complaintService.getStats(),
        ]);
        setComplaints(complaintsRes.data.complaints || []);
        setComplaintStats(statsRes.data.stats || null);
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

  // Inventory Modal Functions
  const openInventoryModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setInventoryForm({
        name: item.name,
        partNumber: item.partNumber || '',
        supplier: item.supplier || '',
        quantity: item.quantity,
        unit: item.unit,
        costPrice: item.costPrice,
        salePrice: item.salePrice,
        lowStockThreshold: item.lowStockThreshold
      });
    } else {
      setEditingItem(null);
      setInventoryForm({
        name: '',
        partNumber: '',
        supplier: '',
        quantity: 0,
        unit: 'units',
        costPrice: 0,
        salePrice: 0,
        lowStockThreshold: 5
      });
    }
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setEditingItem(null);
    setInventoryForm({
      name: '',
      partNumber: '',
      supplier: '',
      quantity: 0,
      unit: 'units',
      costPrice: 0,
      salePrice: 0,
      lowStockThreshold: 5
    });
  };

  const handleInventorySubmit = async () => {
    setError('');
    setSuccess('');

    if (!inventoryForm.name || !inventoryForm.costPrice || !inventoryForm.salePrice) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      if (editingItem) {
        await inventoryService.update(editingItem._id, inventoryForm);
        setSuccess('Item updated successfully!');
      } else {
        await inventoryService.create(inventoryForm);
        setSuccess('Item added successfully!');
      }
      
      closeInventoryModal();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save item');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryService.delete(id);
      setSuccess('Item deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete item');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Complaint Management Functions (NEW)
  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setComplaintResponse({
      status: complaint.status,
      response: complaint.response || '',
      priority: complaint.priority,
    });
    setShowComplaintModal(true);
  };

  const closeComplaintModal = () => {
    setShowComplaintModal(false);
    setSelectedComplaint(null);
    setComplaintResponse({
      status: '',
      response: '',
      priority: '',
    });
  };

  const handleComplaintUpdate = async () => {
    if (!complaintResponse.response && complaintResponse.status === selectedComplaint.status) {
      setError('Please add a response or change the status');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await complaintService.update(selectedComplaint._id, complaintResponse);
      setSuccess('Complaint updated successfully! Customer will be notified.');
      closeComplaintModal();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update complaint');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      await complaintService.delete(id);
      setSuccess('Complaint deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete complaint');
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

  const getComplaintStatusBadge = (status) => { // NEW
    const badges = {
      'Open': 'badge-warning',
      'In Review': 'badge-info',
      'Resolved': 'badge-success',
      'Closed': 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  const getPriorityBadge = (priority) => { // NEW
    const badges = {
      'Low': 'badge-info',
      'Medium': 'badge-warning',
      'High': 'badge-danger',
      'Urgent': 'badge-danger'
    };
    return badges[priority] || 'badge-info';
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
        <button 
        className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
        onClick={() => setActiveTab('reports')}
        >
        📊 Reports
        </button>
        <button 
          className={`btn ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('complaints')}
        >
          📝 Complaints
          {complaintStats && complaintStats.byStatus.open > 0 && (
            <span style={{ 
              marginLeft: '0.5rem', 
              background: '#f39c12', 
              color: 'white',
              padding: '0.2rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.8rem'
            }}>
              {complaintStats.byStatus.open}
            </span>
          )}
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
                      <td>{apt.assignedMechanic?.name || 'Unassigned'}</td>
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
                    <td>{apt.assignedMechanic?.name || '-'}</td>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-header" style={{ marginBottom: 0 }}>Inventory Management</h3>
            <button 
              className="btn btn-primary"
              onClick={() => openInventoryModal()}
            >
              ➕ Add New Item
            </button>
          </div>
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading inventory...</p>
          ) : inventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <h3>No inventory items yet</h3>
              <p>Start by adding your first inventory item</p>
              <button 
                className="btn btn-primary"
                onClick={() => openInventoryModal()}
                style={{ marginTop: '1rem' }}
              >
                Add First Item
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Part Number</th>
                  <th>Quantity</th>
                  <th>Cost Price</th>
                  <th>Sale Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.supplier && (
                        <>
                          <br />
                          <small style={{ color: '#666' }}>Supplier: {item.supplier}</small>
                        </>
                      )}
                    </td>
                    <td>{item.partNumber || '-'}</td>
                    <td>
                      {item.quantity} {item.unit}
                      {item.quantity <= item.lowStockThreshold && (
                        <>
                          <br />
                          <small style={{ color: '#f39c12' }}>⚠️ Low Stock</small>
                        </>
                      )}
                    </td>
                    <td>Rs. {item.costPrice.toFixed(2)}</td>
                    <td>Rs. {item.salePrice.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${item.quantity > item.lowStockThreshold ? 'badge-success' : 'badge-warning'}`}>
                        {item.quantity > item.lowStockThreshold ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={() => openInventoryModal(item)}
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteItem(item._id)}
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
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
                  {fb.appointment?.assignedMechanic && (
                    <small style={{ color: '#999' }}>Mechanic: {fb.appointment.assignedMechanic.name}</small>
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

      {/* Complaints Tab (NEW) */}
      {activeTab === 'complaints' && (
        <>
          {/* Complaint Stats */}
          {complaintStats && (
            <div className="stats">
              <div className="stat-card">
                <h3>{complaintStats.total}</h3>
                <p>Total Complaints</p>
              </div>
              <div className="stat-card">
                <h3 style={{ color: '#f39c12' }}>{complaintStats.byStatus.open}</h3>
                <p>Open</p>
              </div>
              <div className="stat-card">
                <h3>{complaintStats.byStatus.inReview}</h3>
                <p>In Review</p>
              </div>
              <div className="stat-card">
                <h3 style={{ color: '#27ae60' }}>{complaintStats.byStatus.resolved}</h3>
                <p>Resolved</p>
              </div>
            </div>
          )}

          {/* Complaints List */}
          <div className="card">
            <h3 className="card-header">Customer Complaints</h3>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
            ) : complaints.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No complaints yet</p>
            ) : (
              <div className="grid grid-2">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="card" style={{ background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#667eea' }}>{complaint.subject}</strong>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className={`badge ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        <span className={`badge ${getComplaintStatusBadge(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.5rem' }}>
                      <strong>From:</strong> {complaint.customer?.name} ({complaint.customer?.email})
                    </p>

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
                        marginTop: '0.75rem', 
                        padding: '0.5rem', 
                        background: '#e7f3ff', 
                        borderLeft: '3px solid #667eea',
                        borderRadius: '4px'
                      }}>
                        <strong style={{ fontSize: '0.85rem', color: '#667eea' }}>Your Response:</strong>
                        <p style={{ fontSize: '0.85rem', color: '#555', margin: '0.25rem 0 0 0' }}>
                          {complaint.response}
                        </p>
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #ddd'
                    }}>
                      <button 
                        className="btn btn-primary btn-small"
                        onClick={() => openComplaintModal(complaint)}
                      >
                        {complaint.response ? '✏️ Update' : '📝 Respond'}
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteComplaint(complaint._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#999' }}>
                      Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && <Reports />}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-overlay" onClick={closeInventoryModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <span className="modal-close" onClick={closeInventoryModal}>×</span>
            <h3 style={{ marginBottom: '1.5rem' }}>
              {editingItem ? '✏️ Edit Inventory Item' : '➕ Add New Inventory Item'}
            </h3>
            
            <div>
              <div className="form-group">
                <label>Item Name * <small style={{ color: '#999' }}>(Required)</small></label>
                <input
                  type="text"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                  placeholder="e.g., Engine Oil 5W-30, Brake Pads"
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Part Number <small style={{ color: '#999' }}>(Optional)</small></label>
                  <input
                    type="text"
                    value={inventoryForm.partNumber}
                    onChange={(e) => setInventoryForm({...inventoryForm, partNumber: e.target.value})}
                    placeholder="e.g., BP-123"
                  />
                </div>

                <div className="form-group">
                  <label>Supplier <small style={{ color: '#999' }}>(Optional)</small></label>
                  <input
                    type="text"
                    value={inventoryForm.supplier}
                    onChange={(e) => setInventoryForm({...inventoryForm, supplier: e.target.value})}
                    placeholder="e.g., ABC Parts Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Quantity * <small style={{ color: '#999' }}>(Required)</small></label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({...inventoryForm, quantity: parseInt(e.target.value) || 0})}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Unit * <small style={{ color: '#999' }}>(Required)</small></label>
                  <select
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({...inventoryForm, unit: e.target.value})}
                  >
                    <option value="units">Units</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="sets">Sets</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Cost Price (Rs.) * <small style={{ color: '#999' }}>(Required)</small></label>
                  <input
                    type="number"
                    value={inventoryForm.costPrice}
                    onChange={(e) => setInventoryForm({...inventoryForm, costPrice: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Sale Price (Rs.) * <small style={{ color: '#999' }}>(Required)</small></label>
                  <input
                    type="number"
                    value={inventoryForm.salePrice}
                    onChange={(e) => setInventoryForm({...inventoryForm, salePrice: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {inventoryForm.costPrice > 0 && inventoryForm.salePrice > 0 && (
                    <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                      Profit: Rs. {(inventoryForm.salePrice - inventoryForm.costPrice).toFixed(2)} 
                      ({(((inventoryForm.salePrice - inventoryForm.costPrice) / inventoryForm.costPrice) * 100).toFixed(1)}%)
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Low Stock Threshold * <small style={{ color: '#999' }}>(Alert when stock falls below this)</small></label>
                <input
                  type="number"
                  value={inventoryForm.lowStockThreshold}
                  onChange={(e) => setInventoryForm({...inventoryForm, lowStockThreshold: parseInt(e.target.value) || 5})}
                  min="0"
                  placeholder="5"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleInventorySubmit}
                >
                  {editingItem ? '✅ Update Item' : '➕ Add Item'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={closeInventoryModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Response Modal (NEW) */}
      {showComplaintModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeComplaintModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <span className="modal-close" onClick={closeComplaintModal}>×</span>
            <h3 style={{ marginBottom: '1.5rem' }}>📝 Respond to Complaint</h3>
            
            {/* Complaint Details */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>{selectedComplaint.subject}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{selectedComplaint.description}</p>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                <strong>From:</strong> {selectedComplaint.customer?.name} ({selectedComplaint.customer?.email})
              </p>
            </div>

            <div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={complaintResponse.status}
                    onChange={(e) => setComplaintResponse({...complaintResponse, status: e.target.value})}
                  >
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={complaintResponse.priority}
                    onChange={(e) => setComplaintResponse({...complaintResponse, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Your Response *</label>
                <textarea
                  value={complaintResponse.response}
                  onChange={(e) => setComplaintResponse({...complaintResponse, response: e.target.value})}
                  rows="6"
                  placeholder="Type your response to the customer..."
                />
              </div>

              <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                <strong>💡 Note:</strong> The customer will receive an email notification with your response.
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleComplaintUpdate}
                >
                  ✅ Send Response
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={closeComplaintModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;