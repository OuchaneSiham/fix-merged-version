import { Link } from 'react-router-dom';
import Logo from './components/Auth/Logo';

function PrivacyPolicy() {
    return (
          <div className='relative min-h-screen bg-[linear-gradient(to_bottom,#162D2A,#2F3A32,#3E2411)] flex justify-center items-center'>
                                 <div className="max-w-md w-full bg-[#1F1A1F] space-y-9 px-4 py-2 rounded-4xl border-1 border-[#3D3229]">
                                     <Logo />
                                     <div className='text-[#E5E5E5]'>
                                         <p className='text-[32px] md:text-[36px]  text-white font-bold text-center mb-9'>
                                            Privacy Policy
                                         </p>
    
                                        <h2 className='text-[20px] md:text-[28px] text-white font-bold text-center mb-2'>1. Information We Collect</h2>
                                        <p className='text-center'>We collect: username, email, password (encrypted), avatar, friend connections.</p>
                                        <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>2. How We Use Your Information</h2>
                                        <p className='text-center'>To provide our service, authenticate users, and enable social features.</p>
        
                                        <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>3. Data Security</h2>
                                        <p className='text-center'>We use bcrypt encryption, HTTPS, and JWT tokens.</p>
        
                                        <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>4. Your Rights</h2>
                                        <p className='text-center pb-12'>You can access, update, and delete your data.</p>
                                        <p className='text-center'>Last updated: {new Date().toLocaleDateString()}</p>
                                     </div>
                                     <div className="text-center text-white">
                                      <Link to="/" >Back To Home</Link>
                                     </div>
                                 </div>
                             </div>
        // <div style={{padding: "20px"}}>
        //     <h1>Privacy Policy</h1>
        //     <p>Last updated: {new Date().toLocaleDateString()}</p>
            
        //     <h2>1. Information We Collect</h2>
        //     <p>We collect: username, email, password (encrypted), avatar, friend connections.</p>

        //     <h2>2. How We Use Your Information</h2>
        //     <p>To provide our service, authenticate users, and enable social features.</p>

        //     <h2>3. Data Security</h2>
        //     <p>We use bcrypt encryption, HTTPS, and JWT tokens.</p>

        //     <h2>4. Your Rights</h2>
        //     <p>You can access, update, and delete your data.</p>

        //     <Link to="/">Back to Home</Link>
        // </div>
    );
}

export default PrivacyPolicy;