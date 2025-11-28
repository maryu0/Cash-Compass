import React from "react";
import "./Chatbot.css";

export default function Chatbot() {
  return (
    <section className="container" id="chatbot">
      <div className="chatbot-showcase">
        <div className="chatbot-content">
          <div className="chatbot-badge">
            <i className="fas fa-star"></i> Autonomous Financial Coaching
          </div>
          <h2>Your Personal AI Financial Coach</h2>
          <p>
            Meet CashCompass—your 24/7 conversational AI advisor. Explain your
            financial situation in simple terms and receive explainable guidance
            instantly. No jargon, just practical advice tailored to your income
            patterns and local context.
          </p>
          <div className="chatbot-features">
            <div className="chatbot-feature">
              <div className="chatbot-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Income Risk Detection</h4>
              <p>
                AI monitors income fluctuations and detects seasonal patterns,
                helping you prepare for low-income periods
              </p>
            </div>
            <div className="chatbot-feature">
              <div className="chatbot-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h4>Proactive Risk Prevention</h4>
              <p>
                Receive alerts before financial risks materialize—unexpected
                expenses, overdue payments, or unsustainable spending
              </p>
            </div>
            <div className="chatbot-feature">
              <div className="chatbot-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h4>Adaptive Budget Coaching</h4>
              <p>
                Get real-time budget adjustments based on your actual income
                patterns and emergency fund needs
              </p>
            </div>
            <div className="chatbot-feature">
              <div className="chatbot-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h4>Understandable Guidance</h4>
              <p>
                Financial advice explained in plain language you understand,
                respecting your local context and values
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
