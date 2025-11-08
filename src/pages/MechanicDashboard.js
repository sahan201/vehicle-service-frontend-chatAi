import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { mechanicService } from "../services/api";

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [partsData, setPartsData] = useState({
    partName: "",
    quantity: 1,
    price: 0,
  });
  const [laborData, setLaborData] = useState({
    description: "",
    hours: 1,
    rate: 500,
  });
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await mechanicService.getMyJobs();
      const myJobs = response.data.jobs || response.data.appointments || [];
      setJobs(myJobs);

      setStats({
        total: myJobs.length,
        scheduled: myJobs.filter((j) => j.status === "Scheduled").length,
        inProgress: myJobs.filter((j) => j.status === "In Progress").length,
        completed: myJobs.filter((j) => j.status === "Completed").length,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs");
      setLoading(false);
    }
  };

  const handleStartJob = async (id) => {
    try {
      await mechanicService.startJob(id);
      setSuccess("Job started successfully!");
      fetchJobs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to start job");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleFinishJob = async (id) => {
    if (
      !window.confirm("Are you sure you want to mark this job as finished?")
    ) {
      return;
    }

    try {
      await mechanicService.finishJob(id);
      setSuccess("Job completed successfully!");
      fetchJobs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to complete job");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddParts = async (e) => {
    e.preventDefault();
    try {
      await mechanicService.addParts(selectedJob._id, partsData);
      setSuccess("Parts added successfully!");
      setShowPartsModal(false);
      setPartsData({ partName: "", quantity: 1, price: 0 });
      fetchJobs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to add parts");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddLabor = async (e) => {
    e.preventDefault();
    try {
      await mechanicService.addLabor(selectedJob._id, laborData);
      setSuccess("Labor charges added successfully!");
      setShowLaborModal(false);
      setLaborData({ description: "", hours: 1, rate: 500 });
      fetchJobs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to add labor charges");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Scheduled: "badge-info",
      "In Progress": "badge-warning",
      Completed: "badge-success",
      Cancelled: "badge-danger",
    };
    return badges[status] || "badge-info";
  };

  const openPartsModal = (job) => {
    setSelectedJob(job);
    setShowPartsModal(true);
  };

  const openLaborModal = (job) => {
    setSelectedJob(job);
    setShowLaborModal(true);
  };

  if (loading) return <div className="loading">Loading jobs...</div>;

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Mechanic Dashboard 👨‍🔧</h2>
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
        <h3 className="card-header">My Jobs</h3>

        {jobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "3rem" }}>
            No jobs assigned yet
          </p>
        ) : (
          <div className="grid grid-2">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="card"
                style={{ background: "#f8f9fa" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1rem",
                  }}
                >
                  <h3 style={{ color: "#667eea", margin: 0 }}>
                    {job.serviceType}
                  </h3>
                  <span className={`badge ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <p>
                    <strong>👤 Customer:</strong> {job.customer?.name}
                  </p>
                  <p>
                    <strong>🚗 Vehicle:</strong> {job.vehicle?.make}{" "}
                    {job.vehicle?.model}
                  </p>
                  <p>
                    <strong>🔢 Reg No:</strong> {job.vehicle?.vehicleNo}
                  </p>
                  <p>
                    <strong>📅 Date:</strong> {job.date}
                  </p>
                  <p>
                    <strong>🕐 Time:</strong> {job.time}
                  </p>

                  {job.description && (
                    <p style={{ marginTop: "0.5rem" }}>
                      <strong>📝 Notes:</strong>
                      <br />
                      <small>{job.description}</small>
                    </p>
                  )}

                  {job.jobCard &&
                    job.jobCard.parts &&
                    job.jobCard.parts.length > 0 && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem",
                          background: "#fff",
                          borderRadius: "5px",
                        }}
                      >
                        <strong>Parts Used:</strong>
                        {job.jobCard.parts.map((part, idx) => (
                          <div
                            key={idx}
                            style={{ fontSize: "0.85rem", color: "#666" }}
                          >
                            • {part.partName} (x{part.quantity}) - Rs.{" "}
                            {part.price * part.quantity}
                          </div>
                        ))}
                      </div>
                    )}

                  {job.jobCard &&
                    job.jobCard.labor &&
                    job.jobCard.labor.length > 0 && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem",
                          background: "#fff",
                          borderRadius: "5px",
                        }}
                      >
                        <strong>Labor:</strong>
                        {job.jobCard.labor.map((labor, idx) => (
                          <div
                            key={idx}
                            style={{ fontSize: "0.85rem", color: "#666" }}
                          >
                            • {labor.description} ({labor.hours}h @ Rs.{" "}
                            {labor.rate}/h)
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {job.status === "Scheduled" && (
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleStartJob(job._id)}
                    >
                      ▶️ Start Job
                    </button>
                  )}

                  {job.status === "In Progress" && (
                    <>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => openPartsModal(job)}
                      >
                        🔧 Add Parts
                      </button>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => openLaborModal(job)}
                      >
                        ⏱️ Add Labor
                      </button>
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleFinishJob(job._id)}
                      >
                        ✅ Finish Job
                      </button>
                    </>
                  )}
                </div>

                <small
                  style={{ display: "block", marginTop: "1rem", color: "#999" }}
                >
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
            <span
              className="modal-close"
              onClick={() => setShowPartsModal(false)}
            >
              ×
            </span>
            <h3>Add Parts</h3>

            <form onSubmit={handleAddParts}>
              <div className="form-group">
                <label>Part Name</label>
                <input
                  type="text"
                  value={partsData.partName}
                  onChange={(e) =>
                    setPartsData({ ...partsData, partName: e.target.value })
                  }
                  required
                  placeholder="e.g., Oil Filter"
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={partsData.quantity}
                  onChange={(e) =>
                    setPartsData({
                      ...partsData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Price per Unit (Rs.)</label>
                <input
                  type="number"
                  value={partsData.price}
                  onChange={(e) =>
                    setPartsData({
                      ...partsData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <p style={{ color: "#666", marginBottom: "1rem" }}>
                <strong>Total:</strong> Rs.{" "}
                {(partsData.quantity * partsData.price).toFixed(2)}
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Add Parts
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
          </div>
        </div>
      )}

      {/* Add Labor Modal */}
      {showLaborModal && (
        <div className="modal-overlay" onClick={() => setShowLaborModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span
              className="modal-close"
              onClick={() => setShowLaborModal(false)}
            >
              ×
            </span>
            <h3>Add Labor Charges</h3>

            <form onSubmit={handleAddLabor}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={laborData.description}
                  onChange={(e) =>
                    setLaborData({ ...laborData, description: e.target.value })
                  }
                  required
                  placeholder="e.g., Engine diagnosis"
                />
              </div>

              <div className="form-group">
                <label>Hours</label>
                <input
                  type="number"
                  value={laborData.hours}
                  onChange={(e) =>
                    setLaborData({
                      ...laborData,
                      hours: parseFloat(e.target.value),
                    })
                  }
                  required
                  min="0.5"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label>Rate per Hour (Rs.)</label>
                <input
                  type="number"
                  value={laborData.rate}
                  onChange={(e) =>
                    setLaborData({
                      ...laborData,
                      rate: parseFloat(e.target.value),
                    })
                  }
                  required
                  min="0"
                  step="1"
                />
              </div>

              <p style={{ color: "#666", marginBottom: "1rem" }}>
                <strong>Total:</strong> Rs.{" "}
                {(laborData.hours * laborData.rate).toFixed(2)}
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Add Labor
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
