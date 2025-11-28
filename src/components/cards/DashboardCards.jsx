import React from "react";
import "./DashboardCards.css";

export const MaxSpentCard = ({ category, amount, icon }) => {
  return (
    <div className="dashboard-card max-spent-card">
      <div className="card-icon-wrapper max-spent-icon">
        <i className="fas fa-chart-pie"></i>
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3>Max Spent Category</h3>
          <span className="card-badge">{category || "N/A"}</span>
        </div>
        <p className="card-value">₹{amount?.toLocaleString() || "0"}</p>
        <div className="card-footer">
          <span className="card-trend neutral">
            <i className="fas fa-tag"></i>
            Top expense this month
          </span>
        </div>
      </div>
      <div className="card-glow"></div>
    </div>
  );
};

export const CrisisPercentageCard = ({ percentage }) => {
  const getCrisisLevel = (percent) => {
    if (percent >= 70)
      return {
        level: "High Risk",
        color: "red",
        icon: "fa-exclamation-triangle",
      };
    if (percent >= 40)
      return {
        level: "Medium",
        color: "yellow",
        icon: "fa-exclamation-circle",
      };
    return { level: "Safe", color: "green", icon: "fa-shield-alt" };
  };

  const crisis = getCrisisLevel(percentage || 0);

  return (
    <div className={`dashboard-card crisis-card crisis-${crisis.color}`}>
      <div className={`card-icon-wrapper crisis-icon-${crisis.color}`}>
        <i className={`fas ${crisis.icon}`}></i>
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3>Crisis Score</h3>
          <span className={`status-dot ${crisis.color}`}></span>
        </div>
        <p className="card-value">{crisis.level}</p>
        <div className="card-footer">
          <span className={`card-trend ${crisis.color}`}>
            <i className="fas fa-chart-line"></i>
            {percentage || 0}% risk level
          </span>
        </div>
      </div>
      <div className="card-glow"></div>
    </div>
  );
};

export const SpentVsTargetCard = ({ spent, target }) => {
  const percentage = target ? Math.round((spent / target) * 100) : 0;
  const isOverBudget = percentage > 100;

  return (
    <div
      className={`dashboard-card spent-target-card ${
        isOverBudget ? "over-budget-card" : ""
      }`}
    >
      <div
        className={`card-icon-wrapper ${
          isOverBudget ? "expense-icon-red" : "expense-icon"
        }`}
      >
        <i className="fas fa-wallet"></i>
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3>Monthly Expenses</h3>
          <span
            className={`percentage-badge ${isOverBudget ? "over" : "under"}`}
          >
            {percentage}%
          </span>
        </div>
        <p className="card-value">₹{spent?.toLocaleString() || "0"}</p>
        <div className="progress-wrapper">
          <div className="progress-bar-container">
            <div
              className={`progress-bar ${isOverBudget ? "over-budget" : ""}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>
          <span className="progress-label">
            of ₹{target?.toLocaleString() || "0"} budget
          </span>
        </div>
      </div>
      <div className="card-glow"></div>
    </div>
  );
};

export const MoneySavedCard = ({ amount, change }) => {
  return (
    <div className="dashboard-card money-saved-card">
      <div className="card-icon-wrapper savings-icon">
        <i className="fas fa-piggy-bank"></i>
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3>Money Saved</h3>
        </div>
        <p className="card-value">₹{amount?.toLocaleString() || "0"}</p>
        <div className="card-footer">
          <span
            className={`card-trend ${change >= 0 ? "positive" : "negative"}`}
          >
            <i
              className={`fas ${change >= 0 ? "fa-arrow-up" : "fa-arrow-down"}`}
            ></i>
            {change >= 0 ? "+" : ""}
            {change}% this month
          </span>
        </div>
      </div>
      <div className="card-glow"></div>
    </div>
  );
};
