import React, { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { 
  Users, 
  Plus, 
  MapPin, 
  Search,
  Filter,
  MoreVertical,
  Mail,
  UserPlus,
  LayoutDashboard,
  Building2,
  Map,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Trash2,
  Edit,
  ExternalLink,
  Settings2,
  Globe,
  Layers
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { authService } from "@/services/authService"
import { adminService } from "@/services/adminService"
import { geoService } from "@/services/geoService"

export default function ZoneAdmin() {
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [woredaAdmins, setWoredaAdmins] = useState([])
  const [woredas, setWoredas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "Woreda_Admin",
    service_name: "Public",
    sex: "Male",
    age: "",
    woreda_id: ""
  })

  const [woredaFormData, setWoredaFormData] = useState({
    name: ""
  })

  const [searchQuery, setSearchQuery] = useState("")

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const userData = authService.getCurrentUser()
      setAdmin(userData)

      if (userData?.zone_id) {
        const [adminsData, woredasData] = await Promise.all([
          adminService.getAdmins({ role: 'Woreda_Admin', zone_id: userData.zone_id }),
          geoService.getWoredas(userData.zone_id)
        ])
        setWoredaAdmins(adminsData.data || [])
        setWoredas(woredasData.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch zone dashboard data", err)
      setError("Failed to load zone data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const fetchAdmins = async () => {
    if (!admin?.zone_id) return
    try {
      const data = await adminService.getAdmins({ role: 'Woreda_Admin', zone_id: admin.zone_id })
      setWoredaAdmins(data.data || [])
    } catch (err) {
      console.error("Failed to fetch woredas admins", err)
    }
  }

  const fetchWoredas = async () => {
    if (!admin?.zone_id) return
    try {
      const data = await geoService.getWoredas(admin.zone_id)
      setWoredas(data.data || [])
    } catch (err) {
      console.error("Failed to fetch woredas", err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await adminService.createAdmin({
        ...formData,
        region_id: admin.region_id,
        zone_id: admin.zone_id
      })
      setSuccess("Woreda Admin successfully registered!")
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "Woreda_Admin",
        service_name: "Public",
        sex: "Male",
        age: "",
        woreda_id: ""
      })
      setTimeout(() => {
        setActiveTab("list")
        fetchAdmins()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add woreda admin")
    } finally {
      setSubmitting(false)
    }
  }

  const handleWoredaSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await geoService.createWoreda({
        ...woredaFormData,
        zone_id: admin.zone_id
      })
      setSuccess(`Woreda "${woredaFormData.name}" successfully created!`)
      setWoredaFormData({ name: "" })
      fetchWoredas()
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create woreda")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAdmins = woredaAdmins.filter(wa => 
    `${wa.first_name} ${wa.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wa.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wa.woreda?.name && wa.woreda.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="border-none shadow-lg shadow-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp size={14} />
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )

  if (loading && !admin) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
           <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl"></div>)}
           </div>
           <div className="h-[400px] bg-gray-50 rounded-[32px]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">Zone Command</Badge>
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                 {admin?.zone?.name || "Zone"} Administration
              </h1>
              <p className="text-gray-500 font-medium mt-1 text-lg">
                 Managing administrative infrastructure and health woredas
              </p>
           </div>
           
           <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                className={`rounded-xl font-bold gap-2 px-6 transition-all ${activeTab === "overview" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500"}`}
              >
                 <LayoutDashboard className="size-4" />
                 Overview
              </Button>
              <Button 
                variant={activeTab === "list" || activeTab === "add" ? "default" : "ghost"}
                onClick={() => setActiveTab("list")}
                className={`rounded-xl font-bold gap-2 px-6 transition-all ${activeTab === "list" || activeTab === "add" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500"}`}
              >
                 <Users className="size-4" />
                 Woreda Admins
              </Button>
              <Button 
                variant={activeTab === "infra" ? "default" : "ghost"}
                onClick={() => setActiveTab("infra")}
                className={`rounded-xl font-bold gap-2 px-6 transition-all ${activeTab === "infra" ? "bg-indigo-600 text-white shadow-lg hover:bg-indigo-700" : "text-gray-500"}`}
              >
                 <Layers className="size-4" />
                 Zone Data
              </Button>
           </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard 
                 title="Total Woredas" 
                 value={woredas.length} 
                 icon={Layers} 
                 color="bg-indigo-500" 
                 trend="Zone Structure"
               />
               <StatCard 
                 title="Woreda Admins" 
                 value={woredaAdmins.length} 
                 icon={ShieldCheck} 
                 color="bg-blue-500" 
                 trend="Assigned"
               />
               <StatCard 
                 title="Total Facilities" 
                 value="12" 
                 icon={Building2} 
                 color="bg-emerald-500" 
                 trend="Active"
               />
               <StatCard 
                 title="Avg Staffing" 
                 value="92%" 
                 icon={Activity} 
                 color="bg-rose-500" 
                 trend="Optimal"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-extrabold text-gray-900">Recent Woreda Admins</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Recently registered administrators for woredas</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setActiveTab("list")}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        {woredaAdmins.slice(0, 5).map((wa) => (
                           <TableRow key={wa.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                             <TableCell className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                 <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                                   {wa.first_name[0]}{wa.last_name[0]}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-extrabold text-gray-900">{wa.first_name} {wa.last_name}</span>
                                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{wa.email}</span>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <MapPin className="size-3 text-rose-500" />
                                 <span className="font-bold text-gray-600">{wa.woreda?.name || "Unassigned"}</span>
                               </div>
                             </TableCell>
                             <TableCell className="text-right px-8">
                               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase px-3 py-1 rounded-lg">Operational</Badge>
                             </TableCell>
                           </TableRow>
                        ))}
                        {woredaAdmins.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="py-20 text-center text-gray-400 font-bold">No recent registrations</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] bg-indigo-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={160} />
                  </div>
                  <CardHeader className="p-8 relative z-10">
                    <CardTitle className="text-2xl font-extrabold">Zone Governance</CardTitle>
                    <CardDescription className="text-indigo-400 font-medium">Administrative tools for {admin?.zone?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6 relative z-10">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5" onClick={() => setActiveTab("infra")}>
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                               <Layers size={24} />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-lg">Woreda Control</span>
                               <span className="text-xs text-indigo-400">{woredas.length} active woredas</span>
                            </div>
                         </div>
                         <ArrowRight size={20} className="text-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                       </div>
                       
                       <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                               <Building2 size={24} />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-lg">Hospital Data</span>
                               <span className="text-xs text-indigo-400">Inventory of health facilities</span>
                            </div>
                         </div>
                         <ArrowRight size={20} className="text-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 relative z-10">
                     <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold rounded-2xl h-14 shadow-2xl shadow-black/20 text-lg">
                        Zone Activity Log
                     </Button>
                  </CardFooter>
               </Card>
            </div>
          </div>
        )}

        {activeTab === "add" && (
           <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[40px] overflow-hidden max-w-6xl mx-auto bg-white animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                 <div className="lg:col-span-2 bg-indigo-600 p-16 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -bottom-20 -left-20 size-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -right-20 size-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                       <div className="p-5 bg-white/10 rounded-3xl w-fit shadow-2xl backdrop-blur-xl mb-10 border border-white/20">
                          <UserPlus className="size-10 text-white" />
                       </div>
                       <h2 className="text-5xl font-extrabold mb-6 leading-tight">Register Woreda Lead</h2>
                       <p className="text-indigo-100 font-medium text-xl leading-relaxed opacity-90">
                          Designate administrative power to woreda-level leaders. They will be responsible for local clinic and hospital oversight.
                       </p>
                    </div>
                    
                    <div className="relative z-10 mt-12 space-y-8">
                       <div className="flex items-center gap-5">
                          <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xl backdrop-blur-md">
                             <ShieldCheck size={28} />
                          </div>
                          <div>
                             <p className="font-extrabold text-lg tracking-tight">Access Control</p>
                             <p className="text-indigo-200 font-medium">Secured with woreda-specific scopes</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xl backdrop-blur-md">
                             <Activity size={28} />
                          </div>
                          <div>
                             <p className="font-extrabold text-lg tracking-tight">Resource Management</p>
                             <p className="text-indigo-200 font-medium">Integrated woreda health monitoring</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="lg:col-span-3 p-16">
                    <form onSubmit={handleAdminSubmit} className="space-y-10">
                       {error && <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold text-sm animate-in slide-in-from-top duration-300 flex items-center gap-3">
                         <div className="size-2 rounded-full bg-rose-600"></div>
                         {error}
                       </div>}
                       {success && <div className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold text-sm animate-in slide-in-from-top duration-300 flex items-center gap-3">
                         <div className="size-2 rounded-full bg-emerald-600 animate-ping"></div>
                         {success}
                       </div>}

                       <div className="space-y-8">
                          <div>
                             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-indigo-600"></div>
                               Personal Information
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                   <Input name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Name" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Middle Name</label>
                                   <Input name="middle_name" value={formData.middle_name} onChange={handleChange} required placeholder="Father's" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                   <Input name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Surname" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                                   <Input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="30" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                             </div>
                          </div>

                          <div>
                             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-indigo-600"></div>
                               Access Details
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Login Email</label>
                                   <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@woreda.gov" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">System Password</label>
                                   <Input type="password" name="password" value={formData.password} onChange={handleChange} required className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-base font-bold transition-all" />
                                </div>
                             </div>
                          </div>

                          <div>
                             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-indigo-600"></div>
                               Assigned Woreda
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Woreda Jurisdiction</label>
                                   <Select onValueChange={(val) => handleSelectChange("woreda_id", val)} value={formData.woreda_id}>
                                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-50 text-base font-bold transition-all">
                                         <SelectValue placeholder="Identify Woreda" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                         {woredas.map(w => (
                                           <SelectItem key={w.id} value={w.id} className="rounded-xl mb-1 p-3 focus:bg-indigo-50 focus:text-indigo-600 font-bold transition-colors">
                                              {w.name}
                                           </SelectItem>
                                         ))}
                                         {woredas.length === 0 && <SelectItem disabled value="none">No woredas in this zone</SelectItem>}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Service Designation</label>
                                   <Select onValueChange={(val) => handleSelectChange("service_name", val)} value={formData.service_name}>
                                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-50 text-base font-bold transition-all">
                                         <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                         <SelectItem value="Public" className="rounded-xl mb-1 p-3 font-bold transition-colors">Public Health</SelectItem>
                                         <SelectItem value="Private" className="rounded-xl p-3 font-bold transition-colors">Private Health</SelectItem>
                                      </SelectContent>
                                   </Select>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="pt-10 border-t border-gray-100 flex items-center justify-between gap-6">
                          <Button 
                             type="button" 
                             variant="ghost" 
                             onClick={() => setActiveTab("list")}
                             className="rounded-2xl h-14 px-10 font-black text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all text-base"
                          >
                             Discard
                          </Button>
                          <Button 
                             type="submit" 
                             disabled={submitting} 
                             className="rounded-2xl h-14 px-14 font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 min-w-[240px] text-lg transition-all transform active:scale-95"
                          >
                             {submitting ? (
                                <Activity className="animate-spin size-6" />
                             ) : (
                                "Initiate Admin"
                             )}
                          </Button>
                       </div>
                    </form>
                 </div>
              </div>
           </Card>
        )}

        {activeTab === "list" && (
           <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[40px] overflow-hidden bg-white animate-in slide-in-from-bottom-6 duration-700">
              <CardHeader className="p-10 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white">
                 <div className="space-y-1">
                    <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Woreda Administrators</CardTitle>
                    <CardDescription className="text-gray-500 font-medium text-lg italic">Overseeing {woredaAdmins.length} woreda administrative portals</CardDescription>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-[400px]">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                       <Input 
                         placeholder="Search name, email, or woreda..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-12 rounded-2xl bg-gray-50 border-none w-full h-14 text-base font-bold focus-visible:ring-4 focus-visible:ring-indigo-50 transition-all" 
                       />
                    </div>
                    <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 border-gray-100 font-black text-base shadow-sm hover:bg-gray-50 transition-all" onClick={() => setActiveTab("add")}>
                       <UserPlus className="size-5" />
                       Add Admin
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <Table>
                       <TableHeader className="bg-gray-50/70 border-b border-gray-100">
                          <TableRow className="border-none hover:bg-transparent">
                             <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Admin Profile</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Woreda Assignment</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Sector</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Operational Status</TableHead>
                             <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto text-right">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                       {loading ? (
                          [1, 2, 3].map(i => (
                             <TableRow key={i} className="border-gray-50">
                                <TableCell className="px-10 py-8"><Skeleton className="h-12 w-64 rounded-2xl" /></TableCell>
                                <TableCell><Skeleton className="h-12 w-40 rounded-2xl" /></TableCell>
                                <TableCell><Skeleton className="h-12 w-40 rounded-2xl" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                                <TableCell className="px-10"><div className="flex justify-end"><Skeleton className="h-12 w-12 rounded-2xl" /></div></TableCell>
                             </TableRow>
                          ))
                       ) : filteredAdmins.length > 0 ? (
                          filteredAdmins.map((wa) => (
                             <TableRow key={wa.id} className="border-gray-50 group hover:bg-indigo-50/30 transition-all duration-300">
                                <TableCell className="px-10 py-7">
                                   <div className="flex items-center gap-5">
                                      <div className="size-14 rounded-3xl bg-white shadow-xl flex items-center justify-center font-black text-gray-700 uppercase border-2 border-gray-50 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-100 group-hover:rotate-3 shadow-gray-200/50">
                                            {wa.first_name[0]}{wa.last_name[0]}
                                      </div>
                                      <div className="flex flex-col space-y-0.5">
                                         <span className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors text-lg">{wa.first_name} {wa.last_name}</span>
                                         <div className="flex items-center gap-2 text-xs font-black text-gray-400 tracking-tight">
                                            <Mail className="size-3.5" />
                                            {wa.email}
                                         </div>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="outline" className="rounded-2xl border-gray-100 bg-white shadow-sm font-black text-gray-700 py-2.5 px-5 flex items-center gap-3 w-fit group-hover:border-rose-100 group-hover:bg-rose-50/30 transition-all">
                                      <MapPin className="size-4 text-rose-500" />
                                      {wa.woreda?.name || "Unassigned"}
                                   </Badge>
                                </TableCell>
                                <TableCell>
                                   <div className="flex flex-col gap-1">
                                      <span className="text-base font-extrabold text-gray-800">{wa.service_name} Sector</span>
                                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-[0.1em]">Woreda Admin</span>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2.5">
                                      <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                      <span className="text-sm font-black text-emerald-600 tracking-tight">Active Portal</span>
                                   </div>
                                </TableCell>
                                <TableCell className="px-10 text-right">
                                   <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                      <Button variant="ghost" size="icon" className="size-11 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 shadow-sm border border-transparent hover:border-indigo-100 transition-all">
                                         <Edit className="size-5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="size-11 rounded-2xl hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-100 transition-all">
                                         <Trash2 className="size-5" />
                                      </Button>
                                   </div>
                                </TableCell>
                             </TableRow>
                          ))
                       ) : (
                          <TableRow>
                             <TableCell colSpan={5} className="py-32 text-center text-gray-400 font-bold text-lg italic">
                                No records found matching your filters.
                             </TableCell>
                          </TableRow>
                       )}
                       </TableBody>
                    </Table>
                 </div>
              </CardContent>
           </Card>
        )}

        {activeTab === "infra" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-right-4 duration-500">
            <Card className="lg:col-span-1 border-none shadow-2xl shadow-gray-200/40 rounded-[40px] bg-white h-fit">
              <CardHeader className="p-10 pb-6">
                 <div className="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-indigo-100 shadow-lg">
                    <Plus size={28} />
                 </div>
                 <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Zone Woreda</CardTitle>
                 <CardDescription className="text-gray-500 font-medium text-lg">Define a new administrative woreda for this zone</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                 <form onSubmit={handleWoredaSubmit} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Woreda Identity Name</label>
                       <Input 
                         value={woredaFormData.name}
                         onChange={(e) => setWoredaFormData({ ...woredaFormData, name: e.target.value })}
                         placeholder="e.g. Adama Zuria Woreda"
                         required
                         className="rounded-2xl h-16 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-lg font-bold"
                       />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full rounded-2xl h-16 bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                    >
                       {submitting ? <Activity className="animate-spin" /> : "Authorize Woreda"}
                    </Button>
                 </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/40 rounded-[40px] bg-white overflow-hidden">
               <CardHeader className="p-10 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Woreda Structure</CardTitle>
                      <CardDescription className="text-gray-500 font-medium text-lg">Inventory of all established woredas in this zone</CardDescription>
                    </div>
                    <Settings2 size={24} className="text-gray-300" />
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-none">
                        <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Administrative Woreda</TableHead>
                        <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Zone Mapping</TableHead>
                        <TableHead className="px-10 py-6 text-right text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {woredas.map((w) => (
                        <TableRow key={w.id} className="border-gray-50 group hover:bg-gray-50 transition-colors">
                          <TableCell className="px-10 py-7">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner">
                                {w.name[0]}
                              </div>
                              <span className="font-black text-gray-900 text-lg">{w.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl border-gray-100 bg-white font-black text-gray-500 py-1.5 px-4 shadow-sm">
                              {admin?.zone?.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-10 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-lg transition-all">
                                <Edit className="size-5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <Trash2 className="size-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {woredas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-32 text-center text-gray-400 font-bold text-lg italic">
                            No woreda data found for this zone.
                          </TableCell>
                        </TableRow>
                      )}
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
