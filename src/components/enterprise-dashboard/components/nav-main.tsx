"use client";


import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname  = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Home</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            const isActiveItem = pathname === item.url;
            return(
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} className={`cursor-pointer hover:bg-[#5F9598] hover:text-white ${isActiveItem && 'bg-[#061E29] text-white'}`}>
                {item.icon && <item.icon />}
                <Link href={item.url} className='w-full'>{item.title}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
