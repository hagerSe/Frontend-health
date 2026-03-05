// components/PharmacyDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const PharmacyDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, dispensed: 0 });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    if (userData.hospital) setHospitalInfo(userData.hospital);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io("http://localhost:5000", {
      auth: { token }
    });
    setSocket(newSocket);

    const hospitalId = user.hospital_id || 1;
    newSocket.emit('join_hospital', hospitalId);
    newSocket.emit('join_department', hospitalId, 'pharmacy');

    // Listen for new prescriptions from doctors
    newSocket.on('new_prescription', (data) => {
      if (data.hospital_id === hospitalId) {
        addNewPrescription(data);
        if (Notification.permission === "granted") {
          new Notification("New Prescription", {
            body: `${data.medication.name} for ${data.patient_name}`,
            icon: "/pharmacy-icon.png"
          });
        }
      }
    });

    return () => newSocket.close();
  }, [token, user]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch data on mount
  useEffect(() => {
    fetchPrescriptions();
    fetchStats();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get("/pharmacy/prescriptions");
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      // Mock data
      const mockPrescriptions = [
        {
          id: 1,
          prescription_id: "RX-123",
          patient_name: "John Doe",
          patient_card: "12345",
          medication_name: "Amoxicillin",
          dosage: "500mg",
          frequency: "twice daily",
          duration: "7 days",
          prescribed_by: "Dr. Smith",
          prescribed_at: new Date().toISOString(),
          status: "prescribed",
          hospital_id: user?.hospital_id || 1
        },
        {
          id: 2,
          prescription_id: "RX-456",
          patient_name: "Jane Smith",
          patient_card: "67890",
          medication_name: "Paracetamol",
          dosage: "1000mg",
          frequency: "as needed",
          duration: "3 days",
          prescribed_by: "Dr. Jones",
          prescribed_at: new Date().toISOString(),
          status: "prescribed",
          hospital_id: user?.hospital_id || 1
        }
      ];
      setPrescriptions(mockPrescriptions);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/pharmacy/stats");
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const addNewPrescription = (data) => {
    const newPrescription = {
      id: Date.now(),
      prescription_id: `RX-${Date.now()}`,
      patient_name: data.patient_name,
      patient_card: data.patient_card,
      medication_name: data.medication.name,
      dosage: data.medication.dosage,
      frequency: data.medication.frequency,
      duration: data.medication.duration,
      prescribed_by: `Dr. ${data.doctor_name}`,
      prescribed_at: new Date().toISOString(),
      status: "prescribed",
      hospital_id: data.hospital_id
    };
    
    setPrescriptions(prev => [newPrescription, ...prev]);
    setStats(prev => ({ ...prev, pending: prev.pending + 1 }));
  };

  const handleDispense = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const confirmDispense = async () => {
    if (!selectedPrescription) return;

    setLoading(true);
    try {
      const dispensedPrescription = {
        ...selectedPrescription,
        status: "dispensed",
        dispensed_at: new Date().toISOString()
      };

      setPrescriptions(prev => prev.map(p => 
        p.id === selectedPrescription.id ? dispensedPrescription : p
      ));

      setStats(prev => ({
        pending: prev.pending - 1,
        dispensed: prev.dispensed + 1
      }));

      // Send confirmation to doctor via socket
      if (socket) {
        socket.emit('medication_dispensed', {
          prescription_id: selectedPrescription.id,
          medication_name: selectedPrescription.medication_name,
          patient_id: selectedPrescription.patient_id,
          patient_name: selectedPrescription.patient_name,
          doctor_id: selectedPrescription.prescribed_by_id,
          hospital_id: user?.hospital_id
        });
      }

      setSelectedPrescription(null);

    } catch (err) {
      console.error("Error dispensing medication:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPrescriptions = () => {
    return prescriptions.filter(p => {
      if (activeTab === "pending") return p.status === "prescribed";
      if (activeTab === "dispensed") return p.status === "dispensed";
      return true;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">💊</span>
                Pharmacy Dashboard
              </h1>
              <p className="text-green-100">
                {user?.first_name} {user?.last_name} • {hospitalInfo?.hospital_name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Dispensed</p>
                <p className="text-2xl font-bold text-green-600">{stats.dispensed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.pending + stats.dispensed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab("dispensed")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dispensed"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Dispensed ({stats.dispensed})
              </button>
            </nav>
          </div>

          {/* Prescriptions List */}
          <div className="p-6">
            {getFilteredPrescriptions().length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">💊</span>
                <p className="text-gray-500">No {activeTab} prescriptions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredPrescriptions().map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            prescription.status === 'prescribed' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {prescription.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Prescribed: {formatDate(prescription.prescribed_at)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Patient</p>
                            <p className="font-semibold">{prescription.patient_name}</p>
                            <p className="text-xs text-gray-500">Card: {prescription.patient_card}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Medication</p>
                            <p className="font-semibold">{prescription.medication_name}</p>
                            <p className="text-xs text-gray-500">{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Instructions</p>
                            <p>{prescription.frequency}</p>
                            <p className="text-xs text-gray-500">Duration: {prescription.duration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Prescribed By</p>
                            <p>{prescription.prescribed_by}</p>
                          </div>
                        </div>

                        {prescription.status === 'dispensed' && prescription.dispensed_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Dispensed at: {formatDate(prescription.dispensed_at)}
                          </p>
                        )}
                      </div>

                      {prescription.status === 'prescribed' && (
                        <button
                          onClick={() => handleDispense(prescription)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Dispense
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispense Confirmation Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Dispense</h3>
            
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Patient:</span> {selectedPrescription.patient_name}</p>
              <p><span className="font-medium">Medication:</span> {selectedPrescription.medication_name} {selectedPrescription.dosage}</p>
              <p><span className="font-medium">Instructions:</span> {selectedPrescription.frequency} for {selectedPrescription.duration}</p>
              <p><span className="font-medium">Prescribed by:</span> {selectedPrescription.prescribed_by}</p>
              
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please verify the medication and dosage before dispensing.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDispense}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Dispense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;