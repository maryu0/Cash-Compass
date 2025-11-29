import React from "react";
import "./Pricing.css";

export default function Pricing() {
  const plans = [
    {
      name: "Essential",
      price: "₹0",
      description: "Start your financial journey",
      features: [
        "Income & expense tracking",
        "Spending habit insights",
        "Basic financial alerts",
      ],
      highlighted: false,
      cta: "Get Started",
    },
    {
      name: "SmartGuard",
      price: "₹75/mo",
      description: "Complete AI-powered financial protection",
      features: [
        "Advanced AI Risk Prediction",
        "Proactive AI Coaching",
        "Goal-Based Budgeting",
        "Income Fluctuation Alerts",
        "Priority Alerts via SMS/WhatsApp",
        "Debt Reduction Strategy Builder",
      ],
      highlighted: true,
      cta: "Start Free Trial",
    },
  ];

  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="section-title">
          <h2>Affordable Financial Coaching for Everyone</h2>
          <p>
            Choose the plan that fits your needs. All plans include a free
            trial, no credit card required.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${
                plan.highlighted ? "highlighted" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="popular-badge">Most Popular</div>
              )}

              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>

              <div className="pricing">
                <span className="price">{plan.price}</span>
              </div>

              <button className="pricing-cta">{plan.cta}</button>

              <div className="features-list">
                <h4>What's included:</h4>
                <ul>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <p>
            All plans include a free trial.
            <a href="#"> See FAQ for more details</a>
          </p>
        </div>
      </div>
    </section>
  );
}
