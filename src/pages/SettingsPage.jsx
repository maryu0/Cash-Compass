import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardSidebar from "../components/sidebar/DashboardSidebar";
import "./SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [saveStatus, setSaveStatus] = useState("");

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    riskAlerts: true,
    emailReports: true,
    pushNotifications: false,
    alertFrequency: "immediate",
  });

  useEffect(() => {
    // Check for section parameter in URL
    const sectionParam = searchParams.get("section");
    if (
      sectionParam &&
      ["profile", "notifications", "privacy"].includes(sectionParam)
    ) {
      setActiveSection(sectionParam);
    }

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load profile from user data
    setProfileSettings((prev) => ({
      ...prev,
      name: parsedUser.name || "",
      email: parsedUser.email || "",
    }));

    // Load saved settings from localStorage
    const savedNotifications = localStorage.getItem("notificationSettings");
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }
  }, [navigate, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, type, checked, value } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveProfileSettings = () => {
    // Validate passwords if changing
    if (profileSettings.newPassword) {
      if (profileSettings.newPassword !== profileSettings.confirmPassword) {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }
    }

    // Update user in localStorage
    const updatedUser = {
      ...user,
      name: profileSettings.name,
      email: profileSettings.email,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    setSaveStatus("success");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const saveNotificationSettings = () => {
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(notificationSettings)
    );
    setSaveStatus("success");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleExportData = () => {
    // Create export data object
    const exportData = {
      user: {
        name: user?.name,
        email: user?.email,
      },
      settings: {
        notifications: notificationSettings,
      },
      exportDate: new Date().toISOString(),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashcompass_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveStatus("exported");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const settingsSections = [
    { id: "profile", label: "Profile", icon: "fa-user" },
    { id: "notifications", label: "Notifications", icon: "fa-bell" },
    { id: "privacy", label: "Privacy & Security", icon: "fa-shield-alt" },
  ];

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`dashboard-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-cog"></i>
                Settings
              </h1>
              <p className="header-subtitle">
                Manage your account preferences and settings
              </p>
            </div>
          </div>

          {/* Save Status Message */}
          {saveStatus && (
            <div className={`save-status ${saveStatus}`}>
              {saveStatus === "success" && (
                <>
                  <i className="fas fa-check-circle"></i>
                  Settings saved successfully!
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <i className="fas fa-exclamation-circle"></i>
                  Passwords do not match!
                </>
              )}
              {saveStatus === "exported" && (
                <>
                  <i className="fas fa-download"></i>
                  Data exported successfully!
                </>
              )}
            </div>
          )}

          <div className="settings-content">
            {/* Settings Navigation */}
            <div className="settings-nav">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className={`settings-nav-item ${
                    activeSection === section.id ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <i className={`fas ${section.icon}`}></i>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            <div className="settings-panel">
              {/* Profile Settings */}
              {activeSection === "profile" && (
                <div className="settings-section">
                  <h2>
                    <i className="fas fa-user"></i>
                    Profile Settings
                  </h2>
                  <p className="section-description">
                    Update your personal information and password
                  </p>

                  <div className="settings-form">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileSettings.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileSettings.email}
                        onChange={handleProfileChange}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileSettings.phone}
                        onChange={handleProfileChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-divider">
                      <span>Change Password</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={profileSettings.currentPassword}
                        onChange={handleProfileChange}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={profileSettings.newPassword}
                          onChange={handleProfileChange}
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={profileSettings.confirmPassword}
                          onChange={handleProfileChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={saveProfileSettings}
                      >
                        <i className="fas fa-save"></i>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === "notifications" && (
                <div className="settings-section">
                  <h2>
                    <i className="fas fa-bell"></i>
                    Notification Settings
                  </h2>
                  <p className="section-description">
                    Configure how you want to receive alerts and updates
                  </p>

                  <div className="settings-form">
                    <div className="toggle-group">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h4>Risk Alerts</h4>
                          <p>
                            Get notified when your risk score exceeds the
                            threshold
                          </p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            name="riskAlerts"
                            checked={notificationSettings.riskAlerts}
                            onChange={handleNotificationChange}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h4>Email Reports</h4>
                          <p>Receive weekly spending reports via email</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            name="emailReports"
                            checked={notificationSettings.emailReports}
                            onChange={handleNotificationChange}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h4>Push Notifications</h4>
                          <p>Enable browser push notifications</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={notificationSettings.pushNotifications}
                            onChange={handleNotificationChange}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="alertFrequency">Alert Frequency</label>
                      <select
                        id="alertFrequency"
                        name="alertFrequency"
                        value={notificationSettings.alertFrequency}
                        onChange={handleNotificationChange}
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly Digest</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Digest</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={saveNotificationSettings}
                      >
                        <i className="fas fa-save"></i>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security Settings */}
              {activeSection === "privacy" && (
                <div className="settings-section">
                  <h2>
                    <i className="fas fa-shield-alt"></i>
                    Privacy & Security
                  </h2>
                  <p className="section-description">
                    Manage your data and account security
                  </p>

                  <div className="settings-form">
                    {/* Security Info Cards */}
                    <div className="security-cards">
                      <div className="security-card">
                        <div className="security-icon enabled">
                          <i className="fas fa-lock"></i>
                        </div>
                        <div className="security-info">
                          <h4>Password Protection</h4>
                          <p>
                            Your account is protected with a secure password
                          </p>
                        </div>
                        <span className="security-badge enabled">Enabled</span>
                      </div>

                      <div className="security-card">
                        <div className="security-icon enabled">
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <div className="security-info">
                          <h4>Secure Connection</h4>
                          <p>All data is transmitted over HTTPS</p>
                        </div>
                        <span className="security-badge enabled">Active</span>
                      </div>

                      <div className="security-card">
                        <div className="security-icon">
                          <i className="fas fa-key"></i>
                        </div>
                        <div className="security-info">
                          <h4>Two-Factor Authentication</h4>
                          <p>Add an extra layer of security to your account</p>
                        </div>
                        <span className="security-badge disabled">
                          Coming Soon
                        </span>
                      </div>

                      <div className="security-card">
                        <div className="security-icon enabled">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="security-info">
                          <h4>Session Timeout</h4>
                          <p>
                            Automatically log out after 30 minutes of inactivity
                          </p>
                        </div>
                        <span className="security-badge enabled">30 min</span>
                      </div>
                    </div>

                    <div className="form-divider">
                      <span>Data Management</span>
                    </div>

                    <div className="data-actions">
                      <div className="data-action-card">
                        <div className="data-action-icon export">
                          <i className="fas fa-download"></i>
                        </div>
                        <div className="data-action-info">
                          <h4>Export Your Data</h4>
                          <p>
                            Download a copy of all your data including settings
                            and preferences
                          </p>
                        </div>
                        <button
                          className="data-action-btn export"
                          onClick={handleExportData}
                        >
                          <i className="fas fa-download"></i>
                          Export Data
                        </button>
                      </div>

                      <div className="data-action-card danger">
                        <div className="data-action-icon danger">
                          <i className="fas fa-trash-alt"></i>
                        </div>
                        <div className="data-action-info">
                          <h4>Delete Account</h4>
                          <p>
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                          </p>
                        </div>
                        <button className="data-action-btn danger" disabled>
                          <i className="fas fa-trash-alt"></i>
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
