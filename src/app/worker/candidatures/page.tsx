"use client"

import {
  Briefcase,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react"

/* ================= DATA ================= */

type Application = {
  id: number
  role: string
  company: string
  appliedAt: string
  updatedAt: string
  status: "Pending" | "Accepted" | "Rejected"
}

const applications: Application[] = [
  { id: 1, role: "Frontend Developer", company: "Tech Solutions", appliedAt: "12 Sep 2025", updatedAt: "15 Sep 2025", status: "Pending" },
  { id: 2, role: "UI/UX Designer", company: "Design Lab", appliedAt: "05 Sep 2025", updatedAt: "10 Sep 2025", status: "Pending" },
  { id: 3, role: "Backend Engineer", company: "CloudWorks", appliedAt: "01 Sep 2025", updatedAt: "08 Sep 2025", status: "Accepted" },
  { id: 4, role: "Project Coordinator", company: "Atlas Group", appliedAt: "28 Aug 2025", updatedAt: "02 Sep 2025", status: "Rejected" },
]

/* ================= STYLES ================= */

const statusConfig = {
  Pending: { icon: Hourglass, badge: "bg-yellow-100 text-yellow-700 bg-gradient-to-r from-yellow-50 to-yellow-100" },
  Accepted: { icon: CheckCircle, badge: "bg-green-100 text-green-700 bg-gradient-to-r from-green-50 to-green-100" },
  Rejected: { icon: XCircle, badge: "bg-red-100 text-red-700 bg-gradient-to-r from-red-50 to-red-100" },
}

/* ================= COMPONENT ================= */

export default function ApplicationsPage() {
  const acceptedCount = applications.filter((a) => a.status === "Accepted").length
  const pendingCount = applications.filter((a) => a.status === "Pending").length
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all missions you have applied for.
          </p>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Accepted", value: acceptedCount, icon: CheckCircle, color: "green" },
            { label: "Pending", value: pendingCount, icon: Hourglass, color: "yellow" },
            { label: "Rejected", value: rejectedCount, icon: XCircle, color: "red" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`bg-white border rounded-xl p-6 flex items-center justify-between shadow-md hover:shadow-xl transition duration-300`}
              >
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-semibold text-${stat.color}-700`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={`text-${stat.color}-600`} size={36} />
              </div>
            )
          })}
        </div>

        {/* ================= APPLICATIONS TABLE ================= */}
        <div className="bg-white border rounded-xl shadow-md overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Mission</th>
                <th className="px-6 py-3 text-left">Company</th>
                <th className="px-6 py-3 text-left">Applied</th>
                <th className="px-6 py-3 text-left">Last Update</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {applications.map((app) => {
                const StatusIcon = statusConfig[app.status].icon
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-500" />
                      {app.role}
                    </td>

                    <td className="px-6 py-4 text-gray-700">{app.company}</td>

                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                      <Calendar size={14} />
                      {app.appliedAt}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{app.updatedAt}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${statusConfig[app.status].badge} shadow-sm`}
                      >
                        <StatusIcon size={14} />
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition">
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
