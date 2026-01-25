// src/components/ui/worker/Workernavbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {User,FileText,Calendar,Star,Settings,LogOut,ChevronDown,ChevronUp,} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface WorkerNavbarProps {
  user: {
    nomComplet: string | null;
    email: string;
    initials: string;
  };
}

export function WorkerNavbar({ user }: WorkerNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    const role = session?.user?.role || "Travailleur";
    let callbackUrl = "/worker/sign-in";
    
    if (role === "Administrateur") {
      callbackUrl = "/admin/sign-in";
    } else if (role === "Institution") {
      callbackUrl = "/enterprise/sign-in";
    } else if (role === "Travailleur") {
      callbackUrl = "/worker/sign-in";
    }
    
    // Utiliser redirect: false et gérer la redirection manuellement
    await signOut({ redirect: false });
    // Forcer la redirection vers la bonne page
    window.location.href = callbackUrl;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1D546D]/20 bg-[#061E29] text-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/worker/dashboard"
            className="text-xl font-bold hover:text-[#5F9598] transition-colors"
          >
            MARcrute
          </Link>

          {/* User Menu */}
          <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-[#1D546D]/50 px-3 py-2 rounded-lg transition-colors">
              <Avatar className="h-9 w-9 border-2 border-[#5F9598]">
                <AvatarImage src="" alt={user.nomComplet || user.email} />
                <AvatarFallback className="bg-[#5F9598] text-white font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {user.nomComplet || user.email}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-[#5F9598]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#5F9598]" />
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.nomComplet || "Travailleur"}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href="/worker/cv"
                  className="flex items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>CV</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/worker/candidatures"
                  className="flex items-center cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Mes Candidatures</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/worker/disponibilites"
                  className="flex items-center cursor-pointer"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Disponibilités</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/worker/evaluations"
                  className="flex items-center cursor-pointer"
                >
                  <Star className="mr-2 h-4 w-4" />
                  <span>Évaluations</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/worker/settings"
                  className="flex items-center cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}