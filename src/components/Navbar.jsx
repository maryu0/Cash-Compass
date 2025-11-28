import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <nav className="navbar">
          <a href="#" className="logo">
            <i className="fas fa-compass"></i>
            <span>CashCompass</span>
          </a>
          <div className="nav-links">
            <a href="#features" onClick={(e) => scrollToSection(e, "features")}>
              Features
            </a>
            <a href="#chatbot" onClick={(e) => scrollToSection(e, "chatbot")}>
              AI Chatbot
            </a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")}>
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={(e) => scrollToSection(e, "testimonials")}
            >
              Testimonials
            </a>
            <Link
              to="/login"
              target="_blank"
              className="cta-button"
              style={{ padding: "15px 20px", color: "white" }}
            >
              Login/Signup
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
