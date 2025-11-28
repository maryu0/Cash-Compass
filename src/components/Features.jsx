import React, { useState } from "react";
import "./Features.css";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: "fas fa-envelope",
      title: "Easy Content Access",
      desc: "Weekly, Monthly total and budgets are provided",
      position: "top-left",
      color: "#FF6B6B",
      screen: "summary",
    },
    {
      icon: "fas fa-chart-bar",
      title: "Aesthetically Improved Charts",
      desc: "Review your expenses with improved and well-organized charts",
      position: "top-right",
      color: "#4ECDC4",
      screen: "charts",
    },
    {
      icon: "fas fa-sliders-h",
      title: "Reinforced Filter",
      desc: "Review your transactions with more filtering options",
      position: "middle-left",
      color: "#95E1D3",
      screen: "filter",
    },
    {
      icon: "fas fa-wallet",
      title: "Advanced Budget Feature",
      desc: "Set a monthly budget for each category",
      position: "middle-right",
      color: "#F38181",
      screen: "budget",
    },
    {
      icon: "fas fa-chart-line",
      title: "Asset Graphs",
      desc: "Review asset trend in your chart",
      position: "bottom-right",
      color: "#AA96DA",
      screen: "assets",
    },
  ];

  const renderPhoneScreen = () => {
    switch (activeFeature) {
      case "Aesthetically Improved Charts":
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-arrow-left"></i>
              <h2>Analytics</h2>
              <i className="fas fa-ellipsis-v"></i>
            </div>
            <div className="chart-container">
              <div className="chart-title">Expense Breakdown</div>
              <div className="pie-chart">
                <div
                  className="chart-segment"
                  style={{
                    background:
                      "conic-gradient(#FF6B6B 0% 30%, #4ECDC4 30% 55%, #F38181 55% 75%, #AA96DA 75% 100%)",
                  }}
                ></div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span
                    className="legend-color"
                    style={{ background: "#FF6B6B" }}
                  ></span>
                  <span>Food - 30%</span>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-color"
                    style={{ background: "#4ECDC4" }}
                  ></span>
                  <span>Transport - 25%</span>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-color"
                    style={{ background: "#F38181" }}
                  ></span>
                  <span>Shopping - 20%</span>
                </div>
                <div className="legend-item">
                  <span
                    className="legend-color"
                    style={{ background: "#AA96DA" }}
                  ></span>
                  <span>Bills - 25%</span>
                </div>
              </div>
            </div>
            <div className="bar-chart-section">
              <div className="chart-title">Monthly Trend</div>
              <div className="bar-chart">
                <div className="bar" style={{ height: "60%" }}>
                  <span>Jan</span>
                </div>
                <div className="bar" style={{ height: "75%" }}>
                  <span>Feb</span>
                </div>
                <div className="bar" style={{ height: "50%" }}>
                  <span>Mar</span>
                </div>
                <div className="bar" style={{ height: "85%" }}>
                  <span>Apr</span>
                </div>
                <div className="bar" style={{ height: "70%" }}>
                  <span>May</span>
                </div>
              </div>
            </div>
          </>
        );

      case "Reinforced Filter":
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-times"></i>
              <h2>Filter Options</h2>
              <i className="fas fa-check"></i>
            </div>
            <div className="filter-section">
              <div className="filter-group">
                <h3>Date Range</h3>
                <div className="filter-options">
                  <button className="filter-btn active">This Week</button>
                  <button className="filter-btn">This Month</button>
                  <button className="filter-btn">Custom</button>
                </div>
              </div>
              <div className="filter-group">
                <h3>Category</h3>
                <div className="filter-options">
                  <button className="filter-btn active">Food</button>
                  <button className="filter-btn">Transport</button>
                  <button className="filter-btn">Shopping</button>
                  <button className="filter-btn">Bills</button>
                </div>
              </div>
              <div className="filter-group">
                <h3>Amount Range</h3>
                <div className="range-slider">
                  <input type="range" />
                  <div className="range-values">$0 - $500</div>
                </div>
              </div>
              <div className="filter-group">
                <h3>Transaction Type</h3>
                <div className="filter-options">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Income</button>
                  <button className="filter-btn">Expense</button>
                </div>
              </div>
            </div>
          </>
        );

      case "Advanced Budget Feature":
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-arrow-left"></i>
              <h2>Budget</h2>
              <i className="fas fa-plus"></i>
            </div>
            <div className="budget-overview">
              <div className="budget-total">
                <span className="budget-label">Total Budget</span>
                <span className="budget-amount">$3,500</span>
              </div>
            </div>
            <div className="budget-list">
              <div className="budget-item">
                <div className="budget-info">
                  <i
                    className="fas fa-utensils"
                    style={{ color: "#FF6B6B" }}
                  ></i>
                  <div>
                    <h4>Food & Dining</h4>
                    <div className="budget-progress">
                      <div
                        className="progress-bar"
                        style={{ width: "70%", background: "#FF6B6B" }}
                      ></div>
                    </div>
                    <span className="budget-text">$700 of $1,000</span>
                  </div>
                </div>
              </div>
              <div className="budget-item">
                <div className="budget-info">
                  <i className="fas fa-car" style={{ color: "#4ECDC4" }}></i>
                  <div>
                    <h4>Transportation</h4>
                    <div className="budget-progress">
                      <div
                        className="progress-bar"
                        style={{ width: "45%", background: "#4ECDC4" }}
                      ></div>
                    </div>
                    <span className="budget-text">$225 of $500</span>
                  </div>
                </div>
              </div>
              <div className="budget-item">
                <div className="budget-info">
                  <i
                    className="fas fa-shopping-bag"
                    style={{ color: "#F38181" }}
                  ></i>
                  <div>
                    <h4>Shopping</h4>
                    <div className="budget-progress">
                      <div
                        className="progress-bar"
                        style={{ width: "90%", background: "#F38181" }}
                      ></div>
                    </div>
                    <span className="budget-text">$540 of $600</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "Asset Graphs":
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-arrow-left"></i>
              <h2>Assets</h2>
              <i className="fas fa-cog"></i>
            </div>
            <div className="asset-total">
              <span className="asset-label">Total Assets</span>
              <span className="asset-amount">$45,832.50</span>
              <span className="asset-change positive">+12.5% this month</span>
            </div>
            <div className="asset-graph">
              <svg viewBox="0 0 280 120" className="line-graph">
                <polyline
                  points="10,80 50,60 90,70 130,40 170,50 210,30 250,35"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                <circle cx="250" cy="35" r="5" fill="#3b82f6" />
              </svg>
            </div>
            <div className="asset-list">
              <div className="asset-item">
                <div
                  className="asset-icon"
                  style={{ background: "#10b98120", color: "#10b981" }}
                >
                  <i className="fas fa-piggy-bank"></i>
                </div>
                <div>
                  <h4>Savings Account</h4>
                  <span>$25,420.00</span>
                </div>
                <span className="asset-percent positive">+5.2%</span>
              </div>
              <div className="asset-item">
                <div
                  className="asset-icon"
                  style={{ background: "#3b82f620", color: "#3b82f6" }}
                >
                  <i className="fas fa-chart-line"></i>
                </div>
                <div>
                  <h4>Investments</h4>
                  <span>$18,912.50</span>
                </div>
                <span className="asset-percent positive">+18.3%</span>
              </div>
            </div>
          </>
        );

      case "Easy Content Access":
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-arrow-left"></i>
              <h2>Summary</h2>
              <i className="fas fa-calendar"></i>
            </div>
            <div className="summary-cards">
              <div className="summary-card">
                <span className="summary-period">Weekly</span>
                <div className="summary-detail">
                  <span className="summary-label">Income</span>
                  <span className="summary-value income">$1,250.00</span>
                </div>
                <div className="summary-detail">
                  <span className="summary-label">Expenses</span>
                  <span className="summary-value expense">$832.45</span>
                </div>
                <div className="summary-detail">
                  <span className="summary-label">Balance</span>
                  <span className="summary-value">$417.55</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-period">Monthly</span>
                <div className="summary-detail">
                  <span className="summary-label">Income</span>
                  <span className="summary-value income">$4,831.89</span>
                </div>
                <div className="summary-detail">
                  <span className="summary-label">Expenses</span>
                  <span className="summary-value expense">$2,442.93</span>
                </div>
                <div className="summary-detail">
                  <span className="summary-label">Balance</span>
                  <span className="summary-value">$2,388.96</span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="screen-header">
              <i className="fas fa-search"></i>
              <h2>Transaction</h2>
              <div className="header-icons">
                <i className="far fa-star"></i>
                <i className="fas fa-bars"></i>
              </div>
            </div>
            <div className="date-nav">
              <i className="fas fa-chevron-left"></i>
              <span>Jul 2020</span>
              <i className="fas fa-chevron-right"></i>
            </div>
            <div className="tabs">
              <span className="tab active">Daily</span>
              <span className="tab">Calendar</span>
              <span className="tab">Weekly</span>
              <span className="tab">Monthly</span>
              <span className="tab">Summary</span>
            </div>
            <div className="summary-row">
              <div className="summary-item">
                <span className="label">Income</span>
                <span className="value income">$4,831.89</span>
              </div>
              <div className="summary-item">
                <span className="label">Expenses</span>
                <span className="value expense">$2,442.93</span>
              </div>
              <div className="summary-item">
                <span className="label">Total</span>
                <span className="value total">$2,388.96</span>
              </div>
            </div>
            <div className="transactions">
              <div className="transaction-item">
                <div className="transaction-date">29</div>
                <div className="transaction-details">
                  <span className="category">Social Life</span>
                  <span className="description">brunch with daniel</span>
                </div>
                <span className="amount expense">$34.39</span>
              </div>
              <div className="transaction-item">
                <div className="transaction-date">28</div>
                <div className="transaction-details">
                  <span className="category">Household</span>
                  <span className="description">ikea wardrobe</span>
                </div>
                <span className="amount expense">$315.48</span>
              </div>
              <div className="transaction-item">
                <div className="transaction-date">27</div>
                <div className="transaction-details">
                  <span className="category">Transfer</span>
                  <span className="description">minimum fees</span>
                </div>
                <span className="amount neutral">$80.00</span>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <section className="section features-showcase" id="features">
      <div className="container">
        <div className="section-title">
          <h2>Powerful Features at Your Fingertips</h2>
          <p>
            Experience a comprehensive suite of tools designed to give you
            complete control over your finances with intuitive visualizations
            and smart insights
          </p>
        </div>

        <div className="features-display">
          {/* Left Side Features */}
          <div className="features-column left-column">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-item ${
                  activeFeature === feature.title ? "active" : ""
                }`}
                onMouseEnter={() => setActiveFeature(feature.title)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="feature-content">
                  <div
                    className="feature-icon-circle"
                    style={{
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                    }}
                  >
                    <i className={feature.icon}></i>
                  </div>
                  <div className="feature-text">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side iPad Mockup */}
          <div className="ipad-mockup">
            <div className="ipad-container">
              <div className="ipad-screen">
                <div className="ipad-camera"></div>
                <div className="screen-content">{renderPhoneScreen()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
