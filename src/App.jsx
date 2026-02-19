import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FederalAdmin from "./components/FederalAdmin";
import RegionalAdmin from "./components/RegionalAdmin";
import ZoneAdmin from "./components/ZoneAdmin";
import WoredaAdmin from "./components/WoredaAdmin";
import KebeleAdmin from "./components/KebeleAdmin";
import HospitalAdmin from "./components/HospitalAdmin";
import DoctorDashboard from "./pages/DoctorDashboard";
import CardofficeDashboard from "./pages/CardofficeDashboard";
import bgImage from "./assets/02.jpg";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [], isUser = false }) => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("admin"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" replace />;

  if (isUser) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  }

  if (allowedRoles.length > 0) {
    if (!admin || !allowedRoles.includes(admin.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen relative font-sans">
        {/* Background Layer */}
        <div 
          className="fixed inset-0 z-0 opacity-40 grayscale-[20%]"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Overlay for better readability */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/90 via-blue-50/70 to-blue-100/60" />

        {/* Content Layer */}
        <div className="relative z-10">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route 
              path="/FederalAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Federal_Admin"]}>
                  <FederalAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/RegionalAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Regional_Admin"]}>
                  <RegionalAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ZoneAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Zone_Admin"]}>
                  <ZoneAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/WoredaAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Woreda_Admin"]}>
                  <WoredaAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/kebeleAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Kebele_Admin"]}>
                  <KebeleAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/HospitalAdmin" 
              element={
                <ProtectedRoute allowedRoles={["Hospital_Admin"]}>
                  <HospitalAdmin />
                </ProtectedRoute>
              } 
            />

            {/* Staff Routes */}
            <Route 
              path="/DoctorDashboard" 
              element={
                <ProtectedRoute isUser={true}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/card-office" 
              element={
                <ProtectedRoute isUser={true}>
                  <CardofficeDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
