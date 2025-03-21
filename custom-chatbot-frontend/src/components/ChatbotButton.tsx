import type React from "react"
import { useState } from "react"
import ChatInterface from "./views/chat/ChatBot"
import "../styles/Chatbot.css"
import BotIcon from "./svgElements/BotIcon"

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <ChatInterface onClose={() => setIsOpen(false)} />
      ) : (
        <button onClick={toggleChat} className="chatbot-button" aria-label="Open chat">
          <BotIcon />
        </button>
      )}
    </div>
  )
}

export default ChatbotButton

