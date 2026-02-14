// import Logo from '../../components/UI/Logo';
// import LoginForm from './LoginForm';
// import RedirectionLine from '../../components/Auth/RedirectionLine';
// import SocialButton from '../../component/ui/SocialButton';
// import PrivacyPolicy from '../../component/ui/PrivacyPolicy';

import Logo from '../../../components/Auth/Logo';
import LoginForm from './Form';
import RedirectionLine from '../../../components/Auth/RedirectionLine'
import Google from '../../../components/Auth/Google'
import PrivacyPolicy from '../../../components/UI/PrivacyPolicy'
import Language from '../../../components/UI/Languages';
export default function Login({ isAdmin = false }){


    return(
        <div className='relative min-h-screen bg-[#111115] flex
                        justify-center items-center ' >
            <Language/>
            <div className=' 
                            max-w-md w-full
                            bg-[#18181C]/100 space-y-9 px-4
                            rounded-4xl border-1 border-[#3D3229] '>
                <Logo/>
                <LoginForm isAdminLogin={isAdmin}/>
                <RedirectionLine text="new Here ?" link="/" linkText="create new account"/>
                {/* <SocialButton/> */}
                <Google />
                <PrivacyPolicy/>
            </div>
        </div>
    );

}