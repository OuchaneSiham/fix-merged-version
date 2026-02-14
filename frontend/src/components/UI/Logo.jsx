import LogoSvg from '../../Assets/images/logo.svg';
import clsx from 'clsx'

export default function Logo({variant = 'navbar' })
{
    return(

            <img src={LogoSvg}
                alt="LeetPong logo"
                className={clsx(
                    "block",
                    {
                        'flex-1 block mt-auto h-12 w-auto bg-white-600 justify-center' : variant === 'Logo',
                        'w-32 h-auto': variant === 'navbar',
                        'w-100 h-100 mb-30' : variant === 'Landing'
                    }
                )}/>
    );
}