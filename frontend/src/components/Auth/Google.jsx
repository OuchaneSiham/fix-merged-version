import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../../context/AuthContext.jsx";

function Google() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const url = `${API_BASE_URL}/users/google-auth`;

  const handleSucc = async (credentialResponse) => {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await resp.json();

    if (resp.ok) {
      const tokenFromServer = data.token; 
      
      if (tokenFromServer) {
        login(tokenFromServer);
        navigate("/profile");
      } else {
        console.error("No token found in response data");
      }
    } else {
      console.log(data, "server error");
    }
  } catch (error) {
    console.error("Google login network error:", error);
  }
};

  const handleErr = () => {
    console.log("failed to login with Google");
  };

  return (
    <>
    <div className="flex w-full justify-center items-center">
      <GoogleLogin onSuccess={handleSucc} onError={handleErr} 
                          theme="outline"
      size="large"
      width="100%" />
    </div>
    </>
  );
}

export default Google;