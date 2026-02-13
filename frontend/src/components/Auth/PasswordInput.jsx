import ClosedEye from '../../assets/images/ClosedEye.png';
import openEye from '../../assets/images/openEye.png';
import { useState } from 'react';

export default function PasswordInput({htmlFor ,text, id, value, onChange})
{
    const [eyeButtun, setEyeButton] = useState(openEye);
    const [passwordType, setpasswordType] = useState('password');

    function    changeEye()
    {
        setEyeButton(eyeButtun == openEye ? ClosedEye : openEye);
        setpasswordType(eyeButtun == openEye ? 'text': 'password')
    }
    return (
        <div>
            <label htmlFor={htmlFor} className='block text-sm font-thin'>
                {text}
            </label>
            <div className='relative'>
                <input  id={id}
                        type={passwordType}
                        className=' block mt-1 w-full bg-[#2A2A2A] text-white text-[16px] px-3 py-1 font-light border:none  rounded-lg hover:border-1 hover:border-[#D4A574]
                                ring-offset-2 focus:outline-none focus:border-2 focus:border-white-500'
                        value={value}
                        onChange={onChange}
                        required
                />
                <button
                    type="button"
                    onClick={changeEye}
                    className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <img 
                            src={eyeButtun} 
                            alt="Toggle password visibility"
                            className="w-4 h-3"
                        />
                </button>
            </div>
        </div>
    );
}