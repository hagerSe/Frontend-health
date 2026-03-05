// components/HospitalDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    dashboard: false,
    list: false,
    create: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [kebeleInfo, setKebeleInfo] = useState(null);
  const [woredaInfo, setWoredaInfo] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [regionalInfo, setRegionalInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [showWardField, setShowWardField] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    age: "",
    gender: "",
    ward: "",
    department: "",
    email: "",
    password: "",
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterWard, setFilterWard] = useState("");
  
  const navigate = useNavigate();
  
  // Get token and user info
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ CORRECTED: Departments that require ward
  const wardRequiredDepartments = ["Doctor", "Nurse", "Midwifery","Radiology", "Pharmacy", "Laboratory"];
  const clinicalDepartments = ["Doctor", "Nurse", "Midwifery", "Radiology", "Pharmacy", "Laboratory"];
  const nonClinicalDepartments = ["card office", "triage", "bed management", "human resource"];
  const allDepartments = [...clinicalDepartments, ...nonClinicalDepartments];

  // Ward options based on User model ENUM
  const wards = ["OPD", "Emergency", "ANC"];

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
    console.log("HospitalDashboard mounted");
    console.log("User from localStorage:", user);
    
    if (!token) {
      console.log("No token, redirecting to login");
      navigate("/login");
      return;
    }

    if (user.role !== 'hospital') {
      console.log('Not a hospital admin, role:', user.role);
      navigate('/login');
      return;
    }
    
    setHospitalInfo(user);
    
    // Set hierarchy info from user object
    if (user.kebele) setKebeleInfo(user.kebele);
    if (user.woreda) setWoredaInfo(user.woreda);
    if (user.zone) setZoneInfo(user.zone);
    if (user.regional) setRegionalInfo(user.regional);
    setLoadingInfo(false);
    
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "list") {
      fetchUsers();
    }
  }, [activeTab]);

  // ✅ FIXED: Watch department change to show/hide ward field
  useEffect(() => {
    // Only show ward field for departments that require it
    if (wardRequiredDepartments.includes(formData.department)) {
      setShowWardField(true);
    } else {
      setShowWardField(false);
      // Clear ward value when switching to non-ward department
      setFormData(prev => ({ ...prev, ward: "" }));
    }
  }, [formData.department]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError("");
    
    try {
      const response = await api.get("/users/stats");
      console.log("Stats response:", response.data);
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (err.response?.status === 404) {
        setStats({ 
          totalUsers: 0, 
          departmentDistribution: [], 
          wardDistribution: [], 
          genderDistribution: [],
          nonClinicalCount: 0,
          recentUsers: [] 
        });
      } else {
        setError("Failed to fetch dashboard statistics");
      }
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch all users for this hospital
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError("");
    
    try {
      const response = await api.get("/users");
      console.log("Users response:", response.data);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
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
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      age: "",
      gender: "",
      ward: "",
      department: "",
      email: "",
      password: "",
    });
    setIsEditing(false);
    setSelectedUser(null);
    setShowWardField(false);
  };

  // ✅ FIXED: Handle create user with proper ward logic
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      // Create a copy of formData
      const userData = { ...formData };
      
      // ✅ CORRECTED: Only Doctor, Nurse, Midwifery require ward
      // For other departments, ensure ward is null (not empty string)
      if (!wardRequiredDepartments.includes(userData.department)) {
        userData.ward = null; // Set to null for database, not empty string
      }
      
      // Ensure age is number or null
      if (userData.age) {
        userData.age = parseInt(userData.age);
      } else {
        userData.age = null;
      }
      
      const response = await api.post("/users", userData);
      console.log("Create response:", response.data);
      setSuccess("User created successfully!");
      resetForm();
      
      if (activeTab === "list") {
        fetchUsers();
      } else {
        fetchDashboardStats();
      }
      
      setTimeout(() => {
        setActiveTab("list");
      }, 2000);
    } catch (err) {
      console.error("Create error:", err);
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle edit user
  const handleEditClick = (userData) => {
    setSelectedUser(userData);
    setFormData({
      first_name: userData.first_name || "",
      middle_name: userData.middle_name || "",
      last_name: userData.last_name || "",
      phone: userData.phone || "",
      age: userData.age || "",
      gender: userData.gender || "",
      ward: userData.ward || "",
      department: userData.department,
      email: userData.email,
      password: "",
    });
    setIsEditing(true);
    setActiveTab("create");
  };

  // ✅ FIXED: Handle update user with proper ward logic
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      // Create a copy of formData to modify
      const userData = { ...formData };
      
      // ✅ CORRECTED: Only Doctor, Nurse, Midwifery require ward
      if (!wardRequiredDepartments.includes(userData.department)) {
        userData.ward = null; // Set to null for database
      }
      
      // Convert age to number or null
      if (userData.age) {
        userData.age = parseInt(userData.age);
      } else {
        userData.age = null;
      }
      
      await api.put(`/users/${selectedUser.id}`, userData);
      setSuccess("User updated successfully!");
      resetForm();
      fetchUsers();
      setActiveTab("list");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Error updating user");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setSuccess("User deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting user");
    }
  };

  // Filter users
  const filteredUsers = (users || []).filter(userData => {
    const matchesSearch = 
      (userData.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = filterGender ? userData.gender === filterGender : true;
    const matchesDepartment = filterDepartment ? userData.department === filterDepartment : true;
    const matchesWard = filterWard ? userData.ward === filterWard : true;
    
    return matchesSearch && matchesGender && matchesDepartment && matchesWard;
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
        <h2 className="text-2xl font-bold text-gray-800">Hospital Dashboard Overview</h2>
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {hospitalInfo?.first_name} {hospitalInfo?.last_name}!
          </h2>
          <p className="text-blue-100">
            You are managing <span className="font-bold text-yellow-300">{hospitalInfo?.hospital_name}</span> hospital 
            ({hospitalInfo?.service_name}) in <span className="font-bold text-yellow-300">{kebeleInfo?.kebele_name}</span> kebele,
            <span className="font-bold text-yellow-300"> {woredaInfo?.woreda_name}</span> woreda,
            <span className="font-bold text-yellow-300"> {zoneInfo?.zone_name}</span> zone,
            <span className="font-bold text-yellow-300"> {regionalInfo?.regional_name}</span> region.
          </p>
        </div>

        {/* Hierarchy Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl shadow-md border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Administrative Hierarchy</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Hospital</p>
              <p className="font-semibold">{hospitalInfo?.hospital_name}</p>
            </div>
          </div>
        </div>
        
        {stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-4 mr-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              {/* Clinical Staff Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-4 mr-4">
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Clinical Staff</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.departmentDistribution
                        ?.filter(d => clinicalDepartments.includes(d.department))
                        .reduce((sum, d) => sum + d.count, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Non-Clinical Staff Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-4 mr-4">
                    <span className="text-3xl">👔</span>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">Non-Clinical</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.nonClinicalCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Gender Distribution Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-gray-500 text-sm mb-2">Gender Distribution</h3>
                <div className="space-y-1">
                  {stats.genderDistribution?.map(g => (
                    <div key={g.gender} className="flex justify-between text-sm">
                      <span>{g.gender}:</span>
                      <span className="font-semibold">{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {allDepartments.map(dept => {
                  const deptStat = stats.departmentDistribution?.find(d => d.department === dept);
                  return (
                    <div key={dept} className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600 truncate">{dept}</p>
                      <p className="font-bold text-blue-600">{deptStat?.count || 0}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ward Distribution (Only for Doctor, Nurse, Midwifery) */}
            {stats.wardDistribution?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ward Distribution (Doctor/Nurse/Midwife)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wards.map(ward => {
                    const wardStat = stats.wardDistribution?.find(w => w.ward === ward);
                    return (
                      <div key={ward} className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600">{ward}</p>
                        <p className="text-xl font-bold text-blue-600">{wardStat?.count || 0}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-gray-500 text-sm mb-3">Quick Actions</h3>
                <button 
                  onClick={() => setActiveTab("create")}
                  className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add New User
                </button>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  View All Users
                </button>
              </div>

              {/* Recent Users */}
              {stats.recentUsers?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-gray-500 text-sm mb-3">Recent Users</h3>
                  <div className="space-y-2">
                    {stats.recentUsers.map(u => (
                      <div key={u.id} className="flex justify-between items-center text-sm">
                        <span>{u.first_name} {u.last_name}</span>
                        <span className="text-gray-500">{u.department}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No data available yet. Start by creating users.</p>
            <button 
              onClick={() => setActiveTab("create")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First User
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
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Hospital Users</h2>
          <button 
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add New User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={filterGender} 
            onChange={(e) => setFilterGender(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select 
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {allDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={filterWard} 
            onChange={(e) => setFilterWard(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Wards</option>
            {wards.map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(userData => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.first_name} {userData.middle_name} {userData.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{userData.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          wardRequiredDepartments.includes(userData.department)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {userData.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.ward || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{userData.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{userData.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(userData)} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(userData.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

  // Render create form
  const renderCreateForm = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditing ? "Edit User" : "Create New User"}
        </h2>
        
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}
        
        <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser} className="bg-white rounded-lg shadow p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isEditing}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {allDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {showWardField && (
              <div>
                <label className="block mb-2 font-medium">Ward *</label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ward</option>
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Required for Doctor, Nurse, Midwifery</p>
              </div>
            )}
            {!isEditing && (
              <div className="md:col-span-3">
                <label className="block mb-2 font-medium">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={resetForm} 
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading.create} 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
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
              <h1 className="text-2xl font-bold">Hospital Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                {hospitalInfo?.hospital_name} ({hospitalInfo?.service_name}) - {kebeleInfo?.kebele_name} Kebele
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
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
              className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "dashboard" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("list");
                fetchUsers();
              }}
              className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "list" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "create" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {isEditing ? "Edit User" : "Create User"}
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

export default HospitalDashboard;