"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserCircle, FileText, Briefcase, Building2, PlusCircle, CheckCircle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  const sections = [
    {
      role: "Travailleurs",
      color: "text-[#1D546D]",
      bgColor: "bg-[#1D546D]",
      borderColor: "border-[#5F9598]/30",
      bg: "bg-[#5F9598]/10",
      steps: [
        { icon: UserCircle, title: "Créer votre profil", desc: "Inscrivez-vous en quelques minutes" },
        { icon: FileText, title: "Compléter vos données", desc: "Informations personnelles et professionnelles" },
        { icon: Briefcase, title: "Postuler aux offres", desc: "Trouvez les missions qui vous correspondent" }
      ]
    },
    {
      role: "Entreprises",
      color: "text-[#061E29]",
      bgColor: "bg-[#061E29]",
      borderColor: "border-[#5F9598]/40",
      bg: "bg-[#1D546D]/10",
      steps: [
        { icon: Building2, title: "Créer votre profil", desc: "Créez votre compte entreprise" },
        { icon: FileText, title: "Compléter vos données", desc: "Informations sur votre organisation" },
        { icon: PlusCircle, title: "Publier des offres", desc: "Postez vos missions et besoins" },
        { icon: CheckCircle, title: "Accepter le bon profil", desc: "Sélectionnez le talent idéal" }
      ]
    }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading and subtitle
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
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

      // Animate cards
      const cards = gsap.utils.toArray<HTMLElement>('.step-card')
      
      cards.forEach((card, index) => {
        gsap.fromTo(card, 
          { opacity: 0, x: -30, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="how-it-works" ref={containerRef} className="px-3 sm:px-5 pb-5">
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#1D546D]/20 border-2 border-[#5F9598]/30 bg-[#F3F4F4]/70 backdrop-blur-xl py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="text-center mb-12 sm:mb-20">
            <h2 
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-[#061E29] to-[#1D546D] bg-clip-text text-transparent mb-3 sm:mb-4"
            >
              Comment ça marche
            </h2>
            <p 
              ref={subtitleRef}
              className="text-base sm:text-xl text-[#1D546D]"
            >
              Une plateforme, deux expériences simplifiées
            </p>
          </div>

          {sections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col lg:flex-row gap-8 sm:gap-12 mb-16 sm:mb-32 last:mb-0">
              
              {/* Left Side: Sticky Header */}
              <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-32 space-y-3 sm:space-y-4">
                  <span className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${section.color}`}>
                    Espace {section.role}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#061E29]">
                    Votre parcours vers le succès
                  </h3>
                  <p className="text-sm sm:text-base text-[#1D546D]">
                    Suivez ces étapes simples pour commencer à utiliser notre plateforme dès aujourd'hui.
                  </p>
                  <div className={`h-1 w-16 sm:w-20 rounded-full ${section.bgColor}`} />
                </div>
              </div>

              {/* Right Side: Scrolling Cards */}
              <div className="lg:w-2/3 space-y-4 sm:space-y-6">
                {section.steps.map((step, idx) => {
                  const Icon = step.icon
                  return (
                    <div key={idx} className="relative pl-6 sm:pl-8 step-card">
                      {/* Step Number Badge - Half outside, half inside */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 size-12 sm:size-16 flex items-center justify-center text-[#F3F4F4] font-bold text-lg sm:text-2xl rounded-full ${section.bgColor} shadow-lg z-10`}>
                        {idx + 1}
                      </div>

                      <Card className={`border-2 ${section.borderColor} bg-[#F3F4F4]/90 backdrop-blur-md shadow-lg  overflow-hidden group`}>
                        <CardContent className="p-4 sm:p-6 lg:p-8 pl-8 sm:pl-10 lg:pl-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                          <div className={`p-3 sm:p-4 rounded-2xl ${section.bg}  shrink-0 shadow-sm`}>
                            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${section.color}`} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-[#061E29] mb-1">
                              {step.title}
                            </h4>
                            <p className="text-sm sm:text-base text-[#1D546D] wrap-break-words">
                              {step.desc}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks