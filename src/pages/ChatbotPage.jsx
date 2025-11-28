import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./ChatbotPage.css";

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        'Hello! 👋 I\'m your **AI Financial Buddy** with Agentic capabilities!\n\n🤖 **I can take actions for you:**\n• 📧 "Send me a weekly report"\n• 🚨 "Set up crisis alerts"\n• 💰 "Create a smart budget"\n• ⏰ "Remind me about bills"\n• 🎯 "Set a savings goal"\n\n🔔 **Real-time Risk Monitoring Active** - I\'ll alert you when risk exceeds 80%!\n\nWhat would you like to know or do?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);
  const messagesEndRef = useRef(null);
  const alertCheckIntervalRef = useRef(null);
  const shownAlertIdsRef = useRef(new Set()); // Track alerts we've already shown (useRef persists across renders)

  const quickActions = [
    { label: "📊 Risk Score", message: "What's my risk score?" },
    { label: "💸 Spending", message: "Where is my money going?" },
    { label: "📧 Send Report", message: "Send me a weekly report" },
    { label: "🚨 Set Alert", message: "Set up crisis alerts for me" },
    { label: "💰 Smart Budget", message: "Create a smart budget for me" },
    { label: "💡 Tips", message: "Give me financial tips" },
  ];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchRiskData();
    fetchMonitoringStatus();

    // Start polling for alerts every 5 seconds
    alertCheckIntervalRef.current = setInterval(() => {
      checkForNewAlerts();
      fetchCurrentRisk();
    }, 5000);

    return () => {
      if (alertCheckIntervalRef.current) {
        clearInterval(alertCheckIntervalRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRiskData = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/risk");
      const data = await response.json();
      if (data.success) {
        setRiskData(data.data);
      }
    } catch (error) {
      console.error("Error fetching risk data:", error);
    }
  };

  const fetchMonitoringStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/monitoring/status"
      );
      const data = await response.json();
      if (data.success) {
        setMonitoringStatus(data);
      }
    } catch (error) {
      console.error("Error fetching monitoring status:", error);
    }
  };

  const fetchCurrentRisk = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/risk/current");
      const data = await response.json();
      if (data.success) {
        // Update risk data with critical status
        setRiskData({
          ...data.data,
          is_critical: data.is_critical,
        });
      }
    } catch (error) {
      console.error("Error fetching current risk:", error);
    }
  };

  const checkForNewAlerts = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/alerts?limit=5");
      const data = await response.json();

      if (data.success && data.alerts && data.alerts.length > 0) {
        const newAlerts = data.alerts;

        // Find alerts we haven't shown yet using the ref
        const unseenAlerts = newAlerts.filter(
          (alert) => !shownAlertIdsRef.current.has(alert.id)
        );

        if (unseenAlerts.length > 0) {
          // Get the newest unseen alert
          const newestAlert = unseenAlerts[unseenAlerts.length - 1];

          // Mark this alert as shown immediately (using ref, no re-render needed)
          shownAlertIdsRef.current.add(newestAlert.id);

          setLatestAlert(newestAlert);
          setShowAlertPopup(true);

          // Auto-hide popup after 10 seconds
          setTimeout(() => setShowAlertPopup(false), 10000);

          // Add alert message to chat
          const alertMessage = {
            id: Date.now(),
            type: "bot",
            content: `🚨 **RISK ALERT!**\n\nYour risk score has reached **${
              newestAlert.risk_score
            }%** (threshold: ${newestAlert.threshold}%)\n\n**Risk Level:** ${
              newestAlert.risk_level?.toUpperCase() || "HIGH"
            }\n\n**Reasons:**\n${
              newestAlert.reasons?.map((r) => `• ${r}`).join("\n") ||
              "High spending detected"
            }\n\n**Recommended Actions:**\n${
              newestAlert.recommended_actions
                ?.map((a) => `• ${a}`)
                .join("\n") || "• Review recent spending\n• Set up a budget"
            }`,
            timestamp: new Date(),
            isAlert: true,
          };
          setMessages((prev) => [...prev, alertMessage]);
        }
        setAlerts(newAlerts);
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          user_id: user?.id || "user123",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          content: data.response.message,
          data: data.response.data,
          responseType: data.response.type,
          agenticActions: data.response.agentic_actions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Update risk data if we got new data
        if (data.response.data?.risk_score) {
          setRiskData(data.response.data);
        }
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        content:
          "I'm having trouble connecting right now. Please make sure the chatbot server is running on port 5001. You can start it by running `python main.py` in the chatbot-backend folder.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (message) => {
    sendMessage(message);
  };

  const formatMessage = (content) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "healthy":
        return "#10b981";
      case "caution":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Risk Alert Popup */}
      {showAlertPopup && latestAlert && (
        <div className="alert-popup-overlay">
          <div className="alert-popup">
            <div className="alert-popup-header">
              <span className="alert-icon">🚨</span>
              <h3>RISK ALERT!</h3>
              <button
                className="alert-close-btn"
                onClick={() => setShowAlertPopup(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="alert-popup-content">
              <div className="alert-risk-score">
                <span className="risk-number">{latestAlert.risk_score}%</span>
                <span className="risk-label">Risk Score</span>
              </div>
              <div className="alert-details">
                <p className="alert-threshold">
                  Threshold exceeded: {latestAlert.threshold}%
                </p>
                <p className="alert-level">
                  Risk Level:{" "}
                  <strong>{latestAlert.risk_level?.toUpperCase()}</strong>
                </p>
                {latestAlert.reasons && latestAlert.reasons.length > 0 && (
                  <div className="alert-reasons">
                    <strong>Reasons:</strong>
                    <ul>
                      {latestAlert.reasons.slice(0, 3).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="alert-popup-actions">
              <button
                className="alert-action-btn"
                onClick={() => {
                  setShowAlertPopup(false);
                  sendMessage("What should I do to reduce my risk?");
                }}
              >
                Get Advice
              </button>
              <button
                className="alert-dismiss-btn"
                onClick={() => setShowAlertPopup(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        className={`dashboard-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="chatbot-header-info">
                <h1>AI Financial Buddy</h1>
                <span className="chatbot-status">
                  <span className="status-indicator"></span>
                  Online • Ready to help
                </span>
              </div>
            </div>
            <div className="chatbot-header-right">
              {riskData && (
                <div
                  className={`risk-badge ${
                    riskData.is_critical ? "critical" : ""
                  }`}
                  style={{ backgroundColor: getRiskColor(riskData.risk_level) }}
                >
                  <i className="fas fa-shield-alt"></i>
                  <span>Risk: {riskData.risk_score}/100</span>
                  {riskData.is_critical && (
                    <span className="critical-pulse"></span>
                  )}
                </div>
              )}
              {monitoringStatus?.monitoring_active && (
                <div className="monitoring-badge">
                  <span className="monitoring-pulse"></span>
                  <i className="fas fa-eye"></i>
                  <span>Monitoring</span>
                </div>
              )}
              <div className="agentic-badge">
                <i className="fas fa-robot"></i>
                <span>Agentic AI</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.message)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.type === "user" ? "user-message" : "bot-message"
                }`}
              >
                {message.type === "bot" && (
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="message-content">
                  <div
                    className="message-text"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content),
                    }}
                  />
                  {message.agenticActions &&
                    message.agenticActions.length > 0 && (
                      <div className="agentic-actions-display">
                        <div className="agentic-actions-header">
                          <i className="fas fa-cogs"></i>
                          <span>Actions Triggered</span>
                        </div>
                        <div className="agentic-actions-list">
                          {message.agenticActions.map((action, idx) => (
                            <div
                              key={idx}
                              className={`action-item ${
                                action.success || action.pending
                                  ? "success"
                                  : "failed"
                              }`}
                            >
                              <span className="action-icon">
                                {action.success
                                  ? "✅"
                                  : action.pending
                                  ? "⏳"
                                  : "❌"}
                              </span>
                              <span className="action-name">
                                {action.action
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.type === "user" && (
                  <div className="message-avatar user-avatar-msg">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your finances..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <p className="input-hint">
              <i className="fas fa-magic"></i>
              Try: "Send me a report" or "Set up alerts" - I can take actions!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
