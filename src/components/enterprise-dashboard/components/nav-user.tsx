"use client";

import { IconLogout } from "@tabler/icons-react";
import {SidebarMenu,SidebarMenuButton,SidebarMenuItem,} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({
        redirect: false,
        callbackUrl: "/enterprise/sign-in",
      });
      router.push("/enterprise/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton
      size="lg"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-2 w-full">
        <IconLogout className="h-5 w-5" />
        <span className="font-semibold text-sm">
          {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
        </span>
      </div>
    </SidebarMenuButton>
  </SidebarMenuItem>
</SidebarMenu>
  );
}