import React, { useEffect, useState } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { 
  Users, 
  Stethoscope, 
  Plus, 
  Search,
  Settings,
  MoreVertical,
  Mail,
  UserPlus,
  Activity,
  UserCircle
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/authService"
import { adminService } from "@/services/adminService"

export default function HospitalAdmin() {
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState("list")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    sex: "Female",
    email: "",
    password: "",
    ward: "OPD",
    department: "Doctor",
  })

  useEffect(() => {
    const userData = authService.getCurrentUser()
    setAdmin(userData)
    // In a real app we'd fetch users for this hospital
    // fetchStaff()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Logic to create staff user
      setSuccess("Staff member added successfully!")
      setActiveTab("list")
    } catch (err) {
      setError(err.message || "Failed to add user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                 {admin?.hospital?.name || "Hospital"} Command Center
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                 Managing clinical staff and operations
              </p>
           </div>
           <div className="flex items-center gap-3">
              <Button 
                variant={activeTab === "list" ? "default" : "outline"}
                onClick={() => setActiveTab("list")}
                className="rounded-xl font-bold gap-2"
              >
                 <Users className="size-4" />
                 Staff Roster
              </Button>
              <Button 
                variant={activeTab === "add" ? "default" : "outline"}
                onClick={() => setActiveTab("add")}
                className="rounded-xl font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                 <Plus className="size-4" />
                 Onboard Staff
              </Button>
           </div>
        </div>

        {activeTab === "add" ? (
           <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden max-w-4xl mx-auto">
              <CardHeader className="p-8 bg-blue-600 text-white">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                       <UserPlus className="size-6 text-white" />
                    </div>
                    <div>
                       <CardTitle className="text-2xl font-extrabold">Staff Onboarding</CardTitle>
                       <CardDescription className="text-blue-100 font-medium">Add new medical or administrative personnel to the hospital</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border-none font-bold text-sm">{error}</div>}
                    {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border-none font-bold text-sm">{success}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                          <Input name="first_name" value={formData.first_name} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                          <Input name="last_name" value={formData.last_name} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                          <Input type="email" name="email" value={formData.email} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                          <Input type="password" name="password" value={formData.password} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Ward Assignment</label>
                          <select name="ward" value={formData.ward} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold">
                             <option>OPD</option>
                             <option>Emergency</option>
                             <option>ANC</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Professional Role</label>
                          <select name="department" value={formData.department} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-blue-600">
                             <option>Doctor</option>
                             <option>Nurse</option>
                             <option>Radiology</option>
                             <option>Pharmacy</option>
                             <option>Laboratory</option>
                             <option>HR</option>
                          </select>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                       <Button type="submit" disabled={loading} className="rounded-2xl h-12 px-10 font-extrabold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
                          {loading ? 'Processing...' : 'Add Staff Member'}
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              <div className="lg:col-span-1 space-y-6">
                 <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[24px]">
                    <CardHeader className="p-6 pb-2">
                       <CardTitle className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Active Duty</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="size-2 bg-emerald-500 rounded-full"></div>
                             <span className="text-sm font-bold text-gray-700">Doctors</span>
                          </div>
                          <span className="font-extrabold">12</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="size-2 bg-blue-500 rounded-full"></div>
                             <span className="text-sm font-bold text-gray-700">Nurses</span>
                          </div>
                          <span className="font-extrabold">24</span>
                       </div>
                    </CardContent>
                 </Card>
                 
                 <Card className="border-none shadow-xl shadow-blue-100/30 rounded-[24px] bg-blue-600 text-white p-6">
                    <Activity className="size-8 mb-4 text-white/50" />
                    <h4 className="text-lg font-extrabold mb-1">ER Capacity</h4>
                    <p className="text-xs text-blue-100 mb-4">92% Occupancy rate</p>
                    <div className="h-1.5 bg-white/20 rounded-full">
                       <div className="h-full bg-white w-[92%] rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                 </Card>
              </div>

              <Card className="lg:col-span-3 border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="p-8 border-b border-gray-100 flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="text-xl font-extrabold text-gray-900">Medical Staff Registry</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                         <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-4">Practitioner</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Ward</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="px-8 text-right"></TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         <TableRow className="border-gray-50 group hover:bg-white transition-all cursor-pointer">
                            <TableCell className="px-8 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-2xl bg-gray-100 flex items-center justify-center font-extrabold text-gray-500 uppercase">
                                     DM
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-extrabold text-gray-900">Dr. Meredith Grey</span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chief of Surgery</span>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <Stethoscope className="size-3 text-blue-400" />
                                  <span className="font-bold text-gray-700">Surgery</span>
                               </div>
                            </TableCell>
                            <TableCell>
                               <span className="text-xs font-bold text-gray-500">Theater 1</span>
                            </TableCell>
                            <TableCell>
                               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold rounded-xl px-3 py-1">
                                  In Surgery
                               </Badge>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                               <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="size-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      </TableBody>
                   </Table>
                </CardContent>
              </Card>
           </div>
        )}
      </div>
    </DashboardLayout>
  )
}
