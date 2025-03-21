import type React from "react"
// import "../styles/global.css"

const ChatHistory: React.FC = () => {
  return (
    <div className="chat-history-page">
      <div className="page-header">
        <h1>Chat History</h1>
      </div>

      <div className="chat-history-empty">
        <p>No chat history available yet.</p>
        <p>Start a conversation with the chatbot to see your history here.</p>
      </div>
    </div>
  )
}

export default ChatHistory

