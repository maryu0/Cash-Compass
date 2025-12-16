import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login-page.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);

    try {
      // Connect to backend API
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="brand-logo">
          <i className="fas fa-compass"></i>
          <span>CashCompass</span>
        </div>

        <div className="info-content">
          <h1>
            Welcome <span className="highlight">Back!</span>
          </h1>
          <p className="tagline">
            Sign in to access your financial dashboard and continue managing
            your money wisely.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Track your expenses in real-time</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Get AI-powered financial insights</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">
                <i className="fas fa-check"></i>
              </div>
              <span>Achieve your savings goals faster</span>
            </div>
          </div>
        </div>

        <div className="illustration">
          <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#60A5FA", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#A78BFA", stopOpacity: 0.8 }}
                />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#34D399", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#60A5FA", stopOpacity: 0.8 }}
                />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#FBBF24", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#F59E0B", stopOpacity: 0.8 }}
                />
              </linearGradient>
            </defs>

            {/* Background circles */}
            <circle cx="200" cy="150" r="120" fill="rgba(96, 165, 250, 0.15)" />
            <circle cx="200" cy="150" r="80" fill="rgba(167, 139, 250, 0.1)" />

            {/* Growth chart bars with gradients */}
            <rect
              x="50"
              y="180"
              width="35"
              height="70"
              rx="6"
              fill="url(#grad1)"
            />
            <rect
              x="100"
              y="160"
              width="35"
              height="90"
              rx="6"
              fill="url(#grad1)"
            />
            <rect
              x="150"
              y="130"
              width="35"
              height="120"
              rx="6"
              fill="url(#grad2)"
            />
            <rect
              x="200"
              y="100"
              width="35"
              height="150"
              rx="6"
              fill="url(#grad2)"
            />
            <rect
              x="250"
              y="70"
              width="35"
              height="180"
              rx="6"
              fill="url(#grad3)"
            />
            <rect
              x="300"
              y="40"
              width="35"
              height="210"
              rx="6"
              fill="url(#grad3)"
            />

            {/* Trend line */}
            <path
              d="M 67 215 L 117 185 L 167 155 L 217 125 L 267 95 L 317 65"
              stroke="#FBBF24"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Dots on trend line */}
            <circle
              cx="67"
              cy="215"
              r="6"
              fill="#60A5FA"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="117"
              cy="185"
              r="6"
              fill="#60A5FA"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="167"
              cy="155"
              r="6"
              fill="#34D399"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="217"
              cy="125"
              r="6"
              fill="#34D399"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="267"
              cy="95"
              r="6"
              fill="#FBBF24"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="317"
              cy="65"
              r="6"
              fill="#FBBF24"
              stroke="white"
              strokeWidth="2"
            />

            {/* Up arrow */}
            <path
              d="M 335 55 L 350 35 L 365 55 L 350 50 Z"
              fill="#34D399"
              stroke="white"
              strokeWidth="2"
            />

            {/* Dollar signs */}
            <text
              x="80"
              y="90"
              fill="#60A5FA"
              fontSize="24"
              fontWeight="bold"
              opacity="0.7"
            >
              $
            </text>
            <text
              x="320"
              y="25"
              fill="#FBBF24"
              fontSize="28"
              fontWeight="bold"
              opacity="0.8"
            >
              $
            </text>
          </svg>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Login to Your Account</h2>
          <p className="subtitle">Enter your credentials to continue</p>

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

          <form className="login-form" onSubmit={handleSubmit}>
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

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
