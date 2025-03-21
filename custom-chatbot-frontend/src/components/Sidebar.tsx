import type React from "react";
import "../styles/global.css";
import { useState } from "react";
import NewBotIcon from "./svgElements/NewBotIcon";
import ChatIcon from "./svgElements/ChatIcon";
import { Link } from "react-router-dom";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState("training");
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      <div className="sidebar-tabs">
        <Link
          to="/"
          className={`sidebar-tab ${activeTab === "training" ? "active" : ""}`}
          onClick={() => setActiveTab("training")}
        >
          <NewBotIcon />
          Bot Training
        </Link>
        <Link
          to="/chat-history"
          className={`sidebar-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <ChatIcon />
          Chat History
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
