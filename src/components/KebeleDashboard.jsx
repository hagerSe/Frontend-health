// components/KebeleDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const KebeleDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    dashboard: false,
    list: false,
    create: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [kebeleInfo, setKebeleInfo] = useState(null);
  const [woredaInfo, setWoredaInfo] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [regionalInfo, setRegionalInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    hospital_name: "",
    first_name: "",
    last_name: "",
    age: "",
    sex: "",
    email: "",
    password: "",
    service_name: "Public", // Public or Private
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterService, setFilterService] = useState("");
  
  const navigate = useNavigate();
  
  // Get token and user info
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // API instance with token
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch data on component mount
  useEffect(() => {
    console.log("KebeleDashboard mounted");
    console.log("User from localStorage:", user);
    
    if (!token) {
      console.log("No token, redirecting to login");
      navigate("/login");
      return;
    }

    if (user.role !== 'kebele') {
      console.log('Not a kebele admin, role:', user.role);
      navigate('/login');
      return;
    }
    
    setKebeleInfo(user);
    
    // Set hierarchy info from user object
    if (user.woreda) setWoredaInfo(user.woreda);
    if (user.zone) setZoneInfo(user.zone);
    if (user.regional) setRegionalInfo(user.regional);
    setLoadingInfo(false);
    
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "list") {
      fetchHospitalAdmins();
    }
  }, [activeTab]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError("");
    
    try {
      const response = await api.get("/hospitals/stats");
      console.log("Stats response:", response.data);
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch all hospital admins for this kebele
  const fetchHospitalAdmins = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError("");
    
    try {
      const response = await api.get("/hospitals");
      console.log("Hospitals response:", response.data);
      setHospitalAdmins(response.data.hospitals || []);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      setError("Failed to fetch hospital admins");
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      hospital_name: "",
      first_name: "",
      last_name: "",
      age: "",
      sex: "",
      email: "",
      password: "",
      service_name: "Public",
    });
    setIsEditing(false);
    setSelectedAdmin(null);
  };

  // Handle create hospital admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/hospitals", formData);
      console.log("Create response:", response.data);
      setSuccess("Hospital Admin created successfully!");
      resetForm();
      
      if (activeTab === "list") {
        fetchHospitalAdmins();
      } else {
        fetchDashboardStats();
      }
      
      setTimeout(() => {
        setActiveTab("list");
      }, 2000);
    } catch (err) {
      console.error("Create error:", err);
      setError(err.response?.data?.message || "Error creating hospital admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle edit hospital admin
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      hospital_name: admin.hospital_name,
      first_name: admin.first_name,
      last_name: admin.last_name,
      age: admin.age || "",
      sex: admin.sex || "",
      email: admin.email,
      password: "",
      service_name: admin.service_name || "Public",
    });
    setIsEditing(true);
    setActiveTab("create");
  };

  // Handle update hospital admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      await api.put(`/hospitals/${selectedAdmin.id}`, formData);
      setSuccess("Hospital Admin updated successfully!");
      resetForm();
      fetchHospitalAdmins();
      setActiveTab("list");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Error updating hospital admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle delete hospital admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital admin?")) {
      return;
    }

    try {
      await api.delete(`/hospitals/${id}`);
      setSuccess("Hospital Admin deleted successfully!");
      fetchHospitalAdmins();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting hospital admin");
    }
  };

  // Filter hospital admins
  const filteredAdmins = (hospitalAdmins || []).filter(admin => {
    const matchesSearch = 
      (admin.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.hospital_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSex = filterSex ? admin.sex === filterSex : true;
    const matchesService = filterService ? admin.service_name === filterService : true;
    
    return matchesSearch && matchesSex && matchesService;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Render dashboard tab
  const renderDashboard = () => {
    if (loading.dashboard || loadingInfo) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Kebele Dashboard Overview</h2>
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {kebeleInfo?.first_name} {kebeleInfo?.last_name}!
          </h2>
          <p className="text-purple-100">
            You are managing <span className="font-bold text-yellow-300">{kebeleInfo?.kebele_name}</span> kebele 
            in <span className="font-bold text-yellow-300">{woredaInfo?.woreda_name}</span> woreda,
            <span className="font-bold text-yellow-300"> {zoneInfo?.zone_name}</span> zone,
            <span className="font-bold text-yellow-300"> {regionalInfo?.regional_name}</span> region.
          </p>
        </div>

        {/* Hierarchy Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-md border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Administrative Hierarchy</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Region</p>
              <p className="font-semibold">{regionalInfo?.regional_name}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Zone</p>
              <p className="font-semibold">{zoneInfo?.zone_name}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Woreda</p>
              <p className="font-semibold">{woredaInfo?.woreda_name}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Kebele</p>
              <p className="font-semibold">{kebeleInfo?.kebele_name}</p>
            </div>
          </div>
        </div>
        
        {stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Hospitals Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-4">
                  <span className="text-3xl">🏥</span>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Hospitals</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalHospitals || 0}</p>
                </div>
              </div>

              {/* Service Distribution Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Service Distribution</h3>
                {stats.serviceDistribution?.map(s => (
                  <div key={s.service} className="flex justify-between text-sm">
                    <span>{s.service}:</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-3">Quick Actions</h3>
                <button 
                  onClick={() => setActiveTab("create")}
                  className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  + Add New Hospital
                </button>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  View All Hospitals
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No data available yet. Start by creating hospital admins.</p>
          </div>
        )}
      </div>
    );
  };

  // Render list tab
  const renderList = () => {
    if (loading.list) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading hospitals...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Hospital Admins</h2>
          <button 
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            + Add New Hospital
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <select 
            value={filterSex} 
            onChange={(e) => setFilterSex(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select 
            value={filterService} 
            onChange={(e) => setFilterService(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Services</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded">
            <p>No hospital admins found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Hospital</th>
                  <th className="px-6 py-3 text-left">Admin</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Service</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{admin.hospital_name}</td>
                    <td className="px-6 py-4">{admin.first_name} {admin.last_name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        admin.service_name === 'Public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {admin.service_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEditClick(admin)} className="text-blue-600 mr-3">Edit</button>
                      <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render create form
  const renderCreateForm = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditing ? "Edit Hospital Admin" : "Create New Hospital Admin"}
        </h2>
        
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}
        
        <form onSubmit={isEditing ? handleUpdateAdmin : handleCreateAdmin} className="bg-white rounded-lg shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2">Hospital Name *</label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isEditing}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Service Type *</label>
              <select
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button type="submit" disabled={loading.create} className="px-6 py-2 bg-blue-600 text-white rounded">
              {loading.create ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Kebele Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                {kebeleInfo?.kebele_name} - {woredaInfo?.woreda_name} Woreda
              </p>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 ${activeTab === "dashboard" ? "border-b-2 border-purple-600 text-purple-600" : ""}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("list");
                fetchHospitalAdmins();
              }}
              className={`py-2 ${activeTab === "list" ? "border-b-2 border-purple-600 text-purple-600" : ""}`}
            >
              Hospitals
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`py-2 ${activeTab === "create" ? "border-b-2 border-purple-600 text-purple-600" : ""}`}
            >
              {isEditing ? "Edit Hospital" : "Create Hospital"}
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "list" && renderList()}
          {activeTab === "create" && renderCreateForm()}
        </div>
      </div>
    </div>
  );
};

export default KebeleDashboard;