import React, { useState } from "react";
import "./ChatbotWidget.css";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-widget">
      <button className="chatbot-button" onClick={handleToggle}>
        <i className="fas fa-comment-dots"></i>
        <div className="chatbot-badge-widget">AI</div>
      </button>
    </div>
  );
}
