'use client';

import useConversation from "@/app/hooks/useConversation";
import useRoutes from "@/app/hooks/useRoutes";
import MobileItem from "./MobileItem";
import Avatar from "../Avatar";
import { useState } from "react";
import { User } from "@prisma/client";
import SettingsModal from "./SettingsModal";


interface MobileFooterProps {
  currentUser: User
}

const MobileFooter:  React.FC<MobileFooterProps> = ({ currentUser }) => {
  const routes = useRoutes();
  const { isOpen } = useConversation();
  const [isOpenModal, setIsOpen] = useState(false);
  
  
  if (isOpen) {
    return null;
  }


  return ( 
    <>
      <SettingsModal currentUser={currentUser} isOpen={isOpenModal} onClose={() => setIsOpen(false)} />
      <div 
        className="
          fixed 
          justify-between 
          w-full 
          bottom-0 
          z-40 
          flex 
          items-center 
          bg-white 
          border-t-[1px] 
          lg:hidden
        "
      >
        {routes.map((route) => (
          <MobileItem 
            key={route.href} 
            href={route.href} 
            active={route.active} 
            icon={route.icon}
            onClick={route.onClick}
          />
        ))}

        <nav className="mt-2 mr-2 flex flex-col justify-between items-center">
            <div 
              onClick={() => setIsOpen(true)} 
              className="cursor-pointer hover:opacity-75 transition"
            >
              <Avatar user={currentUser} />
            </div>
          </nav>
      </div>
    </>
   );
}
 
export default MobileFooter;