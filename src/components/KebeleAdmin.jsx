import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, register } from "../api";
import { FaUserPlus, FaLayerGroup, FaHospital, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

export default function KebeleAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
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
    hospital_name: "",
    service_name: "Public",
    sex: "Male",
    age: "",
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
        zone: admin.zone,
        woreda: admin.woreda,
        kebele: admin.kebele
      }, token);
      setSuccess("Hospital Admin added successfully!");
      setFormData({
        ...formData,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        age: "",
        hospital_name: ""
      });
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Failed to add hospital admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await api("/admin"); 
      setHospitalAdmins(data || []);
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
          <h1 className="text-3xl font-bold text-slate-900">{admin.kebele} Kebele Dashboard</h1>
          <p className="text-slate-500 mt-1">Managing hospital administrators for {admin.kebele} Kebele</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "list" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaLayerGroup /> Hospital Admins
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "add" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <FaUserPlus /> Add Hospital Admin
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
          <div className="bg-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaHospital /> Register New Hospital Administrator
            </h2>
            <p className="text-emerald-100 text-sm">Assign oversight for a specific hospital within {admin.kebele}</p>
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
                <input name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Middle Name</label>
                <input name="middle_name" value={formData.middle_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Phone</label>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Gender</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Hospital Name</label>
                <input name="hospital_name" value={formData.hospital_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="e.g. St. Peter Hospital" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Service Type</label>
                <select name="service_name" value={formData.service_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transform transition active:scale-95 flex items-center gap-2"
              >
                {loading ? 'Processing...' : <>Add Hospital Admin <FaChevronRight /></>}
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
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Hospital</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitalAdmins.filter(ha => ha.role === "Hospital_Admin" && ha.kebele === admin.kebele).length > 0 ? (
                  hospitalAdmins.filter(ha => ha.role === "Hospital_Admin" && ha.kebele === admin.kebele).map((ha) => (
                    <tr key={ha.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{ha.first_name} {ha.last_name}</td>
                      <td className="px-6 py-4 text-slate-600">{ha.email}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">{ha.hospital_name}</span></td>
                      <td className="px-6 py-4 text-green-600 font-bold text-sm">Active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No hospital administrators found in this kebele.</td>
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
