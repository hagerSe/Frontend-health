import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Hospital,
  Map,
  Settings,
  LogOut,
  ChevronRight,
  UserCircle,
  Bell,
  Search,
  MapPin,
  Activity,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { authService } from "@/services/authService"
import { useNavigate, useLocation } from "react-router-dom"

const roleConfigs = {
  Federal_Admin: {
    title: "Federal Portal",
    navMain: [
      {
        title: "Dashboard",
        url: "/FederalAdmin",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Regional Management",
        url: "#",
        icon: Map,
        items: [
          { title: "All Regions", url: "#" },
          { title: "Regional Admins", url: "#" },
        ],
      },
      {
        title: "Hospital Network",
        url: "#",
        icon: Hospital,
        items: [
          { title: "National Directory", url: "#" },
          { title: "Resource Status", url: "#" },
        ],
      },
      {
        title: "User Management",
        url: "#",
        icon: Users,
        items: [
          { title: "System Admins", url: "#" },
          { title: "Permissions", url: "#" },
        ],
      },
    ],
  },
  Regional_Admin: {
    title: "Regional Portal",
    navMain: [
      { title: "Dashboard", url: "/RegionalAdmin", icon: LayoutDashboard },
      { title: "Zones", url: "#", icon: Map },
      { title: "Hospitals", url: "#", icon: Hospital },
      { title: "Staff", url: "#", icon: Users },
    ],
  },
  Zone_Admin: {
    title: "Zone Portal",
    navMain: [
      { title: "Dashboard", url: "/ZoneAdmin", icon: LayoutDashboard },
      { title: "Woredas", url: "#", icon: Map },
      { title: "Regional Link", url: "#", icon: MapPin },
    ],
  },
  Woreda_Admin: {
    title: "Woreda Portal",
    navMain: [
      { title: "Dashboard", url: "/WoredaAdmin", icon: LayoutDashboard },
      { title: "Kebeles", url: "#", icon: Map },
      { title: "Health Centers", url: "#", icon: Hospital },
    ],
  },
  Kebele_Admin: {
    title: "Kebele Portal",
    navMain: [
      { title: "Dashboard", url: "/KebeleAdmin", icon: LayoutDashboard },
      { title: "Facilities", url: "#", icon: Hospital },
      { title: "Community", url: "#", icon: Users },
    ],
  },
  Hospital_Admin: {
    title: "Hospital Portal",
    navMain: [
      { title: "Dashboard", url: "/HospitalAdmin", icon: LayoutDashboard },
      { title: "Departments", url: "#", icon: LayoutDashboard },
      { title: "Staff Directory", url: "#", icon: Users },
      { title: "Patient Records", url: "#", icon: Activity },
    ],
  },
}

export function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getCurrentUser()
  const role = authService.getUserRole()
  const config = roleConfigs[role] || { title: "Admin Portal", navMain: [] }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Hospital className="size-6" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-gray-900 truncate">NationalHealth</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{config.title}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {config.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <React.Fragment>
                      <SidebarMenuButton tooltip={item.title} className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url} className="hover:text-blue-600">
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </React.Fragment>
                  ) : (
                    <SidebarMenuButton 
                        asChild 
                        tooltip={item.title} 
                        isActive={location.pathname === item.url}
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600"
                    >
                      <a href={item.url}>
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarGroup className="mt-auto">
             <SidebarGroupLabel>Support</SidebarGroupLabel>
             <SidebarMenu>
                <SidebarMenuItem>
                   <SidebarMenuButton tooltip="Settings" className="hover:bg-blue-50 transition-colors">
                      <Settings className="size-4" />
                      <span>Settings</span>
                   </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-3 border-t border-gray-100 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
             <div className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:hidden">
                <Avatar className="size-8 border-2 border-white shadow-sm">
                   <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                   <AvatarFallback>{user?.first_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                   <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{user?.first_name} {user?.last_name}</span>
                   <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</span>
                </div>
             </div>
             <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="size-4" />
             </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-xl px-4 md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 hover:bg-blue-50 transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="hover:text-blue-600 transition-colors">System</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold text-gray-900">{config.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input 
                  placeholder="Universal search..." 
                  className="pl-10 h-10 w-64 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                />
             </div>
             <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 transition-colors">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="group">
                      <Avatar className="size-8 border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback>{user?.first_name?.[0]}</AvatarFallback>
                      </Avatar>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-gray-100">
                   <DropdownMenuLabel className="font-extrabold text-blue-600 px-3 py-2 text-xs uppercase tracking-widest">Account</DropdownMenuLabel>
                   <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2">
                      <UserCircle className="size-4" />
                      <span>Profile</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-gray-50 mx-1 my-1" />
                   <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2 cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
