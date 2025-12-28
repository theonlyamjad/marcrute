"use client"

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CTA = () => {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        }
      })

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.5"
      )
      .fromTo(
        buttonsRef.current?.children || [],
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(
        trustRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="px-5 pb-5">
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border-2 border-slate-200/60 bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 py-20 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-slate-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-slate-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          
          {/* Content */}
          <div className="text-center space-y-8">
            <h2 
              ref={headingRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight"
            >
              Prêt à commencer votre parcours ?
            </h2>
            
            <p 
              ref={subtitleRef}
              className="text-xl sm:text-2xl text-slate-200 max-w-2xl mx-auto"
            >
              Rejoignez des milliers de professionnels et d'entreprises qui transforment leur avenir avec MARcrute
            </p>

            {/* CTA Buttons */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button 
                onClick={() => router.push('/worker/sign-in')}
                className="bg-white hover:bg-slate-50 cursor-pointer text-slate-900 rounded-full px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
              >
                Je cherche du travail
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => router.push('/enterprise/sign-in')}
                className="bg-white/10 backdrop-blur-md cursor-pointer border-2 border-white/60 text-white hover:bg-white hover:text-slate-900 rounded-full px-10 py-7 text-lg font-semibold transition-all duration-300 hover:scale-105 group w-full sm:w-auto shadow-lg hover:shadow-2xl"
              >
                Je recrute des talents
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust indicator */}
            <p ref={trustRef} className="text-sm text-slate-300 pt-8">
              Inscription gratuite • Sans engagement • Accès immédiat
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA