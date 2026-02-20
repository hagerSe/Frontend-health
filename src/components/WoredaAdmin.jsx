import React, { useEffect, useState } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { Map, Users, Plus, MapPin, Search, BarChart3, MoreVertical, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/authService"

export default function WoredaAdmin() {
  const [admin, setAdmin] = useState(null)
  useEffect(() => { setAdmin(authService.getCurrentUser()) }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{admin?.woreda?.name || "Woreda"} Dashboard</h1>
              <p className="text-gray-500 font-medium mt-1">Managing kesehatan level woreda and health centers</p>
           </div>
           <div className="flex items-center gap-3">
              <Button className="rounded-xl font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100">
                 <Plus className="size-4" /> Manage Kebeles
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[24px]">
              <CardContent className="p-6">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4"><Map className="size-6" /></div>
                 <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Total Kebeles</p>
                 <h3 className="text-3xl font-black text-gray-900">12</h3>
              </CardContent>
           </Card>
           <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[24px]">
              <CardContent className="p-6">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4"><Building className="size-6" /></div>
                 <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Health Centers</p>
                 <h3 className="text-3xl font-black text-gray-900">3</h3>
              </CardContent>
           </Card>
           <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[24px]">
              <CardContent className="p-6">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4"><Users className="size-6" /></div>
                 <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Woreda Staff</p>
                 <h3 className="text-3xl font-black text-gray-900">45</h3>
              </CardContent>
           </Card>
           <Card className="border-none shadow-xl border-t-4 border-t-orange-500 rounded-[24px] bg-white">
              <CardContent className="p-6">
                 <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl w-fit mb-4"><BarChart3 className="size-6" /></div>
                 <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Report Status</p>
                 <h3 className="text-3xl font-black text-gray-900">Pending</h3>
              </CardContent>
           </Card>
        </div>

        <Card className="border-none shadow-2xl shadow-gray-200/40 rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm">
           <CardHeader className="p-8 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-extrabold">Facility Registry</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                    <TableRow className="border-none hover:bg-transparent">
                       <TableHead className="px-8 py-4">Facility Name</TableHead>
                       <TableHead>Type</TableHead>
                       <TableHead>Location</TableHead>
                       <TableHead>Operational Status</TableHead>
                       <TableHead className="px-8 text-right"></TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    <TableRow className="border-gray-50 group hover:bg-white transition-all cursor-pointer">
                       <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="size-10 rounded-2xl bg-gray-100 flex items-center justify-center font-extrabold text-gray-500 uppercase">HC</div>
                             <span className="font-extrabold text-gray-900">Woreda Primary HC</span>
                          </div>
                       </TableCell>
                       <TableCell><span className="text-sm font-bold text-gray-700">Health Center</span></TableCell>
                       <TableCell><div className="flex items-center gap-2"><MapPin className="size-3 text-gray-400" /><span className="text-xs font-bold text-gray-500">Center Market</span></div></TableCell>
                       <TableCell><Badge className="bg-emerald-50 text-emerald-600 font-bold rounded-xl border-none">Active</Badge></TableCell>
                       <TableCell className="px-8 text-right"><Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="size-4" /></Button></TableCell>
                    </TableRow>
                 </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
