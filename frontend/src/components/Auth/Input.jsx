import { useState } from 'react';


export default function Input({htmlFor ,text, id, type, onChange, className})
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
                        className={className}
                        required
                        />
                        
            </div>
    </>
);
}