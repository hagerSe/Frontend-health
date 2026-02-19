import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, register } from "../api";
import { FaUserPlus, FaUsers, FaGlobe, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

export default function FederalAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [regionalAdmins, setRegionalAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api("/auth/me");
        setAdmin(data.admin);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      }
    };
    fetchProfile();
  }, []);

  const ETHIOPIA_REGIONS = [
    "Tigray", "Afar", "Amhara", "Oromia", "Somali",
    "Benishangul-Gumuz", "SNNPR", "Gambela", "Harari",
    "Addis Ababa", "Dire Dawa", "Sidama", "South West Ethiopia"
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    hospital_name: "Regional Office",
    service_name: "Public",
    sex: "Male",
    age: "",
    region: "",
    woreda: "N/A",
    zone: "N/A",
    kebele: "N/A"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await register(formData, token);
      setSuccess("Regional Admin added successfully!");
      setFormData({
        ...formData,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        age: "",
        region: ""
      });
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Failed to add regional admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await api("/admin"); // Assuming there's a route to list admins
      // Filter regional admins if possible, or just show all
      setRegionalAdmins(data || []);
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchAdmins();
    }
  }, [activeTab]);

  if (!admin) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading Federal Profile...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Federal Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome, {admin ? `${admin.first_name} ${admin.last_name}` : "Administrator"} • Global health management and regional oversight
          </p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "list" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaUsers /> Regional Admins
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "add" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaUserPlus /> Add Regional Admin
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors font-semibold"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {activeTab === "add" ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaGlobe /> Register New Regional Administrator
            </h2>
            <p className="text-blue-100 text-sm">Assign oversight for a specific region within Ethiopia</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3 animate-shake">
                <span className="text-lg font-bold">!</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-3">
                <span className="text-lg font-bold">✓</span> {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter first name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Middle Name</label>
                <input name="middle_name" value={formData.middle_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter middle name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter last name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="email@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="+251 ..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter age" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Assigned Region</label>
                <select name="region" value={formData.region} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
                  <option value="">Select Region</option>
                  {ETHIOPIA_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transform transition active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : <>Add Regional Admin <FaChevronRight /></>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Region</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Phone</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalAdmins.filter(a => a.role === "Regional_Admin").length > 0 ? (
                  regionalAdmins.filter(a => a.role === "Regional_Admin").map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{admin.first_name} {admin.last_name}</td>
                      <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{admin.region}</span></td>
                      <td className="px-6 py-4 text-slate-600">{admin.phone_number}</td>
                      <td className="px-6 py-4 text-green-600 font-bold text-sm">Active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">No regional administrators found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
