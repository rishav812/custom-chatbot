import './App.css';
import PublicRoutes from './PublicRoutes';
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="App">
      <PublicRoutes />
      <ToastContainer />
    </div>
  );
}

export default App;
