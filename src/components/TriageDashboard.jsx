// components/TriageDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const TriageDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [vitals, setVitals] = useState({
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    oxygen_saturation: "",
    pain_level: "",
    weight: "",
    height: "",
    chief_complaint: "",
    triage_notes: "",
    recommended_department: "opd",
    priority: "medium"
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Connect to socket.io for real-time updates
  useEffect(() => {
    if (!token) return;
    
    const newSocket = io("http://localhost:5000", {
      auth: { token }
    });
    setSocket(newSocket);

    // Get hospital_id from user object (once user is loaded)
    if (user && user.hospital_id) {
      const hospitalId = user.hospital_id;
      
      // Join hospital-specific rooms
      newSocket.emit('join_hospital', hospitalId);
      newSocket.emit('join_triage', hospitalId);

      newSocket.on('triage_queue_update', (data) => {
        // Only update if this is for our hospital
        if (data && data.hospital_id === hospitalId) {
          setQueue(data.queue || []);
        }
      });
    }

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [token, user]);

  // API instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get("/triage/queue");
      setQueue(response.data?.queue || []);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  const handleStartTriage = async (queueItem) => {
    try {
      const response = await api.put(`/triage/start/${queueItem.id}`);
      if (response.data && response.data.success) {
        setCurrentPatient({
          ...queueItem.patient,
          queueId: queueItem.id,
          visitId: queueItem.visit_id
        });
      }
    } catch (err) {
      console.error("Error starting triage:", err);
      alert("Error starting triage. Please try again.");
    }
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const handleCompleteTriage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentPatient || !currentPatient.queueId) {
        throw new Error("No patient selected");
      }

      const response = await api.post("/triage/complete", {
        queueId: currentPatient.queueId,
        ...vitals
      });

      if (response.data && response.data.success) {
        alert(`Patient sent to ${response.data.department?.toUpperCase() || 'department'}`);
        setCurrentPatient(null);
        setVitals({
          temperature: "",
          heart_rate: "",
          respiratory_rate: "",
          systolic_bp: "",
          diastolic_bp: "",
          oxygen_saturation: "",
          pain_level: "",
          weight: "",
          height: "",
          chief_complaint: "",
          triage_notes: "",
          recommended_department: "opd",
          priority: "medium"
        });
        
        // Refresh queue
        fetchQueue();
      }
    } catch (err) {
      console.error("Error completing triage:", err);
      alert("Error completing triage: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Triage Dashboard</h1>
              <p className="text-yellow-100">
                {user?.hospital_name ? `Hospital: ${user.hospital_name}` : 'Real-time Patient Queue'}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Queue Column */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs mr-2">
                  {Array.isArray(queue) ? queue.length : 0}
                </span>
                Waiting in Triage
              </h2>

              <div className="space-y-3">
                {Array.isArray(queue) && queue.map((item) => (
                  <div
                    key={item?.id || Math.random()}
                    className={`p-3 rounded-lg border ${
                      item?.status === 'in_progress'
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-white border-gray-200 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !currentPatient && item?.patient && handleStartTriage(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          #{item?.position || 0}
                        </span>
                        {item?.patient && (
                          <>
                            <h3 className="font-semibold mt-2">
                              {item.patient.first_name || ''} {item.patient.last_name || ''}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Card: {item.patient.card_number || ''}
                            </p>
                          </>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item?.estimated_wait || 0} min
                      </span>
                    </div>
                  </div>
                ))}

                {(!queue || queue.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No patients in triage
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Triage Form Column */}
          <div className="md:col-span-2">
            {currentPatient ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  Triage: {currentPatient?.first_name || ''} {currentPatient?.last_name || ''}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Card: {currentPatient?.card_number || ''}
                </p>

                <form onSubmit={handleCompleteTriage} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        value={vitals.temperature}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Heart Rate
                      </label>
                      <input
                        type="number"
                        name="heart_rate"
                        value={vitals.heart_rate}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Respiratory
                      </label>
                      <input
                        type="number"
                        name="respiratory_rate"
                        value={vitals.respiratory_rate}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        O2 Sat (%)
                      </label>
                      <input
                        type="number"
                        name="oxygen_saturation"
                        value={vitals.oxygen_saturation}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Systolic BP
                      </label>
                      <input
                        type="number"
                        name="systolic_bp"
                        value={vitals.systolic_bp}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Diastolic BP
                      </label>
                      <input
                        type="number"
                        name="diastolic_bp"
                        value={vitals.diastolic_bp}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Pain (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        name="pain_level"
                        value={vitals.pain_level}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={vitals.weight}
                        onChange={handleVitalsChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chief Complaint
                    </label>
                    <textarea
                      name="chief_complaint"
                      value={vitals.chief_complaint}
                      onChange={handleVitalsChange}
                      rows="2"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Triage Notes
                    </label>
                    <textarea
                      name="triage_notes"
                      value={vitals.triage_notes}
                      onChange={handleVitalsChange}
                      rows="2"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Send to Department
                      </label>
                      <select
                        name="recommended_department"
                        value={vitals.recommended_department}
                        onChange={handleVitalsChange}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="opd">OPD</option>
                        <option value="anc">ANC</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={vitals.priority}
                        onChange={handleVitalsChange}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentPatient(null)}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Complete Triage & Send"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Patient Selected
                </h3>
                <p className="mt-2 text-gray-500">
                  Click on a patient from the queue to start triage
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriageDashboard;