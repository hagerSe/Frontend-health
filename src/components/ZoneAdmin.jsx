import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, register } from "../api";
import { FaUserPlus, FaLayerGroup, FaMapPin, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

export default function ZoneAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [woredaAdmins, setWoredaAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    hospital_name: "Woreda Office",
    service_name: "Public",
    sex: "Male",
    age: "",
    woreda: "",
    kebele: "N/A"
  });

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
      await register({
        ...formData,
        region: admin.region,
        zone: admin.zone
      }, token);
      setSuccess("Woreda Admin added successfully!");
      setFormData({
        ...formData,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        age: "",
        woreda: ""
      });
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Failed to add woreda admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await api("/admin"); 
      setWoredaAdmins(data || []);
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

  if (!admin) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{admin.zone} Zone Dashboard</h1>
          <p className="text-slate-500 mt-1">Managing woreda administrators for {admin.zone} Zone, {admin.region}</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "list" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaLayerGroup /> Woreda Admins
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "add" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaUserPlus /> Add Woreda Admin
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
          <div className="bg-cyan-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaMapPin /> Register New Woreda Administrator
            </h2>
            <p className="text-cyan-100 text-sm">Assign oversight for a specific woreda within {admin.zone}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-3">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Middle Name</label>
                <input name="middle_name" value={formData.middle_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Phone</label>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Woreda Name</label>
                <input name="woreda" value={formData.woreda} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition" placeholder="e.g. Gullele" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-700 transform transition active:scale-95 flex items-center gap-2"
              >
                {loading ? 'Processing...' : <>Add Woreda Admin <FaChevronRight /></>}
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
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Woreda</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {woredaAdmins.filter(wa => wa.role === "Woreda_Admin" && wa.zone === admin.zone).length > 0 ? (
                  woredaAdmins.filter(wa => wa.role === "Woreda_Admin" && wa.zone === admin.zone).map((wa) => (
                    <tr key={wa.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{wa.first_name} {wa.last_name}</td>
                      <td className="px-6 py-4 text-slate-600">{wa.email}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold">{wa.woreda}</span></td>
                      <td className="px-6 py-4 text-green-600 font-bold text-sm">Active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No woreda administrators found in this zone.</td>
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
