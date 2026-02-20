import React, { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { 
  UserCircle, 
  Stethoscope, 
  User, 
  Calendar, 
  FileText, 
  ClipboardList,
  Clock,
  ArrowRight
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/services/authService"

export default function DoctorDashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(authService.getCurrentUser())
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-none px-4 py-1 rounded-full font-bold backdrop-blur-md">
                   On Duty • {user?.department || 'Medical Staff'}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                   Welcome back, <br />
                   Dr. {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-blue-100 font-medium max-w-md">
                   You have 8 active cases today and 12 scheduled appointments in your ward ({user?.ward})
                </p>
             </div>
             <div className="flex gap-4">
                <Button className="rounded-2xl h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-md shadow-xl">
                   Daily Rounds
                </Button>
                <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20 font-extrabold text-md backdrop-blur-sm">
                   View Schedule
                </Button>
             </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
              { label: "Active Patients", val: "24", icon: User, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Appointments", val: "12", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending Reports", val: "5", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Avg Wait Time", val: "14m", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
           ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl shadow-gray-200/50 rounded-[24px] hover:scale-105 transition-transform">
                 <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                       <stat.icon className="size-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                       <h3 className="text-2xl font-black text-gray-900">{stat.val}</h3>
                    </div>
                 </CardContent>
              </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Tools Section */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black text-gray-900 ml-2">Clinical Workspace</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                    { title: "E-Prescriptions", desc: "Digital medication ordering", icon: Stethoscope, color: "bg-indigo-600" },
                    { title: "Clinical Notes", desc: "Update patient progress", icon: ClipboardList, color: "bg-emerald-600" },
                    { title: "Lab Results", desc: "Review diagnostics", icon: Activity, color: "bg-blue-600" },
                    { title: "Team Chat", desc: "Internal coordination", icon: Users, color: "bg-purple-600" },
                 ].map((tool, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-gray-200/30 rounded-[32px] group cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden">
                       <CardContent className="p-8 flex items-center gap-6">
                          <div className={`size-16 rounded-[20px] ${tool.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                             <tool.icon className="size-8" />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-extrabold text-gray-900 text-lg mb-1">{tool.title}</h4>
                             <p className="text-sm text-gray-500 font-medium">{tool.desc}</p>
                          </div>
                          <ArrowRight className="size-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>

           {/* Location Info */}
           <div className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 ml-2">Assigned Unit</h2>
              <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden">
                 <CardHeader className="p-8 bg-gray-50">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                       <Stethoscope className="size-5 text-blue-600" />
                       Hopsital Context
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-5">
                    <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Facility</span>
                       <span className="font-extrabold text-gray-800">{user?.hospital?.name || 'Local Hospital'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section</span>
                       <span className="font-extrabold text-gray-800">{user?.ward || 'General ward'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</span>
                       <span className="font-extrabold text-gray-800">{user?.region?.name || 'Assigned Region'}</span>
                    </div>
                 </CardContent>
              </Card>
           </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
