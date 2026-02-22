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
  Globe
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

export default function RegionalAdmin() {
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [zoneAdmins, setZoneAdmins] = useState([])
  const [zones, setZones] = useState([])
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
    role: "Zone_Admin",
    service_name: "Public",
    sex: "Male",
    age: "",
    zone_id: ""
  })

  const [zoneFormData, setZoneFormData] = useState({
    name: ""
  })

  const [searchQuery, setSearchQuery] = useState("")

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const userData = authService.getCurrentUser()
      setAdmin(userData)

      if (userData?.region_id) {
        const [adminsData, zonesData] = await Promise.all([
          adminService.getAdmins({ role: 'Zone_Admin', region_id: userData.region_id }),
          geoService.getZones(userData.region_id)
        ])
        setZoneAdmins(adminsData.data || [])
        setZones(zonesData.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const fetchAdmins = async () => {
    if (!admin?.region_id) return
    try {
      const data = await adminService.getAdmins({ role: 'Zone_Admin', region_id: admin.region_id })
      setZoneAdmins(data.data || [])
    } catch (err) {
      console.error("Failed to fetch admins", err)
    }
  }

  const fetchZones = async () => {
    if (!admin?.region_id) return
    try {
      const data = await geoService.getZones(admin.region_id)
      setZones(data.data || [])
    } catch (err) {
      console.error("Failed to fetch zones", err)
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
        region_id: admin.region_id
      })
      setSuccess("Zone Admin successfully registered!")
      setFormData({
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
        zone_id: ""
      })
      setTimeout(() => {
        setActiveTab("list")
        fetchAdmins()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add zone admin")
    } finally {
      setSubmitting(false)
    }
  }

  const handleZoneSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await geoService.createZone({
        ...zoneFormData,
        region_id: admin.region_id
      })
      setSuccess(`Zone "${zoneFormData.name}" successfully created!`)
      setZoneFormData({ name: "" })
      fetchZones()
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create zone")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAdmins = zoneAdmins.filter(za => 
    `${za.first_name} ${za.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    za.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (za.zone?.name && za.zone.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold">Regional Command</Badge>
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                 {admin?.region?.name || "Regional"} Dashboard
              </h1>
              <p className="text-gray-500 font-medium mt-1 text-lg">
                 Overseeing administrative operations and regional infrastructure
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
                 Admins
              </Button>
              <Button 
                variant={activeTab === "infra" ? "default" : "ghost"}
                onClick={() => setActiveTab("infra")}
                className={`rounded-xl font-bold gap-2 px-6 transition-all ${activeTab === "infra" ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700" : "text-gray-500"}`}
              >
                 <Globe className="size-4" />
                 Regional Data
              </Button>
           </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard 
                 title="Total Zones" 
                 value={zones.length} 
                 icon={Map} 
                 color="bg-indigo-500" 
                 trend="+2 this month"
               />
               <StatCard 
                 title="Zone Admins" 
                 value={zoneAdmins.length} 
                 icon={ShieldCheck} 
                 color="bg-blue-500" 
                 trend="Active"
               />
               <StatCard 
                 title="Hospitals" 
                 value="24" 
                 icon={Building2} 
                 color="bg-emerald-500" 
                 trend="8 General"
               />
               <StatCard 
                 title="Regional Health" 
                 value="88%" 
                 icon={Activity} 
                 color="bg-rose-500" 
                 trend="Stable"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-extrabold text-gray-900">Recent Zone Registrations</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Latest administrators added to regional zones</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setActiveTab("list")}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableBody>
                        {zoneAdmins.slice(0, 5).map((za) => (
                           <TableRow key={za.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                             <TableCell className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                 <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                                   {za.first_name[0]}{za.last_name[0]}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-extrabold text-gray-900">{za.first_name} {za.last_name}</span>
                                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{za.email}</span>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <MapPin className="size-3 text-rose-500" />
                                 <span className="font-bold text-gray-600">{za.zone?.name || "Unassigned"}</span>
                               </div>
                             </TableCell>
                             <TableCell className="text-right px-8">
                               <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase px-3 py-1 rounded-lg">Operational</Badge>
                             </TableCell>
                           </TableRow>
                        ))}
                        {zoneAdmins.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="py-20 text-center text-gray-400 font-bold">No recent registrations</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] bg-slate-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={160} />
                  </div>
                  <CardHeader className="p-8 relative z-10">
                    <CardTitle className="text-2xl font-extrabold">Regional Infrastructure</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Quick access to regional sectors</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6 relative z-10">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5" onClick={() => setActiveTab("infra")}>
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                               <Map size={24} />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-lg">Zone Structure</span>
                               <span className="text-xs text-slate-400">{zones.length} active zones mapped</span>
                            </div>
                         </div>
                         <ArrowRight size={20} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                       </div>
                       
                       <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group border border-white/5">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                               <Building2 size={24} />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-lg">Health Facilities</span>
                               <span className="text-xs text-slate-400">Manage 24 regional hospitals</span>
                            </div>
                         </div>
                         <ArrowRight size={20} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 relative z-10">
                     <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-2xl h-14 shadow-2xl shadow-black/20 text-lg">
                        Generate Regional Report
                     </Button>
                  </CardFooter>
               </Card>
            </div>
          </div>
        )}

        {activeTab === "add" && (
           <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[40px] overflow-hidden max-w-6xl mx-auto bg-white animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                 <div className="lg:col-span-2 bg-blue-600 p-16 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -bottom-20 -left-20 size-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -right-20 size-80 bg-blue-400/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                       <div className="p-5 bg-white/10 rounded-3xl w-fit shadow-2xl backdrop-blur-xl mb-10 border border-white/20">
                          <UserPlus className="size-10 text-white" />
                       </div>
                       <h2 className="text-5xl font-extrabold mb-6 leading-tight">Register Zone Admin</h2>
                       <p className="text-blue-100 font-medium text-xl leading-relaxed opacity-90">
                          Empower professional leadership for regional health sectors. These administrators will oversee critical healthcare infrastructure.
                       </p>
                    </div>
                    
                    <div className="relative z-10 mt-12 space-y-8">
                       <div className="flex items-center gap-5">
                          <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xl backdrop-blur-md">
                             <ShieldCheck size={28} />
                          </div>
                          <div>
                             <p className="font-extrabold text-lg tracking-tight">Enterprise Security</p>
                             <p className="text-blue-200 font-medium">Automatic role-based access encryption</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-xl backdrop-blur-md">
                             <Activity size={28} />
                          </div>
                          <div>
                             <p className="font-extrabold text-lg tracking-tight">Live Integration</p>
                             <p className="text-blue-200 font-medium">Immediate synchronization with zone data</p>
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
                             <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-blue-600"></div>
                               Personal Profile
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                   <Input name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="John" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Middle Name</label>
                                   <Input name="middle_name" value={formData.middle_name} onChange={handleChange} required placeholder="Doe" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                   <Input name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Smith" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                                   <Input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="35" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                             </div>
                          </div>

                          <div>
                             <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-blue-600"></div>
                               Secure Credentials
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                   <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@zone.gov" className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                   <Input type="password" name="password" value={formData.password} onChange={handleChange} required className="rounded-2xl h-14 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 text-base font-bold transition-all" />
                                </div>
                             </div>
                          </div>

                          <div>
                             <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                               <div className="h-[2px] w-4 bg-blue-600"></div>
                               Operational Scope
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Zone</label>
                                   <Select onValueChange={(val) => handleSelectChange("zone_id", val)} value={formData.zone_id}>
                                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 text-base font-bold transition-all">
                                         <SelectValue placeholder="Locate Zone" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                         {zones.map(z => (
                                           <SelectItem key={z.id} value={z.id} className="rounded-xl mb-1 p-3 focus:bg-blue-50 focus:text-blue-600 font-bold transition-colors">
                                              {z.name}
                                           </SelectItem>
                                         ))}
                                         {zones.length === 0 && <SelectItem disabled value="none">No zones found</SelectItem>}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Service Type</label>
                                   <Select onValueChange={(val) => handleSelectChange("service_name", val)} value={formData.service_name}>
                                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-50 text-base font-bold transition-all">
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
                             className="rounded-2xl h-14 px-14 font-black bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-200 min-w-[240px] text-lg transition-all transform active:scale-95"
                          >
                             {submitting ? (
                                <Activity className="animate-spin size-6" />
                             ) : (
                                "Initialize Portal"
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
                    <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Zone Administrators</CardTitle>
                    <CardDescription className="text-gray-500 font-medium text-lg italic">Overseeing {zoneAdmins.length} active portals in the region</CardDescription>
                 </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-[400px]">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                       <Input 
                         placeholder="Search profile, email, or zone..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-12 rounded-2xl bg-gray-50 border-none w-full h-14 text-base font-bold focus-visible:ring-4 focus-visible:ring-blue-50 transition-all" 
                       />
                    </div>
                    <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 border-gray-100 font-black text-base shadow-sm hover:bg-gray-50 transition-all" onClick={() => setActiveTab("add")}>
                       <UserPlus className="size-5" />
                       New Admin
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <Table>
                       <TableHeader className="bg-gray-50/70 border-b border-gray-100">
                          <TableRow className="border-none hover:bg-transparent">
                             <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Administrator Identity</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Mapped Sector</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Specialization</TableHead>
                             <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto">Integrity Status</TableHead>
                             <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] h-auto text-right">Settings</TableHead>
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
                          filteredAdmins.map((za) => (
                             <TableRow key={za.id} className="border-gray-50 group hover:bg-slate-50/50 transition-all duration-300">
                                <TableCell className="px-10 py-7">
                                   <div className="flex items-center gap-5">
                                      <div className="relative">
                                         <div className="size-14 rounded-3xl bg-white shadow-xl flex items-center justify-center font-black text-gray-700 uppercase border-2 border-gray-50 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-100 group-hover:rotate-3 shadow-gray-200/50">
                                            {za.first_name[0]}{za.last_name[0]}
                                         </div>
                                         <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                                      </div>
                                      <div className="flex flex-col space-y-0.5">
                                         <span className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">{za.first_name} {za.last_name}</span>
                                         <div className="flex items-center gap-2 text-xs font-black text-gray-400 tracking-tight">
                                            <Mail className="size-3.5" />
                                            {za.email}
                                         </div>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="outline" className="rounded-2xl border-gray-100 bg-white shadow-sm font-black text-gray-700 py-2.5 px-5 flex items-center gap-3 w-fit group-hover:border-rose-100 group-hover:bg-rose-50/30 transition-all">
                                      <MapPin className="size-4 text-rose-500" />
                                      {za.zone?.name || "Unassigned"}
                                   </Badge>
                                </TableCell>
                                <TableCell>
                                   <div className="flex flex-col gap-1">
                                      <span className="text-base font-extrabold text-gray-800">{za.service_name} Sector</span>
                                      <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-[0.1em]">{za.role.replace('_', ' ')}</span>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2.5">
                                      <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                      <span className="text-sm font-black text-emerald-600 tracking-tight">Operational</span>
                                   </div>
                                </TableCell>
                                <TableCell className="px-10 text-right">
                                   <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                      <Button variant="ghost" size="icon" className="size-11 rounded-2xl hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-transparent hover:border-blue-100 transition-all">
                                         <ExternalLink className="size-5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="size-11 rounded-2xl hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-transparent hover:border-blue-100 transition-all">
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
                             <TableCell colSpan={5} className="py-32 text-center">
                                <div className="flex flex-col items-center justify-center space-y-6">
                                   <div className="p-8 bg-gray-50 rounded-[40px] shadow-inner">
                                      <Search className="size-16 text-gray-200" />
                                   </div>
                                   <div className="space-y-2">
                                      <p className="font-black text-gray-900 text-2xl tracking-tight">Deployment Data Missing</p>
                                      <p className="text-gray-500 font-medium text-lg max-w-sm mx-auto">No administrators match your current regional parameters.</p>
                                   </div>
                                   <Button className="rounded-2xl font-black bg-gray-900 text-white hover:bg-blue-600 h-14 px-10 transition-all shadow-xl" onClick={() => setActiveTab("add")}>
                                      Setup New Portal
                                   </Button>
                                </div>
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
                 <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">New Region Zone</CardTitle>
                 <CardDescription className="text-gray-500 font-medium text-lg">Define a new administrative sector for the region</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                 <form onSubmit={handleZoneSubmit} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Zone Designation Name</label>
                       <Input 
                         value={zoneFormData.name}
                         onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                         placeholder="e.g. North Shewa Zone"
                         required
                         className="rounded-2xl h-16 bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50 text-lg font-bold"
                       />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full rounded-2xl h-16 bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                    >
                       {submitting ? <Activity className="animate-spin" /> : "Authorize New Zone"}
                    </Button>
                    <p className="text-xs text-center text-gray-400 font-bold px-4">
                      By authorizing, you confirm this zone is within official regional boundaries.
                    </p>
                 </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/40 rounded-[40px] bg-white overflow-hidden">
               <CardHeader className="p-10 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Regional Zone Structure</CardTitle>
                      <CardDescription className="text-gray-500 font-medium text-lg">Inventory of all established administrative sectors</CardDescription>
                    </div>
                    <Settings2 size={24} className="text-gray-300" />
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-none">
                        <TableHead className="px-10 py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Sector Name</TableHead>
                        <TableHead className="py-6 text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Regional Mapping</TableHead>
                        <TableHead className="px-10 py-6 text-right text-[11px] uppercase font-black text-gray-400 tracking-[0.2em]">Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zones.map((z) => (
                        <TableRow key={z.id} className="border-gray-50 group hover:bg-gray-50 transition-colors">
                          <TableCell className="px-10 py-7">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner">
                                {z.name[0]}
                              </div>
                              <span className="font-black text-gray-900 text-lg">{z.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl border-gray-100 bg-white font-black text-gray-500 py-1.5 px-4 shadow-sm">
                              {admin?.region?.name}
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
                      {zones.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="py-32 text-center text-gray-400 font-bold text-lg italic">
                            No infrastructure data mapped for this region yet.
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
