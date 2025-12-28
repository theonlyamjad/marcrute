"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Stethoscope, 
  GraduationCap, 
  Heart, 
  Users, 
  Brain, 
  Home, 
  Smile, 
  Scale,
  Briefcase,
  Baby
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Categories = () => {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  const categories = [
    {
      icon: Stethoscope,
      title: "Santé et médico-social",
      description: "Infirmiers, aides-soignants, médecins"
    },
    {
      icon: GraduationCap,
      title: "Éducation et formation",
      description: "Enseignants, formateurs, éducateurs"
    },
    {
      icon: Heart,
      title: "Services sociaux",
      description: "Assistants sociaux, accompagnateurs"
    },
    {
      icon: Users,
      title: "Administration",
      description: "Gestionnaires, coordinateurs"
    },
    {
      icon: Brain,
      title: "Psychologie",
      description: "Psychologues, thérapeutes"
    },
    {
      icon: Home,
      title: "Aide à domicile",
      description: "Auxiliaires de vie, aides ménagères"
    },
    {
      icon: Smile,
      title: "Animation socioculturelle",
      description: "Animateurs, médiateurs"
    },
    {
      icon: Scale,
      title: "Juridique et conseil",
      description: "Conseillers juridiques, experts"
    },
    {
      icon: Briefcase,
      title: "Insertion professionnelle",
      description: "Conseillers emploi, coachs"
    },
    {
      icon: Baby,
      title: "Petite enfance",
      description: "Éducateurs, puéricultrices"
    }
  ]

  useEffect(() => {
    // Stagger animation for heading and subtitle
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
    })

    // Marquee animation
    if (!marqueeRef.current) return

    const marqueeContent = marqueeRef.current
    const cards = Array.from(marqueeContent.children) as HTMLElement[]
    
    // Calculate total width
    const totalWidth = cards.reduce((acc, card) => acc + card.offsetWidth + 24, 0)

    // Duplicate cards for seamless loop
    cards.forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement
      marqueeContent.appendChild(clone)
    })

    // Infinite smooth scroll animation
    gsap.to(marqueeContent, {
      x: -totalWidth,
      duration: 40,
      ease: "none",
      repeat: -1,
    })

    // Pause on hover
    marqueeContent.addEventListener('mouseenter', () => {
      gsap.to(marqueeContent, { timeScale: 0, duration: 0.5 })
    })

    marqueeContent.addEventListener('mouseleave', () => {
      gsap.to(marqueeContent, { timeScale: 1, duration: 0.5 })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="px-5 pb-5">
      {/* Rounded Container with Glass Effect */}
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border-2 border-slate-200/60 bg-white/70 backdrop-blur-xl py-16">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-5 mb-16">
          <div className="text-center">
            <h2 
              ref={headingRef}
              className="text-4xl md:text-5xl font-bold bg-linear-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4"
            >
              Des professionnels qualifiés dans tous les domaines
            </h2>
            <p 
              ref={subtitleRef}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Accédez à un réseau de talents qualifiés à travers une diversité de secteurs professionnels
            </p>
          </div>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">

          {/* Scrolling Cards */}
          <div 
            ref={marqueeRef}
            className="flex gap-6 py-4"
          >
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card
                  key={index}
                  className="cursor-pointer border-2 border-slate-200/60 bg-white/80 backdrop-blur-md shrink-0 w-80 "
                >
                  <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="p-6 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl shadow-md">
                      <Icon className="w-12 h-12 text-slate-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 mb-3">
                        {category.title}
                      </h3>
                      <p className="text-base text-slate-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Categories