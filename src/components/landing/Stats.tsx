"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Building2, Briefcase } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Stats = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const stats = [
    {
      icon: Users,
      number: 5243,
      label: "Travailleurs inscrits"
    },
    {
      icon: Building2,
      number: 1089,
      label: "Entreprises actives"
    },
    {
      icon: Briefcase,
      number: 3721,
      label: "Postes libres"
    }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          }
        }
      )

      // Stagger animate cards
      cardsRef.current.forEach((card, index) => {
        if (!card) return

        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: 0.2 + (index * 0.15),
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            }
          }
        )
      })

      // Animate counters
      counterRefs.current.forEach((counter, index) => {
        if (!counter) return

        const targetNumber = stats[index].number

        gsap.fromTo(
          counter,
          { innerText: 0 },
          {
            innerText: targetNumber,
            duration: 2.5,
            delay: 0.5 + (index * 0.15),
            ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
            onUpdate: function() {
              counter.innerText = Math.ceil(this.targets()[0].innerText) + "+"
            }
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="stats" ref={sectionRef} className="px-5 pb-5">
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#1D546D]/20 border-2 border-[#5F9598]/30 bg-[#F3F4F4]/70 backdrop-blur-xl py-16">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Title */}
          <div className="text-center mb-16">
            <h2 
              ref={headingRef}
              className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[#061E29] to-[#1D546D] bg-clip-text text-transparent"
            >
              MARcrute en chiffres
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              
              return (
                <div
                  key={index}
                  ref={(el) => { cardsRef.current[index] = el }}
                >
                  <Card className="border-2 border-[#5F9598]/30 shadow-lg bg-[#F3F4F4]/90 backdrop-blur-md">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="inline-flex p-4 bg-linear-to-br from-[#5F9598]/20 to-[#1D546D]/20 rounded-2xl shadow-md">
                        <Icon className="w-10 h-10 text-[#061E29]" strokeWidth={1.5} />
                      </div>
                      
                      <h3 className="text-5xl font-bold text-[#061E29] tracking-tight">
                        <span ref={(el) => { counterRefs.current[index] = el }}>
                          0+
                        </span>
                      </h3>
                      
                      <p className="text-[#1D546D] text-lg font-medium">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats