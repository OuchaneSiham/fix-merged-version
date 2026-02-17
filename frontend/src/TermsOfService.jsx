import { Link } from 'react-router-dom';
import Logo from './components/Auth/Logo';

function TermsOfService() {
    return (
                     <div className='relative min-h-screen bg-[linear-gradient(to_bottom,#162D2A,#2F3A32,#3E2411)] flex justify-center items-center'>
                         <div className="max-w-md w-full bg-[#1F1A1F] space-y-9 px-4 py-2 rounded-4xl border-1 border-[#3D3229]">
                             <Logo />
                             <div className='text-[#E5E5E5]'>
                                 <p className='text-[32px] md:text-[36px]  text-white font-bold text-center mb-9'>
                                    Terms of Service
                                 </p>

                                <h2 className='text-[20px] md:text-[28px] text-white font-bold text-center mb-2'>1. Acceptance</h2>
                                <p className='text-center'>By using this service, you accept these terms.</p>
                                <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>2. User Accounts</h2>
                                <p className='text-center'>Keep your password secure. You're responsible for your account.</p>

                                <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>3. Acceptable Use</h2>
                                <p className='text-center'>Don't harass users, upload malicious content, or break the law.</p>

                                <h2 className='text-[24px] md:text-[28px] text-white font-bold text-center mb-2'>4. Termination</h2>
                                <p className='text-center pb-12'>We can terminate accounts that violate these terms.</p>
                                <p className='text-center'>Last updated: {new Date().toLocaleDateString()}</p>
                             </div>
                         </div>
                     </div>
    );
{/* 
        <div style={{padding: "20px"}}>
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance</h2>
            <p>By using this service, you accept these terms.</p>

            <h2>2. User Accounts</h2>
            <p>Keep your password secure. You're responsible for your account.</p>

            <h2>3. Acceptable Use</h2>
            <p>Don't harass users, upload malicious content, or break the law.</p>

            <h2>4. Termination</h2>
            <p>We can terminate accounts that violate these terms.</p>

            <Link to="/">Back to Home</Link>
        </div> */}
}

export default TermsOfService;