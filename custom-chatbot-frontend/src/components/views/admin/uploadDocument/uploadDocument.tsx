import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import ChatBot from "../../chat/ChatBot";
import BotIcon from "../../../svgElements/BotIcon";
// import Document from "../../../svgElements/Document";
import Documents from "../../../svgElements/Document";
import "./uploadDocument.css";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../../../firebase";
import {
  checkDocTrainingStatus,
  getAllUploadedDocs,
  getPreSignedUrl,
  uploadAdminDocuments,
} from "../../../../service/admin";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import {
  DOCUMENT_RESPONSE_TYPE,
  IDocumentList,
} from "../../../../constants/commonConstants";
import Download from "../../../svgElements/Download";
import Delete from "../../../svgElements/Delete";
import EyeOpen from "../../../svgElements/EyeOpen";

const UploadDocument: React.FC = () => {
  const [openBot, setOpenBot] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentList, setDocumentList] = useState<IDocumentList[]>([]);
  const pendingDocumentList: MutableRefObject<number[]> = useRef<number[]>([]);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const intervalIdRef: any = useRef(null);
  const [error, setError] = useState<string>("");
  const documentListRef = useRef<IDocumentList[]>([]);
  const { data, loading, fetchData, setData } = useInfiniteScroll({
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
      setFileLoading(true);
      const file = uploadedFile;
      const url = await storePdfFile(file);
      // console.log("url=========", url);
      if (url) {
        // console.log("filee name=",file.name.split(".")[0])
        const res = await uploadAdminDocuments({
          fileName: file.name.split(".")[0],
          signedUrl: url as string,
        });
        console.log("ress=======", res);
        if (res.status) {
          // toast.success("Document training started");
          toast.success("Document training started");
          const temp = [...documentList];
          temp.splice(0, 0, res.data?.data as IDocumentList);
          setData(temp);
        } else {
          toast.error("something went wrong");
        }
      }
    }
    setUploadedFile(null)
    setFileLoading(false);
  };

  useEffect(() => {
    fetchData({ firstLoad: true });
  }, []);

  console.log("data==>", data);

  useEffect(() => {
    if (data.length) {
      documentListRef.current = data;
      setDocumentList(data);
      const documentId: any = [];
      data.filter((it: any) => {
        if (it.status === "pending") {
          documentId.push({ id: it.id });
        }
      });
      if (documentId.length) {
        startInterval(documentId);
      }
    }
  }, [data]);

  const startInterval = (documentId: any) => {
    intervalIdRef.current = setInterval(
      () => documentUploadStatusCheck(documentId),
      10000
    );
  };

  const documentUploadStatusCheck = async (documentId: any) => {
    if (documentId?.length > 0) {
      console.log(documentId, "documentId");
      const res = await checkDocTrainingStatus({
        payload: documentId,
      });
      if (res?.data?.data?.length) {
        const updatedDocumentList = documentListRef.current.map(
          (doc: IDocumentList, index: number) => {
            const updatedDoc = res.data.data.find(
              (item: { id: number }) =>
                item.id === (doc.id as unknown as number)
            );
            documentId.splice(index, 1);
            return updatedDoc ? { ...doc, status: updatedDoc.status } : doc;
          }
        );

        // Update the state and the ref
        toast.success("Document trained successfully");
        documentListRef.current = updatedDocumentList;
        setData(updatedDocumentList);
      }
    } else {
      clearInterval(intervalIdRef.current);
    }
  };
  console.log("docume`ntListRef==>", data);

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
        <button
          className={`upload-button ${fileLoading ? "loading" : ""}`}
          disabled={fileLoading}
          onClick={uploadDocument}
        >
          {fileLoading ? (
            <>
              <span className="spinner-border"></span> Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>

        {uploadedFile && (
          <div className="uploaded-file">
            <span>{uploadedFile.name}</span>
            <div className="file-actions">
              <button onClick={() => setUploadedFile(null)}>Delete</button>
            </div>
          </div>
        )}
      </div>
      <div className="upload-container-right">
        {data.length > 0 ? (
          data.map((doc: any, index: number) => {
            if (doc.status === "pending") {
              console.log("pending doc===", doc.status);
            }
            return (
              <div className="doc-lists" key={index}>
                <div className="item">
                  <Documents />
                  {/* <BotIcon/> */}
                  <p>{doc.name}</p>
                </div>
                {[
                  DOCUMENT_RESPONSE_TYPE.pending,
                  DOCUMENT_RESPONSE_TYPE.deleting,
                ].includes(doc.status) ? (
                  <div className="progress-loader">
                    <p>
                      {doc.status === DOCUMENT_RESPONSE_TYPE.pending
                        ? "Training in Progress"
                        : "Deleting in Progress"}
                    </p>
                    <div className="custom-spinner" role="status">
                      {/* <span className="sr-only">Loading...</span> */}
                    </div>
                  </div>
                ) : (
                  <div className="item-right">
                    <button type="button">
                      <Download />
                    </button>
                    <button type="button">
                      <Delete />
                    </button>
                    <button type="button">
                      <EyeOpen />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <h1>No filed uploaded</h1>
        )}
      </div>

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
