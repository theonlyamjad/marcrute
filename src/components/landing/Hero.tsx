"use client"

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.5 }
      )
      .fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.5"
      )
      .fromTo(
        buttonsRef.current?.children || [],
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
        "-=0.4"
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="hero" className="py-5 px-5 pb-5">
      {/* Rounded Container with Background Image */}
      <div 
        ref={heroRef}
        className="relative min-h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border-2 border-slate-200/60 flex items-center"
      >
        
        {/* Background Image */}
        <img
          src="/heroimage.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-100"
        />
        
        {/* linear Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/60 via-slate-800/50 to-slate-900/60" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
          
          {/* THE GLASS CARD */}
          <div className="max-w-3xl p-8 md:p-12 ">
            
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 
                ref={headingRef}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                Connectez-vous avec les{' '}
                <span className="text-purple-300">meilleurs talents</span>{' '}
                du Maroc
              </h1>

              {/* Subheading */}
              <p 
                ref={subtitleRef}
                className="text-lg md:text-xl text-white/95 font-medium leading-relaxed max-w-2xl"
              >
                La plateforme qui facilite le recrutement de professionnels qualifiés dans tous les domaines
              </p>

              {/* Toggle Buttons */}
              <div ref={buttonsRef} className="flex flex-wrap gap-4 pt-6">
                <Button 
                  onClick={() => router.push('/enterprise/sign-in')}
                  className="bg-white hover:bg-slate-50 text-slate-900 rounded-full px-10 py-7 text-base font-semibold cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Recruter un talent
                </Button>
                
                <Button 
                  onClick={() => router.push('/worker/sign-in')}
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white hover:text-slate-900 rounded-full px-10 py-7 text-base font-semibold cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Trouver une mission
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero