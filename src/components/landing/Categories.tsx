"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Stethoscope, GraduationCap, Heart, Users, Brain, 
  Home, Smile, Scale, Briefcase, Baby, Wrench, 
  Car, Utensils, Hotel, ShoppingBag, Truck, 
  Laptop, Phone, Camera, ClipboardCheck, FileText
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Categories = () => {
  const marqueeRef1 = useRef<HTMLDivElement>(null)
  const marqueeRef2 = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  const allCategories = [
    { icon: Stethoscope, title: "Santé et médico-social", description: "Infirmiers, aides-soignants, médecins" },
    { icon: GraduationCap, title: "Éducation et formation", description: "Enseignants, formateurs, éducateurs" },
    { icon: Heart, title: "Services sociaux", description: "Assistants sociaux, accompagnateurs" },
    { icon: Users, title: "Administration", description: "Gestionnaires, coordinateurs" },
    { icon: Brain, title: "Psychologie", description: "Psychologues, thérapeutes" },
    { icon: Home, title: "Aide à domicile", description: "Auxiliaires de vie, aides ménagères" },
    { icon: Smile, title: "Animation socioculturelle", description: "Animateurs, médiateurs" },
    { icon: Scale, title: "Juridique et conseil", description: "Conseillers juridiques, experts" },
    { icon: Briefcase, title: "Insertion professionnelle", description: "Conseillers emploi, coachs" },
    { icon: Baby, title: "Petite enfance", description: "Éducateurs, puéricultrices" },
    { icon: Wrench, title: "Maintenance et technique", description: "Techniciens, électriciens, plombiers" },
    { icon: Car, title: "Transport et logistique", description: "Chauffeurs, livreurs, logisticiens" },
    { icon: Utensils, title: "Restauration", description: "Cuisiniers, serveurs, chefs" },
    { icon: Hotel, title: "Hôtellerie et tourisme", description: "Réceptionnistes, guides, hôtes" },
    { icon: ShoppingBag, title: "Commerce et vente", description: "Vendeurs, conseillers commerciaux" },
    { icon: Truck, title: "Livraison", description: "Coursiers, livreurs express" },
    { icon: Laptop, title: "Informatique et digital", description: "Développeurs, techniciens IT" },
    { icon: Phone, title: "Service client", description: "Téléopérateurs, agents support" },
    { icon: Camera, title: "Communication et média", description: "Photographes, vidéastes, journalistes" },
    { icon: ClipboardCheck, title: "Qualité et contrôle", description: "Inspecteurs, auditeurs, superviseurs" }
  ]

  // Split categories: First 10 (Top) and Last 10 (Bottom)
  const row1Categories = allCategories.slice(0, 10)
  const row2Categories = allCategories.slice(10, 20)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text Animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        }
      })
      tl.fromTo(headingRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")

      // 2. Marquee Function (Handles cloning and looping)
      const setupMarquee = (el: HTMLDivElement, direction: 'left' | 'right') => {
        const cards = Array.from(el.children) as HTMLElement[]
        const originalCount = cards.length
        
        // Clone multiple times to ensure no gaps (3 times for safety)
        for (let i = 0; i < 3; i++) {
          cards.forEach(card => {
            const clone = card.cloneNode(true) as HTMLElement
            el.appendChild(clone)
          })
        }

        // Calculate total width after cloning
        const cardWidth = cards[0].offsetWidth
        const gap = 20 // gap-5 = 1.25rem = 20px
        const totalWidth = (cardWidth + gap) * originalCount

        if (direction === 'left') {
          gsap.to(el, {
            x: -totalWidth,
            duration: 30,
            ease: "none",
            repeat: -1,
          })
        } else {
          // Start from -totalWidth and move to 0 for Right direction
          gsap.set(el, { x: -totalWidth })
          gsap.to(el, {
            x: 0,
            duration: 50,
            ease: "none",
            repeat: -1,
          })
        }

        // Hover effect
        el.addEventListener('mouseenter', () => gsap.to(el, { timeScale: 0, duration: 0.5 }))
        el.addEventListener('mouseleave', () => gsap.to(el, { timeScale: 1, duration: 0.5 }))
      }

      if (marqueeRef1.current) setupMarquee(marqueeRef1.current, 'left')
      if (marqueeRef2.current) setupMarquee(marqueeRef2.current, 'right')
    })

    return () => ctx.revert()
  }, [])

  const renderCard = (category: typeof allCategories[0], index: number) => {
    const Icon = category.icon
    return (
    <Card 
      key={index} 
      className="cursor-pointer border-2 border-[#5F9598]/30 bg-[#F3F4F4]/90 backdrop-blur-md shrink-0 w-52 hover:shadow-lg transition-shadow"
    >
      <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-glinear-to-br from-[#5F9598]/20 to-[#1D546D]/20 rounded-lg shadow-sm">
          <Icon className="w-7 h-7 text-[#061E29]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-bold text-base text-[#061E29] mb-1.5">{category.title}</h3>
          <p className="text-xs text-[#1D546D] leading-relaxed">{category.description}</p>
        </div>
      </CardContent>
    </Card>
    )
  }

  return (
    <section id="features" ref={sectionRef} className="px-5 pb-5">
      <div className="rounded-[2.5rem] shadow-2xl shadow-[#1D546D]/20 border-2 border-[#5F9598]/30 backdrop-blur-xl bg-[#F3F4F4]/70 py-16">
        <div className="max-w-7xl mx-auto px-5 mb-16">
          <div className="text-center">
            <h2 ref={headingRef} className="text-3xl md:text-5xl font-bold text-[#061E29] bg-clip-text  mb-4">
              Des professionnels qualifiés dans tous les domaines
            </h2>
            <p ref={subtitleRef} className="text-xl text-[#1D546D] max-w-3xl mx-auto">
              Accédez à un réseau de talents qualifiés à travers une diversité de secteurs professionnels
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Row 1: Right to Left */}
          <div className="relative overflow-hidden">
            <div ref={marqueeRef1} className="flex gap-5 w-max">
              {row1Categories.map((cat, i) => renderCard(cat, i))}
            </div>
          </div>

          {/* Row 2: Left to Right */}
          <div className="relative overflow-hidden">
            <div ref={marqueeRef2} className="flex gap-5 w-max">
              {row2Categories.map((cat, i) => renderCard(cat, i))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Categories