import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FederalAdmin from "./components/FederalAdmin";
import RegionalAdmin from "./components/RegionalAdmin";
import ZoneAdmin from "./components/ZoneAdmin";
import WoredaAdmin from "./components/WoredaAdmin";
import KebeleAdmin from "./components/KebeleAdmin";
import HospitalAdmin from "./components/HospitalAdmin";
import DoctorDashboard from "./pages/DoctorDashboard";
import CardofficeDashboard from "./pages/CardofficeDashboard";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./pages/Home";

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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            path="/KebeleAdmin" 
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

          {/* User/Staff Routes */}
          <Route 
            path="/DoctorDashboard" 
            element={
              <ProtectedRoute isUser={true}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/CardofficeDashboard" 
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
    </Router>
  );
}

export default App;
