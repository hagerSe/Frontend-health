import React, { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { 
  UserPlus, 
  Contact, 
  Search, 
  ClipboardCheck, 
  Hospital, 
  UserCircle,
  Clock,
  Printer,
  FileText
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/services/authService"

export default function CardOfficeDashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("register")

  useEffect(() => {
    setUser(authService.getCurrentUser())
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registration Office</h1>
              <p className="text-gray-500 font-medium mt-1">Patient intake and hospital card issuance</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold">
                 <Clock className="size-4" />
                 Shift: Day
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* Sidebar Actions */}
           <div className="lg:col-span-1 space-y-4">
              <Button 
                variant={activeTab === 'register' ? 'default' : 'outline'} 
                className={`w-full h-16 justify-start rounded-[20px] px-6 gap-4 font-extrabold transition-all border-none ${activeTab === 'register' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                onClick={() => setActiveTab('register')}
              >
                 <UserPlus className="size-5" />
                 New Patient
              </Button>
              <Button 
                variant={activeTab === 'search' ? 'default' : 'outline'}
                className={`w-full h-16 justify-start rounded-[20px] px-6 gap-4 font-extrabold transition-all border-none ${activeTab === 'search' ? 'bg-emerald-600 text-white shadow-xl border-none' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                onClick={() => setActiveTab('search')}
              >
                 <Search className="size-5" />
                 Find Card
              </Button>
              <Button 
                variant={activeTab === 'reports' ? 'default' : 'outline'}
                className={`w-full h-16 justify-start rounded-[20px] px-6 gap-4 font-extrabold transition-all border-none ${activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-xl border-none' : 'hover:bg-emerald-50 hover:text-emerald-700'}`}
                onClick={() => setActiveTab('reports')}
              >
                 <ClipboardCheck className="size-5" />
                 Daily Stats
              </Button>

              <Card className="mt-8 border-none shadow-xl shadow-gray-200/40 rounded-[24px] bg-slate-900 text-white p-6">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Location Context</p>
                 <div className="flex items-center gap-2 mb-4">
                    <Hospital className="size-4 text-emerald-400" />
                    <span className="font-bold text-sm">{user?.hospital?.name || 'Assigned Center'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Contact className="size-4 text-emerald-400" />
                    <span className="font-bold text-sm">Zone: {user?.zone?.name || 'Assigned Zone'}</span>
                 </div>
              </Card>
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3">
              {activeTab === 'register' ? (
                 <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden">
                    <CardHeader className="p-8 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                       <CardTitle className="text-2xl font-black">Patient Intake</CardTitle>
                       <CardDescription className="text-emerald-50 font-medium opacity-80">Verify identification and create hospital record</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                       <form className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input placeholder="First Middle Last" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white transition-all" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <Input type="date" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                <select className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none font-bold text-gray-700">
                                   <option>Female</option>
                                   <option>Male</option>
                                   <option>Other</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Citizenship ID</label>
                                <Input placeholder="ID Number" className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Clinical Triage / Reason</label>
                             <textarea className="w-full min-h-[120px] p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-emerald-100 font-medium" placeholder="Brief visit reason..." />
                          </div>
                          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                             <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold">Clear</Button>
                             <Button className="rounded-2xl h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-xl shadow-emerald-100 gap-2">
                                <Printer className="size-4" />
                                Generate Card
                             </Button>
                          </div>
                       </form>
                    </CardContent>
                 </Card>
              ) : (
                 <div className="bg-white rounded-[40px] p-16 border-2 border-dashed border-gray-100 text-center animate-in fade-in duration-700">
                    <FileText className="size-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900">Module restricted</h3>
                    <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">This section is currently being optimized for faster data retrieval.</p>
                    <Button variant="ghost" className="mt-6 text-emerald-600 font-black hover:bg-emerald-50 rounded-xl" onClick={() => setActiveTab('register')}>
                       Back to Registration
                    </Button>
                 </div>
              )}
           </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
