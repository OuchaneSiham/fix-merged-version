// import { useEffect } from "react";
// import {GoogleOAuthProvider} from '@react-oauth/google'
// import { GoogleLogin } from '@react-oauth/google';
// import { Link, useNavigate } from 'react-router-dom'


// export default function SocialButton() {
//     function Google()
//     {
//         const navigate = useNavigate();
//         const url = "http://localhost:8281/api/v1/users/google-auth"
//             // useEffect(()=>{
//             //     google.accounts.id.initialize 
//             // })
//             const handleSucc = async (credentialResponse) => {
        
//             const resp =  await fetch(url, {
//                 method: "POST",
//                 headers:{
//                     "Content-Type" : "application/json",
//                 },
//                 body: JSON.stringify({ token: credentialResponse.credential }),
//             });
//             // const sessionToken = data.token;
//             // const saved = localStorage.setItem("token",sessionToken);
//             // navigate("/profile");
//             // console.log(credentialResponse);
//             if(resp.ok)
//             {
//                 const data = await resp.json();
//                 const sessionToken = data.token;
//                 const saved = localStorage.setItem("token",sessionToken);
//                 navigate("/profile");
//                 console.log(data, "database user");
//             }
//             else 
//             {
//                 console.log(data, "server error");
//             }
//             }
//             const handleErr =() =>{
//                 console.log("failed to login");
//             }
//     }

//     return
//     (
//     <div className="mx-3 mt-3 grid pb-4">
//         <button
//             onClick={typelogin}
//             className="group bg-white h-11 px-6 border-1 border-[#2A2420] rounded-full">
//             <div className="relative flex items-center space-x-4 justify-center">
//                 <img src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     className="absolute left-0 w-5" alt="google logo" />
//                 <span
//                     className="block w-max font-semibold tracking-wide text-black  text-sm ">Continue
//                     with Google
//                 </span>
//             </div>
//         </button>
//     </div>
//     );
// }


import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function SocialButton() {
    const navigate = useNavigate();
    const url = "http://localhost:8281/api/v1/users/google-auth";

    const handleSucc = async (credentialResponse) => {
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: credentialResponse.access_token }),
            });

            if (resp.ok) {
                const data = await resp.json();
                const sessionToken = data.token;
                localStorage.setItem("token", sessionToken);
                navigate("/profile");
                console.log(data, "database user");
            } else {
                console.log("server error");
            }
        } catch (error) {
            console.log("Failed to login:", error);
        }
    };

    const handleErr = () => {
        console.log("failed to login");
    };

    // Use the hook to create the login function
    const typelogin = useGoogleLogin({
        onSuccess: handleSucc,
        onError: handleErr,
    });

    return (
            <div className="mx-3 mt-3 grid pb-4">
                <button
                    onClick={typelogin}
                    className="group bg-white h-11 px-6 border-1 border-[#2A2420] rounded-full">
                    <div className="relative flex items-center space-x-4 justify-center">
                        <img 
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            className="absolute left-0 w-5" 
                            alt="google logo" 
                        />
                        <span className="block w-max font-semibold tracking-wide text-black text-sm">
                            Continue with Google
                        </span>
                    </div>
                </button>
            </div>
    );
}