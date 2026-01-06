"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const SidebarNav = () => {
  const { data: session } = useSession();
  const [initials, setInitials] = useState("EN"); 

  useEffect(() => {
    if (session?.user?.name) {
      const words = session.user.name.trim().split(/\s+/);
      const generatedInitials = words
        .slice(0, 2) 
        .map(word => word[0]?.toUpperCase() || "")
        .join("");
      
      setInitials(generatedInitials || "EN");
    }
  }, [session?.user?.name]);

  return (
    <div className="p-2 flex items-center justify-center flex-col gap-2">
      {/* Enterprise Initials Avatar */}
      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold text-white">
          {initials}
        </span>
      </div>
      
      {/* Enterprise Name */}
      <div className="text-center">
        <h2 className="font-bold text-lg text-[#061E29] truncate max-w-50">
          {session?.user?.name || "Enterprise"}
        </h2>
      </div>
    </div>
  );
};

export default SidebarNav;