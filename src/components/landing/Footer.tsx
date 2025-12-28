"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail('')
  }

  return (
    <footer className="">
      <div className="rounded-t-4xl overflow-hidden shadow-2xl bg-black py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">MARcrute</h3>
              <p className="text-gray-400 leading-relaxed">
                La plateforme qui connecte les meilleurs talents avec les entreprises au Maroc. 
                Nous facilitons l'accès à l'emploi et simplifions le recrutement pour un avenir professionnel meilleur.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <Link 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5 text-gray-400" />
                </Link>
                <Link 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-400" />
                </Link>
                <Link 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-gray-400" />
                </Link>
                <Link 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Liens rapides</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="#stats" className="text-gray-400 hover:text-white transition-colors">
                    Statistiques
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Newsletter</h4>
              <p className="text-gray-400 text-sm">
                Restez informé des dernières opportunités et actualités
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full cursor-pointer bg-white hover:bg-gray-100 text-black font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  S'abonner
                </Button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-8"></div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} MARcrute. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer