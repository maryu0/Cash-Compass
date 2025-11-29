import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ChatbotPage from "./pages/ChatbotPage";
import TransactionsPage from "./pages/TransactionsPage";
import SettingsPage from "./pages/SettingsPage";
import CrisisAlertsPage from "./pages/CrisisAlertsPage";
import GoalsPage from "./pages/GoalsPage";
import BudgetsPage from "./pages/BudgetsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/chatbot" element={<ChatbotPage />} />
      <Route path="/dashboard/transactions" element={<TransactionsPage />} />
      <Route path="/dashboard/budgets" element={<BudgetsPage />} />
      <Route path="/dashboard/settings" element={<SettingsPage />} />
      <Route path="/dashboard/alerts" element={<CrisisAlertsPage />} />
      <Route path="/dashboard/goals" element={<GoalsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
