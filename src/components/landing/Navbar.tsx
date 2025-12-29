"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power3.out",
          delay: 0.2
        }
      )
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav 
      ref={navRef}
      className="pt-3 sm:pt-5 px-3 sm:px-5 w-full z-50"
    >
      <div className="max-w-7xl mx-auto bg-[#F3F4F4]/90 backdrop-blur-xl border-2 border-[#5F9598]/30 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#1D546D]/10 px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-[#061E29] to-[#1D546D] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
              MARcrute
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={() => scrollToSection('features')}
              className="px-4 py-2 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="px-4 py-2 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Comment ça marche
            </button>
            <button 
              onClick={() => scrollToSection('stats')}
              className="px-4 py-2 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Statistiques
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/worker/sign-in" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className="text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 cursor-pointer font-medium transition-all duration-200 rounded-xl"
              >
                Inscription
              </Button>
            </Link>
            <Link href="/enterprise/sign-in" className="cursor-pointer">
              <Button className="bg-linear-to-r from-[#1D546D] to-[#061E29] hover:from-[#5F9598] hover:to-[#1D546D] text-[#F3F4F4] cursor-pointer font-medium px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                Espace Recruteur
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 cursor-pointer hover:bg-[#5F9598]/10 rounded-xl transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-[#061E29] transition-transform duration-200" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-[#061E29] transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#F3F4F4]/90 backdrop-blur-xl border-2 border-[#5F9598]/30 rounded-2xl sm:rounded-3xl shadow-lg shadow-[#1D546D]/10 animate-in slide-in-from-top duration-200">
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 sm:px-4 py-2.5 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 sm:px-4 py-2.5 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Comment ça marche
            </button>
            <button 
              onClick={() => scrollToSection('stats')}
              className="block w-full text-left px-3 sm:px-4 py-2.5 text-[#1D546D] hover:text-[#061E29] hover:bg-[#5F9598]/10 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Statistiques
            </button>
            <div className="pt-3 space-y-2">
              <Link href="/worker/sign-in" className="block cursor-pointer">
                <Button variant="outline" className="w-full cursor-pointer font-medium hover:bg-[#5F9598]/10 transition-all duration-200 rounded-xl border-[#5F9598]/40 text-[#1D546D]">
                  Inscription
                </Button>
              </Link>
              <Link href="/enterprise/sign-in" className="block cursor-pointer">
                <Button className="w-full bg-linear-to-r from-[#1D546D] to-[#061E29] hover:from-[#5F9598] hover:to-[#1D546D] text-[#F3F4F4] cursor-pointer font-medium shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                  Espace Recruteur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar