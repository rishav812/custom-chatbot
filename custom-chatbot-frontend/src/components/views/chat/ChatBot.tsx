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
   const socket = useRef(
     io("http://localhost:8000/", { path: "/socket.io/ws" })
   );

  useEffect(() => {
    const handleMessage = (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.current.on("connect_response", (data: any) => {
      console.log("Connected with ID:", data.chat_id);
    });

    socket.current.on("message", handleMessage);
  }, []);

  const sendMessage = (data: any) => {
    console.log("data.chatInput",data.chatInput)
    // const messageData = {
    //   mt: "message_upload",
    //   message: data.chatInput,
    //   isBot: false,
    //   timezone: moment().format("Z").toString(),
    // };
    socket.current.emit("message", data.chatInput);
  };

  return (
    <div className="chatContainer">
      <div className="chatHeader">
        <div>
          <div>AI Dev</div>
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
