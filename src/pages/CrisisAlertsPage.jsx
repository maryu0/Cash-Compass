import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./CrisisAlertsPage.css";

const CrisisAlertsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [riskScore, setRiskScore] = useState(0);

  // Mock alerts data
  const mockAlerts = [
    {
      id: 1,
      type: "critical",
      title: "High Spending Alert",
      message:
        "Your spending this week is 45% above your budget. Consider reviewing your expenses.",
      category: "Overspending",
      amount: "₹8,500",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      isRead: false,
      isResolved: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Unusual Transaction Detected",
      message:
        "A large transaction of ₹15,000 was made in Entertainment category.",
      category: "Unusual Activity",
      amount: "₹15,000",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
      isResolved: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Budget Limit Approaching",
      message:
        "You've used 85% of your monthly food budget with 10 days remaining.",
      category: "Budget",
      amount: "₹4,250",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      isRead: true,
      isResolved: false,
    },
    {
      id: 4,
      type: "info",
      title: "Subscription Renewal",
      message: "Your Netflix subscription of ₹649 will be renewed in 3 days.",
      category: "Recurring",
      amount: "₹649",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      isResolved: false,
    },
    {
      id: 5,
      type: "critical",
      title: "Emergency Fund Low",
      message:
        "Your emergency fund is below the recommended 3-month expense coverage.",
      category: "Savings",
      amount: "₹25,000",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      isRead: true,
      isResolved: false,
    },
    {
      id: 6,
      type: "info",
      title: "Goal Milestone Reached",
      message:
        "Congratulations! You've reached 50% of your vacation savings goal.",
      category: "Goals",
      amount: "₹10,000",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      isRead: true,
      isResolved: true,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Fetch alerts from API
    fetchAlerts(token);
  }, [navigate]);

  const fetchAlerts = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const apiAlerts = result.data.map((alert) => ({
            id: alert._id,
            type: alert.type || "warning",
            title: alert.title,
            message: alert.message,
            category: alert.category || "Budget",
            amount:
              typeof alert.amount === "number"
                ? `₹${Math.abs(alert.amount).toLocaleString()}`
                : alert.amount,
            threshold: alert.threshold,
            timestamp: new Date(
              alert.createdAt || alert.timestamp
            ).toISOString(),
            isRead: alert.isRead || false,
            isResolved: alert.isResolved || false,
          }));

          setAlerts(apiAlerts);
          calculateRiskScore(apiAlerts);
        }
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to localStorage if API fails
      const savedAlerts = localStorage.getItem("crisisAlerts");
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
        calculateRiskScore(JSON.parse(savedAlerts));
      } else {
        setAlerts(mockAlerts);
        calculateRiskScore(mockAlerts);
      }
    }
  };

  const calculateRiskScore = (alertsList) => {
    const activeAlerts = alertsList.filter((a) => !a.isResolved);
    const criticalCount = activeAlerts.filter(
      (a) => a.type === "critical"
    ).length;
    const warningCount = activeAlerts.filter(
      (a) => a.type === "warning"
    ).length;
    const score = Math.min(100, criticalCount * 30 + warningCount * 15 + 20);
    setRiskScore(score);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("uploadedTransactions");
    navigate("/login");
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return "fa-exclamation-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "info":
        return "fa-info-circle";
      default:
        return "fa-bell";
    }
  };

  const markAsRead = (alertId) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem("crisisAlerts", JSON.stringify(updatedAlerts));
  };

  const resolveAlert = (alertId) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId
        ? { ...alert, isResolved: true, isRead: true }
        : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem("crisisAlerts", JSON.stringify(updatedAlerts));
    calculateRiskScore(updatedAlerts);
  };

  const dismissAlert = (alertId) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
    setAlerts(updatedAlerts);
    localStorage.setItem("crisisAlerts", JSON.stringify(updatedAlerts));
    calculateRiskScore(updatedAlerts);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === "all") return !alert.isResolved;
    if (activeFilter === "critical")
      return alert.type === "critical" && !alert.isResolved;
    if (activeFilter === "warning")
      return alert.type === "warning" && !alert.isResolved;
    if (activeFilter === "info")
      return alert.type === "info" && !alert.isResolved;
    if (activeFilter === "resolved") return alert.isResolved;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead && !a.isResolved).length;
  const criticalCount = alerts.filter(
    (a) => a.type === "critical" && !a.isResolved
  ).length;
  const warningCount = alerts.filter(
    (a) => a.type === "warning" && !a.isResolved
  ).length;

  const getRiskLevel = () => {
    if (riskScore >= 70) return { level: "High", color: "#ef4444" };
    if (riskScore >= 40) return { level: "Medium", color: "#f59e0b" };
    return { level: "Low", color: "#10b981" };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`dashboard-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="alerts-container">
          {/* Header */}
          <div className="alerts-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-bell"></i>
                Crisis Alerts
              </h1>
              <p className="header-subtitle">
                Monitor and manage your financial alerts
              </p>
            </div>
            <div className="header-right">
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="alerts-stats">
            {/* Risk Score Gauge */}
            <div className="stat-card risk-gauge-card">
              <div className="risk-gauge">
                <svg viewBox="0 0 120 120" className="gauge-svg">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={riskLevel.color}
                    strokeWidth="12"
                    strokeDasharray={`${(riskScore / 100) * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    className="gauge-progress"
                  />
                </svg>
                <div className="gauge-center">
                  <span className="gauge-value">{riskScore}</span>
                  <span className="gauge-label">Risk Score</span>
                </div>
              </div>
              <div className="risk-info">
                <span className="risk-level" style={{ color: riskLevel.color }}>
                  {riskLevel.level} Risk
                </span>
                <p className="risk-description">
                  {riskScore >= 70
                    ? "Immediate attention required"
                    : riskScore >= 40
                    ? "Review recommended"
                    : "Your finances are healthy"}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="stat-card">
              <div className="stat-icon critical">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{criticalCount}</span>
                <span className="stat-label">Critical Alerts</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{warningCount}</span>
                <span className="stat-label">Warnings</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon resolved">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {alerts.filter((a) => a.isResolved).length}
                </span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="alerts-filters">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              <i className="fas fa-list"></i>
              All Active
            </button>
            <button
              className={`filter-btn critical ${
                activeFilter === "critical" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("critical")}
            >
              <i className="fas fa-exclamation-circle"></i>
              Critical
            </button>
            <button
              className={`filter-btn warning ${
                activeFilter === "warning" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("warning")}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Warnings
            </button>
            <button
              className={`filter-btn info ${
                activeFilter === "info" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("info")}
            >
              <i className="fas fa-info-circle"></i>
              Info
            </button>
            <button
              className={`filter-btn resolved ${
                activeFilter === "resolved" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("resolved")}
            >
              <i className="fas fa-check-circle"></i>
              Resolved
            </button>
          </div>

          {/* Alerts List */}
          <div className="alerts-list">
            {filteredAlerts.length === 0 ? (
              <div className="no-alerts">
                <div className="no-alerts-icon">
                  <i className="fas fa-bell-slash"></i>
                </div>
                <h3>No alerts found</h3>
                <p>
                  {activeFilter === "resolved"
                    ? "No resolved alerts yet"
                    : "Great! You have no active alerts in this category"}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-card ${alert.type} ${
                    !alert.isRead ? "unread" : ""
                  } ${alert.isResolved ? "resolved" : ""}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="alert-indicator"></div>

                  <div className="alert-icon">
                    <i className={`fas ${getAlertIcon(alert.type)}`}></i>
                  </div>

                  <div className="alert-content">
                    <div className="alert-header">
                      <h3 className="alert-title">{alert.title}</h3>
                      <span className="alert-time">
                        {getTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <div className="alert-meta">
                      <span className="alert-category">
                        <i className="fas fa-tag"></i>
                        {alert.category}
                      </span>
                      <span className="alert-amount">
                        <i className="fas fa-rupee-sign"></i>
                        {alert.amount}
                      </span>
                    </div>
                  </div>

                  {!alert.isResolved && (
                    <div className="alert-actions">
                      <button
                        className="action-btn resolve"
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveAlert(alert.id);
                        }}
                        title="Mark as resolved"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className="action-btn dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        title="Dismiss"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}

                  {alert.isResolved && (
                    <div className="resolved-badge">
                      <i className="fas fa-check-circle"></i>
                      Resolved
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Tips Section */}
          <div className="alerts-tips">
            <div className="tips-header">
              <i className="fas fa-lightbulb"></i>
              <h3>Financial Tips</h3>
            </div>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">
                  <i className="fas fa-piggy-bank"></i>
                </div>
                <h4>Build Emergency Fund</h4>
                <p>
                  Aim to save 3-6 months of expenses for unexpected situations.
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4>Track Spending Patterns</h4>
                <p>
                  Review your expenses weekly to identify areas to cut back.
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h4>Set Budget Goals</h4>
                <p>
                  Create monthly budgets for each category and stick to them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrisisAlertsPage;
