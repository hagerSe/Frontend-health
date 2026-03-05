import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegionalDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [zoneAdmins, setZoneAdmins] = useState([]);
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
  const [regionalInfo, setRegionalInfo] = useState(null);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    zone_name: "",
    first_name: "",
    last_name: "",
    age: "",
    sex: "",
    email: "",
    password: "",
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSex, setFilterSex] = useState("");
  
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

  // Fetch data on component mount and tab change
 useEffect(() => {
  // Check if user is regional admin
  if (!token || user.role !== 'regional') {
    console.log("Access denied. Redirecting to login.");
    navigate("/login");
    return;
  }
  
  setRegionalInfo(user);
  
  if (activeTab === "dashboard") {
    fetchDashboardStats();
  } else if (activeTab === "list") {
    fetchZoneAdmins();
  }
}, [activeTab, token, user.role, navigate]); // Changed user.userType to user.role

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError("");
    
    try {
      // You'll need to create this endpoint on the backend
      const response = await api.get("/zones/stats");
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch all zone admins for this regional admin
  const fetchZoneAdmins = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError("");
    
    try {
      // This endpoint should return zones where regional_id = current user id
      const response = await api.get("/zones");
      setZoneAdmins(response.data.zones);
    } catch (err) {
      console.error("Error fetching zones:", err);
      setError("Failed to fetch zone admins");
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
      zone_name: "",
      first_name: "",
      last_name: "",
      age: "",
      sex: "",
      email: "",
      password: "",
    });
    setIsEditing(false);
    setSelectedAdmin(null);
  };

  // Handle create zone admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      // This will send regional_id from the token on the backend
      await api.post("/zones", formData);
      setSuccess("Zone Admin created successfully!");
      resetForm();
      
      // Refresh data
      if (activeTab === "list") {
        fetchZoneAdmins();
      } else {
        fetchDashboardStats();
      }
      
      // Switch to list tab after 2 seconds
      setTimeout(() => {
        setActiveTab("list");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating zone admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle edit zone admin
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      zone_name: admin.zone_name,
      first_name: admin.first_name,
      last_name: admin.last_name,
      age: admin.age,
      sex: admin.sex,
      email: admin.email,
      password: "", // Password field empty for security
    });
    setIsEditing(true);
    setActiveTab("create");
  };

  // Handle update zone admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      await api.put(`/zones/${selectedAdmin.id}`, formData);
      setSuccess("Zone Admin updated successfully!");
      resetForm();
      fetchZoneAdmins();
      setActiveTab("list");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating zone admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle delete zone admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this zone admin?")) {
      return;
    }

    try {
      await api.delete(`/zones/${id}`);
      setSuccess("Zone Admin deleted successfully!");
      
      // Refresh the list
      fetchZoneAdmins();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error deleting zone admin");
      console.error("Error deleting:", err);
    }
  };

  // Filter zone admins based on search and filter
  const filteredAdmins = zoneAdmins.filter(admin => {
    const matchesSearch = 
      admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSex ? admin.sex === filterSex : true;
    
    return matchesSearch && matchesFilter;
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Render dashboard tab
  const renderDashboard = () => {
    if (loading.dashboard) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Regional Dashboard Overview</h2>
        <p className="text-gray-600">Welcome, {regionalInfo?.first_name} {regionalInfo?.last_name} - {regionalInfo?.regional_name}</p>
        
        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Zones Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 rounded-full p-4">
                  <span className="text-3xl">🗺️</span>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Zone Admins</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalZones || 0}</p>
                </div>
              </div>

              {/* Gender Distribution Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-green-100 rounded-full p-4">
                  <span className="text-3xl">⚥</span>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Gender Distribution</h3>
                  <div className="space-y-1 mt-2">
                    {stats.genderDistribution?.map((g) => (
                      <div key={g.sex} className="flex justify-between text-sm">
                        <span>{g.sex}:</span>
                        <span className="font-semibold text-gray-700">{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 rounded-full p-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-500 text-sm font-medium mb-3">Quick Actions</h3>
                  <button 
                    onClick={() => setActiveTab("create")}
                    className="w-full mb-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add New Zone
                  </button>
                  <button 
                    onClick={() => setActiveTab("list")}
                    className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View All Zones
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Zones Section */}
            {stats?.recentZones && stats.recentZones.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Zones</h3>
                <div className="space-y-4">
                  {stats.recentZones.map(zone => (
                    <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{zone.zone_name}</p>
                        <p className="text-sm text-gray-600">{zone.first_name} {zone.last_name}</p>
                        <p className="text-xs text-gray-500">Added: {new Date(zone.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => handleEditClick(zone)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {!stats && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No data available yet. Start by creating zone admins.</p>
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
          <span className="ml-3 text-gray-600">Loading zone admins...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Zone Admins Management</h2>
          <button 
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> Add New Zone Admin
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, zone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select 
            value={filterSex} 
            onChange={(e) => setFilterSex(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No zone admins found</p>
            {searchTerm || filterSex ? (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setFilterSex("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Zone Admin
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.zone_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${admin.first_name} ${admin.last_name}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          admin.sex === 'Male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {admin.sex}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(admin)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render create/edit form
  const renderCreateForm = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditing ? "Edit Zone Admin" : "Create New Zone Admin"}
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        <form onSubmit={isEditing ? handleUpdateAdmin : handleCreateAdmin} className="bg-white rounded-xl shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="zone_name" className="block text-sm font-medium text-gray-700 mb-2">
                Zone Name *
              </label>
              <input
                type="text"
                id="zone_name"
                name="zone_name"
                value={formData.zone_name}
                onChange={handleInputChange}
                required
                placeholder="Enter zone name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                placeholder="Enter first name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                placeholder="Enter last name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="18"
                placeholder="Enter age"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                Sex *
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                disabled={isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {!isEditing && (
              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={() => {
                resetForm();
                setActiveTab("list");
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading.create}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                loading.create ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading.create 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Admin" : "Create Admin")}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Regional Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{regionalInfo?.regional_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Regional Admin
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("list");
                fetchZoneAdmins();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "list"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Zone Admins
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "create"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {isEditing ? "Edit Zone" : "Create Zone"}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "list" && renderList()}
          {activeTab === "create" && renderCreateForm()}
        </div>
      </div>
    </div>
  );
};

export default RegionalDashboard;