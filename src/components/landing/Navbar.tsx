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
      className="pt-5 px-5 w-full z-50"
    >
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border-2 border-slate-200/60 rounded-3xl shadow-lg shadow-slate-200/50 px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className="text-2xl font-bold bg-linear-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
              MARcrute
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => scrollToSection('features')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Comment ça marche
            </button>
            <button 
              onClick={() => scrollToSection('stats')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-200 cursor-pointer font-medium"
            >
              Statistiques
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/worker/sign-in" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 cursor-pointer font-medium transition-all duration-200 rounded-xl"
              >
                Inscription
              </Button>
            </Link>
            <Link href="/enterprise/sign-in" className="cursor-pointer">
              <Button className="bg-linear-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white cursor-pointer font-medium px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                Espace Recruteur
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 cursor-pointer hover:bg-slate-100/50 rounded-xl transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700 transition-transform duration-200" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border-2 border-slate-200/60 rounded-3xl shadow-lg shadow-slate-200/50 animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Fonctionnalités
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-4 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Comment ça marche
            </button>
            <button 
              onClick={() => scrollToSection('stats')}
              className="block w-full text-left px-4 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl cursor-pointer font-medium transition-all duration-200"
            >
              Statistiques
            </button>
            <div className="pt-3 space-y-2">
              <Link href="/worker/sign-in" className="block cursor-pointer">
                <Button variant="outline" className="w-full cursor-pointer font-medium hover:bg-slate-50 transition-all duration-200 rounded-xl border-slate-200">
                  Inscription
                </Button>
              </Link>
              <Link href="/enterprise/sign-in" className="block cursor-pointer">
                <Button className="w-full bg-linear-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 cursor-pointer font-medium shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
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