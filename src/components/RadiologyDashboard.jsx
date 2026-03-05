// components/RadiologyDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const RadiologyDashboard = () => {
  const [studies, setStudies] = useState([]);
  const [stats, setStats] = useState({ ordered: 0, scheduled: 0, completed: 0, reported: 0 });
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("ordered");
  const [report, setReport] = useState({
    findings: "",
    impression: "",
    recommendations: "",
    technique: "",
    image_count: 0
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  // Study type icons and colors
  const studyIcons = {
    'X-Ray': '📸',
    'CT': '🖥️',
    'MRI': '🧲',
    'Ultrasound': '📡',
    'Mammogram': '🎗️',
    'Fluoroscopy': '📹'
  };

  const studyColors = {
    'X-Ray': 'bg-blue-100 text-blue-800',
    'CT': 'bg-purple-100 text-purple-800',
    'MRI': 'bg-indigo-100 text-indigo-800',
    'Ultrasound': 'bg-green-100 text-green-800',
    'Mammogram': 'bg-pink-100 text-pink-800',
    'Fluoroscopy': 'bg-yellow-100 text-yellow-800'
  };

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
    newSocket.emit('join_department', hospitalId, 'radiology');

    // Listen for new radiology orders from doctors
    newSocket.on('new_radiology_order', (data) => {
      if (data.hospital_id === hospitalId) {
        addNewStudy(data);
        if (Notification.permission === "granted") {
          new Notification("New Radiology Order", {
            body: `${data.study.study_type} - ${data.patient_name}`,
            icon: "/radiology-icon.png"
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
    fetchStudies();
    fetchStats();
  }, []);

  const fetchStudies = async () => {
    try {
      const response = await api.get("/radiology/studies");
      setStudies(response.data.studies || []);
    } catch (err) {
      console.error("Error fetching studies:", err);
      // Mock data
      const mockStudies = [
        {
          id: 1,
          study_id: "RAD-123",
          patient_name: "John Doe",
          patient_card: "12345",
          study_type: "X-Ray",
          body_part: "Chest",
          clinical_history: "Cough, fever",
          status: "ordered",
          ordered_by: "Dr. Smith",
          ordered_at: new Date().toISOString(),
          hospital_id: user?.hospital_id || 1
        },
        {
          id: 2,
          study_id: "RAD-456",
          patient_name: "Jane Smith",
          patient_card: "67890",
          study_type: "MRI",
          body_part: "Brain",
          clinical_history: "Headache, dizziness",
          status: "ordered",
          ordered_by: "Dr. Jones",
          ordered_at: new Date().toISOString(),
          hospital_id: user?.hospital_id || 1
        }
      ];
      setStudies(mockStudies);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/radiology/stats");
      setStats(response.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const addNewStudy = (data) => {
    const newStudy = {
      id: Date.now(),
      study_id: data.study.study_id,
      patient_name: data.patient_name,
      patient_card: data.patient_card,
      study_type: data.study.study_type,
      body_part: data.study.body_part,
      clinical_history: data.study.clinical_history,
      status: "ordered",
      ordered_by: data.doctor_name,
      ordered_at: new Date().toISOString(),
      hospital_id: data.hospital_id
    };
    
    setStudies(prev => [newStudy, ...prev]);
    setStats(prev => ({ ...prev, ordered: prev.ordered + 1 }));
  };

  const handleScheduleStudy = (study) => {
    setSelectedStudy(study);
  };

  const confirmSchedule = async () => {
    if (!selectedStudy) return;

    setLoading(true);
    try {
      const scheduledStudy = {
        ...selectedStudy,
        status: "scheduled",
        scheduled_at: new Date().toISOString()
      };

      setStudies(prev => prev.map(s => 
        s.id === selectedStudy.id ? scheduledStudy : s
      ));

      setStats(prev => ({
        ordered: prev.ordered - 1,
        scheduled: prev.scheduled + 1,
        completed: prev.completed,
        reported: prev.reported
      }));

      setSelectedStudy(null);

    } catch (err) {
      console.error("Error scheduling study:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStudy = (study) => {
    setSelectedStudy(study);
    setActiveTab("report");
  };

  const handleSubmitReport = async () => {
    if (!selectedStudy || !report.findings || !report.impression) {
      alert("Please enter findings and impression");
      return;
    }

    setLoading(true);
    try {
      const completedStudy = {
        ...selectedStudy,
        status: "reported",
        ...report,
        reported_at: new Date().toISOString(),
        reported_by: user?.id
      };

      setStudies(prev => prev.map(s => 
        s.id === selectedStudy.id ? completedStudy : s
      ));

      setStats(prev => ({
        ordered: prev.ordered,
        scheduled: prev.scheduled - 1,
        completed: prev.completed,
        reported: prev.reported + 1
      }));

      // Send report back to doctor via socket
      if (socket) {
        socket.emit('radiology_report_ready', {
          study_id: selectedStudy.study_id,
          study_type: selectedStudy.study_type,
          patient_id: selectedStudy.patient_id,
          patient_name: selectedStudy.patient_name,
          doctor_id: selectedStudy.ordered_by_id,
          report: report,
          hospital_id: user?.hospital_id
        });
      }

      setSelectedStudy(null);
      setReport({
        findings: "",
        impression: "",
        recommendations: "",
        technique: "",
        image_count: 0
      });

    } catch (err) {
      console.error("Error submitting report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStudies = () => {
    return studies.filter(study => {
      if (activeTab === "ordered") return study.status === "ordered";
      if (activeTab === "scheduled") return study.status === "scheduled";
      if (activeTab === "completed") return study.status === "completed";
      if (activeTab === "reported") return study.status === "reported";
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
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">📷</span>
                Radiology Dashboard
              </h1>
              <p className="text-indigo-100">
                {user?.first_name} {user?.last_name} • {hospitalInfo?.hospital_name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Ordered</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.ordered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Reported</p>
                <p className="text-2xl font-bold text-purple-600">{stats.reported}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.ordered + stats.scheduled + stats.completed + stats.reported}
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
                onClick={() => setActiveTab("ordered")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "ordered"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Ordered ({stats.ordered})
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "scheduled"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Scheduled ({stats.scheduled})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "completed"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setActiveTab("reported")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reported"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Reported ({stats.reported})
              </button>
            </nav>
          </div>

          {/* Studies List */}
          <div className="p-6">
            {getFilteredStudies().length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📷</span>
                <p className="text-gray-500">No {activeTab} studies</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredStudies().map((study) => (
                  <div key={study.id} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{studyIcons[study.study_type]}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            study.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                            study.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            study.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {study.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${studyColors[study.study_type]}`}>
                            {study.study_type}
                          </span>
                          <span className="text-sm text-gray-500">
                            Ordered: {formatDate(study.ordered_at)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Patient</p>
                            <p className="font-semibold">{study.patient_name}</p>
                            <p className="text-xs text-gray-500">Card: {study.patient_card}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Body Part</p>
                            <p className="font-semibold">{study.body_part}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ordered By</p>
                            <p>{study.ordered_by}</p>
                          </div>
                        </div>

                        {study.clinical_history && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">History:</span> {study.clinical_history}
                          </p>
                        )}

                        {study.status === 'reported' && study.findings && (
                          <div className="mt-3 bg-gray-50 p-3 rounded">
                            <p className="text-sm font-medium">Findings:</p>
                            <p className="text-sm">{study.findings}</p>
                            <p className="text-sm font-medium mt-2">Impression:</p>
                            <p className="text-sm">{study.impression}</p>
                          </div>
                        )}
                      </div>

                      {study.status === 'ordered' && (
                        <button
                          onClick={() => handleScheduleStudy(study)}
                          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Schedule
                        </button>
                      )}

                      {study.status === 'scheduled' && (
                        <button
                          onClick={() => handleCompleteStudy(study)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Enter Report
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

      {/* Schedule Modal */}
      {selectedStudy && activeTab !== "report" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Schedule Study</h3>
            
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Patient:</span> {selectedStudy.patient_name}</p>
              <p><span className="font-medium">Study:</span> {selectedStudy.study_type} - {selectedStudy.body_part}</p>
              <p><span className="font-medium">Ordered by:</span> {selectedStudy.ordered_by}</p>
              
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  ⏰ Schedule this study for the patient.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedStudy(null)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {selectedStudy && activeTab === "report" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Radiology Report</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><span className="font-medium">Patient:</span> {selectedStudy.patient_name}</p>
              <p><span className="font-medium">Study:</span> {selectedStudy.study_type} - {selectedStudy.body_part}</p>
              <p><span className="font-medium">Ordered by:</span> {selectedStudy.ordered_by}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technique
                </label>
                <textarea
                  value={report.technique}
                  onChange={(e) => setReport({...report, technique: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the technique used..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Findings *
                </label>
                <textarea
                  value={report.findings}
                  onChange={(e) => setReport({...report, findings: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the findings..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impression *
                </label>
                <textarea
                  value={report.impression}
                  onChange={(e) => setReport({...report, impression: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Your impression/diagnosis..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={report.recommendations}
                  onChange={(e) => setReport({...report, recommendations: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Any recommendations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Images
                </label>
                <input
                  type="number"
                  value={report.image_count}
                  onChange={(e) => setReport({...report, image_count: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedStudy(null);
                  setActiveTab("scheduled");
                }}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadiologyDashboard;