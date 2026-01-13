"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Home,
  Users,
  CheckCircle,
  Flag,
  Tag,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavMain } from "./nav-main";

const navMain = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Utilisateurs",
    url: "/admin/utilisateurs",
    icon: Users,
  },
  {
    title: "Validations",
    url: "/admin/validations",
    icon: CheckCircle,
  },
  {
    title: "Signalements",
    url: "/admin/signalements",
    icon: Flag,
  },
  {
    title: "Catégories",
    url: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Rôles",
    url: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Paramètres",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin/dashboard">
                <span className="text-xl font-bold text-[#5F9598]">
                  MARcrute
                </span>
                <Shield className="ml-2 h-5 w-5 text-[#5F9598]" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <div className="mt-auto p-4">
          <Button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/admin/sign-in";
            }}
            variant="outline"
            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 transition-all cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

