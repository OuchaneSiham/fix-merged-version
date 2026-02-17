import React from "react";
import { MdArrowBack } from 'react-icons/md';
import Logo from '../../Assets/images/logo.svg';

export default function ChatHeader({navigate})
{
    return(
      <>
        <div className="sticky top-0 z-20 flex items-center px-4 py-3 bg-[#1F2623]">
          {/* Left - Back Button */}
          <button
            onClick={() => navigate(-1)}>
            <MdArrowBack size={24} color="#FFFFFF" />
          </button>
          {/* Center - Logo */}
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-[40px] flex-1 lg:h-[60px] md:h-[50px]"
          />
      </div>
        {/* <div className="flex items-center justify-center py-4 py-3">
          <h2 className="text-white text-[20px] font-semibold">Chat</h2>
        </div> */}
    </>
    );
}