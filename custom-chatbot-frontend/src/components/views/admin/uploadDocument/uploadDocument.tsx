import React, { MutableRefObject, useEffect, useRef, useState } from "react";
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
          alert("Document training started");
          const temp = [...documentList];
          temp.splice(0, 0, res.data?.data as IDocumentList);
          setData(temp);
        } else {
          // toast.error("something went wrong");
        }
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

  console.log("data==>", data);

  useEffect(() => {
    if (data.length) {
      documentListRef.current = data;
      setDocumentList(data);
      const ids = [] as number[];
      data.forEach((item: IDocumentList) => {
        if (item.status === DOCUMENT_RESPONSE_TYPE.pending) {
          ids.push(item?.id as unknown as number);
        }
      });
      if (ids.length) {
        pendingDocumentList.current = ids;
      }
      if (ids.length) {
        startInterval();
      }
    }
  }, [data]);

  const startInterval = () => {
    setInterval(documentUploadStatusCheck, 10000);
  };

  const documentUploadStatusCheck = async () => {
    const documentId: any = [];
    data.filter((it: any) => {
      if (it.status === "pending") {
        documentId.push({ id: it.id });
      }
    });
    console.log("documentId==>", documentId);

    if (documentListRef?.current?.length > 0) {
      console.log(pendingDocumentList.current, "pendingDocumentList.current");
      const res = await checkDocTrainingStatus({
        payload: documentId,
      });
      console.log("ressssssssssss", res);
      // console.log("interval check res==>",res);
      if (res?.data?.data?.length) {
        res.data.data.forEach((item: { status: string; id: number }) => {
          documentListRef.current[documentListRef.current.findIndex((i: IDocumentList) => i.id === item.id as unknown as string)].status = item.status;
        });
      //   res.data.forEach(item => {
      //     documentListRef.current.findIndex((i) => i.id === item.id);
      //   });
      // }
    }
  }
  };

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
