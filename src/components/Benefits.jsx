import React, { useEffect } from "react";
import "./Benefits.css";

export default function Benefits() {
  useEffect(() => {
    // Section-level animation
    const sectionObserverOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === "benefits") {
          entry.target.style.animation = "slideUp 0.8s ease-out forwards";
        }
      });
    }, sectionObserverOptions);

    const benefitsSection = document.getElementById("benefits");
    if (benefitsSection) {
      sectionObserver.observe(benefitsSection);
    }

    // Item-level animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "slideUp 0.8s ease-out forwards";
        }
      });
    }, observerOptions);

    document.querySelectorAll(".benefit-item").forEach((item) => {
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const benefits = [
    {
      title: "Anticipate Financial Risks Before They Hit",
      desc: "CashCompass detects patterns and warns you early—preventing debt spirals and emergency financial crises",
    },
    {
      title: "Smart Savings Without Stress",
      desc: "Build emergency funds aligned with your unpredictable income. Save what you can when you can, automatically",
    },
    {
      title: "Understand Your Money Better",
      desc: "Learn your spending habits with clear, judgment-free insights delivered in your language",
    },
    {
      title: "AI Coach Available 24/7",
      desc: "Chat anytime for personalized advice. No financial expertise needed—just honest conversations",
    },
  ];

  return (
    <section id="benefits" className="benefits">
      <div className="benefits-container">
        <div className="benefits-content">
          <h2 className="section-title">Financial Wellbeing Made Accessible</h2>
          <div className="benefits-list">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="benefit-item"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="benefit-icon">✓</div>
                <div className="benefit-text">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="benefits-visual">
          <div className="progress-ring">
            <svg viewBox="0 0 100 100" className="circular-progress">
              <circle cx="50" cy="50" r="45" className="progress-bg" />
              <circle cx="50" cy="50" r="45" className="progress-fill" />
            </svg>
            <div className="progress-text">78%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
