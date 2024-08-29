import React, { useState } from "react";
import ChatBot from "../../chat/ChatBot";
import BotIcon from "../../../svgElements/BotIcon";
import "./uploadDocument.css";
import {
  getPreSignedUrl,
  uploadAdminDocuments,
} from "../../../../service/admin";

const UploadDocument: React.FC = () => {
  const [openBot, setOpenBot] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // const [base64Url, setBase64Url] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  let fileNameWithTime = "";
  let base64Url="";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files[0]?.size > 15728640) {
      setError("File size cannot exceed 15 MB.");
    } else if (files && files[0].type !== "application/pdf") {
      setError("File format is not supported.");
    } else {
      if (files) setUploadedFile(files[0]);
      setError("");
    }
  };

  // const presignedUrl = async (file:Blob,fileName: string) => {
  //   const fileNameTime = `${fileName.split(".")[0]}_${new Date().getDate()}`;
  //   console.log("fileNameTime====>", fileNameTime);
  //   fileNameWithTime = fileNameTime;
  //   const response = await getPreSignedUrl({
  //     fileFormat: fileName.split(".")[0],
  //     fileType: file.type,
  //   });
  //   return response;
  // };

  // const pushFileToS3 = async (signedUrl: string, file: Blob) => {
  //   try {
  //     const myHeaders = new Headers({
  //       "Content-Type": "application/xml",
  //       // "x-amz-acl": "public-read"
  //     });
  //     return await fetch(signedUrl, {
  //       method: "PUT",
  //       headers: myHeaders,
  //       body: file,
  //     });
  //   } catch (e) {
  //     return e;
  //   }
  // };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // setBase64Url(base64);
    };
    reader.onerror = (error) => {
      console.error("Error converting file to Base64:", error);
    };
  };

  const uploadDocument = async () => {
    console.log(
      "File uploaded:",
      uploadedFile,
      uploadedFile?.name.split(".")[0]
    );
    if (uploadedFile) {
      const file = uploadedFile;
      const fileNameTime = `${file.name.split(".")[0]}_${new Date().getTime()}`;
      const base64Url = convertToBase64(file);
      console.log("base64Url====vvvvvv", base64Url);
      const res = await uploadAdminDocuments({
        fileName: fileNameTime,
        signedUrl: base64Url,
      });
      // let signedUrl = "";
      // const presignedUrlData: any = await presignedUrl(file,file.name);
      // console.log("presignedUrlData============",presignedUrlData.data.data)
      // if (presignedUrlData && presignedUrlData.data.data) {
      //   const response = await pushFileToS3(
      //     presignedUrlData.data.data,
      //     file
      //   );
      // }
    }
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
};

export default UploadDocument;
