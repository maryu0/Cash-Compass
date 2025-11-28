import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>
              <i className="fas fa-compass"></i> CashCompass
            </h3>
            <p>
              Your AI-powered financial intelligence platform for smarter
              investing and wealth management.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Product</h3>
            <ul>
              <li>
                <a href="#features">
                  <i className="fas fa-arrow-right"></i> Features
                </a>
              </li>
              <li>
                <a href="#chatbot">
                  <i className="fas fa-arrow-right"></i> AI Chatbot
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Pricing
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Security
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> About Us
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Blog
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Careers
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Press
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Privacy Policy
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Terms of Service
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Cookie Policy
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-arrow-right"></i> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; 2025 CashCompass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
