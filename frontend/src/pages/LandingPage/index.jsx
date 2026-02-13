import Logo from '../../components/UI/Logo';
import Language from '../../components/UI/Languages';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
export default function Landing()
{
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/signUp');
    };
    return(
        <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
            <img
                src="/LPbackground.png"
                alt="background"
                className="absolute inset-0 h-full w-full object-cover -z-10"
            />
                <Language />
            <div className="flex flex-col items-center gap-8 -mt-50">
                <Logo variant='Landing'/>
                <p className='text-4xl md:text-5xl font-bold text-amber-50 tracking-wide drop-shadow-lg'>
                    Welcome to ping pong
                </p>
                <div className="flex gap-4 mt-4">
                    <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-200" onClick={handleButtonClick}>
                            
                        Start Now
                    </button>
                </div>
            </div>
         </div>
    );
}
