import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WoredaDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [kebeleAdmins, setKebeleAdmins] = useState([]);
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
  const [woredaInfo, setWoredaInfo] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [regionalInfo, setRegionalInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    kebele_name: "",
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
    console.log("WoredaDashboard mounted");
    console.log("User from localStorage:", user);
    
    // Check if user is woreda admin
    if (!token) {
      console.log("No token, redirecting to login");
      navigate("/login");
      return;
    }

    // ✅ FIXED: Check role property instead of userType
    if (user.role !== 'woreda') {
      console.log('Not a woreda admin, role:', user.role);
      navigate('/login');
      return;
    }
    
    setWoredaInfo(user);
    
    // Set zone and regional info from user object (included in login)
    if (user.zone) {
      setZoneInfo(user.zone);
    }
    if (user.regional) {
      setRegionalInfo(user.regional);
    }
    setLoadingInfo(false);
    
    // Fetch data based on active tab
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "list") {
      fetchKebeleAdmins();
    }
  }, [activeTab]); // ✅ Fixed: Remove unnecessary dependencies

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError("");
    
    try {
      const response = await api.get("/kebeles/stats");
      console.log("Stats response:", response.data);
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch all kebele admins for this woreda admin
  const fetchKebeleAdmins = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError("");
    
    try {
      const response = await api.get("/kebeles");
      console.log("Kebeles response:", response.data);
      setKebeleAdmins(response.data.kebeles || []);
    } catch (err) {
      console.error("Error fetching kebeles:", err);
      setError("Failed to fetch kebele admins");
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
      kebele_name: "",
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

  // Handle create kebele admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/kebeles", formData);
      console.log("Create response:", response.data);
      setSuccess("Kebele Admin created successfully!");
      resetForm();
      
      // Refresh data
      if (activeTab === "list") {
        fetchKebeleAdmins();
      } else {
        fetchDashboardStats();
      }
      
      // Switch to list tab after 2 seconds
      setTimeout(() => {
        setActiveTab("list");
      }, 2000);
    } catch (err) {
      console.error("Create error:", err);
      setError(err.response?.data?.message || "Error creating kebele admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle edit kebele admin
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      kebele_name: admin.kebele_name,
      first_name: admin.first_name,
      last_name: admin.last_name,
      age: admin.age || "",
      sex: admin.sex || "",
      email: admin.email,
      password: "", // Password field empty for security
    });
    setIsEditing(true);
    setActiveTab("create");
  };

  // Handle update kebele admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      await api.put(`/kebeles/${selectedAdmin.id}`, formData);
      setSuccess("Kebele Admin updated successfully!");
      resetForm();
      fetchKebeleAdmins();
      setActiveTab("list");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Error updating kebele admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle delete kebele admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this kebele admin?")) {
      return;
    }

    try {
      await api.delete(`/kebeles/${id}`);
      setSuccess("Kebele Admin deleted successfully!");
      fetchKebeleAdmins();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting kebele admin");
    }
  };

  // Filter kebele admins based on search and filter
  const filteredAdmins = (kebeleAdmins || []).filter(admin => {
    const matchesSearch = 
      (admin.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.kebele_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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
        <h2 className="text-2xl font-bold text-gray-800">Woreda Dashboard Overview</h2>
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {woredaInfo?.first_name} {woredaInfo?.last_name}!
          </h2>
          <p className="text-green-100">
            You are managing the <span className="font-bold text-yellow-300">{woredaInfo?.woreda_name}</span> woreda 
            in <span className="font-bold text-yellow-300">{zoneInfo?.zone_name || 'your zone'}</span> zone,
            under <span className="font-bold text-yellow-300">{regionalInfo?.regional_name || 'your region'}</span> region.
          </p>
        </div>

        {/* Zone and Regional Info Card */}
        {(zoneInfo || regionalInfo) && (
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Administrative Hierarchy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zoneInfo && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Zone</p>
                  <p className="font-semibold text-gray-800">{zoneInfo.zone_name}</p>
                </div>
              )}
              {regionalInfo && (
                <>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Region</p>
                    <p className="font-semibold text-gray-800">{regionalInfo.regional_name}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Regional Admin</p>
                    <p className="font-semibold text-gray-800">{regionalInfo.first_name} {regionalInfo.last_name}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Kebeles Card */}
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 rounded-full p-4">
                  <span className="text-3xl">🏘️</span>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Kebele Admins</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalKebeles || 0}</p>
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
                    + Add New Kebele
                  </button>
                  <button 
                    onClick={() => setActiveTab("list")}
                    className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View All Kebeles
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Kebeles Section */}
            {stats?.recentKebeles && stats.recentKebeles.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Kebeles</h3>
                <div className="space-y-4">
                  {stats.recentKebeles.map(kebele => (
                    <div key={kebele.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{kebele.kebele_name}</p>
                        <p className="text-sm text-gray-600">{kebele.first_name} {kebele.last_name}</p>
                        <p className="text-xs text-gray-500">Added: {new Date(kebele.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => handleEditClick(kebele)}
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
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No data available yet. Start by creating kebele admins.</p>
            <button 
              onClick={() => setActiveTab("create")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Kebele Admin
            </button>
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
          <span className="ml-3 text-gray-600">Loading kebele admins...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Kebele Admins Management</h2>
          <button 
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> Add New Kebele Admin
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, kebele, or email..."
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
            <p className="text-gray-600 mb-4">No kebele admins found</p>
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
                Create Your First Kebele Admin
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kebele Name</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.kebele_name}</td>
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
          {isEditing ? "Edit Kebele Admin" : "Create New Kebele Admin"}
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
              <label htmlFor="kebele_name" className="block text-sm font-medium text-gray-700 mb-2">
                Kebele Name *
              </label>
              <input
                type="text"
                id="kebele_name"
                name="kebele_name"
                value={formData.kebele_name}
                onChange={handleInputChange}
                required
                placeholder="Enter kebele name"
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
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                placeholder="Enter age"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                Sex
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
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
              <h1 className="text-2xl font-bold text-gray-900">Woreda Admin Dashboard</h1>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Woreda:</span> {woredaInfo?.woreda_name}
                </p>
                {zoneInfo && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Zone:</span> {zoneInfo.zone_name}
                  </p>
                )}
                {regionalInfo && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Region:</span> {regionalInfo.regional_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Woreda Admin
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
                fetchKebeleAdmins();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "list"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Kebele Admins
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
              {isEditing ? "Edit Kebele" : "Create Kebele"}
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

export default WoredaDashboard;