import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./GoalsPage.css";

const GoalsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState([]);

  const goalCategories = [
    {
      id: "emergency",
      name: "Emergency Fund",
      icon: "fa-shield-alt",
      color: "#ef4444",
    },
    { id: "vacation", name: "Vacation", icon: "fa-plane", color: "#3b82f6" },
    { id: "car", name: "Car", icon: "fa-car", color: "#8b5cf6" },
    { id: "house", name: "House", icon: "fa-home", color: "#10b981" },
    {
      id: "education",
      name: "Education",
      icon: "fa-graduation-cap",
      color: "#f59e0b",
    },
    {
      id: "retirement",
      name: "Retirement",
      icon: "fa-umbrella-beach",
      color: "#06b6d4",
    },
    { id: "gadget", name: "Gadget", icon: "fa-laptop", color: "#ec4899" },
    { id: "custom", name: "Custom", icon: "fa-star", color: "#64748b" },
  ];

  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "emergency",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    description: "",
  });

  // Mock goals data
  const mockGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      category: "emergency",
      targetAmount: 100000,
      currentAmount: 45000,
      deadline: "2025-06-30",
      description: "3 months of expenses saved",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Goa Trip",
      category: "vacation",
      targetAmount: 30000,
      currentAmount: 18000,
      deadline: "2025-03-15",
      description: "Family vacation to Goa",
      createdAt: "2024-06-01",
    },
    {
      id: 3,
      name: "New Laptop",
      category: "gadget",
      targetAmount: 80000,
      currentAmount: 55000,
      deadline: "2025-02-28",
      description: "MacBook Pro for work",
      createdAt: "2024-08-10",
    },
    {
      id: 4,
      name: "MBA Fund",
      category: "education",
      targetAmount: 500000,
      currentAmount: 125000,
      deadline: "2026-06-01",
      description: "MBA program fees",
      createdAt: "2024-03-20",
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

    // Load goals from localStorage or use mock data
    const savedGoals = localStorage.getItem("financialGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals(mockGoals);
      localStorage.setItem("financialGoals", JSON.stringify(mockGoals));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("uploadedTransactions");
    navigate("/login");
  };

  const getCategoryInfo = (categoryId) => {
    return goalCategories.find((c) => c.id === categoryId) || goalCategories[7];
  };

  const calculateProgress = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMonthlyRequired = (current, target, deadline) => {
    const remaining = target - current;
    const daysLeft = getDaysRemaining(deadline);
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    return Math.ceil(remaining / monthsLeft);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitGoal = (e) => {
    e.preventDefault();

    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      return;
    }

    const goalData = {
      id: editingGoal ? editingGoal.id : Date.now(),
      name: newGoal.name,
      category: newGoal.category,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline,
      description: newGoal.description,
      createdAt: editingGoal
        ? editingGoal.createdAt
        : new Date().toISOString().split("T")[0],
    };

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = goals.map((g) => (g.id === editingGoal.id ? goalData : g));
    } else {
      updatedGoals = [...goals, goalData];
    }

    setGoals(updatedGoals);
    localStorage.setItem("financialGoals", JSON.stringify(updatedGoals));
    resetForm();
  };

  const resetForm = () => {
    setNewGoal({
      name: "",
      category: "emergency",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
      description: "",
    });
    setEditingGoal(null);
    setShowModal(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      description: goal.description || "",
    });
    setShowModal(true);
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = goals.filter((g) => g.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem("financialGoals", JSON.stringify(updatedGoals));
  };

  const handleAddMoney = (goalId, amount) => {
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount, g.currentAmount + amount),
        };
      }
      return g;
    });
    setGoals(updatedGoals);
    localStorage.setItem("financialGoals", JSON.stringify(updatedGoals));
  };

  // Calculate overall stats
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoals = goals.filter(
    (g) => g.currentAmount >= g.targetAmount
  ).length;
  const overallProgress =
    totalTargetAmount > 0
      ? calculateProgress(totalSavedAmount, totalTargetAmount)
      : 0;

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
        <div className="goals-container">
          {/* Header */}
          <div className="goals-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-bullseye"></i>
                Financial Goals
              </h1>
              <p className="header-subtitle">
                Track your savings and achieve your dreams
              </p>
            </div>
            <button className="add-goal-btn" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus"></i>
              Add New Goal
            </button>
          </div>

          {/* Overall Stats */}
          <div className="goals-stats">
            <div className="stat-card overall-progress-card">
              <div className="overall-progress">
                <svg viewBox="0 0 120 120" className="progress-ring">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="10"
                    strokeDasharray={`${(overallProgress / 100) * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    className="progress-ring-circle"
                  />
                  <defs>
                    <linearGradient
                      id="progressGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-center">
                  <span className="progress-value">{overallProgress}%</span>
                  <span className="progress-label">Overall</span>
                </div>
              </div>
              <div className="progress-info">
                <h3>Total Progress</h3>
                <p className="progress-amounts">
                  {formatCurrency(totalSavedAmount)} of{" "}
                  {formatCurrency(totalTargetAmount)}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon goals-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{goals.length}</span>
                <span className="stat-label">Active Goals</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon completed-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{completedGoals}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon saved-icon">
                <i className="fas fa-piggy-bank"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatCurrency(totalSavedAmount)}
                </span>
                <span className="stat-label">Total Saved</span>
              </div>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="goals-grid">
            {goals.length === 0 ? (
              <div className="no-goals">
                <div className="no-goals-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3>No goals yet</h3>
                <p>Start your journey by creating your first financial goal!</p>
                <button
                  className="create-first-btn"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  Create Your First Goal
                </button>
              </div>
            ) : (
              goals.map((goal) => {
                const category = getCategoryInfo(goal.category);
                const progress = calculateProgress(
                  goal.currentAmount,
                  goal.targetAmount
                );
                const daysRemaining = getDaysRemaining(goal.deadline);
                const monthlyRequired = getMonthlyRequired(
                  goal.currentAmount,
                  goal.targetAmount,
                  goal.deadline
                );
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                const isOverdue = daysRemaining < 0 && !isCompleted;

                return (
                  <div
                    key={goal.id}
                    className={`goal-card ${isCompleted ? "completed" : ""} ${
                      isOverdue ? "overdue" : ""
                    }`}
                  >
                    {isCompleted && (
                      <div className="completed-banner">
                        <i className="fas fa-check-circle"></i>
                        Goal Achieved!
                      </div>
                    )}

                    <div className="goal-header">
                      <div
                        className="goal-icon"
                        style={{
                          background: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        <i className={`fas ${category.icon}`}></i>
                      </div>
                      <div className="goal-actions">
                        <button
                          className="goal-action-btn edit"
                          onClick={() => handleEditGoal(goal)}
                          title="Edit"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          className="goal-action-btn delete"
                          onClick={() => handleDeleteGoal(goal.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <h3 className="goal-name">{goal.name}</h3>
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}

                    {/* Progress Circle */}
                    <div className="goal-progress-container">
                      <svg viewBox="0 0 100 100" className="goal-progress-ring">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={isCompleted ? "#10b981" : category.color}
                          strokeWidth="8"
                          strokeDasharray={`${(progress / 100) * 251} 251`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          className="goal-progress-circle"
                        />
                      </svg>
                      <div className="goal-progress-center">
                        <span className="goal-progress-value">{progress}%</span>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="goal-amounts">
                      <div className="amount-saved">
                        <span className="amount-label">Saved</span>
                        <span className="amount-value">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="amount-divider"></div>
                      <div className="amount-target">
                        <span className="amount-label">Target</span>
                        <span className="amount-value">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="goal-footer">
                      <div className="goal-deadline">
                        <i className="fas fa-calendar"></i>
                        {isOverdue ? (
                          <span className="overdue-text">
                            Overdue by {Math.abs(daysRemaining)} days
                          </span>
                        ) : isCompleted ? (
                          <span className="completed-text">Completed!</span>
                        ) : (
                          <span>{daysRemaining} days left</span>
                        )}
                      </div>
                      {!isCompleted && !isOverdue && (
                        <div className="goal-monthly">
                          <i className="fas fa-chart-line"></i>
                          <span>
                            {formatCurrency(monthlyRequired)}/mo needed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Add Buttons */}
                    {!isCompleted && (
                      <div className="quick-add">
                        <span className="quick-add-label">Quick add:</span>
                        <div className="quick-add-buttons">
                          <button onClick={() => handleAddMoney(goal.id, 500)}>
                            +₹500
                          </button>
                          <button onClick={() => handleAddMoney(goal.id, 1000)}>
                            +₹1K
                          </button>
                          <button onClick={() => handleAddMoney(goal.id, 5000)}>
                            +₹5K
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Motivation Section */}
          <div className="motivation-section">
            <div className="motivation-card">
              <div className="motivation-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3>Savings Tip</h3>
              <p>
                Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for
                savings and debt repayment.
              </p>
            </div>
            <div className="motivation-card">
              <div className="motivation-icon">
                <i className="fas fa-fire"></i>
              </div>
              <h3>Stay Consistent</h3>
              <p>
                Small, regular contributions add up quickly. Even ₹500 per week
                can grow to ₹26,000 in a year!
              </p>
            </div>
            <div className="motivation-card">
              <div className="motivation-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Celebrate Wins</h3>
              <p>
                Reward yourself when you hit milestones. It keeps you motivated
                for the long term!
              </p>
            </div>
          </div>
        </div>

        {/* Add/Edit Goal Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-bullseye"></i>
                  {editingGoal ? "Edit Goal" : "Create New Goal"}
                </h2>
                <button className="modal-close" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitGoal} className="goal-form">
                <div className="form-group">
                  <label htmlFor="name">Goal Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newGoal.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Emergency Fund, Dream Vacation"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <div className="category-selector">
                    {goalCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`category-btn ${
                          newGoal.category === cat.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          setNewGoal((prev) => ({ ...prev, category: cat.id }))
                        }
                        style={{
                          "--cat-color": cat.color,
                        }}
                      >
                        <i className={`fas ${cat.icon}`}></i>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="targetAmount">Target Amount (₹) *</label>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      value={newGoal.targetAmount}
                      onChange={handleInputChange}
                      placeholder="100000"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentAmount">Current Savings (₹)</label>
                    <input
                      type="number"
                      id="currentAmount"
                      name="currentAmount"
                      value={newGoal.currentAmount}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Target Date *</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={newGoal.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newGoal.description}
                    onChange={handleInputChange}
                    placeholder="Add some notes about this goal..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <i
                      className={`fas ${editingGoal ? "fa-save" : "fa-plus"}`}
                    ></i>
                    {editingGoal ? "Save Changes" : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GoalsPage;
