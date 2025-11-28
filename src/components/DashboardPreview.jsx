import React from "react";
import "./DashboardPreview.css";

export default function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="dashboard-header">
        <div className="header-controls">
          <div className="control-button"></div>
          <div className="control-button"></div>
          <div className="control-button"></div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="sidebar-item active">
            <i className="fas fa-chart-pie"></i>
            <span>Financial Health</span>
          </div>
          <div className="sidebar-item">
            <i className="fas fa-exchange-alt"></i>
            <span>Income & Spending</span>
          </div>
          <div className="sidebar-item">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Risk Alerts</span>
          </div>
          <div className="sidebar-item">
            <i className="fas fa-comments"></i>
            <span>AI Coach</span>
          </div>
        </div>

        <div className="main-content">
          <div className="content-header">
            <div>
              <h3>Your Financial Health</h3>
              <p className="date-range">Last 30 days of activity</p>
            </div>
            <div className="time-range">
              <span className="period active">1M</span>
              <span className="period">3M</span>
              <span className="period">1Y</span>
              <span className="period">ALL</span>
            </div>
          </div>

          <div className="balance-section">
            <div className="balance-card">
              <p className="label">Available Savings</p>
              <h2>$8,245.30</h2>
              <p className="change positive">
                <i className="fas fa-arrow-up"></i> Strong emergency fund
                building
              </p>
            </div>

            <div className="mini-stats">
              <div className="mini-stat">
                <span className="icon green">
                  <i className="fas fa-plus-circle"></i>
                </span>
                <div>
                  <p className="label">This Month Income</p>
                  <p className="value">$3,850.00</p>
                </div>
              </div>
              <div className="mini-stat">
                <span className="icon red">
                  <i className="fas fa-minus-circle"></i>
                </span>
                <div>
                  <p className="label">Essential Expenses</p>
                  <p className="value">$2,180.00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-placeholder">
              <svg viewBox="0 0 300 120" className="chart">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.01)" />
                  </linearGradient>
                </defs>
                <polyline
                  points="10,90 40,70 70,75 100,50 130,60 160,40 190,55 220,30 250,45 280,25"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <polygon
                  points="10,90 40,70 70,75 100,50 130,60 160,40 190,55 220,30 250,45 280,25 280,120 10,120"
                  fill="url(#gradient)"
                />
              </svg>
            </div>
          </div>

          <div className="portfolio-section">
            <h4>Income Insights & Risk Alerts</h4>
            <div className="holdings-list">
              <div className="holding-item">
                <div className="holding-icon tech">📊</div>
                <div className="holding-info">
                  <p className="name">Income Stability Score</p>
                  <p className="amount">Your income pattern is detected</p>
                </div>
                <div className="holding-value">
                  <p className="amount">Moderate</p>
                  <p className="change positive">Planning for variation</p>
                </div>
              </div>
              <div className="holding-item">
                <div className="holding-icon finance">⚠️</div>
                <div className="holding-info">
                  <p className="name">Risk Alert</p>
                  <p className="amount">Seasonal income dip predicted</p>
                </div>
                <div className="holding-value">
                  <p className="amount">4 weeks ahead</p>
                  <p className="change positive">Adjust budget now</p>
                </div>
              </div>
              <div className="holding-item">
                <div className="holding-icon health">💰</div>
                <div className="holding-info">
                  <p className="name">Smart Savings Nudge</p>
                  <p className="amount">Save $150 this week optimally</p>
                </div>
                <div className="holding-value">
                  <p className="amount">On Track</p>
                  <p className="change positive">Keep it up!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
