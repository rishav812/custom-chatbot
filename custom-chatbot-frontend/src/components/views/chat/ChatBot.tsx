import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import moment from "moment";
import "./Chat.css";
import { Controller, useForm } from "react-hook-form";
import CommonInput from "../../formElements/commonInput/commonInput";
import BotIcon from "../../svgElements/BotIcon";

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

const ChatBot: React.FC = () => {
  const [openBot, setOpenBot] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();
  const [messages, setMessages] = useState<IMessages[]>([]);
  const [appendText, setAppendText] = useState("");
  const chunkMessageRef = useRef<{ text: string }>({
    text: "",
  });

  const [connect, setConnect] = useState(false);
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
          console.log("here comes user message first");
          setMessages((prevMessages) => [...prevMessages, data]);
        }
        if (data.isBot) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      }
    };

    if (!socketRef.current) {
      const socket = io("http://localhost:8000/", { path: "/socket.io/" });
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
    }
  };

  return (
    <div className="container">
      {openBot && (
        <div className="chatContainer">
          <div className="chatHeader">
            <div className="Header">
              <div>
                <div>AI Dev</div>
              </div>
              <div>
                <p>{connect ? "online" : "offline"}</p>
              </div>
            </div>
          </div>
          <ul className="messageList">
            {messages.map((message, index) => (
              <li
                key={index}
                className={`messageItem ${message.isBot ? "bot" : "user"}`}
              >
                {message.message}
              </li>
            ))}
          </ul>
          <form className="chatForm" onSubmit={handleSubmit(sendMessage)}>
            <CommonInput
              required
              control={control}
              className="chatInput"
              name="chatInput"
              placeholder="Type your message"
              type="text"
              error={errors?.chatInput}
            />
            <button className="chatButton" type="submit">
              Send
            </button>
          </form>
        </div>
      )}

      {/* <button
        type="button"
        className="bot-icon-box"
        onClick={() => setOpenBot(!openBot)}
      >
        <BotIcon />
      </button> */}
    </div>
  );
};

export default ChatBot;
