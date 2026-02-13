import Logo from "./Logo";
import ProfileIcone from "./ProfileIcone";
import NotifIcone from "./NotifIcone";
import { useState, useEffect } from 'react';


export default function Navbar()
{
    const [hasNotification , setHasNotification] = useState(true);
    // const [NotificationsChecked , setNotificationsChecked] = useState(false); //this state if the user click to see the notifications , if yes than we eill hifde the red button
    
    //when the user clicke the Notification button
    function clickNotifictionBell()
    {
        if(hasNotification == false)
        {
            console.log("dd");
            alert(22);
            setHasNotification(false);
        }
    }
    
    return (
        <nav className="flex items-center justify-between w-full h-[60px] border mt-3 rounded-[19px] border-[#C77966]/20 bg-[#4A302A] mb-6 px-10">
            <div className="flex-1">
                <NotifIcone Notificationstate={hasNotification}
                            onClick={clickNotifictionBell}/>        
            </ div>
            <Logo variant ='Logo'/>
            <div className="flex-1 flex justify-end items-center">
                <ProfileIcone />
            </div>
        </nav>
    );
}