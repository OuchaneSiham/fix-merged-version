// import Input from '../../component/ui/Input';
// import PasswordInput from '../../component/ui/PasswordInput';
// import { useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import AdminSingin from '../../component/ui/AdminSignIn';


import { API_BASE_URL } from '../../../config';
import { useState } from "react";
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// import SocialButton from '../../components/Auth/SocialButton';

function Login() {
    // const navigate = useNavigate();
    // const url = `${API_BASE_URL}/users/login`;
    // const [formData, setFormData] = useState({});
    // const [isAdminLogin, setIsAdminLogin] = useState(false);
    
    // const handlechange = (event) => {
    //     setFormData({...formData, [event.target.id]: event.target.value});
    // }
    
    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     try {
    //         const resp = await fetch(url, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(formData),
    //         });
    //         if (resp.ok) {
    //             const data = await resp.json();
    //             const sessionToken = data.token;
    //             localStorage.setItem("token", sessionToken);
    //             navigate("/profile");
    //         } else {
    //             const data = await resp.json();
    //             alert(data.error || "Login failed!");
    //         }
    //     } catch(error) {
    //         console.log("error is ", error);
    //     }
    // }
      const navigate = useNavigate();
      const url = `${API_BASE_URL}/users/login`;
      const [formData, setFormData] = useState({});
      const [isAdminLogin, setIsAdminLogin] = useState(false);
      const { login } = useAuth();
    
      const handlechange = (event) => {
        console.log(event.target.value);
        setFormData({ ...formData, [event.target.id]: event.target.value });
      };
    
      const handleSubmit = async (event) => {
        console.log("button submited");
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
    const isFormValid = formData.username && formData.password;    
    const buttonStyleOn = "w-full py-4 bg-[#D4A574] text-[#1A1410] font-semibold rounded-xl hover:bg-[#C49564] transition-colors";
    const buttonStyleOff = "w-full py-4 bg-[#2A2420] text-[#6B5D52] font-semibold rounded-xl cursor-not-allowed";
    
    return (
        <div className='text-[#E5E5E5]'>
            <p className='text-[24px] text-white font-medium text-center mb-3'>
                {isAdminLogin ? "Sign in as Admin" : "Sign in to LEETPONG"}
            </p>
            
            <div className='grid gap-y-4 rounded-2xl border-1 border-[#2A2420] mt-5 max-w-md mx-3 px-4 py-4 py-5'>
                <div>
                    <label htmlFor="username" className="block mb-2">username</label>
                    <input 
                        type="text" 
                        onChange={handlechange} 
                        id="username" 
                        name="username" 
                        placeholder="enter your username" 
                        className="w-full px-4 py-3 bg-[#1A1410] border border-[#2A2420] rounded-xl text-white placeholder-[#6B5D52] focus:outline-none focus:border-[#D4A574]"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="password" className="block mb-2">password</label>
                    <input 
                        type="password" 
                        onChange={handlechange} 
                        id="password" 
                        name="password" 
                        placeholder="enter your password" 
                        className="w-full px-4 py-3 bg-[#1A1410] border border-[#2A2420] rounded-xl text-white placeholder-[#6B5D52] focus:outline-none focus:border-[#D4A574]"
                        required
                    />
                </div>
                
                <button
                    // onClick={() => alert("button active")}
                    disabled={!isFormValid}
                    onClick={handleSubmit}
                    className={isFormValid ? buttonStyleOn : buttonStyleOff}>
                    {isAdminLogin ? "Sign in as Admin" : "sign in"}
                </button>
                
                {!isAdminLogin ? (
                    <button 
                        type="button"
                        onClick={() => setIsAdminLogin(true)}
                        className="w-full py-4 bg-[#4A3B2F] text-[#D4A574] font-semibold rounded-xl hover:bg-[#3A2B1F] transition-colors border border-[#D4A574]">
                        Sign in as Admin
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsAdminLogin(false)}
                        className="w-full py-4 bg-[#4A3B2F] text-[#D4A574] font-semibold rounded-xl hover:bg-[#3A2B1F] transition-colors border border-[#D4A574]">
                        Back to User Login
                    </button>
                )}
                
                {/* <SocialButton /> */}
            </div>
        </div>
    );
}

export default Login;