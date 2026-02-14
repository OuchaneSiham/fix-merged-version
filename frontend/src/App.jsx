// import Register from "./Register";
// import Login from "./Login";
import Profile from "./Profile.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminUsers from "./AdminUsers.jsx";
import ChatPage from "./ChatPage";
import GamePage from "./GamePage"; // ✅ NEW
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";
import Footer from "./Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Landing from "./pages/LandingPage/index.jsx"
//new paths 
// import Login from "./pages/Auth/Login"
// import SignUp from "./pages/Auth/register";

import Login from "./pages/Auth/Login/index.jsx";
import SignUp from "./pages/Auth/register/index.jsx";

function App() {
  const { token } = useAuth();
  const checkAuth = () => !!localStorage.getItem("token");

  return (
    <GoogleOAuthProvider clientId="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com">
      <div>
        <Routes>
          <Route path="/" element={<Landing />}/> 
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/* <Route 
            path="/profile" 
            element={localStorage.getItem("token") ? <Profile /> : <Navigate to="/login" />} 
          /> */}
          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={
              localStorage.getItem("token") ? (
                <ChatPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* ✅ NEW: Game route */}
          <Route
            path="/game"
            element={
              localStorage.getItem("token") ? (
                <GamePage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>

        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
