import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import {
  MaxSpentCard,
  CrisisPercentageCard,
  SpentVsTargetCard,
  MoneySavedCard,
} from "../components/cards/DashboardCards";
import WeeklySpendingChart from "../components/charts/WeeklySpendingChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import SummarySection from "../components/SummarySection";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [crisisAlerts, setCrisisAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    loadCrisisAlerts();
  }, []);

  const loadCrisisAlerts = () => {
    const savedAlerts = localStorage.getItem("crisisAlerts");
    if (savedAlerts) {
      const alerts = JSON.parse(savedAlerts).filter((a) => !a.isResolved);
      setCrisisAlerts(alerts);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Check authentication
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        navigate("/login");
        return;
      }

      setUser(JSON.parse(userData));

      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:5000/api/user/dashboard', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();

      // Mock data for now
      const mockData = {
        maxSpentCategory: {
          name: "Rent",
          amount: 12000,
          icon: "🏠",
        },
        crisisPercentage: 35,
        spentVsTarget: {
          spent: 21000,
          target: 25000,
        },
        moneySaved: {
          amount: 3000,
          change: 12,
        },
        weeklySpending: [
          { month: "Jul", income: 24000, expenses: 20000 },
          { month: "Aug", income: 26000, expenses: 21000 },
          { month: "Sep", income: 28000, expenses: 19000 },
          { month: "Oct", income: 25000, expenses: 22000 },
          { month: "Nov", income: 30000, expenses: 24000 },
          { month: "Dec", income: 32000, expenses: 26000 },
        ],
        categories: [
          { name: "Food", value: 8000, color: "#f59e0b" },
          { name: "Transport", value: 6000, color: "#10b981" },
          { name: "Entertainment", value: 3000, color: "#8b5cf6" },
          { name: "Rent", value: 12000, color: "#3b82f6" },
          { name: "Others", value: 2000, color: "#06b6d4" },
        ],
        summary: {
          totalSpentThisWeek: 7800,
          crisisAlert: {
            level: "Medium",
            message:
              "Your spending is slightly above normal. Consider reviewing your budget.",
          },
          biggestCategory: {
            name: "Rent",
            amount: 12000,
          },
          insights: [
            "You spent 15% more on food this week compared to last week",
            "Your entertainment expenses are within budget - Great job!",
            "Consider setting aside ₹2,100 for emergency savings this month",
          ],
        },
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
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
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
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
          <div className="error-container">
            <p>Failed to load dashboard data</p>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

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
        {/* Professional Header/Navbar */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-greeting">
              <h1>Dashboard</h1>
              <p className="header-subtitle">
                Welcome back,{" "}
                <span className="user-name">{user?.name || "User"}</span>!
                Here's your financial overview
              </p>
            </div>
          </div>

          <div className="header-center">
            <div className="header-calendar">
              <i className="fas fa-calendar-alt calendar-icon"></i>
              <span className="calendar-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="notification-wrapper">
              <button
                className="header-icon-btn notification-btn"
                title="Notifications"
                onClick={() =>
                  setShowNotificationDropdown(!showNotificationDropdown)
                }
              >
                <i className="fas fa-bell"></i>
                {crisisAlerts.length > 0 && (
                  <span className="notification-badge">
                    {crisisAlerts.length}
                  </span>
                )}
              </button>
              {showNotificationDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h4>Crisis Alerts</h4>
                    <button
                      onClick={() => navigate("/dashboard/alerts")}
                      className="view-all-btn"
                    >
                      View All
                    </button>
                  </div>
                  <div className="notification-dropdown-content">
                    {crisisAlerts.length === 0 ? (
                      <div className="no-notifications">
                        <i className="fas fa-check-circle"></i>
                        <p>No active alerts</p>
                      </div>
                    ) : (
                      crisisAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className={`notification-item ${alert.type}`}
                        >
                          <div
                            className={`notification-indicator ${alert.type}`}
                          ></div>
                          <div className="notification-content">
                            <span className="notification-title">
                              {alert.title}
                            </span>
                            <span className="notification-category">
                              {alert.category}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              className="header-icon-btn settings-btn"
              title="Settings"
              onClick={() => navigate("/dashboard/settings")}
            >
              <i className="fas fa-cog"></i>
            </button>
            <div
              className="header-profile"
              onClick={() => navigate("/dashboard/settings?section=profile")}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || "User"}</span>
                <span className="profile-role">Premium</span>
              </div>
              <i className="fas fa-chevron-down profile-dropdown-icon"></i>
            </div>
          </div>
        </header>

        {/* Top Cards Row - 3 Cards */}
        <div className="top-cards-row">
          <MaxSpentCard
            category={dashboardData.maxSpentCategory.name}
            amount={dashboardData.maxSpentCategory.amount}
            icon={dashboardData.maxSpentCategory.icon}
          />
          <CrisisPercentageCard percentage={dashboardData.crisisPercentage} />
          <SpentVsTargetCard
            spent={dashboardData.spentVsTarget.spent}
            target={dashboardData.spentVsTarget.target}
          />
        </div>

        {/* Charts Section - Side by Side */}
        <div className="charts-section">
          <div className="chart-wrapper">
            <WeeklySpendingChart data={dashboardData.weeklySpending} />
          </div>
          <div className="chart-wrapper">
            <CategoryPieChart data={dashboardData.categories} />
          </div>
        </div>

        {/* Summary Section */}
        <SummarySection summaryData={dashboardData.summary} />
      </main>
    </div>
  );
};

export default Dashboard;
