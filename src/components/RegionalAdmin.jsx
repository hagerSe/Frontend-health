import React, { useEffect, useState } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { 
  Users, 
  Plus, 
  MapPin, 
  Search,
  Filter,
  MoreVertical,
  Mail,
  UserPlus
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

export default function RegionalAdmin() {
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState("list")
  const [zoneAdmins, setZoneAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "Zone_Admin",
    service_name: "Public",
    sex: "Male",
    age: "",
    zone_id: "" // Assuming zone_id now
  })

  useEffect(() => {
    const userRole = authService.getUserRole()
    const userData = authService.getCurrentUser()
    setAdmin(userData)
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdmins({ role: 'Zone_Admin' })
      setZoneAdmins(data.data || [])
    } catch (err) {
      console.error("Failed to fetch admins", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await adminService.createAdmin({
        ...formData,
        region_id: admin.region_id
      })
      setSuccess("Zone Admin added successfully!")
      setFormData({
        ...formData,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        age: "",
        zone_id: ""
      })
      setActiveTab("list")
      fetchAdmins()
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add zone admin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                 {admin?.region?.name || "Regional"} Management
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                 Manage administrators for zones within your jurisdiction
              </p>
           </div>
           <div className="flex items-center gap-3">
              <Button 
                variant={activeTab === "list" ? "default" : "outline"}
                onClick={() => setActiveTab("list")}
                className="rounded-xl font-bold gap-2 px-6"
              >
                 <Users className="size-4" />
                 View Admins
              </Button>
              <Button 
                variant={activeTab === "add" ? "default" : "outline"}
                onClick={() => setActiveTab("add")}
                className="rounded-xl font-bold gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                 <Plus className="size-4" />
                 Register Admin
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
                       <CardTitle className="text-2xl font-extrabold">Register Zone Admin</CardTitle>
                       <CardDescription className="text-blue-100 font-medium">Create a new administrative account for a zone</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border-none font-bold text-sm">{error}</div>}
                    {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border-none font-bold text-sm">{success}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                          <Input name="first_name" value={formData.first_name} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Middle Name</label>
                          <Input name="middle_name" value={formData.middle_name} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                          <Input name="last_name" value={formData.last_name} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <Input type="email" name="email" value={formData.email} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <Input name="phone_number" value={formData.phone_number} onChange={handleChange} className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                          <Input type="password" name="password" value={formData.password} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Age</label>
                          <Input type="number" name="age" value={formData.age} onChange={handleChange} className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                          <select name="sex" value={formData.sex} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-100">
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Zone Assignment</label>
                          <Input name="zone_id" value={formData.zone_id} onChange={handleChange} required className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white" placeholder="Enter Zone ID" />
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                       <Button type="submit" disabled={loading} className="rounded-2xl h-12 px-10 font-extrabold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
                          {loading ? 'Processing...' : 'Complete Registration'}
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        ) : (
           <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm">
             <CardHeader className="p-8 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-extrabold">Zone Administrators</CardTitle>
                   <CardDescription className="text-gray-500 font-medium">Directory of all administrators within the region</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                   <div className="hidden sm:flex relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input placeholder="Search admins..." className="pl-10 rounded-xl bg-gray-50 border-transparent w-64" />
                   </div>
                   <Button variant="outline" size="icon" className="rounded-xl">
                      <Filter className="size-4" />
                   </Button>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                   <TableHeader className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                      <TableRow className="border-none hover:bg-transparent">
                         <TableHead className="px-8 py-4">Admin Identity</TableHead>
                         <TableHead>Zone Mapping</TableHead>
                         <TableHead>Contact Info</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="px-8 text-right">Settings</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                   {loading ? (
                      <TableRow><TableCell colSpan={5} className="py-12 text-center text-gray-400 font-bold">Fetching secure data...</TableCell></TableRow>
                   ) : zoneAdmins.length > 0 ? (
                      zoneAdmins.map((za) => (
                         <TableRow key={za.id} className="border-gray-50 group hover:bg-white transition-all cursor-pointer">
                            <TableCell className="px-8 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center font-extrabold text-slate-500 uppercase border-2 border-white shadow-sm">
                                     {za.first_name[0]}{za.last_name[0]}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="font-extrabold text-gray-900">{za.first_name} {za.last_name}</span>
                                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">ID: {za.id.slice(0, 8)}</span>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <MapPin className="size-3 text-red-400" />
                                  <span className="font-bold text-gray-700">{za.zone?.name || "Unassigned"}</span>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                     <Mail className="size-3" />
                                     {za.email}
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold rounded-xl px-3 py-1">
                                  Operational
                               </Badge>
                            </TableCell>
                            <TableCell className="px-8 text-right">
                               <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="size-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))
                   ) : (
                      <TableRow><TableCell colSpan={5} className="py-20 text-center text-gray-400 font-bold italic">No active administrators found in this jurisdiction</TableCell></TableRow>
                   )}
                   </TableBody>
                </Table>
             </CardContent>
           </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
