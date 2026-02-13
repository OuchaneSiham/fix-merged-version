import { useState } from 'react';


export default function Input({htmlFor ,text, id, type, onChange})
{
    const [username, setFirstName] = useState('');


    return (
        <>
            <div className="">
                <label  htmlFor={htmlFor} className='block  text-sm font-thin'>
                    {text}
                </label>
            
                <input  id={id}
                        type={type}
                        onChange={onChange}
                        className='block mt-1 w-full bg-[#2A2A2A] text-white text-[16px] px-3 py-1 font-light border:none rounded-lg hover:border-1 hover:border-[#D4A574]
                                    ring-offset-2 focus:outline-none focus:border-2 focus:border-white-500'
                        required
                        />
                        
            </div>
    </>
);
}