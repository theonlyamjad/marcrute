"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Pencil, Save, Plus } from "lucide-react"

/* ================= TYPES ================= */

type Experience = {
  role: string
  company: string
  start: string
  end: string
}

type Diploma = {
  title: string
  institution: string
  year: string
  proof?: File
}

/* ================= COMPONENT ================= */

export default function SettingsPage() {
  const [editPersonal, setEditPersonal] = useState(false)
  const [editProfessional, setEditProfessional] = useState(false)

  const [personal, setPersonal] = useState({
    name: "Ahmed Benali",
    email: "ahmed@email.com",
    phone: "+212 600000000",
    description:
      "Passionate software engineer focused on building clean, scalable, and user-centric applications.",
  })

  const [title, setTitle] = useState("Software Engineer")
  const [years, setYears] = useState("3")

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      role: "Frontend Developer",
      company: "Startup X",
      start: "2022",
      end: "2024",
    },
  ])

  const [diplomas, setDiplomas] = useState<Diploma[]>([
    { title: "", institution: "", year: "" },
  ])

  const updateExperience = (
    i: number,
    field: keyof Experience,
    value: string
  ) => {
    setExperiences((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    )
  }

  const updateDiploma = (i: number, field: keyof Diploma, value: any) => {
    setDiplomas((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d))
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">

      {/* ================= PERSONAL ================= */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <Button
              variant="outline"
              onClick={() => setEditPersonal(!editPersonal)}
            >
              {editPersonal ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>

            {editPersonal && (
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Input type="file" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              disabled={!editPersonal}
              value={personal.name}
              onChange={(e) =>
                setPersonal({ ...personal, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              disabled={!editPersonal}
              value={personal.email}
              onChange={(e) =>
                setPersonal({ ...personal, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              disabled={!editPersonal}
              value={personal.phone}
              onChange={(e) =>
                setPersonal({ ...personal, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Input
              disabled={!editPersonal}
              value={personal.description}
              onChange={(e) =>
                setPersonal({ ...personal, description: e.target.value })
              }
            />
          </div>

          {editPersonal && (
            <Button onClick={() => setEditPersonal(false)}>
              Save changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ================= PROFESSIONAL ================= */}
      <Card>
        <CardContent className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Professional Profile</h2>
            <Button
              variant="outline"
              onClick={() => setEditProfessional(!editProfessional)}
            >
              {editProfessional ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Professional Title</Label>
            <Input
              disabled={!editProfessional}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Input
              disabled={!editProfessional}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>

          {/* ===== EXPERIENCE ===== */}
          <div className="space-y-4">
            <h3 className="font-semibold">Experience</h3>

            {experiences.map((exp, i) => (
              <Card key={i} className="p-4 bg-muted/30 space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    disabled={!editProfessional}
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(i, "role", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    disabled={!editProfessional}
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(i, "company", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      disabled={!editProfessional}
                      value={exp.start}
                      onChange={(e) =>
                        updateExperience(i, "start", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      disabled={!editProfessional}
                      value={exp.end}
                      onChange={(e) =>
                        updateExperience(i, "end", e.target.value)
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}

            {editProfessional && (
              <Button
                variant="secondary"
                onClick={() =>
                  setExperiences([
                    ...experiences,
                    { role: "", company: "", start: "", end: "" },
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add experience
              </Button>
            )}
          </div>

          {/* ===== DIPLOMAS ===== */}
          <div className="space-y-4">
            <h3 className="font-semibold">Diplomas & Certifications</h3>

            {diplomas.map((dip, i) => (
              <Card key={i} className="p-4 bg-muted/30 space-y-4">
                <div className="space-y-2">
                  <Label>Diploma Title</Label>
                  <Input
                    disabled={!editProfessional}
                    value={dip.title}
                    onChange={(e) =>
                      updateDiploma(i, "title", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input
                    disabled={!editProfessional}
                    value={dip.institution}
                    onChange={(e) =>
                      updateDiploma(i, "institution", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    disabled={!editProfessional}
                    value={dip.year}
                    onChange={(e) =>
                      updateDiploma(i, "year", e.target.value)
                    }
                  />
                </div>

                {editProfessional && (
                  <div className="space-y-2">
                    <Label>Upload Proof</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        updateDiploma(i, "proof", e.target.files?.[0])
                      }
                    />
                  </div>
                )}

                {dip.proof && (
                  <Badge variant="outline">
                    Proof uploaded: {dip.proof.name}
                  </Badge>
                )}
              </Card>
            ))}

            {editProfessional && (
              <Button
                variant="secondary"
                onClick={() =>
                  setDiplomas([
                    ...diplomas,
                    { title: "", institution: "", year: "" },
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add diploma
              </Button>
            )}
          </div>

          {editProfessional && (
            <Button onClick={() => setEditProfessional(false)}>
              Save professional profile
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
