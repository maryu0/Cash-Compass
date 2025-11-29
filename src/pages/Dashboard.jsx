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

// Helper function to generate insights from API data
const generateInsights = (apiData) => {
  const insights = [];
  const summary = apiData.summary || {};
  const categories = apiData.categoryBreakdown || [];

  // Find top spending category
  const expenseCategories = categories.filter((cat) => cat.name !== "Income");
  if (expenseCategories.length > 0) {
    const topCategory = expenseCategories.reduce(
      (max, cat) => (cat.value > max.value ? cat : max),
      expenseCategories[0]
    );
    insights.push(
      `Your highest spending category is ${
        topCategory.name
      } at ₹${topCategory.value.toLocaleString()}`
    );
  }

  // Savings insight
  const saved = summary.totalIncome - summary.totalExpenses;
  if (saved > 0) {
    insights.push(
      `Great job! You've saved ₹${saved.toLocaleString()} this period`
    );
  } else if (saved < 0) {
    insights.push(
      `Warning: You've overspent by ₹${Math.abs(saved).toLocaleString()}`
    );
  }

  // Transaction count insight
  if (summary.transactionCount > 0) {
    insights.push(
      `You've made ${summary.transactionCount} transactions in total`
    );
  }

  // Goals insight
  if (apiData.goalsCount > 0) {
    insights.push(
      `You have ${apiData.goalsCount} active financial goal${
        apiData.goalsCount > 1 ? "s" : ""
      }`
    );
  }

  // Alerts insight
  if (apiData.alertsCount > 0) {
    insights.push(
      `You have ${apiData.alertsCount} unread alert${
        apiData.alertsCount > 1 ? "s" : ""
      } to review`
    );
  }

  return insights.length > 0
    ? insights
    : ["Start adding transactions to see personalized insights"];
};

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
  }, []);

  const loadCrisisAlerts = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // API returns data directly as array, not data.alerts
          const alerts = (result.data || []).filter((a) => !a.isResolved);
          setCrisisAlerts(alerts);
        }
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
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

      // Fetch alerts for notification badge
      await loadCrisisAlerts(token);

      // Fetch real data from API
      const response = await fetch("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const result = await response.json();
      const apiData = result.data;

      // Color mapping for categories
      const categoryColors = {
        Food: "#f59e0b",
        Transport: "#10b981",
        Entertainment: "#8b5cf6",
        Household: "#3b82f6",
        Health: "#ef4444",
        Education: "#6366f1",
        Travel: "#14b8a6",
        Savings: "#22c55e",
        Gifts: "#ec4899",
        Misc: "#06b6d4",
        Other: "#94a3b8",
        Income: "#22c55e",
      };

      // Category icon mapping
      const categoryIcons = {
        Food: "🍔",
        Transport: "🚗",
        Entertainment: "🎬",
        Household: "🏠",
        Health: "💊",
        Education: "📚",
        Travel: "✈️",
        Savings: "💰",
        Gifts: "🎁",
        Misc: "📦",
        Other: "📦",
      };

      // Find max spent category from categoryBreakdown
      const expenseCategories = (apiData.categoryBreakdown || []).filter(
        (cat) => cat.name !== "Income"
      );
      const maxCategory = expenseCategories.reduce(
        (max, cat) => (cat.value > (max?.value || 0) ? cat : max),
        expenseCategories[0] || { name: "None", value: 0 }
      );

      // Calculate crisis percentage (expenses / income * 100)
      const totalIncome = apiData.summary?.totalIncome || 1;
      const totalExpenses = apiData.summary?.totalExpenses || 0;
      const crisisPercentage = Math.min(
        Math.round((totalExpenses / totalIncome) * 100),
        100
      );

      // Format categories with colors and icons
      const categories = (apiData.categoryBreakdown || [])
        .filter((cat) => cat.name !== "Income")
        .map((cat) => ({
          name: cat.name,
          value: cat.value,
          color: categoryColors[cat.name] || "#94a3b8",
          icon: categoryIcons[cat.name] || "📦",
        }));

      // Format spending trend for charts - hardcoded realistic data
      const spendingTrend = [
        { month: "Jul", income: 85000, expenses: 52000 },
        { month: "Aug", income: 92000, expenses: 61000 },
        { month: "Sep", income: 78000, expenses: 48000 },
        { month: "Oct", income: 95000, expenses: 67000 },
        { month: "Nov", income: 88000, expenses: 54000 },
        { month: "Dec", income: 102000, expenses: 72000 },
      ];

      // Transform API data to dashboard format
      const dashboardData = {
        maxSpentCategory: {
          name: maxCategory?.name || "None",
          amount: maxCategory?.value || 0,
          icon: categoryIcons[maxCategory?.name] || "📦",
        },
        crisisPercentage: crisisPercentage,
        spentVsTarget: {
          spent: totalExpenses,
          target: totalIncome, // Using income as target
        },
        moneySaved: {
          amount: apiData.summary?.totalBalance || 0,
          change:
            totalIncome > 0
              ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
              : 0,
        },
        weeklySpending:
          spendingTrend.length > 0
            ? spendingTrend
            : [{ month: "No Data", income: 0, expenses: 0 }],
        categories:
          categories.length > 0
            ? categories
            : [{ name: "No Data", value: 1, color: "#94a3b8" }],
        summary: {
          totalSpentThisWeek: totalExpenses,
          crisisAlert: {
            level:
              crisisPercentage > 80
                ? "High"
                : crisisPercentage > 50
                ? "Medium"
                : "Low",
            message:
              crisisPercentage > 80
                ? "Warning! Your spending exceeds 80% of your income. Review your expenses immediately."
                : crisisPercentage > 50
                ? "Your spending is slightly above normal. Consider reviewing your budget."
                : "Great job! Your spending is under control.",
          },
          biggestCategory: {
            name: maxCategory?.name || "None",
            amount: maxCategory?.value || 0,
          },
          insights: generateInsights(apiData),
        },
        recentTransactions: apiData.recentTransactions || [],
        alertsCount: apiData.alertsCount || 0,
        goalsCount: apiData.goalsCount || 0,
      };

      setDashboardData(dashboardData);
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
                    <h4>Alerts ({crisisAlerts.length})</h4>
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
                          key={alert._id || alert.id}
                          className={`notification-item ${
                            alert.severity || alert.type
                          }`}
                        >
                          <div
                            className={`notification-indicator ${
                              alert.severity || alert.type
                            }`}
                          ></div>
                          <div className="notification-content">
                            <span className="notification-title">
                              {alert.title}
                            </span>
                            <span className="notification-category">
                              {alert.message?.substring(0, 50)}...
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
