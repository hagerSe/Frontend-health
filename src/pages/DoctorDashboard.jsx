import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { FaUserMd, FaPrescription, FaClipboardList, FaSignOutAlt, FaCalendarCheck, FaUserInjured } from "react-icons/fa";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600 tracking-tight">Initializing Portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FaUserMd className="text-xl" />
          </div>
          <span className="font-bold text-slate-800 text-lg">HMS Doctor Portal</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Dr. {user.firstName} {user.lastName}</p>
            <p className="text-xs text-blue-600 font-medium capitalize">{user.department}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Welcome Card */}
          <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">Welcome Back, {user.firstName}</h1>
              <p className="text-blue-100 opacity-90 mb-6">You have 12 patients scheduled for today. Your first appointment is in 15 minutes.</p>
              <button className="bg-white text-blue-700 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition active:scale-95">
                View Appointments
              </button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Location Info</p>
              <div className="space-y-3">
                <InfoItem label="Ward" value={user.ward} icon={<FaClipboardList className="text-blue-500" />} />
                <Divider />
                <InfoItem label="Region" value={user.region} icon={<FaUserInjured className="text-emerald-500" />} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">Assigned to National Health Referral Network • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Action Grid */}
        <h2 className="text-xl font-bold text-slate-800 mb-6">Clinical Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ToolCard icon={<FaUserInjured />} label="Patient Records" color="bg-rose-500" />
          <ToolCard icon={<FaPrescription />} label="E-Prescriptions" color="bg-amber-500" />
          <ToolCard icon={<FaCalendarCheck />} label="Schedule" color="bg-indigo-500" />
          <ToolCard icon={<FaClipboardList />} label="Clinical Notes" color="bg-teal-500" />
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-100 w-full" />;
}

function ToolCard({ icon, label, color }) {
  return (
    <button className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition group text-left">
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:scale-110 transition`}>
        {icon}
      </div>
      <p className="font-bold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500 mt-1">Manage and update clinical data</p>
    </button>
  );
}
