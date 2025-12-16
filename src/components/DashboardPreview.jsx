import React from "react";
import "./DashboardPreview.css";

export default function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      {/* Mobile Device Frame */}
      <div className="device-frame">
        <div className="device-notch"></div>

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-brand">
            <i className="fas fa-compass"></i>
            <span>CashCompass</span>
          </div>
          <div className="header-icon">
            <i className="fas fa-bell"></i>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card stat-card-1">
            <div className="stat-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="stat-value">₹24.8K</div>
            <div className="stat-label">BALANCE</div>
          </div>
          <div className="stat-card stat-card-2">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-value">92%</div>
            <div className="stat-label">HEALTH</div>
          </div>
        </div>

        {/* Alert Card */}
        <div className="alert-card">
          <div className="alert-header">
            <div className="alert-badge">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Alert</span>
            </div>
            <div className="alert-time">2 min ago</div>
          </div>
          <div className="alert-title">Budget Warning</div>
          <div className="alert-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "87%" }}></div>
            </div>
            <span className="progress-value">87%</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-title">WEEKLY ACTIVITY</div>
            <div className="bar-chart-wrapper">
              <div className="bar-item" style={{ height: "45%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "70%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "55%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "85%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "60%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "75%" }}>
                <div className="bar-fill"></div>
              </div>
              <div className="bar-item" style={{ height: "50%" }}>
                <div className="bar-fill"></div>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-title">BUDGET STATUS</div>
            <div className="donut-chart">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  transform="rotate(-90 50 50)"
                  className="donut-fill"
                />
              </svg>
              <div className="donut-value">75%</div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot healthy"></span>
                <span>On Track</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot risk"></span>
                <span>At Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="activity-header">RECENT ACTIVITY</div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success">
                <i className="fas fa-check"></i>
              </div>
              <div className="activity-details">
                <div className="activity-text">Salary credited - ₹45,000</div>
                <div className="activity-meta">10m</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="activity-details">
                <div className="activity-text">High spending detected</div>
                <div className="activity-meta">2h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
