import React from "react";
import "./SummarySection.css";

const SummarySection = ({ summaryData }) => {
  const { insights = [] } = summaryData || {};

  return (
    <div className="summary-section">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="insights-container">
          <h3 className="insights-title">💡 Insights & Recommendations</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-bullet">•</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
