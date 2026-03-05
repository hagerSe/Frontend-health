// components/CardofficeDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CardofficeDashboard = () => {
  const [activeTab, setActiveTab] = useState("register");
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    register: false,
    search: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [kebeleInfo, setKebeleInfo] = useState(null);
  const [woredaInfo, setWoredaInfo] = useState(null);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [regionalInfo, setRegionalInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  
  // Form state - EXACTLY matching your Patient model
  const [formData, setFormData] = useState({
    card_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: ""
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const navigate = useNavigate();
  
  // Get token and user info
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Generate 5-digit card number (ONLY digits, no prefix)
  const generateCardNumber = () => {
    // Generate random 5-digit number (10000 to 99999)
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // API instance with token
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch user info and hierarchy on mount
  useEffect(() => {
    // Set user info
    setUserInfo(user);
    
    // Set hospital info directly from user object (no API call needed!)
    if (user && user.hospital) {
      setHospitalInfo(user.hospital);
    }
    
    // Optional: Try to fetch additional info, but don't fail if can't
    if (user && user.hospital?.id) {
      fetchAdditionalHierarchyInfo(user.hospital.id).catch(() => {
        // Silently fail - we already have basic info
        console.log("Using basic hospital info from user object");
      });
    }
    
    setLoadingInfo(false);
  }, []);

  // Separate function for additional info that might fail
  const fetchAdditionalHierarchyInfo = async (hospitalId) => {
    try {
      // Try to get kebele info
      if (user && user.hospital?.kebele_id) {
        const kebeleRes = await api.get(`/kebeles/${user.hospital.kebele_id}`);
        if (kebeleRes.data && kebeleRes.data.success) {
          setKebeleInfo(kebeleRes.data.kebele);
        }
      }
    } catch (err) {
      // Ignore errors - we already have basic info
      console.log("Could not fetch additional hierarchy info");
    }
  };

  // Fetch complete hierarchy information
  const fetchHierarchyInfo = async (hospitalId) => {
    setLoadingInfo(true);
    try {
      const hospitalRes = await api.get(`/hospitals/${hospitalId}`);
      if (hospitalRes.data && hospitalRes.data.success) {
        setHospitalInfo(hospitalRes.data.hospital);
        
        // Try to fetch kebele info, but don't fail if forbidden
        try {
          if (hospitalRes.data.hospital && hospitalRes.data.hospital.kebele_id) {
            const kebeleRes = await api.get(`/kebeles/${hospitalRes.data.hospital.kebele_id}`);
            if (kebeleRes.data && kebeleRes.data.success) {
              setKebeleInfo(kebeleRes.data.kebele);
            }
          }
        } catch (kebeleErr) {
          if (kebeleErr.response?.status === 403) {
            console.log("⚠️ No permission to fetch kebele info");
            // Set default values
            setKebeleInfo({ kebele_name: "Unknown" });
          }
        }
        
        // Try to fetch woreda info
        try {
          if (kebeleInfo && kebeleInfo.woreda_id) {
            const woredaRes = await api.get(`/woredas/${kebeleInfo.woreda_id}`);
            if (woredaRes.data && woredaRes.data.success) {
              setWoredaInfo(woredaRes.data.woreda);
            }
          }
        } catch (woredaErr) {
          if (woredaErr.response?.status === 403) {
            console.log("⚠️ No permission to fetch woreda info");
            setWoredaInfo({ woreda_name: "Unknown" });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching hierarchy:", err);
      if (err.response?.status === 403) {
        console.log("⚠️ No permission to fetch hospital hierarchy");
        // Set hospital info from user object as fallback
        if (user && user.hospital) {
          setHospitalInfo(user.hospital);
        }
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError("");
    
    try {
      const response = await api.get("/patients/stats");
      console.log("Stats response:", response.data);
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (err.response?.status === 404) {
        setStats({ 
          totalPatients: 0, 
          activePatients: 0,
          todayRegistrations: 0,
          genderDistribution: [],
          recentPatients: [] 
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(prev => ({ ...prev, search: true }));
    setError("");
    
    try {
      const response = await api.get("/patients");
      console.log("Patients response:", response.data);
      setPatients(response.data.patients || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      // Mock data for demonstration - using your model field names
      setPatients([
        { id: 1, card_number: '12345', first_name: 'John', middle_name: '', last_name: 'Doe', phone: '1234567890', gender: 'Male', date_of_birth: '1990-01-15', status: 'active' },
        { id: 2, card_number: '67890', first_name: 'Jane', middle_name: '', last_name: 'Smith', phone: '0987654321', gender: 'Female', date_of_birth: '1985-05-20', status: 'active' },
        { id: 3, card_number: '54321', first_name: 'Bob', middle_name: '', last_name: 'Johnson', phone: '5551234567', gender: 'Male', date_of_birth: '1978-03-10', status: 'inactive' },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
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

  // Generate new card number (5 digits only)
  const handleGenerateNewCard = () => {
    setFormData(prev => ({
      ...prev,
      card_number: generateCardNumber()
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      card_number: generateCardNumber(),
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      phone: ""
    });
    setSelectedPatient(null);
  };

  // Handle patient registration
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, register: true }));
    setError("");
    setSuccess("");

    try {
      // Validate required fields - matching your model
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.date_of_birth || !formData.gender) {
        setError("First name, last name, date of birth, gender, and phone are required");
        setLoading(prev => ({ ...prev, register: false }));
        return;
      }

      // Prepare data for API - using your model field names
      const patientData = {
        card_number: formData.card_number,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone
      };

      const response = await api.post("/card-office/register", patientData);
      console.log("Register response:", response.data);
      if (response.data && response.data.success) {
        setSuccess(`Patient registered successfully! Card Number: ${response.data.patient.card_number}`);
        
        // Refresh data
        fetchPatients();
        fetchDashboardStats();
        
        // Reset form with new card number
        resetForm();
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Error registering patient");
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  // Handle view patient details
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    console.log("View patient:", patient);
  };

  // Handle print card
  const handlePrintCard = (patient) => {
    if (!patient) return;
    
    // Create a simple printable card with 5-digit number
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Card</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; }
            .card { width: 350px; padding: 30px 20px; background: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; border: 2px solid #6b46c1; }
            .hospital { color: #6b46c1; font-size: 22px; font-weight: bold; margin-bottom: 15px; }
            .card-number { font-size: 36px; font-weight: bold; background: #f3e8ff; padding: 15px; border-radius: 10px; margin: 15px 0; letter-spacing: 3px; }
            .name { font-size: 20px; margin: 10px 0; font-weight: bold; }
            .detail { color: #666; margin: 5px 0; font-size: 16px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="hospital">${hospitalInfo?.hospital_name || 'Hospital'}</div>
            <div class="card-number">${patient.card_number || ''}</div>
            <div class="name">${patient.first_name || ''} ${patient.last_name || ''}</div>
            <div class="detail">DOB: ${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : ''}</div>
            <div class="detail">Gender: ${patient.gender || ''}</div>
            <div class="detail">Phone: ${patient.phone || ''}</div>
            <div class="footer">Valid Hospital ID Card</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter patients based on search
  const filteredPatients = Array.isArray(patients) ? patients.filter(patient => {
    if (!patient) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (patient.card_number && patient.card_number.toLowerCase().includes(searchLower)) ||
      (patient.first_name && patient.first_name.toLowerCase().includes(searchLower)) ||
      (patient.last_name && patient.last_name.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.includes(searchTerm));
    
    const matchesStatus = filterStatus ? patient.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Render register tab
  const renderRegister = () => {
    if (loadingInfo) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Welcome Card with Hierarchy */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {userInfo?.first_name || ''} {userInfo?.last_name || ''}!
          </h2>
          <p className="text-purple-100">
            Card Office • {hospitalInfo?.hospital_name || ''} ({hospitalInfo?.service_name || ''})
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {regionalInfo && (
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-purple-200">Region</p>
                <p className="font-semibold">{regionalInfo.regional_name}</p>
              </div>
            )}
            {zoneInfo && (
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-purple-200">Zone</p>
                <p className="font-semibold">{zoneInfo.zone_name}</p>
              </div>
            )}
            {woredaInfo && (
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-purple-200">Woreda</p>
                <p className="font-semibold">{woredaInfo.woreda_name}</p>
              </div>
            )}
            {kebeleInfo && (
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-purple-200">Kebele</p>
                <p className="font-semibold">{kebeleInfo.kebele_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Registration Form - EXACTLY matching your Patient model */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Patient Registration</h2>
          
          <form onSubmit={handleRegisterPatient} className="space-y-6">
            {/* Card Number Section - 5 digits only */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number (5-digit) <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="card_number"
                  value={formData.card_number}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg font-mono text-lg text-center"
                />
                <button
                  type="button"
                  onClick={handleGenerateNewCard}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate New
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">5-digit unique card number (e.g., 12345)</p>
            </div>

            {/* Personal Information - Matching your model exactly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter middle name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading.register}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading.register ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register Patient'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPatients || patients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.activePatients || (Array.isArray(patients) ? patients.filter(p => p && p.status === 'active').length : 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Today's Registrations</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.todayRegistrations || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render search tab
  const renderSearch = () => {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by card number, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={fetchPatients}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Patients List ({filteredPatients.length})
            </h3>
            <button
              onClick={() => setActiveTab("register")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              + New Registration
            </button>
          </div>
          
          {loading.search ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-500">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient?.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg font-mono text-sm">
                          {patient?.card_number || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient?.first_name || ''} {patient?.last_name || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient?.phone || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient?.gender || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          patient?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient?.status || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => patient && handleViewPatient(patient)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => patient && handlePrintCard(patient)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Print Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        {stats?.genderDistribution && stats.genderDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.genderDistribution.map((g, index) => (
                <div key={g?.gender || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{g?.gender || ''}</span>
                  <span className="font-bold text-purple-600">{g?.count || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Card Office Dashboard
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                {hospitalInfo?.hospital_name || ''} ({hospitalInfo?.service_name || ''})
              </p>
              <div className="flex space-x-4 text-xs text-purple-200 mt-1">
                {regionalInfo && <span>Region: {regionalInfo.regional_name}</span>}
                {zoneInfo && <span>Zone: {zoneInfo.zone_name}</span>}
                {woredaInfo && <span>Woreda: {woredaInfo.woreda_name}</span>}
                {kebeleInfo && <span>Kebele: {kebeleInfo.kebele_name}</span>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("register")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "register"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register Patient
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                fetchPatients();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "search"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Patients
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "register" && renderRegister()}
          {activeTab === "search" && renderSearch()}
        </div>
      </main>
    </div>
  );
};

export default CardofficeDashboard;