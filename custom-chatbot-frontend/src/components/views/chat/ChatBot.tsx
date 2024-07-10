import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import moment from "moment";
import "./Chat.css";
import { Controller, useForm } from "react-hook-form";
import CommonInput from "../../formElements/commonInput/commonInput";

interface IFormInput {
  chatInput: string;
}

const ChatBot: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();
  const [messages, setMessages] = useState<string[]>([]);
  const [appendText, setAppendText] = useState("");
  const chunkMessageRef = useRef<{ text: string }>({
    text: "",
  });

  const [connect, setConnect] = useState(false);
  const socketRef = useRef<any>();

  useEffect(() => {
    const handleMessage = (message: any) => {
      console.log("handledata", message);
      if (message.mt === "chat_message_bot_partial") {
        chunkMessageRef.current = {
          text: (chunkMessageRef.current.text ?? "")+(message.partial??""),
        };
        setAppendText(chunkMessageRef.current.text)
      }
      else if(message.mt==="message_upload_confirm"){
        
      }
      // setMessages((prevMessages) => [...prevMessages, message]);
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

  console.log("messageState===>", messages);

  return (
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
          <li className="messageItem" key={index}>
            {/* {message.message} */}
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
  );
};

export default ChatBot;
