import React from "react";
import "./SummarySection.css";

const SummarySection = ({ summaryData }) => {
  const { insights = [], crisisAlert } = summaryData || {};

  return (
    <div className="summary-section">
      {/* Crisis Alert Banner */}
      {crisisAlert && (
        <div
          className={`crisis-alert-banner crisis-${crisisAlert.level?.toLowerCase()}`}
        >
          <div className="crisis-alert-icon">
            {crisisAlert.level === "High"
              ? ""
              : crisisAlert.level === "Medium"
              ? ""
              : ""}
          </div>
          <div className="crisis-alert-content">
            <span className="crisis-level">{crisisAlert.level} Risk Level</span>
            <p className="crisis-message">{crisisAlert.message}</p>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="insights-container">
          <h3 className="insights-title"> Insights & Recommendations</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-bullet"></span>
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
