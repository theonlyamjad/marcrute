"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import profilePic from "../Icons/world.png"
import { Settings, LogOut, Bell, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const Header = () => {
  const [notifications, setNotifications] = useState(3) // demo badge

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl border-b border-purple-700 mx-4 sm:mx-6 lg:mx-8 mt-4 mb-2 rounded-2xl">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Marcrute
        </h1>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-white font-medium">
          <Link
            href="home"
            className="relative group hover:text-yellow-300 transition-colors"
          >
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full" />
          </Link>
          <Link
            href="candidatures"
            className="relative group hover:text-yellow-300 transition-colors"
          >
            Candidatures
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full" />
          </Link>
          <Link
            href="disponibility"
            className="relative group hover:text-yellow-300 transition-colors"
          >
            Disponibility
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full" />
          </Link>
          <Link
            href="profile"
            className="relative group hover:text-yellow-300 transition-colors"
          >
            Profile
            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full" />
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Notification Icon */}
          <button className="relative p-2 rounded-full hover:bg-white/20 transition">
            <Bell className="text-white" size={20} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 text-xs w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 transition focus:outline-none">
                <Image
                  src={profilePic}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-white/30"
                />
                <span className="hidden sm:block text-white font-medium">
                  Yassir Errouihel
                </span>
                <ChevronDown className="text-white" size={16} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 bg-white rounded-xl shadow-xl text-gray-800 border border-gray-200 animate-fade-in"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="settings"
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <Settings size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="flex items-center gap-3 text-red-500 cursor-pointer hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            {/* Replace with your mobile menu button if needed */}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
