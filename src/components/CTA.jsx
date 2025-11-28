import React from "react";
import "./CTA.css";

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <h2>Take Control of Your Financial Future</h2>
        <p>
          Join thousands of gig workers and informal economy participants who
          are building financial security with CashCompass. Start getting
          proactive guidance today—no credit card required.
        </p>
        <a href="login.html" target="_blank" className="primary-button">
          Start Your Free Trial
        </a>
      </div>
    </section>
  );
}
