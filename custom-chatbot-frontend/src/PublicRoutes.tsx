import { Route, Routes } from "react-router-dom";

import ChatBot from "./components/views/chat/ChatBot";
import UploadDocument from "./components/views/admin/uploadDocument/uploadDocument";
import Sidebar from "./components/Sidebar";

import { FC } from "react";
import ChatHistory from "./components/views/admin/chatHistory/ChatHistory";
import "../src/styles/global.css";
import ChatbotButton from "./components/ChatbotButton";

interface WithSidebarProps {
  Component: FC;
  route: string;
}

const WithSidebar: FC<WithSidebarProps> = ({ Component }) => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Component />
      </div>
      <ChatbotButton />
    </div>
  );
};

const PublicRoutes = () => {
  return (
    <div className="main-container">
      <Routes>
        <Route
          path="/"
          element={<WithSidebar Component={UploadDocument} route="/" />}
        />
        <Route
          path="/chat-history"
          element={
            <WithSidebar Component={ChatHistory} route="/chat-history" />
          }
        />
      </Routes>
    </div>
  );
};

export default PublicRoutes;
