import LogoSvg from '../../assets/images/logo.svg';


export default function Logo(){
    return(
        <a href="/login" target='_self' 
            className="block mx-auto">
            <img src={LogoSvg}
                alt="LeetPong logo"
                className='block mt-4 mx-auto w-40 '/>
        </a>
    );
}