import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FederalDashboard = () => {
  const [activeTab, setActiveTab] = useState("regions");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState({
    regions: false,
    create: false,
    delete: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [federalData, setFederalData] = useState(null);
  
  // Form state for creating new regional admin
  const [formData, setFormData] = useState({
    regional_name: "",
    first_name: "",
    last_name: "",
    age: "",
    sex: "",
    email: "",
    password: "",
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get token and user from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  // Axios instance with auth header
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Check authentication on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFederalProfile();
    fetchRegions();
  }, [token]);

  // Fetch federal profile
  const fetchFederalProfile = async () => {
    try {
      const response = await api.get("/federal/profile");
      setFederalData(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Fetch all regions under this federal
  const fetchRegions = async () => {
    setLoading(prev => ({ ...prev, regions: true }));
    try {
      const response = await api.get("/federal/regions");
      setRegions(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching regions:", err);
      setError("Failed to fetch regions");
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle create regional admin
  const handleCreateRegional = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/federal/regions", formData);
      
      setSuccess("Regional admin created successfully!");
      setFormData({
        regional_name: "",
        first_name: "",
        last_name: "",
        age: "",
        sex: "",
        email: "",
        password: "",
      });
      setShowCreateForm(false);
      fetchRegions(); // Refresh the list
      
    } catch (err) {
      console.error("Create error:", err.response?.data);
      setError(err.response?.data?.message || "Error creating regional admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle edit click
  const handleEditClick = (region) => {
    setEditingId(region.id);
    setFormData({
      regional_name: region.regional_name || "",
      first_name: region.first_name || "",
      last_name: region.last_name || "",
      age: region.age || "",
      sex: region.sex || "",
      email: region.email || "",
      password: "", // Password not pre-filled
    });
    setShowCreateForm(true);
    setActiveTab("create");
  };

  // Handle update regional
  const handleUpdateRegional = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setLoading(prev => ({ ...prev, create: true }));
    setError("");
    setSuccess("");

    try {
      // Remove password if empty (don't update password if not provided)
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.email; // Don't update email

      await api.put(`/federal/regions/${editingId}`, updateData);
      
      setSuccess("Regional admin updated successfully!");
      resetForm();
      fetchRegions();
      setActiveTab("regions");
      
    } catch (err) {
      console.error("Update error:", err.response?.data);
      setError(err.response?.data?.message || "Error updating regional admin");
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle delete regional
  const handleDeleteRegional = async (id) => {
    if (!window.confirm("Are you sure you want to delete this regional admin? This action cannot be undone.")) {
      return;
    }

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await api.delete(`/federal/regions/${id}`);
      setSuccess("Regional admin deleted successfully!");
      fetchRegions(); // Refresh list
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Error deleting regional admin");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      regional_name: "",
      first_name: "",
      last_name: "",
      age: "",
      sex: "",
      email: "",
      password: "",
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Federal Admin Dashboard
              </h1>
              {federalData && (
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {federalData.first_name} {federalData.last_name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Regions</h3>
            <p className="text-3xl font-bold text-blue-600">{regions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Active Admins</h3>
            <p className="text-3xl font-bold text-green-600">{regions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Recent Activity</h3>
            <p className="text-3xl font-bold text-purple-600">
              {regions.filter(r => {
                const days = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
                return days <= 7;
              }).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("regions");
                  resetForm();
                }}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "regions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                View Regions
              </button>
              <button
                onClick={() => {
                  setActiveTab("create");
                  setShowCreateForm(true);
                  setEditingId(null);
                }}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {editingId ? "Edit Region" : "Create New Region"}
              </button>
            </nav>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right font-bold">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
            <button onClick={() => setSuccess("")} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Regions List Tab */}
        {activeTab === "regions" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">All Regions</h2>
            </div>

            {loading.regions ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading regions...</p>
              </div>
            ) : regions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No regions found</p>
                <button
                  onClick={() => {
                    setActiveTab("create");
                    setShowCreateForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Region
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age/Sex
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {regions.map((region) => (
                      <tr key={region.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {region.regional_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {region.first_name} {region.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{region.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {region.age} / {region.sex}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(region.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(region)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRegional(region.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading.delete}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form Tab */}
        {activeTab === "create" && showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {editingId ? "Edit Regional Admin" : "Create New Regional Admin"}
            </h2>

            <form onSubmit={editingId ? handleUpdateRegional : handleCreateRegional}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Region Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region Name *
                  </label>
                  <input
                    type="text"
                    name="regional_name"
                    value={formData.regional_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., North Region"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Age"
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sex *
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={!editingId}
                    disabled={!!editingId}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingId ? "bg-gray-100" : ""
                    }`}
                    placeholder="email@example.com"
                  />
                  {editingId && (
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  )}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingId ? "New Password (leave blank to keep current)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={editingId ? "Enter new password" : "Enter password"}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("regions");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.create}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {loading.create ? "Processing..." : (editingId ? "Update Admin" : "Create Admin")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FederalDashboard;