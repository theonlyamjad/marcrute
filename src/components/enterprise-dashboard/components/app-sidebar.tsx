"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconReport,
} from "@tabler/icons-react";

import {
  Home,
  Briefcase,
  Inbox,
  Users,
  Star,
  Flag,
  Cog 
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import SidebarNav from "./sidebar-nav";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/enterprise/dashboard",
      icon: Home
    },
    {
      title: "Missions",
      url: "/enterprise/missions",
      icon: Briefcase
    },
    {
      title: "Candidature",
      url: "/enterprise/candidature",
      icon: Inbox
    },
    {
      title: "Travailleurs",
      url: "/enterprise/travailleurs",
      icon: Users 
    },
    {
      title: "Evaluations",
      url: "/enterprise/evaluations",
      icon: Star 
    },
    {
      title: "Reports",
      url: "/enterprise/reports",
      icon: Flag
    },
    {
      title: "Paramètre",
      url: "/enterprise/settings",
      icon: Cog
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    }
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="#">
                <span className="text-xl font-bold text-[#5F9598]">MARcrute</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
