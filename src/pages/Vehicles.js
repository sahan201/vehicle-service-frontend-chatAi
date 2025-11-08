import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicleNo: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data.vehicles || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle._id, formData);
        setSuccess('Vehicle updated successfully!');
      } else {
        await vehicleService.create(formData);
        setSuccess('Vehicle added successfully!');
      }
      
      fetchVehicles();
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        setSuccess('Vehicle deleted successfully!');
        fetchVehicles();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete vehicle');
      }
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vehicleNo: vehicle.vehicleNo
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vehicleNo: ''
    });
  };

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-header" style={{ marginBottom: 0 }}>My Vehicles</h2>
          <button className="btn btn-primary" onClick={() => openModal()}>
            ➕ Add Vehicle
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No vehicles added yet</h3>
            <p>Click "Add Vehicle" to add your first vehicle</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="card" style={{ background: '#f8f9fa' }}>
                <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
                  {vehicle.make} {vehicle.model}
                </h3>
                <p><strong>Year:</strong> {vehicle.year}</p>
                <p><strong>Registration:</strong> {vehicle.vehicleNo}</p>
                <p><small style={{ color: '#999' }}>Added: {new Date(vehicle.createdAt).toLocaleDateString()}</small></p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => openModal(vehicle)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowModal(false)}>×</span>
            <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                  placeholder="e.g., Toyota, Honda"
                />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                  placeholder="e.g., Corolla, Civic"
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="form-group">
                <label>Vehicle Registration Number</label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  onChange={(e) => setFormData({...formData, vehicleNo: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., ABC1234"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Update' : 'Add'} Vehicle
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
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

export default Vehicles;
