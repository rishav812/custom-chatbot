import React from "react";
import "../../../styles/Chatbot.css";

const TypingLoader: React.FC = () => {
  return (
    // <div className={styles.chat_bubble}>
      <div className="typing">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    // </div>
  );
};

export default TypingLoader;
