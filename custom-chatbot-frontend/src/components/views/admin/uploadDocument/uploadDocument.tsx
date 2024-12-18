import React, { useEffect, useRef, useState } from "react";
import ChatBot from "../../chat/ChatBot";
import BotIcon from "../../../svgElements/BotIcon";
// import Document from "../../../svgElements/Document";
import Documents from "../../../svgElements/Document";
import "./uploadDocument.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../../../firebase";
import {
  getAllUploadedDocs,
  getPreSignedUrl,
  uploadAdminDocuments,
} from "../../../../service/admin";
import Base64 from "base64-js";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";

const UploadDocument: React.FC = () => {
  const [openBot, setOpenBot] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const { data, loading, fetchData } = useInfiniteScroll({
    apiService: getAllUploadedDocs,
    apiParams: {
      user_id: 1,
    },
  });

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

  const storePdfFile = async (file: any) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const uploadDocument = async () => {
    if (uploadedFile) {
      const file = uploadedFile;
      const url = await storePdfFile(file);
      console.log("url=========", url);
      if (url) {
        // console.log("filee name=",file.name.split(".")[0])
        const res = await uploadAdminDocuments({
          fileName: file.name.split(".")[0],
          signedUrl: url as string,
        });
        console.log("ress=======", res);
      }
    }
  };

  // const getAllDocs = async () => {
  //   const res = await getAllUploadedDocs();
  //   console.log("res==>", res);
  // };

  useEffect(() => {
    // getAllDocs();
    fetchData({ firstLoad: true });
  }, []);

  return (
    <div className="upload-container">
      <div className="upload-container-left">
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
      </div>
      <div className="upload-container-right">
        {data.length > 0 ? (
          data.map((doc: any, index: number) => {
            return (
              <div className="doc-lists" key={index}>
                <div className="item">
                  <Documents />
                  {/* <BotIcon/> */}
                  <p>{doc.name}</p>
                </div>
              </div>
            );
          })
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <h1>No filed uploaded</h1>
        )}
      </div>
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

export default UploadDocument;
