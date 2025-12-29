"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Briefcase, GraduationCap, Calendar, Mail, Phone } from "lucide-react"

/* ================= MOCK DATA ================= */

const profile = {
  name: "Ahmed Benali",
  title: "Software Engineer",
  city: "Casablanca, Morocco",
  email: "ahmed@email.com",
  phone: "+212 600000000",
  bio: "Passionate software engineer focused on building clean, scalable, and user-centric applications.",
  experienceYears: 3,
  experiences: [
    {
      role: "Frontend Developer",
      company: "Startup X",
      start: "2022",
      end: "2024",
    },
    {
      role: "Junior Developer",
      company: "Agency Y",
      start: "2020",
      end: "2022",
    },
  ],
  diplomas: [
    {
      title: "Bachelor in Computer Science",
      institution: "University of Casablanca",
      year: "2020",
      verified: true,
    },
    {
      title: "React Professional Certificate",
      institution: "Meta",
      year: "2023",
      verified: false,
    },
  ],
}

/* ================= COMPONENT ================= */

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">

      {/* ================= HEADER ================= */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-28 w-28">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">{profile.title}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.city}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {profile.experienceYears}+ years</span>
            </div>

            <p className="max-w-xl text-sm text-muted-foreground mt-3">{profile.bio}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button>Contact</Button>
            <Button variant="outline">Download CV</Button>
          </div>
        </CardContent>
      </Card>

      {/* ================= CONTACT ================= */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile.email}</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {profile.phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* ================= EXPERIENCE ================= */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Experience</h2>

          <div className="space-y-4">
            {profile.experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1"><Calendar className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <h3 className="font-semibold">{exp.role}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <Badge variant="secondary" className="mt-1">{exp.start} – {exp.end}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================= DIPLOMAS ================= */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Education & Certifications</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {profile.diplomas.map((dip, i) => (
              <Card key={i} className="p-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> {dip.title}
                </h3>
                <p className="text-sm text-muted-foreground">{dip.institution}</p>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline">{dip.year}</Badge>
                  <Badge variant={dip.verified ? "default" : "secondary"}>
                    {dip.verified ? "Verified" : "Pending verification"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
