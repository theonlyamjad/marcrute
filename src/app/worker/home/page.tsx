"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  User,
} from "lucide-react"

const missions = [
  {
    id: 1,
    title: "Website Redesign",
    status: "Urgent",
    postedBy: "Ahmed Benali",
    description:
      "Redesign a small business website with a modern UI, better UX, and mobile-first approach.",
    duration: "2 weeks",
    applicants: 12,
    city: "Casablanca",
  },
  {
    id: 2,
    title: "Mobile App Testing",
    status: "Normal",
    postedBy: "Sara El Idrissi",
    description:
      "Test Android application, identify bugs, edge cases, and provide a professional QA report.",
    duration: "5 days",
    applicants: 5,
    city: "Rabat",
  },
]

export default function AdvancedSearchPage() {
  const [cities, setCities] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")

  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "Morocco" }),
    })
      .then((res) => res.json())
      .then((data) => setCities(data.data))
      .catch(console.error)
  }, [])

  const filteredMissions = missions.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())

    const matchCity = selectedCity === "all" || m.city === selectedCity

    return matchSearch && matchCity
  })

  return (
    <div className="min-h-screen p-8"> 
     {/* bg-gradient-to-br from-gray-50 to-gray-100 (top) */}
      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search missions, skills, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full md:w-64">
            <MapPin className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {filteredMissions.map((mission) => (
          <Card
            key={mission.id}
            className="group hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6 space-y-4">
              {/* Top */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition">
                      {mission.title}
                    </h3>

                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {mission.city}
                    </Badge>

                    <Badge
                      variant={
                        mission.status === "Urgent"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {mission.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                    {mission.description}
                  </p>
                </div>

                <Button className="hidden md:inline-flex">
                  Apply
                </Button>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {mission.postedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mission.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {mission.applicants} applicants
                  </span>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 md:flex-none">
                    View details
                  </Button>
                  <Button className="flex-1 md:flex-none md:hidden">
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMissions.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            No missions found.
          </div>
        )}
      </div>
    </div>
  )
}
