import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashboardSidebar.css";

const DashboardSidebar = ({
  user,
  onLogout,
  isCollapsed,
  onCollapseToggle,
}) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: "fa-th-large", path: "/dashboard" },
    {
      name: "Transactions",
      icon: "fa-exchange-alt",
      path: "/dashboard/transactions",
    },
    { name: "Budgets", icon: "fa-wallet", path: "/dashboard/budgets" },
    { name: "AI Buddy", icon: "fa-robot", path: "/dashboard/chatbot" },
    {
      name: "Crisis Alerts",
      icon: "fa-bell",
      path: "/dashboard/alerts",
      badge: 2,
    },
    { name: "Goals", icon: "fa-bullseye", path: "/dashboard/goals" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`dashboard-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="fas fa-compass"></i>
        </div>
        <span className="logo-text">CashCompass</span>
        <button
          className="collapse-btn"
          onClick={onCollapseToggle}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"}`}></i>
        </button>
      </div>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="user-info">
          <h4>{user?.name || "User"}</h4>
          <div className="user-status">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              title={item.name}
            >
              <span className="nav-icon">
                <i className={`fas ${item.icon}`}></i>
              </span>
              <span className="nav-text">{item.name}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {isActive(item.path) && (
                <span className="active-indicator"></span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Quick Stats Card */}
      <div className="sidebar-stats">
        <div className="stats-card">
          <div className="stats-header">
            <i className="fas fa-chart-pie"></i>
            <span>Monthly Budget</span>
          </div>
          <div className="stats-progress">
            <div className="progress-bar" style={{ width: "68%" }}></div>
          </div>
          <div className="stats-info">
            <span className="stats-amount">₹17,000</span>
            <span className="stats-total">of ₹25,000</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <Link
          to="/dashboard/settings"
          className={`nav-item ${
            isActive("/dashboard/settings") ? "active" : ""
          }`}
          title="Settings"
        >
          <span className="nav-icon">
            <i className="fas fa-cog"></i>
          </span>
          <span className="nav-text">Settings</span>
        </Link>

        <button onClick={onLogout} className="logout-btn" title="Logout">
          <span className="nav-icon">
            <i className="fas fa-sign-out-alt"></i>
          </span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
