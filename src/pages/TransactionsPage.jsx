import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./TransactionsPage.css";

// Category configuration with priority order, icons, and colors
const CATEGORY_CONFIG = {
  food: {
    name: "Food",
    icon: "fa-utensils",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    priority: 1,
  },
  social_life_entertainment: {
    name: "Social Life & Entertainment",
    icon: "fa-glass-cheers",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    priority: 2,
  },
  transport: {
    name: "Transport",
    icon: "fa-car",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    priority: 3,
  },
  household: {
    name: "Household",
    icon: "fa-home",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    priority: 4,
  },
  health_personal_care: {
    name: "Health & Personal Care",
    icon: "fa-heartbeat",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    priority: 5,
  },
  education: {
    name: "Education",
    icon: "fa-graduation-cap",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
    priority: 6,
  },
  pets: {
    name: "Pets",
    icon: "fa-paw",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
    priority: 7,
  },
  apparel: {
    name: "Apparel",
    icon: "fa-tshirt",
    color: "#14b8a6",
    bgColor: "rgba(20, 184, 166, 0.1)",
    priority: 8,
  },
  travel: {
    name: "Travel",
    icon: "fa-plane",
    color: "#0ea5e9",
    bgColor: "rgba(14, 165, 233, 0.1)",
    priority: 9,
  },
  savings_investments: {
    name: "Savings & Investments",
    icon: "fa-piggy-bank",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
    priority: 10,
  },
  gifts_donations: {
    name: "Gifts & Donations",
    icon: "fa-gift",
    color: "#f43f5e",
    bgColor: "rgba(244, 63, 94, 0.1)",
    priority: 11,
  },
  miscellaneous: {
    name: "Miscellaneous",
    icon: "fa-ellipsis-h",
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.1)",
    priority: 12,
  },
  income: {
    name: "Income",
    icon: "fa-wallet",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    priority: 0,
  },
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Load saved transactions from localStorage
    const savedTransactions = localStorage.getItem("uploadedTransactions");
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        if (parsedTransactions.length > 0) {
          setTransactions(parsedTransactions);
          const grouped = groupTransactionsByCategory(parsedTransactions);
          setGroupedTransactions(grouped);
          setSummary(calculateSummary(parsedTransactions));

          // Keep all categories collapsed by default
          setExpandedCategories({});
        }
      } catch (error) {
        console.error("Error loading saved transactions:", error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("uploadedTransactions"); // Clear transactions on logout
    navigate("/login");
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const dateIndex = headers.indexOf("date");
    const amountIndex = headers.indexOf("amount");
    const categoryIndex = headers.indexOf("category");

    if (dateIndex === -1 || amountIndex === -1 || categoryIndex === -1) {
      throw new Error(
        "CSV must contain 'date', 'amount', and 'category' columns"
      );
    }

    const parsedTransactions = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());

      if (values.length >= 3) {
        const amount = parseFloat(values[amountIndex]);
        const category = values[categoryIndex].toLowerCase();
        const date = values[dateIndex];

        if (!isNaN(amount) && date && category) {
          parsedTransactions.push({
            id: i,
            date: date,
            amount: amount,
            category: category,
            isExpense: amount < 0,
          });
        }
      }
    }

    return parsedTransactions;
  };

  const groupTransactionsByCategory = (transactions) => {
    const grouped = {};

    transactions.forEach((transaction) => {
      const category = transaction.category;
      if (!grouped[category]) {
        grouped[category] = {
          transactions: [],
          totalAmount: 0,
          config: CATEGORY_CONFIG[category] || {
            name: category.charAt(0).toUpperCase() + category.slice(1),
            icon: "fa-receipt",
            color: "#64748b",
            bgColor: "rgba(100, 116, 139, 0.1)",
            priority: 99,
          },
        };
      }
      grouped[category].transactions.push(transaction);
      grouped[category].totalAmount += transaction.amount;
    });

    // Sort transactions within each category by date (newest first)
    Object.keys(grouped).forEach((category) => {
      grouped[category].transactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    });

    return grouped;
  };

  const calculateSummary = (transactions) => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t) => {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      const text = await file.text();
      const parsedTransactions = parseCSV(text);

      if (parsedTransactions.length === 0) {
        throw new Error("No valid transactions found in the CSV file");
      }

      setTransactions(parsedTransactions);
      const grouped = groupTransactionsByCategory(parsedTransactions);
      setGroupedTransactions(grouped);
      setSummary(calculateSummary(parsedTransactions));

      // Save transactions to localStorage
      localStorage.setItem(
        "uploadedTransactions",
        JSON.stringify(parsedTransactions)
      );

      // Keep all categories collapsed by default
      setExpandedCategories({});

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setUploadError(error.message || "Failed to parse CSV file");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(absAmount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-IN", { month: "short" });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });
    return { day, month, year, weekday };
  };

  // Sort categories by priority
  const sortedCategories = Object.entries(groupedTransactions).sort(
    ([, a], [, b]) => a.config.priority - b.config.priority
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
        <div className="transactions-container">
          {/* Header */}
          <div className="transactions-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-exchange-alt"></i>
                Transactions
              </h1>
              <p className="header-subtitle">
                Upload your CSV file to view and analyze your transactions
              </p>
            </div>
            <div className="header-right">
              <label className="upload-btn">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>{isUploading ? "Uploading..." : "Upload CSV"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* Upload Status Messages */}
          {uploadError && (
            <div className="upload-message error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{uploadError}</span>
              <button onClick={() => setUploadError("")}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="upload-message success">
              <i className="fas fa-check-circle"></i>
              <span>
                Successfully loaded {transactions.length} transactions!
              </span>
            </div>
          )}

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="summary-cards">
              <div className="summary-card income">
                <div className="summary-icon">
                  <i className="fas fa-arrow-down"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Total Income</span>
                  <span className="summary-value">
                    {formatCurrency(summary.totalIncome)}
                  </span>
                </div>
              </div>

              <div className="summary-card expenses">
                <div className="summary-icon">
                  <i className="fas fa-arrow-up"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Total Expenses</span>
                  <span className="summary-value">
                    {formatCurrency(summary.totalExpenses)}
                  </span>
                </div>
              </div>

              <div
                className={`summary-card balance ${
                  summary.netBalance >= 0 ? "positive" : "negative"
                }`}
              >
                <div className="summary-icon">
                  <i className="fas fa-balance-scale"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Net Balance</span>
                  <span className="summary-value">
                    {summary.netBalance >= 0 ? "+" : "-"}
                    {formatCurrency(summary.netBalance)}
                  </span>
                </div>
              </div>

              <div className="summary-card count">
                <div className="summary-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="summary-info">
                  <span className="summary-label">Transactions</span>
                  <span className="summary-value">
                    {summary.transactionCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-file-csv"></i>
              </div>
              <h2>No Transactions Yet</h2>
              <p>
                Upload a CSV file to view your transactions grouped by category
              </p>
              <div className="csv-format-hint">
                <h4>
                  <i className="fas fa-info-circle"></i> Expected CSV Format:
                </h4>
                <code>date,amount,category</code>
                <p>Example: 2024-01-01,-59.67,food</p>
              </div>
              <label className="upload-btn-large">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Choose CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  hidden
                />
              </label>
            </div>
          )}

          {/* Grouped Transactions */}
          {transactions.length > 0 && (
            <div className="transactions-list">
              {sortedCategories.map(([category, data]) => (
                <div key={category} className="category-group">
                  <div
                    className="category-header"
                    onClick={() => toggleCategory(category)}
                    style={{
                      borderLeftColor: data.config.color,
                    }}
                  >
                    <div className="category-left">
                      <div
                        className="category-icon"
                        style={{
                          backgroundColor: data.config.bgColor,
                          color: data.config.color,
                        }}
                      >
                        <i className={`fas ${data.config.icon}`}></i>
                      </div>
                      <div className="category-info">
                        <h3>{data.config.name}</h3>
                        <span className="transaction-count">
                          {data.transactions.length} transaction
                          {data.transactions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="category-right">
                      <span
                        className={`category-total ${
                          data.totalAmount >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {data.totalAmount >= 0 ? "+" : "-"}
                        {formatCurrency(data.totalAmount)}
                      </span>
                      <i
                        className={`fas fa-chevron-${
                          expandedCategories[category] ? "up" : "down"
                        } expand-icon`}
                      ></i>
                    </div>
                  </div>

                  {expandedCategories[category] && (
                    <div className="category-transactions">
                      {data.transactions.map((transaction) => {
                        const dateInfo = formatDate(transaction.date);
                        return (
                          <div
                            key={transaction.id}
                            className="transaction-item"
                          >
                            <div className="transaction-date">
                              <div className="date-box">
                                <span className="date-day">{dateInfo.day}</span>
                                <span className="date-month">
                                  {dateInfo.month}
                                </span>
                              </div>
                              <div className="date-details">
                                <span className="date-weekday">
                                  {dateInfo.weekday}
                                </span>
                                <span className="date-year">
                                  {dateInfo.year}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`transaction-amount ${
                                transaction.amount >= 0
                                  ? "positive"
                                  : "negative"
                              }`}
                            >
                              {transaction.amount >= 0 ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
