import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentService } from "../services/api";

const TrackService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointment();
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(fetchAppointment, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await appointmentService.getById(id);
      setAppointment(response.data.appointment);
      setLoading(false);
    } catch (error) {
      setError("Failed to load appointment details");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Scheduled: "#3498db",
      "In Progress": "#f39c12",
      Completed: "#27ae60",
      Cancelled: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const getProgressPercentage = (status) => {
    const progress = {
      Scheduled: 25,
      "In Progress": 60,
      Completed: 100,
      Cancelled: 0,
    };
    return progress[status] || 0;
  };

  const calculateTotalCost = () => {
    if (!appointment) return 0;

    // If backend already calculated, use that
    if (appointment.finalCost !== undefined) {
      return appointment.finalCost.toFixed(2);
    }

    let total = 0;

    // Add parts cost
    if (appointment.partsUsed) {
      appointment.partsUsed.forEach((part) => {
        total += part.salePrice * part.quantity;
      });
    }

    // Add labor cost
    if (appointment.laborItems) {
      appointment.laborItems.forEach((labor) => {
        total += labor.cost;
      });
    }

    // Apply discount if eligible
    if (appointment.discountEligible) {
      total = total * 0.95; // 5% discount
    }

    return total.toFixed(2);
  };

  if (loading) return <div className="loading">Loading service details...</div>;
  if (error)
    return (
      <div className="container" style={{ paddingTop: "2rem" }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  if (!appointment)
    return (
      <div className="container" style={{ paddingTop: "2rem" }}>
        <div className="alert alert-error">Appointment not found</div>
      </div>
    );

  const progress = getProgressPercentage(appointment.status);
  const statusColor = getStatusColor(appointment.status);

  return (
    <div className="container" style={{ paddingTop: "2rem" }}>
      {/* Header */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className="card-header" style={{ marginBottom: 0 }}>
            🔍 Track Service
          </h2>
          <button
            className="btn btn-secondary btn-small"
            onClick={() => navigate("/customer/appointments")}
          >
            ← Back to Appointments
          </button>
        </div>

        {/* Status Banner */}
        <div
          style={{
            background: statusColor,
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: 0, color: "white" }}>
            Status: {appointment.status}
          </h3>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
            Booking ID: {appointment._id}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              background: "#e0e0e0",
              height: "30px",
              borderRadius: "15px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                background: statusColor,
                width: `${progress}%`,
                height: "100%",
                transition: "width 0.5s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {progress}%
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>
            Service Timeline
          </h3>
          <div style={{ position: "relative", paddingLeft: "2rem" }}>
            {/* Scheduled */}
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-2rem",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#27ae60",
                  border: "3px solid white",
                  boxShadow: "0 0 0 2px #27ae60",
                }}
              ></div>
              <strong style={{ color: "#27ae60" }}>✓ Booking Confirmed</strong>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {new Date(appointment.createdAt).toLocaleString()}
              </p>
            </div>

            {/* In Progress */}
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-2rem",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    appointment.status === "In Progress" ||
                    appointment.status === "Completed"
                      ? "#27ae60"
                      : "#e0e0e0",
                  border: "3px solid white",
                  boxShadow:
                    appointment.status === "In Progress" ||
                    appointment.status === "Completed"
                      ? "0 0 0 2px #27ae60"
                      : "0 0 0 2px #e0e0e0",
                }}
              ></div>
              <strong
                style={{
                  color:
                    appointment.status === "In Progress" ||
                    appointment.status === "Completed"
                      ? "#27ae60"
                      : "#999",
                }}
              >
                {appointment.status === "In Progress" ||
                appointment.status === "Completed"
                  ? "✓"
                  : "○"}{" "}
                Work Started
              </strong>
              {appointment.status === "In Progress" ||
              appointment.status === "Completed" ? (
                <>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      margin: "0.25rem 0 0 0",
                    }}
                  >
                    Mechanic: {appointment.assignedMechanic?.name || "Assigned"}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    color: "#999",
                    fontSize: "0.9rem",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  Waiting to start...
                </p>
              )}
            </div>

            {/* Completed */}
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-2rem",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    appointment.status === "Completed" ? "#27ae60" : "#e0e0e0",
                  border: "3px solid white",
                  boxShadow:
                    appointment.status === "Completed"
                      ? "0 0 0 2px #27ae60"
                      : "0 0 0 2px #e0e0e0",
                }}
              ></div>
              <strong
                style={{
                  color:
                    appointment.status === "Completed" ? "#27ae60" : "#999",
                }}
              >
                {appointment.status === "Completed" ? "✓" : "○"} Service
                Completed
              </strong>
              {appointment.status === "Completed" ? (
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  Your vehicle is ready!
                </p>
              ) : (
                <p
                  style={{
                    color: "#999",
                    fontSize: "0.9rem",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  {appointment.status === "In Progress"
                    ? "Work in progress..."
                    : "Pending"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid grid-2">
        {/* Vehicle & Service Info */}
        <div className="card">
          <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>
            🚗 Service Details
          </h3>
          <div style={{ lineHeight: "1.8" }}>
            <p>
              <strong>Vehicle:</strong> {appointment.vehicle?.make}{" "}
              {appointment.vehicle?.model}
            </p>
            <p>
              <strong>Registration:</strong> {appointment.vehicle?.vehicleNo}
            </p>
            <p>
              <strong>Service Type:</strong> {appointment.serviceType}
            </p>
            <p>
              <strong>Date:</strong> {appointment.date}
            </p>
            <p>
              <strong>Time:</strong> {appointment.time}
            </p>
            {appointment.description && (
              <p>
                <strong>Notes:</strong>
                <br />
                {appointment.description}
              </p>
            )}
            {appointment.discountEligible && (
              <div
                className="alert alert-success"
                style={{ marginTop: "1rem" }}
              >
                🎉 5% Off-peak Discount Applied!
              </div>
            )}
          </div>
        </div>

        {/* Mechanic Info */}
        <div className="card">
          <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>
            👨‍🔧 Mechanic
          </h3>
          {appointment.assignedMechanic ? (
            <div style={{ lineHeight: "1.8" }}>
              <p>
                <strong>Name:</strong> {appointment.assignedMechanic.name}
              </p>
              <p>
                <strong>Email:</strong> {appointment.assignedMechanic.email}
              </p>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "5px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                  {appointment.status === "Scheduled" &&
                    "Your mechanic will contact you before starting"}
                  {appointment.status === "In Progress" &&
                    "Currently working on your vehicle"}
                  {appointment.status === "Completed" &&
                    "Service completed by this mechanic"}
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#999" }}
            >
              <p>Mechanic will be assigned soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Work Details */}
      {(appointment.status === "In Progress" ||
        appointment.status === "Completed") &&
        (appointment.partsUsed?.length > 0 ||
          appointment.laborItems?.length > 0) && (
          <div className="card">
            <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>
              🔧 Work Details
            </h3>

            <div className="grid grid-2">
              {/* Parts Used */}
              <div>
                <h4 style={{ marginBottom: "0.5rem" }}>Parts Used</h4>
                {appointment.partsUsed && appointment.partsUsed.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Part</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointment.partsUsed.map((part, idx) => (
                        <tr key={idx}>
                          <td>{part.name}</td>
                          <td>{part.quantity}</td>
                          <td>Rs. {part.salePrice}</td>
                          <td>
                            Rs. {(part.quantity * part.salePrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p
                    style={{
                      color: "#999",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No parts used yet
                  </p>
                )}
              </div>

              {/* Labor */}
              <div>
                <h4 style={{ marginBottom: "0.5rem" }}>Labor Charges</h4>
                {appointment.laborItems && appointment.laborItems.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointment.laborItems.map((labor, idx) => (
                        <tr key={idx}>
                          <td>{labor.description}</td>
                          <td>Rs. {labor.cost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p
                    style={{
                      color: "#999",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No labor logged yet
                  </p>
                )}
              </div>
            </div>

            {/* Total Cost */}
            {appointment.status === "Completed" && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1.5rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  textAlign: "right",
                }}
              >
                <h3 style={{ color: "#667eea", margin: 0 }}>
                  Total Cost: Rs. {calculateTotalCost()}
                </h3>
                {appointment.discountEligible && (
                  <p
                    style={{
                      color: "#27ae60",
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    (5% discount applied)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      {/* Actions */}
      <div className="card">
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {appointment.status === "Scheduled" && (
            <button
              className="btn btn-danger"
              onClick={() => navigate(`/customer/appointments`)}
            >
              Cancel Appointment
            </button>
          )}

          {appointment.status === "Completed" && (
            <button
              className="btn btn-success"
              onClick={() =>
                navigate(`/customer/feedback?appointment=${appointment._id}`)
              }
            >
              ⭐ Leave Feedback
            </button>
          )}

          <button className="btn btn-primary" onClick={fetchAppointment}>
            🔄 Refresh Status
          </button>
        </div>

        <p style={{ color: "#999", fontSize: "0.85rem", marginTop: "1rem" }}>
          💡 This page auto-refreshes every 30 seconds to show the latest
          updates
        </p>
      </div>
    </div>
  );
};

export default TrackService;
