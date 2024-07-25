import { Route, Routes } from "react-router-dom";

import ChatBot from "./components/views/chat/ChatBot";
import UploadDocument from "./components/views/admin/uploadDocument/uploadDocument";

const PublicRoutes = () => {
  return (
    <div className="main-container">
      <Routes>
        <Route path="/" element={<UploadDocument />} />
        {/* <Route
          path="/api/v1/widget/trainwell/iframe/admin/chat-history"
          element={<ChatHistory />}
        />
        <Route
          path="/api/v1/widget/trainwell/iframe/admin/upload-document"
          element={<UploadDocuments />}
        />
        <Route
          path="/api/v1/widget/trainwell/iframe/admin/question-listing"
          element={<QuestionsListing />}
        /> */}
      </Routes>
    </div>
  );
};

export default PublicRoutes;
