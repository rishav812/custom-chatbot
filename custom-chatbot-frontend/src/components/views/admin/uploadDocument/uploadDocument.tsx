import React, { useState } from "react";
import ChatBot from "../../chat/ChatBot";
import BotIcon from "../../../svgElements/BotIcon";

function UploadDocument() {
  const [openBot, setOpenBot] = useState(false);
  return (
    <div className="container">
      <div className="chatContainer">{openBot && <ChatBot />}</div>
      <button
        type="button"
        className="bot-icon-box"
        onClick={() => setOpenBot(!openBot)}
      >
        <BotIcon />
      </button>
    </div>
  );
}

export default UploadDocument;
