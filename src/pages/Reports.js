import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [bookingStats, setBookingStats] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });

    fetchAllReports(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, []);

  const fetchAllReports = async (start, end) => {
    setLoading(true);
    try {
      const [bookingRes, revenueRes, inventoryRes] = await Promise.all([
        reportService.getBookingStats('month'),
        reportService.getRevenueReport(start, end),
        reportService.getInventoryReport(),
      ]);

      setBookingStats(bookingRes.data);
      setRevenueReport(revenueRes.data);
      setInventoryReport(inventoryRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await reportService.downloadBusinessReport(
        dateRange.startDate,
        dateRange.endDate
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `business-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Report downloaded successfully!');
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
      setLoading(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRefresh = () => {
    fetchAllReports(dateRange.startDate, dateRange.endDate);
  };

  if (loading && !bookingStats) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h2>📊 Business Reports</h2>
        <p>Generate and download comprehensive business analytics</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Report Generator */}
      <div className="card">
        <h3 className="card-header">📥 Download Business Report (PDF)</h3>
        
        <div className="grid grid-2">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn btn-primary"
            onClick={handleDownloadReport}
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '📥 Download Comprehensive Report'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            🔄 Refresh Data
          </button>
        </div>

        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <strong>💡 Report Includes:</strong> Financial summary, appointment statistics, 
          popular services, inventory status, customer satisfaction, and mechanic performance.
        </div>
      </div>

      {/* Quick Stats Overview */}
      {bookingStats && (
        <div className="card">
          <h3 className="card-header">📈 Booking Statistics (Last Month)</h3>
          <div className="stats">
            <div className="stat-card">
              <h3>{bookingStats.stats.total}</h3>
              <p>Total Bookings</p>
            </div>
            <div className="stat-card">
              <h3>{bookingStats.stats.completed}</h3>
              <p>Completed</p>
            </div>
            <div className="stat-card">
              <h3>{bookingStats.stats.inProgress}</h3>
              <p>In Progress</p>
            </div>
            <div className="stat-card">
              <h3>${bookingStats.stats.revenue.toFixed(2)}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {revenueReport && (
        <div className="card">
          <h3 className="card-header">💰 Revenue Report</h3>
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#667eea' }}>Total Revenue</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                ${revenueReport.totalRevenue.toFixed(2)}
              </p>
              <p style={{ color: '#666' }}>
                From {revenueReport.appointmentCount} completed appointments
              </p>
            </div>

            {Object.keys(revenueReport.dailyRevenue).length > 0 && (
              <div>
                <h4 style={{ color: '#667eea', marginTop: '1.5rem' }}>Daily Breakdown</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(revenueReport.dailyRevenue)
                      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                      .slice(0, 10)
                      .map(([date, revenue]) => (
                        <tr key={date}>
                          <td>{new Date(date).toLocaleDateString()}</td>
                          <td>${revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {inventoryReport && (
        <div className="card">
          <h3 className="card-header">📦 Inventory Report</h3>
          <div className="grid grid-2">
            <div style={{ padding: '1rem' }}>
              <h4 style={{ color: '#667eea' }}>Inventory Summary</h4>
              <p><strong>Total Items:</strong> {inventoryReport.stats.totalItems}</p>
              <p><strong>Total Cost Value:</strong> ${inventoryReport.stats.totalCostValue.toFixed(2)}</p>
              <p><strong>Total Sale Value:</strong> ${inventoryReport.stats.totalSaleValue.toFixed(2)}</p>
              <p><strong>Potential Profit:</strong> 
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  {' '}${inventoryReport.stats.potentialProfit.toFixed(2)}
                </span>
              </p>
            </div>

            <div style={{ padding: '1rem' }}>
              <h4 style={{ color: inventoryReport.stats.lowStockCount > 0 ? '#f39c12' : '#27ae60' }}>
                ⚠️ Low Stock Items ({inventoryReport.stats.lowStockCount})
              </h4>
              {inventoryReport.stats.lowStockCount === 0 ? (
                <p style={{ color: '#27ae60' }}>All items are well stocked!</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {inventoryReport.stats.lowStockItems.map((item, idx) => (
                    <div key={idx} style={{ 
                      padding: '0.5rem', 
                      background: '#fff3cd', 
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}>
                      <strong>{item.name}</strong>
                      <br />
                      <small>
                        Stock: {item.quantity} (Threshold: {item.threshold})
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="card">
        <h3 className="card-header">📤 Quick Export Options</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDateRange({ startDate: today, endDate: today });
              setTimeout(() => handleDownloadReport(), 100);
            }}
          >
            📅 Today's Report
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 7);
              setDateRange({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
              });
              setTimeout(() => handleDownloadReport(), 100);
            }}
          >
            📊 Last 7 Days
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 1);
              setDateRange({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
              });
              setTimeout(() => handleDownloadReport(), 100);
            }}
          >
            📈 Last Month
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setFullYear(start.getFullYear() - 1);
              setDateRange({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
              });
              setTimeout(() => handleDownloadReport(), 100);
            }}
          >
            📆 Last Year
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;