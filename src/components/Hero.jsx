import React, { useEffect } from "react";
import "./Hero.css";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  useEffect(() => {
    // Add fade-in animation to elements
    const elements = document.querySelectorAll(".fade-in");
    elements.forEach((el) => {
      el.classList.add("appear");
    });

    // Counter animation for stats
    const animateCounter = (element, targetValue, duration = 2000) => {
      const startTime = Date.now();
      const start = 0;

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Parse the target value
        let numericTarget = targetValue;
        if (typeof targetValue === "string") {
          numericTarget = parseFloat(targetValue.replace(/[^0-9.]/g, ""));
        }

        const current = Math.floor(start + numericTarget * progress);
        element.textContent =
          current.toLocaleString() +
          (targetValue.includes("K")
            ? "K+"
            : targetValue.includes("B")
            ? "B+"
            : "★");

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = targetValue;
        }
      };

      updateCounter();
    };

    // Trigger counter animation when stats come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statNumbers = document.querySelectorAll(".stat-number");
            statNumbers.forEach((stat) => {
              const targetValue =
                stat.getAttribute("data-target") || stat.textContent;
              if (!stat.classList.contains("animated")) {
                animateCounter(stat, targetValue);
                stat.classList.add("animated");
              }
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.querySelector(".hero-stats");
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-check-circle"></i>
            Trusted by gig workers & informal economy participants
          </div>
          <h1>
            AI-Powered <span>Financial Partner</span> for Everyone
          </h1>
          <p>
            Empower yourself with continuous financial monitoring, proactive
            risk detection, and adaptive budgeting. CashCompass learns from your
            spending habits and income fluctuations to deliver personalized
            guidance in simple, accessible language—no financial expertise
            required.
          </p>
          <div className="hero-buttons">
            <a href="#" className="primary-button">
              Start Free Trial
            </a>
            <a href="#" className="secondary-button">
              Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number" data-target="25K+">
                250K+
              </span>
              <span className="stat-label">Financial Lives Improved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number" data-target="$1M+">
                $180M+
              </span>
              <span className="stat-label">Savings Protected</span>
            </div>
            <div className="stat-item">
              <span className="stat-number" data-target="35+">
                3+
              </span>
              <span className="stat-label">Languages Supported</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
