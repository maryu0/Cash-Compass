import React, { useState, useEffect } from "react";
import "./FAQ.css";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    // Section-level animation
    const sectionObserverOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === "faq") {
          entry.target.style.animation = "slideUp 0.8s ease-out forwards";
        }
      });
    }, sectionObserverOptions);

    const faqSection = document.getElementById("faq");
    if (faqSection) {
      sectionObserver.observe(faqSection);
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

    document.querySelectorAll(".faq-item").forEach((item) => {
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const faqItems = [
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use 256-bit AES encryption and comply with PCI-DSS standards. Your data is never shared with third parties without your permission.",
    },
    {
      question: "Can I import my financial data?",
      answer:
        "Absolutely! We support importing from all major banks and financial institutions. The process takes just 5 minutes.",
    },
    {
      question: "What's included in the free trial?",
      answer:
        "You get full access to Pro features for 30 days, completely free. No credit card required to start.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes! We offer 24/7 support via chat, email, and phone. Our average response time is under 2 minutes.",
    },
  ];

  const toggleItem = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq">
      <div className="section-header">
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>

      <div className="faq-container">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <div className="faq-question" onClick={() => toggleItem(index)}>
              <h4>{item.question}</h4>
              <span className="faq-icon">+</span>
            </div>
            <div className="faq-answer">{item.answer}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
