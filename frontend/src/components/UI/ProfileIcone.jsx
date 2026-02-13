import face from '../../assets/images/face.jpg';
import DropDown from './DropDown';
import { Activity, useState } from 'react';

export default function ProfileIcone({className})
{
    const [sideBarShow, setsideBarShow] = useState("hidden");
    return (
        <>
        <button className='relative '
                onClick={()=> setsideBarShow((prev) => !prev)}>
            <div className='h-12 w-12 rounded-full transition duration-350 ease-in-out overflow-hidden'>
                <img   src={face}
                    alt="testing img"
                    className='h-full w-full object-cover'>
                </img>
                <Activity mode={sideBarShow ? "visible" : "hidden"}>
                    <DropDown/>
                </Activity>
            </div>
        </button>
        </>
    );
}