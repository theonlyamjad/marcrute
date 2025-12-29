"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react"

type DayStatus = "available" | "unavailable" | null

export default function AvailabilityPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [availability, setAvailability] = useState<Record<string, DayStatus>>(
    {}
  )

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDay = firstDayOfMonth.getDay() || 7 // Monday first

  const monthName = firstDayOfMonth.toLocaleString("default", {
    month: "long",
  })

  const toggleDay = (dateKey: string) => {
    setAvailability((prev) => {
      const current = prev[dateKey]
      if (current === "available") return { ...prev, [dateKey]: "unavailable" }
      if (current === "unavailable") return { ...prev, [dateKey]: null }
      return { ...prev, [dateKey]: "available" }
    })
  }

  const changeMonth = (dir: number) => {
    let newMonth = currentMonth + dir
    let newYear = currentYear

    if (newMonth < 0) {
      newMonth = 11
      newYear--
    }
    if (newMonth > 11) {
      newMonth = 0
      newYear++
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              Availability
            </h1>
            <p className="text-slate-500">
              Set the days you are available to work
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg border bg-white hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="font-medium text-slate-700 min-w-[160px] text-center">
              {monthName} {currentYear}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg border bg-white hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="text-emerald-500" size={18} />
            Available
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <XCircle className="text-rose-500" size={18} />
            Unavailable
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            Today
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-medium text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {/* Empty start */}
            {Array.from({ length: startDay - 1 }).map((_, i) => (
              <div key={i} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = `${currentYear}-${currentMonth + 1}-${day}`
              const status = availability[dateKey]

              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear()

              return (
                <button
                  key={day}
                  onClick={() => toggleDay(dateKey)}
                  className={`h-24 rounded-xl border text-left p-3 transition
                    ${
                      status === "available"
                        ? "bg-emerald-50 border-emerald-400"
                        : status === "unavailable"
                        ? "bg-rose-50 border-rose-400"
                        : "bg-white hover:bg-slate-50"
                    }
                    ${isToday ? "ring-2 ring-blue-400" : ""}
                  `}
                >
                  <div className="text-sm font-medium text-slate-700">
                    {day}
                  </div>

                  <div className="mt-2 text-xs">
                    {status === "available" && (
                      <span className="text-emerald-600 font-medium">
                        Available
                      </span>
                    )}
                    {status === "unavailable" && (
                      <span className="text-rose-600 font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
