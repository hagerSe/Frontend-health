import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import About from "./pages/About";
import FederalAdmin from "./components/FederalAdmin";
import RegionalAdmin from "./components/RegionalAdmin";
import ZoneAdmin from "./components/ZoneAdmin";
import WoredaAdmin from "./components/WoredaAdmin";
import KebeleAdmin from "./components/KebeleAdmin";
import HospitalAdmin from "./components/HospitalAdmin";
import AddAdminForm from "./components/AddAdminForm";
import Contact from "./pages/Contact";
import bgImage from "./assets/02.jpg";
import DoctorDashboard from "./pages/DoctorDashboard";
import CardofficeDashboard from "./pages/CardofficeDashboard";

// Map backend roles to dashboard components
const ROLE_COMPONENT = {
  Federal_Admin: FederalAdmin,
  Regional_Admin: RegionalAdmin,
  Zone_Admin: ZoneAdmin,
  Woreda_Admin: WoredaAdmin,
  Kebele_Admin: KebeleAdmin,
  Hospital_Admin: HospitalAdmin,
};

export default function App() {
  return (
   <div
  className="min-h-screen bg-cover bg-center"
  style={{
    backgroundImage: `
      linear-gradient(
        rgba(255,255,255,0.45),
        rgba(59,130,246,0.25)
      ),
      url(${bgImage})
    `,
    filter: "brightness(1.1)",
  }}
>

      <Router>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Dashboards */}
          <Route path="HospitalAdmin" element={<HospitalAdmin />} />
          <Route path="kebeleAdmin" element={<KebeleAdmin />} />
          <Route path="WoredaAdmin" element={<WoredaAdmin />} />
          <Route path="ZoneAdmin" element={<ZoneAdmin />} />
          <Route path="RegionalAdmin" element={<RegionalAdmin />} />
          <Route path="FederalAdmin" element={<FederalAdmin />} />
          <Route path="/AddAdminForm" element={<AddAdminForm />} />
        <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
        <Route path="/card-office" element={<CardofficeDashboard />} />

        </Routes>
      </Router>
      
    </div>
  );
}
// Dashboard Wrapper component
function DashboardWrapper({ admin, onLogout }) {
  const AdminPanel = ROLE_COMPONENT[admin.role]; // pick dashboard by role
  const canAddAdmin = [
    "Federal_Admin",
    "Regional_Admin",
    "Zone_Admin",
    "Woreda_Admin",
    "Kebele_Admin",
  ].includes(admin.role);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">
          National Health Management System
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">
            {admin.first_name} {admin.last_name}{" "}
            <span className="font-medium text-slate-800">({admin.role})</span>
          </span>

          {canAddAdmin && (
            <button
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
              onClick={() => alert("Add Admin Form")}
            >
              Add Admin
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="py-6">
        {AdminPanel ? (
          <AdminPanel />
        ) : (
          <div className="max-w-4xl mx-auto p-6 text-slate-600">
            No dashboard for role: {admin.role}
          </div>
        )}
         
      </main>
    </div>
  );
}
