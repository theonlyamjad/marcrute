"use client"
import React, { useState } from "react"
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image";

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isHovered, setIsHovered] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in:", formData)
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-[#d4e8f0] via-white to-[#c8dfe8] relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-linear(circle at 2px 2px, #5FA8BE 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* LEFT SIDE - Sign In Form */}
      <div className="w-full lg:w-[45%] bg-white p-8 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center shadow-[0_0_100px_rgba(95,168,190,0.15)] relative z-10 overflow-hidden">
        {/* Zelij Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <Image 
            src="/zelij.jpg" 
            alt="Zelij Pattern" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Decorative linear accent */}
        <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-[#5FA8BE] via-[#93c6d9] to-transparent"></div>
        
        {/* Content */}
        <div className="max-w-lg mx-auto w-full relative z-10">
          {/* Logo  */}
          <h1 className="text-7xl text-[#4A8FA3] font-black">
            MARcrute
          </h1>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="group">
              <label className="block text-xs font-black text-[#4A8FA3] mb-3 uppercase tracking-[0.2em] transition-colors group-focus-within:text-[#5FA8BE]">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="votre@email.com"
                className="w-full px-6 py-4 border-2 border-[#d4e8f0] rounded-2xl bg-linear-to-br from-white via-[#f8fbfd] to-white focus:from-white focus:via-white focus:to-white focus:ring-4 focus:ring-[#5FA8BE]/20 focus:border-[#5FA8BE] outline-none transition-all duration-300 hover:border-[#93c6d9] hover:shadow-lg hover:shadow-[#5FA8BE]/10 text-lg font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black text-[#4A8FA3] uppercase tracking-[0.2em] transition-colors group-focus-within:text-[#5FA8BE]">
                  Mot de Passe
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-[#5FA8BE] font-black hover:text-[#4A8FA3] transition-all duration-300 uppercase tracking-wider hover:tracking-widest hover:underline underline-offset-2"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="w-full px-6 py-4 border-2 border-[#d4e8f0] rounded-2xl bg-linear-to-br from-white via-[#f8fbfd] to-white focus:from-white focus:via-white focus:to-white focus:ring-4 focus:ring-[#5FA8BE]/20 focus:border-[#5FA8BE] outline-none pr-14 transition-all duration-300 hover:border-[#93c6d9] hover:shadow-lg hover:shadow-[#5FA8BE]/10 text-lg font-semibold text-gray-800 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5FA8BE] transition-all duration-300 p-2 rounded-xl hover:bg-[#5FA8BE]/10 hover:scale-110 active:scale-95"
                >
                  {showPassword ? <EyeOff size={24} strokeWidth={2.5} /> : <Eye size={24} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full bg-linear-to-r from-[#4A8FA3] via-[#5FA8BE] to-[#72b5cb] text-white py-5 rounded-2xl font-black text-xl shadow-[0_20px_50px_-15px_rgba(95,168,190,0.5)] hover:shadow-[0_30px_70px_-15px_rgba(95,168,190,0.7)] transition-all duration-500 cursor-pointer overflow-hidden group mt-8 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="tracking-wide">Se connecter</span>
                <ArrowRight 
                  size={24} 
                  strokeWidth={3}
                  className={`transition-all duration-500 ${isHovered ? 'translate-x-2 scale-110' : 'scale-100'}`} 
                />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-[#72b5cb] via-[#5FA8BE] to-[#4A8FA3] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>

            {/* Sign up link */}
            <div className="pt-6">
              <p className="text-gray-600 text-base text-center font-medium">
                Pas encore de compte ?{" "}
                <a
                  href="/signup"
                  className="text-[#5FA8BE] font-black hover:text-[#4A8FA3] transition-all duration-300 relative group"
                >
                  <span className="relative">
                    Créer un compte gratuit
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5FA8BE] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </a>
              </p>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#d4e8f0]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-xs font-black uppercase tracking-[0.2em] text-[#5FA8BE]/60">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="cursor-pointer group flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-[#d4e8f0] rounded-2xl font-bold text-gray-700 hover:border-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="text-sm font-bold">LinkedIn</span>
            </button>
            <button
              type="button"
              className="cursor-pointer group flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-[#d4e8f0] rounded-2xl font-bold text-gray-700 hover:border-gray-800 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-bold">Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Feature Showcase */}
      <div className="hidden lg:flex lg:w-[55%] bg-linear-to-br from-[#4A8FA3] via-[#5FA8BE] to-[#72b5cb] p-16 xl:p-20 items-center justify-center relative overflow-hidden">
        {/* Enhanced background elements */}
        <div className="absolute top-10 right-10 w-150 h-150 bg-white/15 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-10 left-10 w-125 h-125 bg-[#93c6d9]/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-white/10 rounded-full blur-[100px]"></div>

        {/* Zelij Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-soft-light">
          <Image 
            src="/zelij.jpg" 
            alt="Zelij Pattern" 
            fill
            className="object-cover"
          />
        </div>
        
        <div className="max-w-2xl relative z-10">

          {/* Main Hero Message */}
          <div className="mb-12">
            <h2 className="text-6xl lg:text-7xl font-black text-white mb-10 leading-[1.05] tracking-tighter drop-shadow-[0_10px_50px_rgba(0,0,0,0.4)]">
              Votre carrière freelance commence ici
            </h2>
            <p className="text-2xl text-white leading-relaxed font-bold drop-shadow-[0_6px_30px_rgba(0,0,0,0.3)]">
              Rejoignez la plus grande communauté de freelances au Maroc.
            </p>
            <p className="text-xl text-white/95 leading-relaxed font-semibold mt-6 drop-shadow-lg">
              Accédez à des milliers d'opportunités, gérez vos projets et développez votre carrière professionnel.
            </p>
          </div>

          {/* Stats badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { number: "5K+", label: "Freelances" },
              { number: "1.2K+", label: "Missions" }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/15 backdrop-blur-lg rounded-2xl p-5 border-2 border-white/30 text-center shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-sm font-bold text-white/90 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage