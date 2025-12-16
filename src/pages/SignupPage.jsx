import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signup-page.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      // Connect to backend API
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="brand-logo">
          <i className="fas fa-compass"></i>
          <span>CashCompass</span>
        </div>

        <div className="info-content">
          <h1>
            Start Your <span className="highlight">Journey</span>
          </h1>
          <p className="tagline">
            Join thousands of users who are taking control of their financial
            future with CashCompass.
          </p>

          {/* Cash/Money Illustration */}
          <div className="illustration">
            <svg
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="bill1Grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#34D399", stopOpacity: 0.95 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#10B981", stopOpacity: 0.95 }}
                  />
                </linearGradient>
                <linearGradient
                  id="bill2Grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#60A5FA", stopOpacity: 0.95 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#3B82F6", stopOpacity: 0.95 }}
                  />
                </linearGradient>
                <linearGradient
                  id="bill3Grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#A78BFA", stopOpacity: 0.95 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#8B5CF6", stopOpacity: 0.95 }}
                  />
                </linearGradient>
                <linearGradient
                  id="coinGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#FCD34D", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#F59E0B", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>

              {/* Background circles */}
              <circle cx="200" cy="150" r="130" fill="rgba(34, 197, 94, 0.1)" />
              <circle
                cx="200"
                cy="150"
                r="90"
                fill="rgba(59, 130, 246, 0.08)"
              />

              {/* Dollar bill 1 - Green (back) */}
              <g transform="rotate(-15 140 180)">
                <rect
                  x="90"
                  y="150"
                  width="100"
                  height="60"
                  rx="6"
                  fill="url(#bill1Grad)"
                  stroke="#059669"
                  strokeWidth="2"
                />
                <circle cx="140" cy="180" r="18" fill="rgba(255,255,255,0.3)" />
                <text
                  x="140"
                  y="190"
                  textAnchor="middle"
                  fill="#065F46"
                  fontSize="28"
                  fontWeight="bold"
                >
                  $
                </text>
                <rect
                  x="100"
                  y="158"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
                <rect
                  x="100"
                  y="202"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
              </g>

              {/* Dollar bill 2 - Blue (middle) */}
              <g transform="rotate(5 200 150)">
                <rect
                  x="150"
                  y="120"
                  width="100"
                  height="60"
                  rx="6"
                  fill="url(#bill2Grad)"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <circle cx="200" cy="150" r="18" fill="rgba(255,255,255,0.3)" />
                <text
                  x="200"
                  y="160"
                  textAnchor="middle"
                  fill="#1E3A8A"
                  fontSize="28"
                  fontWeight="bold"
                >
                  $
                </text>
                <rect
                  x="160"
                  y="128"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
                <rect
                  x="160"
                  y="172"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
              </g>

              {/* Dollar bill 3 - Purple (front) */}
              <g transform="rotate(18 260 140)">
                <rect
                  x="210"
                  y="110"
                  width="100"
                  height="60"
                  rx="6"
                  fill="url(#bill3Grad)"
                  stroke="#7C3AED"
                  strokeWidth="2"
                />
                <circle cx="260" cy="140" r="18" fill="rgba(255,255,255,0.3)" />
                <text
                  x="260"
                  y="150"
                  textAnchor="middle"
                  fill="#5B21B6"
                  fontSize="28"
                  fontWeight="bold"
                >
                  $
                </text>
                <rect
                  x="220"
                  y="118"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
                <rect
                  x="220"
                  y="162"
                  width="80"
                  height="4"
                  rx="2"
                  fill="rgba(255,255,255,0.4)"
                />
              </g>

              {/* Floating coins */}
              <circle
                cx="110"
                cy="100"
                r="16"
                fill="url(#coinGrad)"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x="110"
                y="107"
                textAnchor="middle"
                fill="#78350F"
                fontSize="18"
                fontWeight="bold"
              >
                $
              </text>

              <circle
                cx="290"
                cy="210"
                r="14"
                fill="url(#coinGrad)"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x="290"
                y="216"
                textAnchor="middle"
                fill="#78350F"
                fontSize="16"
                fontWeight="bold"
              >
                $
              </text>

              <circle
                cx="80"
                cy="220"
                r="12"
                fill="url(#coinGrad)"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x="80"
                y="225"
                textAnchor="middle"
                fill="#78350F"
                fontSize="14"
                fontWeight="bold"
              >
                $
              </text>

              <circle
                cx="320"
                cy="90"
                r="13"
                fill="url(#coinGrad)"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x="320"
                y="96"
                textAnchor="middle"
                fill="#78350F"
                fontSize="15"
                fontWeight="bold"
              >
                $
              </text>

              {/* Sparkle effects */}
              <circle cx="130" cy="80" r="3" fill="#FCD34D" opacity="0.9" />
              <circle cx="270" cy="190" r="2.5" fill="#34D399" opacity="0.9" />
              <circle cx="100" cy="200" r="2" fill="#60A5FA" opacity="0.9" />
              <circle cx="310" cy="110" r="2.5" fill="#A78BFA" opacity="0.9" />
            </svg>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Free to get started, no credit card required</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Advanced AI-powered expense tracking</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Secure and private - your data is protected</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Real-time budget alerts and notifications</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Smart savings goals with auto-tracking</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Multi-platform sync - Web, iOS & Android</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$2M+</span>
              <span className="stat-label">Money Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">User Rating</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="badge-item">
              <i className="fas fa-shield-alt"></i>
              <span>Bank-Level Security</span>
            </div>
            <div className="badge-item">
              <i className="fas fa-lock"></i>
              <span>256-bit Encryption</span>
            </div>
            <div className="badge-item">
              <i className="fas fa-award"></i>
              <span>Award Winning App</span>
            </div>
          </div>
        </div>

        {/* Floating decorative icons */}
        <i className="fas fa-chart-line floating-icon"></i>
        <i className="fas fa-dollar-sign floating-icon"></i>
        <i className="fas fa-wallet floating-icon"></i>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Create Your Account</h2>
          <p className="subtitle">Fill in your details to get started</p>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <i className="fas fa-phone"></i>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fas fa-eye${showPassword ? "-slash" : ""}`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={`fas fa-eye${
                      showConfirmPassword ? "-slash" : ""
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
