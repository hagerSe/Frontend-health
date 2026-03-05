import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./components/Login";
import FederalDashboard from "./components/FederalDashboard";
import RegionalDashboard from "./components/RegionalDashboard";
import ZoneDashboard from "./components/ZoneDashboard";
import WoredaDashboard from "./components/WoredaDashboard";
import KebeleDashboard from "./components/KebeleDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import TriageDashboard from "./components/TriageDashboard";
import bgImage from "./assets/02.jpg";
import NurseDashboard from "./components/NurseDashboard";
import CardofficeDashboard from "./components/CardofficeDashboard";
import LabratoryDashboard from "./components/LabratoryDashboard";
import PharmacyDashboard from "./components/PharmacyDashboard";
import MidwifeDashboard from "./components/MidwifeDashboard";
import RadiologyDashboard from "./components/RadiologyDashboard.jsx";
import BedManagementDashboard from "./components/BedManagementDashboard"; // 👈 ADD THIS
import HrDashboard from "./components/HrDashboard"; // 👈 ADD THIS

function App() {
  const [admin, setAdmin] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAdmin(null);
  };

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login setAdmin={setAdmin} />} />

        {/* Admin Routes */}
        <Route path="/federal-dashboard" element={<FederalDashboard />} />
        <Route path="/regional-dashboard" element={<RegionalDashboard />} />
        <Route path="/zone-dashboard" element={<ZoneDashboard />} />
        <Route path="/woreda-dashboard" element={<WoredaDashboard />} />
        <Route path="/kebele-dashboard" element={<KebeleDashboard />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        
        {/* Clinical Staff Routes */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/midwife-dashboard" element={<MidwifeDashboard />} />
        <Route path="/triage-dashboard" element={<TriageDashboard />} />
        
        {/* Support Staff Routes */}
        <Route path="/card-office-dashboard" element={<CardofficeDashboard />} />
        <Route path="/laboratory-dashboard" element={<LabratoryDashboard />} />
        <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
        <Route path="/radiology-dashboard" element={<RadiologyDashboard />} />
        {/* 👇 NEW ROUTES ADDED */}
        <Route path="/bed-management-dashboard" element={<BedManagementDashboard />} />
        <Route path="/hr-dashboard" element={<HrDashboard />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;