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
      // TODO: Connect to backend API
      // const response = await fetch('http://localhost:5000/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: formData.email, password: formData.password })
      // });
      // const data = await response.json();
      // if (data.success) {
      //   localStorage.setItem('token', data.data.token);
      //   localStorage.setItem('user', JSON.stringify(data.data.user));
      // }

      console.log("Login:", formData);

      // Mock authentication - Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser = {
        id: "1",
        name: formData.email.split("@")[0],
        email: formData.email,
      };
      const mockToken = "mock-jwt-token-" + Date.now();

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Redirect to dashboard
      navigate("/dashboard");
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
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="250" cy="200" r="150" fill="rgba(255,255,255,0.1)" />
            <path
              d="M200 150 L250 100 L300 150 L250 200 Z"
              fill="rgba(255,255,255,0.2)"
            />
            <circle cx="250" cy="200" r="80" fill="rgba(255,255,255,0.15)" />
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
