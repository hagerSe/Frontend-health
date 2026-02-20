import React, { useEffect, useState } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { 
  Building2, 
  Users, 
  MapPin, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  RefreshCcw,
  Search
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
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { adminService } from "@/services/adminService"
import { hospitalService } from "@/services/hospitalService"
import { geoService } from "@/services/geoService"

export default function FederalAdmin() {
  const [stats, setStats] = useState({
    hospitals: 0,
    admins: 0,
    regions: 0,
    patients: 12450 // Dummy for now
  })
  const [recentAdmins, setRecentAdmins] = useState([])
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    region_id: "",
    role: "Regional_Admin",
    sex: "Male",
    age: "",
    service_name: ""
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [hospitalsRes, adminsRes, regionsRes] = await Promise.all([
        hospitalService.getHospitals(),
        adminService.getAdmins(),
        geoService.getRegions()
      ])
      
      setStats({
        hospitals: hospitalsRes.data?.length || 0,
        admins: adminsRes.data?.length || 0,
        regions: regionsRes.data?.length || 0,
        patients: 12450
      })
      setRecentAdmins(adminsRes.data || [])
      setRegions(regionsRes.data || [])
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adminService.createAdmin(formData)
      setIsDialogOpen(false)
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        region_id: "",
        role: "Regional_Admin",
        sex: "Male",
        age: "",
        service_name: ""
      })
      fetchData() // Refresh list
    } catch (err) {
      console.error("Failed to create admin:", err)
      alert(err.response?.data?.message || "Failed to create administrator")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
           <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">National Overview</h1>
              <p className="text-gray-500 font-medium">Monitoring health infrastructure across all sectors</p>
           </div>
           <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchData} className="hidden sm:flex rounded-xl gap-2 font-bold hover:bg-white shadow-sm">
                 <RefreshCcw className="size-4" />
                 Refresh Data
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl gap-2 font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
                    <Plus className="size-4" />
                    Add New Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[585px] rounded-[32px] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-900">Add Regional Administrator</DialogTitle>
                    <DialogDescription className="font-medium text-gray-500">
                      Create a new regional administrator. They will have access to all data within their assigned region.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto px-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</Label>
                          <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middle_name" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Middle Name</Label>
                          <Input id="middle_name" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="last_name" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</Label>
                          <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service_name" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Service Type</Label>
                          <Select onValueChange={(val) => handleSelectChange('service_name', val)} value={formData.service_name}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                              <SelectItem value="Public" className="font-bold cursor-pointer">Public</SelectItem>
                              <SelectItem value="Private" className="font-bold cursor-pointer">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sex" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sex</Label>
                          <Select onValueChange={(val) => handleSelectChange('sex', val)} value={formData.sex}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                              <SelectItem value="Male" className="font-bold cursor-pointer">Male</SelectItem>
                              <SelectItem value="Female" className="font-bold cursor-pointer">Female</SelectItem>
                              <SelectItem value="Other" className="font-bold cursor-pointer">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age</Label>
                          <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Access Password</Label>
                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Region</Label>
                        <Select onValueChange={(val) => handleSelectChange('region_id', val)} value={formData.region_id}>
                          <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white font-bold">
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id.toString()} className="font-bold cursor-pointer">{region.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100">
                        {submitting ? "Processing..." : "Establish Identity"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Hospitals", val: stats.hospitals, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", delta: "+3.2%", status: "up" },
            { title: "Network Admins", val: stats.admins, icon: Users, color: "text-purple-600", bg: "bg-purple-50", delta: "+12.1%", status: "up" },
            { title: "Active Regions", val: stats.regions, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50", delta: "Stable", status: "none" },
            { title: "Total Records", val: stats.patients.toLocaleString(), icon: Activity, color: "text-orange-600", bg: "bg-orange-50", delta: "-0.4%", status: "down" },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-xl shadow-gray-200/40 rounded-[24px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="size-6" />
                   </div>
                   {item.status !== "none" && (
                      <Badge variant="outline" className={`rounded-xl border-none font-bold ${item.status === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {item.status === 'up' ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}
                         {item.delta}
                      </Badge>
                   )}
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.title}</p>
                   <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{item.val}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Recent Admins Table */}
           <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm">
             <CardHeader className="border-b border-gray-100 p-8 flex flex-row items-center justify-between space-y-0">
               <div>
                  <CardTitle className="text-xl font-extrabold text-gray-900">Recent Admin Registrations</CardTitle>
                  <CardDescription className="text-gray-500 font-medium font-sans">Latest administrators added to the national database</CardDescription>
               </div>
               <Button variant="ghost" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl">View All</Button>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-gray-50/50">
                   <TableRow className="hover:bg-transparent border-none">
                     <TableHead className="px-8 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Administrator</TableHead>
                     <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Role / Jurisdiction</TableHead>
                     <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                     <TableHead className="px-8 text-right font-bold text-gray-400 uppercase tracking-widest text-[10px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentAdmins.map((admin) => (
                     <TableRow key={admin.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group border-gray-50">
                       <TableCell className="px-8 py-4">
                         <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-100 font-bold text-gray-600 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-200 uppercase">
                               {admin.first_name[0]}{admin.last_name[0]}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-gray-900">{admin.first_name} {admin.last_name}</span>
                               <span className="text-xs text-gray-500 font-medium">{admin.email}</span>
                            </div>
                         </div>
                       </TableCell>
                       <TableCell className="py-4">
                         <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">{admin.role.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-500 font-medium">{admin.region?.name || "Federal"}</span>
                         </div>
                       </TableCell>
                       <TableCell className="py-4">
                         <Badge className="rounded-xl border-none px-3 py-1 bg-emerald-100/50 text-emerald-700 font-bold hover:bg-emerald-100/50">
                            Active
                         </Badge>
                       </TableCell>
                       <TableCell className="px-8 py-4 text-right">
                          <Button variant="ghost" size="icon" className="rounded-xl opacity-0 hover:bg-white group-hover:opacity-100 transition-all font-bold">
                             <ArrowUpRight className="size-4 text-blue-600" />
                          </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>

           {/* Health Progress Card */}
           <div className="space-y-8">
              <Card className="border-none shadow-2xl shadow-blue-100/30 rounded-[32px] bg-blue-600 text-white overflow-hidden relative group">
                 <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                 <CardHeader className="p-8 pb-4 relative z-10">
                    <div className="p-3 bg-white/20 w-fit rounded-2xl mb-4">
                       <Building2 className="size-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold mb-1">National Growth</CardTitle>
                    <CardDescription className="text-blue-100 font-bold">Facility deployment progress</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0 relative z-10">
                    <div className="space-y-6 mt-4">
                       <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                             <span>Public Access Target</span>
                             <span>84%</span>
                          </div>
                          <Progress value={84} className="h-2 bg-white/20" indicatorClassName="bg-white" />
                       </div>
                       <Button className="w-full rounded-2xl border-none bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-sm shadow-xl mt-4">
                          Download Report
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden">
                 <CardHeader className="p-8 pb-4 border-b border-gray-50 bg-gray-50/30">
                    <CardTitle className="text-lg font-extrabold text-gray-900">System Activity</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    {[
                       { label: "Token Refresh Issues", val: "None detected", color: "text-emerald-600", icon: Activity },
                       { label: "Sync Latency", val: "14ms", color: "text-blue-600", icon: RefreshCcw },
                       { label: "Auth Incidents", val: "0 today", color: "text-emerald-600", icon: Users },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-3">
                             <item.icon className={`size-4 ${item.color}`} />
                             <span className="text-sm font-bold text-gray-500">{item.label}</span>
                          </div>
                          <span className={`text-sm font-extrabold ${item.color}`}>{item.val}</span>
                       </div>
                    ))}
                 </CardContent>
              </Card>
           </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
