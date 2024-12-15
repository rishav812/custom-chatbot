// import endpoints from "../constants/endpoints";
// import ApiResponse from "../resources/domain/entity/IApiResponse";
// import { http } from "../utils/http";

// // Function to get pre-signed URL for uploading documents
// export const getPreSignedUrl = (data: {
//   fileFormat: string;
// }): Promise<ApiResponse> => {
//   return http.post(`${endpoints.admin.GET_PRESIGNED_URL}`, data);
// };

import axios from "axios";
import ApiResponse, {
  TApiState,
} from "../resources/domain/entity/IApiResponse";

const http = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPreSignedUrl = (data: {
  fileFormat: string;
  fileType:string
}): Promise<ApiResponse> => {
  return http.post("/api/v1/admin/pre-signed-url", data);
};

export const uploadAdminDocuments = (data: {
  fileName: string;
  signedUrl: string;
}): Promise<ApiResponse> => {
  return http.post("/api/v1/admin/upload-document", data);
};

export const getAllUploadedDocs= ():Promise<ApiResponse> =>{
  return http.get("/api/v1/admin/get-all-docs")
}
