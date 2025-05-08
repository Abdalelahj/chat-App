import "./App.css";
import Login from "./pages/Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Protected from "./routes/Protected";
import ChatRoom from "./pages/ChatRoom";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function App() {
  const token = JSON.parse(localStorage.getItem("token"));
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let socketInit = null;

    if (token) {
      socketInit = io("http://localhost:5000", {
        extraHeaders: {
          token,
        },
      });

      socketInit.on("connect", () => {
        console.log("connected in client");
      });

      socketInit.on("connect_error", (error) => {
        console.log("problem", error.message);
        if (error.message === "invalid token") {
          navigate("/login");
          localStorage.clear();
        }
      });

      setSocket(socketInit);
    }

    return () => {
      if (socketInit) {
        console.log("Disconnecting socket");
        socketInit.disconnect();
      }
    };
  }, [navigate, token]);

  return (
    <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/chat"
      element={
        <Protected>
          <ChatRoom socket={socket} />
        </Protected>
      }
    />
  </Routes>
  );
}

export default App;
