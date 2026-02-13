import { API_BASE_URL } from "./config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Google from "./Google.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const url = `${API_BASE_URL}/users/login`;
  const [formData, setFormData] = useState({});
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login } = useAuth();

  const handlechange = (event) => {
    setFormData({ ...formData, [event.target.id]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json(); 

      console.log("Login response status:", resp.status);
      console.log("Login response data:", data);

      if (resp.ok) {
        const sessionToken = data.token;
        if (!sessionToken) {
          alert("Login succeeded but no token received from server!");
          return;
        }
        login(sessionToken);
        navigate("/profile");
      } else {
        alert(data.error || "Login failed! Check console for details.");
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      alert("Network error — check if backend is running.");
    }
  };
  return (
    <>
      <div className="Login Page">
        <h2>{isAdminLogin ? "Admin Login" : "User Login"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">username:</label>
            <input
              type="text"
              onChange={handlechange}
              id="username"
              name="username"
              placeholder="enter your username"
              required
            ></input>
          </div>
          <br></br>
          <div>
            <label htmlFor="password">password:</label>
            <input
              type="password"
              onChange={handlechange}
              id="password"
              name="password"
              placeholder="enter your password"
              required
            ></input>
          </div>
          <br />
          <div>
            <input type="submit" value="sign in"></input>
          </div>
        </form>

        <br />
        <button
          type="button"
          className="toggle-admin-btn"
          onClick={() => setIsAdminLogin(!isAdminLogin)}
        >
          {isAdminLogin ? "Sign in as User" : "Sign in as Admin"}
        </button>

        <br />
        <Google />
        <br />
        <Link to="/">Don't have an account? Sign up</Link>
      </div>
    </>
  );
}
export default Login;
