import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { 
  FaUserPlus, FaAddressCard, FaSearch, FaClipboardCheck, 
  FaSignOutAlt, FaNotesMedical, FaRegAddressBook, FaHospitalUser
} from "react-icons/fa";

export default function CardOfficeDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api("/auth/me");
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600 tracking-tight">Loading Card Office...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <FaAddressCard className="text-xl" />
          </div>
          <span className="font-bold text-xl tracking-tight">RegiCare</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<FaUserPlus />} 
            label="New Registration" 
            active={activeTab === "register"} 
            onClick={() => setActiveTab("register")} 
          />
          <SidebarItem 
            icon={<FaRegAddressBook />} 
            label="Patient Records" 
            active={activeTab === "records"} 
            onClick={() => setActiveTab("records")} 
          />
          <SidebarItem 
            icon={<FaSearch />} 
            label="Search Patient" 
            active={activeTab === "search"} 
            onClick={() => setActiveTab("search")} 
          />
          <SidebarItem 
            icon={<FaClipboardCheck />} 
            label="Daily Reports" 
            active={activeTab === "reports"} 
            onClick={() => setActiveTab("reports")} 
          />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Office</p>
            <p className="text-sm font-bold truncate">{user.region} Office</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors font-semibold"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Card Office Operations</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide">Registration Specialist</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "register" && (
            <div className="max-w-4xl animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <FaHospitalUser /> Patient Intake Form
                  </h3>
                  <p className="text-emerald-50 text-sm mt-1 opacity-80">Please ensure all identity documents are verified before submission.</p>
                </div>
                
                <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="First Name" placeholder="e.g. Abebe" />
                  <InputField label="Middle Name" placeholder="e.g. Bekele" />
                  <InputField label="Last Name" placeholder="e.g. Chala" />
                  <InputField label="Date of Birth" type="date" />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Gender</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white">
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <InputField label="Identification Number (ID)" placeholder="e.g. ID-88291" />
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Reason for Visit</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-[100px]"
                      placeholder="Enter a brief clinical reason for visitation..."
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                    <button type="button" className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition">Clear Form</button>
                    <button disabled className="px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50">
                      Print Hospital Card
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-slate-200 text-center animate-fade-in">
              <FaNotesMedical className="text-6xl text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Patient Database</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Access and manage full medical history and administrative records for all registered patients.</p>
              <button onClick={() => setActiveTab("register")} className="mt-6 text-emerald-600 font-bold hover:underline">Return to registration</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-200 ${active ? "bg-white/10 text-emerald-400 shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      <div className="text-xl">{icon}</div>
      <span className="font-bold">{label}</span>
    </button>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input 
        {...props} 
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" 
      />
    </div>
  );
}
