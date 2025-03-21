import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import moment from "moment";
import "./Chat.css";
import { Controller, useForm } from "react-hook-form";
import CommonInput from "../../formElements/commonInput/commonInput";
import BotIcon from "../../svgElements/BotIcon";
import NewBotIcon from "../../svgElements/NewBotIcon";
import CloseIcon from "../../svgElements/CloseIcon";
import SendIcon from "../../svgElements/SendIcon";
import TypingLoader from "./TypingLoader";
// import "../../../styles/ChatBot.css";

interface IFormInput {
  chatInput: string;
}

interface IMessages {
  mt: string;
  sid: string;
  partial?: string;
  isBot?: Boolean;
  message?: string;
  time?: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onClose,
}: ChatInterfaceProps) => {
  const [openBot, setOpenBot] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInput>();
  const [messages, setMessages] = useState<IMessages[]>([
    {
      mt: "message_upload_confirm",
      sid: "123",
      message: "Hello! How can I help you?",
      isBot: true,
    },
  ]);
  const [appendText, setAppendText] = useState("");
  const chunkMessageRef = useRef<{ text: string }>({
    text: "",
  });

  const [connect, setConnect] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const socketRef = useRef<any>();

  useEffect(() => {
    const handleMessage = (message: any) => {
      const data = JSON.parse(message);
      console.log("data====>", data);
      if (data.mt === "chat_message_bot_partial") {
        chunkMessageRef.current = {
          text: (chunkMessageRef.current.text ?? "") + (data.partial ?? ""),
        };
        setAppendText(chunkMessageRef.current.text);
      } else if (data.mt === "message_upload_confirm") {
        if (!data.isBot) {
          setShowTyping(true);
          setMessages((prevMessages) => [...prevMessages, data]);
        }
        if (data.isBot) {
          setShowTyping(false);
          setMessages((prevMessages) => [...prevMessages, data]);
        }
        setAppendText("");
        chunkMessageRef.current = { text: "" };
      }
    };

    if (!socketRef.current) {
      const socket = io("http://127.0.0.1:8000/", { path: "/socket.io" });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnect(socket.connected);
        console.log("Connected with ID:", socket.id);
      });
      socket.on("disconnect", () => {
        setConnect(socket.connected);
        console.log("Disconnected with ID:", socket.id);
      });

      socket.on("new_message", handleMessage);
      return () => {
        if (socketRef.current) {
          socketRef.current.off("connect");
          socketRef.current.off("disconnect");
          socketRef.current.off("message");
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  const sendMessage = (data: any) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      const messageData = {
        mt: "message_upload",
        message: data.chatInput,
        isBot: false,
        timezone: moment().format("Z").toString(),
      };
      socket.emit("message", messageData);
      reset({ chatInput: "" });
    }
  };

  return (
    <div className="chatbot-interface">
      <div className="chat-header">
        <div className="chat-header-title">
          <NewBotIcon />
          <h3>AI Dev</h3>
          <span>{connect ? "online" : "offline"}</span>
        </div>
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close chat"
        >
          <CloseIcon />
        </button>
      </div>
      <ul className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isBot ? "bot" : "user"}`}
          >
            <div className="message-content">
              <p>{message.message}</p>
              {/* <div className="message-time">{formatTime(message.timestamp)}</div> */}
            </div>
          </div>
        ))}
      </ul>
      {showTyping && !appendText && (
        <div>
          <TypingLoader />
        </div>
      )}
      <div className="input-area">
        <form className="input-container" onSubmit={handleSubmit(sendMessage)}>
          <CommonInput
            required
            control={control}
            className="message-input"
            name="chatInput"
            placeholder="Type your message"
            type="text"
            error={errors?.chatInput}
          />
          <button className="send-button" type="submit">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
