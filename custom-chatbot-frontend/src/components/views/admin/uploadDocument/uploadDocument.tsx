import React, { useState } from "react";
import ChatBot from "../../chat/ChatBot";
import BotIcon from "../../../svgElements/BotIcon";
import './uploadDocument.css';

const UploadDocument: React.FC = () => {
  const [openBot, setOpenBot] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files[0]?.size > 15728640) {
      setError("File size cannot exceed 15 MB.")
    } else if (files && files[0].type !== "application/pdf") {
      setError("File format is not supported.");
    }else{
      if(files) setUploadedFile(files[0]);
      setError("");
    }
  };

  const uploadDocument = () => {
    console.log("File uploaded:", uploadedFile);
  };

  return (
    <div className="upload-container">
      <h2>Training Documents</h2>
      <div className="upload-box">
        <label htmlFor="file-upload" className="upload-label">
          <span>Upload PDF here</span>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
        <p>Maximum PDF size 15MB</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <button className="upload-button" onClick={uploadDocument}>
        Upload
      </button>
      {uploadedFile && (
        <div className="uploaded-file">
          <span>{uploadedFile.name}</span>
          <div className="file-actions">
            <button>Download</button>
            <button onClick={() => setUploadedFile(null)}>Delete</button>
          </div>
        </div>
      )}
      {openBot && (
        <div className="chat-container">
          <ChatBot />
        </div>
      )}
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
