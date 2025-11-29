import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./BudgetsPage.css";

const BudgetsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Category configurations with unique colors and icons
  const categoryConfig = {
    food: {
      name: "Food & Dining",
      icon: "fa-utensils",
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
      bgLight: "#fef2f2",
    },
    social_life_entertainment: {
      name: "Entertainment",
      icon: "fa-film",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      bgLight: "#f5f3ff",
    },
    transport: {
      name: "Transport",
      icon: "fa-car",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      bgLight: "#eff6ff",
    },
    household: {
      name: "Household",
      icon: "fa-home",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      bgLight: "#f0fdf4",
    },
    health_personal_care: {
      name: "Health & Care",
      icon: "fa-heartbeat",
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899, #db2777)",
      bgLight: "#fdf2f8",
    },
    education: {
      name: "Education",
      icon: "fa-graduation-cap",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      bgLight: "#fffbeb",
    },
    pets: {
      name: "Pets",
      icon: "fa-paw",
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      bgLight: "#ecfeff",
    },
    apparel: {
      name: "Apparel",
      icon: "fa-tshirt",
      color: "#f97316",
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
      bgLight: "#fff7ed",
    },
    travel: {
      name: "Travel",
      icon: "fa-plane",
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
      bgLight: "#eef2ff",
    },
    savings_investments: {
      name: "Savings",
      icon: "fa-piggy-bank",
      color: "#22c55e",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      bgLight: "#f0fdf4",
    },
    gifts_donations: {
      name: "Gifts & Donations",
      icon: "fa-gift",
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
      bgLight: "#faf5ff",
    },
    miscellaneous: {
      name: "Miscellaneous",
      icon: "fa-ellipsis-h",
      color: "#64748b",
      gradient: "linear-gradient(135deg, #64748b, #475569)",
      bgLight: "#f8fafc",
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchBudgetOptimization();
  }, [navigate]);

  const fetchBudgetOptimization = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from the chatbot backend budget optimization endpoint
      const response = await fetch(
        "http://localhost:5001/api/budget/optimize",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budget optimization");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBudgetData(result.data);
        setLastUpdated(new Date());
      } else if (result.success && !result.triggered) {
        // Budget optimization not triggered (risk below threshold)
        setBudgetData({
          triggered: false,
          risk_score: result.risk_score,
          threshold: result.threshold,
          message: result.message,
        });
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      console.error("Budget fetch error:", err);
      // Try to fetch real risk data as fallback (silently, no error shown)
      await fetchRiskDataFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskDataFallback = async () => {
    try {
      // Try to get real risk data from the risk endpoint
      const riskResponse = await fetch(
        "http://localhost:5001/api/risk?user_id=user123",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (riskResponse.ok) {
        const riskResult = await riskResponse.json();
        if (riskResult.success && riskResult.data) {
          const riskData = riskResult.data;
          const riskScore = riskData.risk_score;

          // Check if budget optimization should be triggered
          if (riskScore >= 80 && riskData.budget_optimization) {
            setBudgetData(riskData.budget_optimization);
          } else if (riskScore >= 80) {
            // Risk is high but no budget optimization data, create from risk data
            setBudgetData(createBudgetFromRiskData(riskData));
          } else {
            // Risk is below threshold
            setBudgetData({
              triggered: false,
              risk_score: riskScore,
              threshold: 80,
              message: `Budget optimization not needed. Risk score (${riskScore}%) is below threshold (80%).`,
            });
          }
          setLastUpdated(new Date());
          return;
        }
      }
      // If risk endpoint also fails, use mock data
      setBudgetData(getMockBudgetData());
      setLastUpdated(new Date());
    } catch (fallbackErr) {
      console.error("Risk fallback error:", fallbackErr);
      setBudgetData(getMockBudgetData());
      setLastUpdated(new Date());
    }
  };

  const createBudgetFromRiskData = (riskData) => {
    const categorySpending = riskData.category_spending || {};
    const income = riskData.income_last_30d || 0;
    const totalSpending = riskData.spending_last_30d || 0;

    // Calculate optimized budgets (reduce by 20% for high risk)
    const reductionFactor = riskData.risk_score >= 90 ? 0.7 : 0.8;
    const optimizedBudgets = {};
    const categoryBreakdown = [];

    Object.entries(categorySpending).forEach(([category, amount]) => {
      const optimized = Math.round(amount * reductionFactor);
      optimizedBudgets[category] = optimized;
      categoryBreakdown.push({
        category,
        current: amount,
        recommended: optimized,
        savings: amount - optimized,
        reduction_percent: ((amount - optimized) / amount) * 100 || 0,
      });
    });

    // Sort by savings
    categoryBreakdown.sort((a, b) => b.savings - a.savings);

    const optimizedTotal = Object.values(optimizedBudgets).reduce(
      (sum, val) => sum + val,
      0
    );

    return {
      triggered: true,
      risk_score: riskData.risk_score,
      threshold: 80,
      income: income,
      current_total_spending: totalSpending,
      optimized_total_spending: optimizedTotal,
      total_potential_savings: totalSpending - optimizedTotal,
      savings_percent:
        ((totalSpending - optimizedTotal) / totalSpending) * 100 || 0,
      optimized_budgets: optimizedBudgets,
      category_breakdown: categoryBreakdown,
      urgency:
        riskData.risk_score >= 90
          ? { level: "critical", label: "CRITICAL", color: "red" }
          : { level: "high", label: "HIGH", color: "orange" },
      estimated_weeks_to_recovery: Math.max(
        4,
        Math.round(12 - (100 - riskData.risk_score) / 5)
      ),
    };
  };

  const getMockBudgetData = () => {
    return {
      triggered: true,
      risk_score: 85,
      threshold: 80,
      income: 50000,
      current_total_spending: 45000,
      optimized_total_spending: 35000,
      total_potential_savings: 10000,
      savings_percent: 22.2,
      optimized_budgets: {
        food: 8000,
        social_life_entertainment: 3000,
        transport: 4000,
        household: 10000,
        health_personal_care: 2500,
        education: 2000,
        pets: 500,
        apparel: 1500,
        travel: 1000,
        savings_investments: 0,
        gifts_donations: 1000,
        miscellaneous: 1500,
      },
      category_breakdown: [
        {
          category: "household",
          current: 12000,
          recommended: 10000,
          savings: 2000,
          reduction_percent: 16.7,
        },
        {
          category: "food",
          current: 10000,
          recommended: 8000,
          savings: 2000,
          reduction_percent: 20,
        },
        {
          category: "social_life_entertainment",
          current: 5000,
          recommended: 3000,
          savings: 2000,
          reduction_percent: 40,
        },
        {
          category: "transport",
          current: 5000,
          recommended: 4000,
          savings: 1000,
          reduction_percent: 20,
        },
        {
          category: "health_personal_care",
          current: 3000,
          recommended: 2500,
          savings: 500,
          reduction_percent: 16.7,
        },
        {
          category: "apparel",
          current: 2500,
          recommended: 1500,
          savings: 1000,
          reduction_percent: 40,
        },
        {
          category: "education",
          current: 2500,
          recommended: 2000,
          savings: 500,
          reduction_percent: 20,
        },
        {
          category: "travel",
          current: 2000,
          recommended: 1000,
          savings: 1000,
          reduction_percent: 50,
        },
        {
          category: "gifts_donations",
          current: 1500,
          recommended: 1000,
          savings: 500,
          reduction_percent: 33.3,
        },
        {
          category: "miscellaneous",
          current: 2000,
          recommended: 1500,
          savings: 500,
          reduction_percent: 25,
        },
        {
          category: "pets",
          current: 500,
          recommended: 500,
          savings: 0,
          reduction_percent: 0,
        },
        {
          category: "savings_investments",
          current: 0,
          recommended: 0,
          savings: 0,
          reduction_percent: 0,
        },
      ],
      urgency: { level: "high", label: "HIGH", color: "orange" },
      estimated_weeks_to_recovery: 8,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleRefresh = () => {
    fetchBudgetOptimization();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getCategoryConfig = (categoryKey) => {
    return categoryConfig[categoryKey] || categoryConfig.miscellaneous;
  };

  const getTotalOptimizedBudget = () => {
    if (!budgetData?.optimized_budgets) return 0;
    return Object.values(budgetData.optimized_budgets).reduce(
      (sum, val) => sum + val,
      0
    );
  };

  const renderBudgetNotTriggered = () => (
    <div className="budget-not-triggered">
      <div className="not-triggered-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <h2>Your Finances Look Good! 🎉</h2>
      <p>
        Budget optimization is not needed at this time. Your risk score of{" "}
        <strong>{budgetData?.risk_score}%</strong> is below the threshold of{" "}
        <strong>{budgetData?.threshold}%</strong>.
      </p>
      <div className="healthy-tips">
        <h3>Keep up the good work!</h3>
        <ul>
          <li>
            <i className="fas fa-check"></i> Continue tracking your expenses
          </li>
          <li>
            <i className="fas fa-check"></i> Maintain your savings habit
          </li>
          <li>
            <i className="fas fa-check"></i> Review your goals regularly
          </li>
        </ul>
      </div>
      <button className="refresh-btn" onClick={handleRefresh}>
        <i className="fas fa-sync-alt"></i>
        Check Again
      </button>
    </div>
  );

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
        <div className="budgets-container">
          {/* Header */}
          <div className="budgets-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-wallet"></i>
                Budget Optimizer
              </h1>
              <p className="header-subtitle">
                AI-powered budget recommendations based on your spending
                patterns
              </p>
            </div>
            <div className="header-actions">
              {lastUpdated && (
                <span className="last-updated">
                  <i className="fas fa-clock"></i>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
              >
                <i
                  className={`fas fa-sync-alt ${loading ? "spinning" : ""}`}
                ></i>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">
                <i className="fas fa-circle-notch fa-spin"></i>
              </div>
              <p>Analyzing your spending patterns...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-banner">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Using demo data - {error}</span>
            </div>
          )}

          {/* Budget Not Triggered */}
          {!loading &&
            budgetData &&
            !budgetData.triggered &&
            renderBudgetNotTriggered()}

          {/* Budget Optimization Active */}
          {!loading && budgetData && budgetData.triggered && (
            <>
              {/* Risk Alert Banner */}
              <div
                className={`risk-alert-banner ${
                  budgetData.urgency?.level || "elevated"
                }`}
              >
                <div className="alert-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="alert-content">
                  <h3>Budget Optimization Activated</h3>
                  <p>
                    Your risk score of <strong>{budgetData.risk_score}%</strong>{" "}
                    has triggered automatic budget optimization. Follow these
                    recommendations to improve your financial health.
                  </p>
                </div>
                <div className="alert-badge">
                  {budgetData.urgency?.label || "ACTIVE"}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="budget-stats">
                <div className="stat-card income-card">
                  <div className="stat-icon">
                    <i className="fas fa-arrow-down"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {formatCurrency(budgetData.income)}
                    </span>
                    <span className="stat-label">Monthly Income</span>
                  </div>
                </div>

                <div className="stat-card current-card">
                  <div className="stat-icon">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {formatCurrency(budgetData.current_total_spending)}
                    </span>
                    <span className="stat-label">Current Spending</span>
                  </div>
                </div>

                <div className="stat-card optimized-card">
                  <div className="stat-icon">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {formatCurrency(getTotalOptimizedBudget())}
                    </span>
                    <span className="stat-label">Optimized Budget</span>
                  </div>
                </div>

                <div className="stat-card savings-card">
                  <div className="stat-icon">
                    <i className="fas fa-piggy-bank"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {formatCurrency(budgetData.total_potential_savings)}
                    </span>
                    <span className="stat-label">
                      Potential Savings (
                      {budgetData.savings_percent?.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Budgets Grid */}
              <div className="budgets-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-th-large"></i>
                    Recommended Budgets by Category
                  </h2>
                  <p>Optimized allocations for each spending category</p>
                </div>

                <div className="category-budgets-grid">
                  {Object.entries(budgetData.optimized_budgets || {}).map(
                    ([category, amount]) => {
                      const config = getCategoryConfig(category);
                      const breakdown = budgetData.category_breakdown?.find(
                        (b) => b.category === category
                      );
                      const currentAmount = breakdown?.current || 0;
                      const savings = breakdown?.savings || 0;
                      const reductionPercent =
                        breakdown?.reduction_percent || 0;
                      const hasReduction = savings > 0;

                      return (
                        <div
                          key={category}
                          className={`category-budget-card ${
                            hasReduction ? "has-reduction" : ""
                          }`}
                          style={{ "--category-color": config.color }}
                        >
                          <div className="card-header">
                            <div
                              className="category-icon"
                              style={{
                                background: config.bgLight,
                                color: config.color,
                              }}
                            >
                              <i className={`fas ${config.icon}`}></i>
                            </div>
                            {hasReduction && (
                              <div className="reduction-badge">
                                <i className="fas fa-arrow-down"></i>
                                {reductionPercent.toFixed(0)}%
                              </div>
                            )}
                          </div>

                          <h3 className="category-name">{config.name}</h3>

                          <div className="budget-amounts">
                            <div className="recommended-amount">
                              <span className="amount-value">
                                {formatCurrency(amount)}
                              </span>
                              <span className="amount-label">Recommended</span>
                            </div>

                            {currentAmount > 0 && (
                              <div className="current-amount">
                                <span className="amount-value">
                                  {formatCurrency(currentAmount)}
                                </span>
                                <span className="amount-label">Current</span>
                              </div>
                            )}
                          </div>

                          {hasReduction && (
                            <div className="savings-indicator">
                              <i className="fas fa-coins"></i>
                              <span>Save {formatCurrency(savings)}</span>
                            </div>
                          )}

                          <div
                            className="card-accent"
                            style={{ background: config.gradient }}
                          ></div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Recovery Info */}
              <div className="recovery-section">
                <div className="recovery-card">
                  <div className="recovery-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="recovery-info">
                    <h3>Estimated Recovery Time</h3>
                    <p>
                      Following these recommendations, you could reach a healthy
                      financial state in approximately{" "}
                      <strong>
                        {budgetData.estimated_weeks_to_recovery} weeks
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <div className="tips-card">
                  <h3>
                    <i className="fas fa-lightbulb"></i> Pro Tips
                  </h3>
                  <ul>
                    <li>
                      Start with the categories showing highest reduction
                      percentages
                    </li>
                    <li>Track your spending daily to stay within budget</li>
                    <li>Use the AI Buddy chatbot for personalized advice</li>
                    <li>
                      Set up crisis alerts to get notified of overspending
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BudgetsPage;
