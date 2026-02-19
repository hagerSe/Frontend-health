import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { 
  FaUserMd, FaUsers, FaChartLine, FaSignOutAlt, FaBars, 
  FaUserPlus, FaHospital, FaClinicMedical, FaBriefcaseMedical 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProfileImage from "../assets/brsh.jpg";

export default function HospitalAdmin() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Female",
    email: "",
    password: "",
    ward: "OPD",
    department: "Doctor",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api("/auth/me");
        setAdmin(data.admin);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        } else {
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "list") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const data = await api("/user"); 
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Users are within the same hospital, so they inherit location from admin
      await api("/user", {
        method: "POST",
        body: {
          ...formData,
          kebele: admin.kebele,
          woreda: admin.woreda,
          zone: admin.zone,
          region: admin.region
        }
      });
      setSuccess("Staff member added successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "Female",
        email: "",
        password: "",
        ward: "OPD",
        department: "Doctor",
      });
    } catch (err) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-600 tracking-tight">Loading Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">H</div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">HealthCore</span>}
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2">
          <SidebarItem 
            icon={<FaChartLine />} 
            label="Dashboard" 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            collapsed={!isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaUserPlus />} 
            label="Add Staff" 
            active={activeTab === "add"} 
            onClick={() => setActiveTab("add")} 
            collapsed={!isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaUsers />} 
            label="Staff Directory" 
            active={activeTab === "list"} 
            onClick={() => setActiveTab("list")} 
            collapsed={!isSidebarOpen} 
          />
        </nav>

        <div className="p-4 mt-auto">
          <div className={`bg-slate-800 rounded-2xl p-4 mb-4 transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 invisible"}`}>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hospital</p>
            <p className="text-sm font-semibold truncate">{admin.hospital_name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
          >
            <FaSignOutAlt />
            {isSidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <FaBars className="text-slate-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{admin.first_name} {admin.last_name}</p>
              <p className="text-xs text-slate-500">Hospital Administrator</p>
            </div>
            <img src={ProfileImage} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Hospital Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard icon={<FaUserMd />} title="Total Doctors" value="24" color="bg-blue-500" />
                <StatsCard icon={<FaClinicMedical />} title="Active Patients" value="142" color="bg-emerald-500" />
                <StatsCard icon={<FaBriefcaseMedical />} title="Departments" value="8" color="bg-amber-500" />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-lg">Hospital Location</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LocationBadge label="Region" value={admin.region} />
                  <LocationBadge label="Zone" value={admin.zone} />
                  <LocationBadge label="Woreda" value={admin.woreda} />
                  <LocationBadge label="Kebele" value={admin.kebele} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="max-w-4xl">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaUserPlus className="text-blue-500" /> Register New Medical Staff
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Staff will be automatically assigned to {admin.hospital_name}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">{error}</div>}
                  {success && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">{success}</div>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                    <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                    <InputField label="Age" type="number" name="age" value={formData.age} onChange={handleChange} />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Ward Assignment</label>
                      <select name="ward" value={formData.ward} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                        <option>OPD</option>
                        <option>Emergency</option>
                        <option>ANC</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Department / Role</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                        <option>Doctor</option>
                        <option>Nurse</option>
                        <option>Radiology</option>
                        <option>Pharmacy</option>
                        <option>Midwife</option>
                        <option>Laboratory</option>
                        <option>Human Resource</option>
                        <option>Triage</option>
                        <option>Card Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={loading} className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:opacity-50">
                      {loading ? "Registering..." : "Add Staff Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 tracking-tight">Staff Directory</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Total: {users.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-sm uppercase">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Ward</th>
                      <th className="px-6 py-4">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length > 0 ? (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{u.firstName} {u.lastName}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">{u.department}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm italic">{u.ward}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{u.email}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No staff members found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-200 ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      <div className="text-xl">{icon}</div>
      {!collapsed && <span className="font-semibold">{label}</span>}
    </button>
  );
}

function StatsCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function LocationBadge({ label, value }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">{value || "None"}</p>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input 
        {...props} 
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" 
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
