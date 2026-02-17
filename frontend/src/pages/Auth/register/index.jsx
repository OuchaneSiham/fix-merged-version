import { API_BASE_URL } from '../../../config';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Logo from '../../../components/Auth/Logo';
import Input from '../../../components/Auth/Input';
import PasswordInput from '../../../components/Auth/PasswordInput';
import OrDevider from '../../../components/Auth/OrDevider';
import RedirectionLine from '../../../components/Auth/RedirectionLine';
import TermsOfService from '../../../components/UI/TermsOfService';
import PrivacyPolicy from '../../../components/UI/PrivacyPolicy'
import Language from '../../../components/UI/Languages';

export default function SignUp() {
        const url = `${API_BASE_URL}/users/register`
    const [formData, setFormData] = useState({});
    const [checkTerms, setUserTerms] = useState(false);
    const navigate = useNavigate();
    
    const handlechange = (event) => {
        setFormData({...formData, [event.target.id]: event.target.value})
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            
            if (resp.ok) {
                const data = await resp.json();
                alert("Registration successful! Please login.");
                navigate("/login");
            } else {
                const data = await resp.json();
                alert(data.error || data || "Registration failed!");
            }
        }
        catch(error) {
            console.log("error is", error);
            alert("Network error. Please try again.");
        }
    }
    // Check if form is valid (username, email, password filled and terms accepted)
    const isFormValid = formData.username && formData.email && formData.password && checkTerms;
    
    const buttonStyleOn = "w-full py-4 bg-[#D4A574] text-[#1A1410] font-semibold rounded-xl hover:bg-[#C49564] transition-colors";
    const buttonStyleOff = "w-full py-4 bg-[#2A2420] text-[#6B5D52] font-semibold rounded-xl cursor-not-allowed";
    
    return (
        <>
            <div className='relative min-h-screen bg-[linear-gradient(to_bottom,#162D2A,#2F3A32,#3E2411)] flex justify-center items-center'>
                <Language/>
                <div className="max-w-md w-full bg-[#1F1A1F]  space-y-9 px-4 py-2 rounded-4xl border-1 border-[#3D3229]">
                    <Logo />
                    <div className='text-[#E5E5E5]'>
                        <p className='text-[24px] text-white font-medium text-center mb-3'>
                            Sign Up to LEETPONG
                        </p>

                        <div className='grid gap-y-4 rounded-2xl border-1 border-[#2A2420] mt-5 max-w-md mx-3 px-4 py-4 py-5'>
                            <Input 
                                htmlFor="username"
                                text='username'
                                id='username'
                                type='text'
                                onChange={handlechange}
                                className="w-full px-4 py-3 bg-[#1A1410] border border-[#2A2420] rounded-xl text-white placeholder-[#6B5D52] hover:border-[#D4A574] focus:outline-none focus:border-[#D4A574]"
                            />
                            <Input 
                                htmlFor="email"
                                text="Email address"
                                id="email"
                                type="email"
                                onChange={handlechange}
                                className="w-full px-4 py-3 bg-[#1A1410] border border-[#2A2420] rounded-xl text-white placeholder-[#6B5D52] hover:border-[#D4A574] focus:outline-none focus:border-[#D4A574]"
                            />
                            <PasswordInput
                                htmlFor='password'
                                text='password'
                                id='password'
                                onChange={handlechange}
                                className="w-full px-4 py-3 bg-[#1A1410] border border-[#2A2420] rounded-xl text-white placeholder-[#6B5D52] hover:border-[#D4A574] focus:outline-none focus:border-[#D4A574]"
                            />
                            <button 
                                disabled={!isFormValid}
                                onClick={handleSubmit}
                                className={isFormValid ? buttonStyleOn : buttonStyleOff}>
                                sign Up
                            </button>
                        </div>
                        <OrDevider />
                        {/* <SocialButton /> */}
                        <RedirectionLine text="already have an account ?" link="/login" linkText="Login" />
                        <TermsOfService
                            onChange={() => setUserTerms(!checkTerms)}
                            checked={checkTerms}
                        />
                        <PrivacyPolicy />
                    </div>
                </div>
            </div>
        </>
    );
}