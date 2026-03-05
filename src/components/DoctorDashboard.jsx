// components/DoctorDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("queue");
  const [queue, setQueue] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Lab, Pharmacy, and Radiology states
  const [labTests, setLabTests] = useState({
    blood: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' },
    urine: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' },
    stool: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' }
  });
  
  const [medications, setMedications] = useState([]);
  const [medicationResponses, setMedicationResponses] = useState({});
  
  const [radiologyTests, setRadiologyTests] = useState({
    xray: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
    mri: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
    ct: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
    ultrasound: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' }
  });
  
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  
  const [consultation, setConsultation] = useState({
    diagnosis: "",
    notes: "",
    disposition: "discharge", // discharge, admit, refer
  });

  // Track completed patients for discharge identification
  const [completedPatients, setCompletedPatients] = useState([]);

  // Admission details
  const [admissionDetails, setAdmissionDetails] = useState({
    ward: "",
    room: "",
    bed: "",
    expectedStay: "",
    admittingDoctor: "",
    reason: ""
  });

  // ============ ENHANCED REFERRAL DETAILS ============
  const [referralDetails, setReferralDetails] = useState({
    referralType: "specialist", // specialist, department, external
    priority: "routine", // routine, urgent, emergency
    reason: "",
    notes: "",
    
    // For internal referrals (specialist/department)
    referredTo: "",
    department: "",
    specialistName: "",
    
    // For external referrals - ENHANCED WITH FULL ADDRESS
    externalFacility: "",
    externalFacilityType: "hospital", // hospital, clinic, health center
    externalDoctor: "",
    externalAddress: {
      region: "",
      zone: "",
      woreda: "",
      city: "",
      kebele: "",
      houseNumber: "",
      phone: "",
      email: ""
    },
    externalContactPerson: "",
    externalContactPhone: "",
    
    // Referral documents
    referralLetter: "",
    attachments: []
  });

  // Discharge details
  const [dischargeDetails, setDischargeDetails] = useState({
    dischargeSummary: "",
    followUpRequired: false,
    followUpDate: "",
    followUpWith: "",
    medicationsAtHome: [],
    dischargeMedications: [] // Medications given at discharge
  });

  // ============ DIGITAL SIGNATURE WITH CANVAS ============
  const [signature, setSignature] = useState({
    isSigned: false,
    signatureData: null,
    signatureDate: null,
    signatureType: "draw", // default to draw
    licenseNumber: ""
  });

  // Signature modal
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureInput, setSignatureInput] = useState({
    type: "draw", // default to draw
    typedName: "",
    licenseNumber: "",
    confirmPassword: ""
  });

  // Canvas ref for drawing signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (showSignatureModal && signatureInput.type === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 500;
      canvas.height = 200;
      const context = canvas.getContext('2d');
      context.strokeStyle = '#000';
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      setCtx(context);
    }
  }, [showSignatureModal, signatureInput.type]);

  // Drawing functions
  const startDrawing = (e) => {
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctx?.closePath();
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
      if (userData.hospital) {
        setHospitalInfo(userData.hospital);
        setSignatureInput(prev => ({
          ...prev,
          licenseNumber: userData.license_number || ""
        }));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!token || !user) return;
    
    const newSocket = io("http://localhost:5000", {
      auth: { token }
    });
    setSocket(newSocket);

    const hospitalId = user.hospital_id || 1;
    
    newSocket.emit('join_hospital', hospitalId);
    newSocket.emit('join_department', hospitalId, 'opd');

    newSocket.on('opd_queue_update', (data) => {
      if (data.hospital_id === hospitalId) {
        setQueue(data.queue || []);
      }
    });

    newSocket.on('new_patient_assigned', (data) => {
      if (data.hospital_id === hospitalId && data.doctor_id === user.id) {
        fetchAssignedPatients();
      }
    });

    // Listen for lab results
    newSocket.on('lab_results_ready', (data) => {
      if (data.patient_id === currentPatient?.patient?.id) {
        const updatedTests = { ...labTests };
        data.results.forEach(result => {
          if (updatedTests[result.test]) {
            updatedTests[result.test] = {
              ...updatedTests[result.test],
              results: result.results,
              status: 'completed',
              completedAt: result.completedAt
            };
          }
        });
        setLabTests(updatedTests);
        alert(`🔬 Lab results received for ${currentPatient?.patient?.full_name}`);
      }
    });

    // Listen for pharmacy responses
    newSocket.on('pharmacy_response', (data) => {
      if (data.patient_id === currentPatient?.patient?.id) {
        setMedicationResponses(prev => ({
          ...prev,
          [data.medicationId]: {
            status: data.status,
            dispensed: data.dispensed,
            notes: data.notes,
            respondedAt: data.respondedAt
          }
        }));
        alert(`💊 Pharmacy response received for medication`);
      }
    });

    // Listen for radiology results with images
    newSocket.on('radiology_results_ready', (data) => {
      if (data.patient_id === currentPatient?.patient?.id) {
        const updatedRadiology = { ...radiologyTests };
        data.results.forEach(result => {
          if (updatedRadiology[result.test]) {
            updatedRadiology[result.test] = {
              ...updatedRadiology[result.test],
              results: result.report,
              images: result.images,
              status: 'completed',
              completedAt: result.completedAt,
              radiologist: result.radiologist
            };
          }
        });
        setRadiologyTests(updatedRadiology);
        alert(`🖼️ Radiology results with images received for ${currentPatient?.patient?.full_name}`);
      }
    });

    return () => newSocket.close();
  }, [token, user, currentPatient]);

  // API instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch data on mount
  useEffect(() => {
    fetchQueue();
    fetchAssignedPatients();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get("/doctor/queue");
      setQueue(response.data.queue || []);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  const fetchAssignedPatients = async () => {
    try {
      const response = await api.get("/doctor/patients");
      const patients = response.data.patients || [];
      setAssignedPatients(patients);
      
      // IMPORTANT: Identify discharged patients using the is_discharged flag from backend
      const discharged = patients
        .filter(p => p.is_discharged === true || p.status === 'discharged' || p.status === 'completed')
        .map(p => p.patient.id);
      
      setCompletedPatients(discharged);
      console.log("✅ Discharged patients:", discharged);
    } catch (err) {
      console.error("Error fetching assigned patients:", err);
    }
  };

  const handleAssignPatient = async (queueItem) => {
    try {
      setLoading(true);
      const response = await api.put(`/doctor/assign/${queueItem.queue_id}`);
      
      if (response.data.success) {
        setCurrentPatient(response.data.patient);
        resetPatientStates();
        setActiveTab("consultation");
        fetchQueue();
        fetchAssignedPatients();
      }
    } catch (err) {
      console.error("Error assigning patient:", err);
      alert("Error assigning patient");
    } finally {
      setLoading(false);
    }
  };

  const resetPatientStates = () => {
    setLabTests({
      blood: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' },
      urine: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' },
      stool: { required: false, ordered: false, results: null, orderedAt: null, status: 'pending' }
    });
    setMedications([]);
    setMedicationResponses({});
    setRadiologyTests({
      xray: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
      mri: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
      ct: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' },
      ultrasound: { required: false, ordered: false, results: null, images: null, orderedAt: null, status: 'pending', bodyPart: '' }
    });
    setAdmissionDetails({
      ward: "", room: "", bed: "", expectedStay: "", admittingDoctor: "", reason: ""
    });
    setReferralDetails({
      referralType: "specialist",
      priority: "routine",
      reason: "",
      notes: "",
      referredTo: "",
      department: "",
      specialistName: "",
      externalFacility: "",
      externalFacilityType: "hospital",
      externalDoctor: "",
      externalAddress: {
        region: "", zone: "", woreda: "", city: "", kebele: "", houseNumber: "", phone: "", email: ""
      },
      externalContactPerson: "",
      externalContactPhone: "",
      referralLetter: "",
      attachments: []
    });
    setDischargeDetails({
      dischargeSummary: "", followUpRequired: false, followUpDate: "", followUpWith: "", medicationsAtHome: [], dischargeMedications: []
    });
    setConsultation({
      diagnosis: "", notes: "", disposition: "discharge"
    });
    // Don't reset signature - keep doctor's signature across patients
  };

  // Order lab tests
  const handleOrderLabTests = async () => {
    try {
      setLoading(true);
      const selectedTests = Object.entries(labTests)
        .filter(([_, value]) => value.required)
        .map(([key]) => key);

      if (selectedTests.length === 0) {
        alert("Please select at least one test");
        return;
      }

      const response = await api.post("/laboratory/order", {
        patientId: currentPatient.patient.id,
        visitId: currentPatient.visit_id,
        tests: selectedTests,
        orderedBy: user.id,
        priority: "routine"
      });

      if (response.data.success) {
        const updatedTests = { ...labTests };
        selectedTests.forEach(test => {
          updatedTests[test] = {
            ...updatedTests[test],
            ordered: true,
            orderedAt: new Date().toISOString(),
            status: 'pending'
          };
        });
        setLabTests(updatedTests);
        setShowLabModal(false);
        alert("🔬 Lab tests ordered successfully. Waiting for results...");
      }
    } catch (err) {
      console.error("Error ordering lab tests:", err);
      alert("Error ordering lab tests");
    } finally {
      setLoading(false);
    }
  };

  // Order radiology tests
  const handleOrderRadiology = async () => {
    try {
      setLoading(true);
      const selectedTests = Object.entries(radiologyTests)
        .filter(([_, value]) => value.required)
        .map(([key, value]) => ({
          test: key,
          bodyPart: value.bodyPart
        }));

      if (selectedTests.length === 0) {
        alert("Please select at least one radiology test");
        return;
      }

      const response = await api.post("/radiology/order", {
        patientId: currentPatient.patient.id,
        visitId: currentPatient.visit_id,
        tests: selectedTests,
        orderedBy: user.id
      });

      if (response.data.success) {
        const updatedRadiology = { ...radiologyTests };
        selectedTests.forEach(({ test, bodyPart }) => {
          updatedRadiology[test] = {
            ...updatedRadiology[test],
            ordered: true,
            orderedAt: new Date().toISOString(),
            status: 'pending',
            bodyPart: bodyPart
          };
        });
        setRadiologyTests(updatedRadiology);
        setShowRadiologyModal(false);
        alert("🖼️ Radiology tests ordered successfully. Waiting for images and reports...");
      }
    } catch (err) {
      console.error("Error ordering radiology:", err);
      alert("Error ordering radiology tests");
    } finally {
      setLoading(false);
    }
  };

  // ============ ENHANCED MEDICATION HANDLING ============
  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now(),
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        route: "oral",
        requiresResponse: true,
        isDischargeMed: false,
        quantity: "",
        refills: 0,
        sig: ""
      }
    ]);
  };

  const handleAddDischargeMedication = () => {
    setDischargeDetails({
      ...dischargeDetails,
      dischargeMedications: [
        ...dischargeDetails.dischargeMedications,
        {
          id: Date.now(),
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          quantity: "",
          refills: 0,
          dispensedAtDischarge: true
        }
      ]
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleDischargeMedicationChange = (index, field, value) => {
    const updated = [...dischargeDetails.dischargeMedications];
    updated[index][field] = value;
    setDischargeDetails({
      ...dischargeDetails,
      dischargeMedications: updated
    });
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleRemoveDischargeMedication = (index) => {
    const updated = dischargeDetails.dischargeMedications.filter((_, i) => i !== index);
    setDischargeDetails({
      ...dischargeDetails,
      dischargeMedications: updated
    });
  };

  // Send to pharmacy
  const handleSendToPharmacy = async () => {
    try {
      setLoading(true);
      
      if (medications.length === 0) {
        alert("Please add at least one medication");
        return;
      }

      if (!signature.isSigned) {
        setShowSignatureModal(true);
        return;
      }

      const response = await api.post("/pharmacy/prescribe", {
        patientId: currentPatient.patient.id,
        visitId: currentPatient.visit_id,
        medications: medications.map(med => ({
          ...med,
          prescribedAt: new Date().toISOString(),
          doctorSignature: signature.signatureData,
          licenseNumber: signature.licenseNumber
        })),
        prescribedBy: user.id
      });

      if (response.data.success) {
        setShowPharmacyModal(false);
        alert("💊 Prescriptions sent to pharmacy. Waiting for pharmacy response...");
      }
    } catch (err) {
      console.error("Error sending to pharmacy:", err);
      alert("Error sending to pharmacy");
    } finally {
      setLoading(false);
    }
  };

  // ============ SIGNATURE HANDLING WITH CANVAS ============
  const handleSignature = () => {
    if (signatureInput.type === "draw") {
      if (!canvasRef.current) {
        alert("Please draw your signature");
        return;
      }
      
      // Convert canvas to data URL
      const signatureDataURL = canvasRef.current.toDataURL('image/png');
      
      if (signatureDataURL === canvasRef.current.toDataURL()) {
        // Check if canvas is empty (all white)
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const isCanvasEmpty = !pixelData.some(pixel => pixel !== 255); // Check if any non-white pixel
        
        if (isCanvasEmpty) {
          alert("Please draw your signature");
          return;
        }
      }

      if (!signatureInput.licenseNumber) {
        alert("Please enter your license number");
        return;
      }

      setSignature({
        isSigned: true,
        signatureData: signatureDataURL,
        signatureDate: new Date().toISOString(),
        signatureType: "draw",
        licenseNumber: signatureInput.licenseNumber
      });
      setShowSignatureModal(false);
    } else if (signatureInput.type === "typed") {
      if (!signatureInput.typedName) {
        alert("Please enter your name for signature");
        return;
      }
      if (!signatureInput.licenseNumber) {
        alert("Please enter your license number");
        return;
      }
      
      setSignature({
        isSigned: true,
        signatureData: {
          name: signatureInput.typedName,
          license: signatureInput.licenseNumber,
          timestamp: new Date().toISOString()
        },
        signatureDate: new Date().toISOString(),
        signatureType: "typed",
        licenseNumber: signatureInput.licenseNumber
      });
      setShowSignatureModal(false);
    }
  };

  // ============ COMPLETE CONSULTATION ============
  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!currentPatient) return;

    if (!signature.isSigned) {
      alert("Please add your digital signature before completing consultation");
      setShowSignatureModal(true);
      return;
    }

    try {
      setLoading(true);
      
      let warningMessage = [];
      
      if (consultation.disposition === 'admit') {
        const pendingLabs = Object.values(labTests).some(test => test.ordered && test.status === 'pending');
        const pendingRadiology = Object.values(radiologyTests).some(test => test.ordered && test.status === 'pending');
        const pendingPharmacy = medications.some(med => !medicationResponses[med.id]);
        
        if (pendingLabs) warningMessage.push("- Lab tests are still pending");
        if (pendingRadiology) warningMessage.push("- Radiology reports/images are still pending");
        if (pendingPharmacy) warningMessage.push("- Pharmacy responses are still pending");
      }
      
      if (consultation.disposition === 'discharge') {
        const pendingLabs = Object.values(labTests).some(test => test.ordered && test.status === 'pending');
        const pendingRadiology = Object.values(radiologyTests).some(test => test.ordered && test.status === 'pending');
        
        if (pendingLabs) warningMessage.push("- Lab tests are still pending");
        if (pendingRadiology) warningMessage.push("- Radiology reports/images are still pending");
      }
      
      if (warningMessage.length > 0) {
        const confirm = window.confirm(
          "⚠️ The following are still pending:\n" + 
          warningMessage.join('\n') + 
          "\n\nComplete consultation anyway?"
        );
        if (!confirm) return;
      }

      const consultationData = {
        visitId: currentPatient.visit_id,
        patientId: currentPatient.patient.id,
        diagnosis: consultation.diagnosis,
        notes: consultation.notes,
        disposition: consultation.disposition,
        doctorSignature: signature.signatureData,
        licenseNumber: signature.licenseNumber,
        signatureDate: signature.signatureDate,
        signatureType: signature.signatureType,
        
        labTests: Object.entries(labTests)
          .filter(([_, value]) => value.ordered)
          .map(([key, value]) => ({
            test: key,
            orderedAt: value.orderedAt,
            results: value.results,
            status: value.status,
            completedAt: value.completedAt
          })),
        
        medications: medications.map(med => ({
          ...med,
          pharmacyResponse: medicationResponses[med.id] || null
        })),
        
        radiologyTests: Object.entries(radiologyTests)
          .filter(([_, value]) => value.ordered)
          .map(([key, value]) => ({
            test: key,
            orderedAt: value.orderedAt,
            results: value.results,
            images: value.images,
            status: value.status,
            bodyPart: value.bodyPart,
            completedAt: value.completedAt
          }))
      };

      if (consultation.disposition === 'admit') {
        consultationData.admission = admissionDetails;
      } else if (consultation.disposition === 'refer') {
        consultationData.referral = referralDetails;
      } else if (consultation.disposition === 'discharge') {
        consultationData.discharge = {
          ...dischargeDetails,
          medicationsGiven: dischargeDetails.dischargeMedications
        };
      }

      const response = await api.post("/doctor/complete", consultationData);

      if (response.data.success) {
        alert(`✅ Consultation completed. Patient ${consultation.disposition === 'admit' ? 'admitted' : 
                                                  consultation.disposition === 'refer' ? 'referred' : 'discharged'} successfully`);
        
        // Refresh the assigned patients list
        await fetchAssignedPatients();
        
        setCurrentPatient(null);
        resetPatientStates();
        setActiveTab("assigned");
      }
    } catch (err) {
      console.error("Error completing consultation:", err);
      alert("Error completing consultation");
    } finally {
      setLoading(false);
    }
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

  const getFullName = (patient) => {
    if (!patient) return 'N/A';
    const names = [
      patient.first_name || patient.firstName || '',
      patient.middle_name || patient.middleName || '',
      patient.last_name || patient.lastName || ''
    ].filter(Boolean);
    return names.join(' ') || patient.name || 'Unknown';
  };

  const hasPendingOrders = () => {
    if (consultation.disposition === 'discharge') return false;
    const pendingLabs = Object.values(labTests).some(t => t.ordered && t.status === 'pending');
    const pendingRadiology = Object.values(radiologyTests).some(t => t.ordered && t.status === 'pending');
    const pendingPharmacy = medications.some(med => !medicationResponses[med.id]);
    return pendingLabs || pendingRadiology || pendingPharmacy;
  };

  // Check if patient is discharged (for visual identification)
  const isPatientDischarged = (patientId) => {
    return completedPatients.includes(patientId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-blue-400 to-indigo-700 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl`}>
        {/* Sidebar Header with Logo */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-bold text-xl">MediQueue</span>
              </div>
            ) : (
              <svg className="w-8 h-8 text-blue-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Doctor Info in Sidebar */}
        <div className="p-4 border-b border-blue-700">
          {!sidebarCollapsed ? (
            <div>
              <p className="text-sm text-blue-200">Welcome back,</p>
              <p className="font-semibold">Dr. {user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-blue-300 mt-1">{hospitalInfo?.hospital_name}</p>
              <p className="text-xs text-blue-300">{hospitalInfo?.service_name}</p>
              {signature.isSigned && (
                <div className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded inline-block">
                  {signature.signatureType === 'draw' ? '✍️ Signed' : '✓ Signed'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-lg font-bold">{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
              </div>
              {signature.isSigned && (
                <div className="mt-1 w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("queue")}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                  activeTab === "queue" ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {!sidebarCollapsed && (
                  <>
                    <span>Waiting Queue</span>
                    {queue.length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {queue.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("assigned")}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                  activeTab === "assigned" ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {!sidebarCollapsed && (
                  <>
                    <span>My Patients</span>
                    {assignedPatients.length > 0 && (
                      <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {assignedPatients.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
            {currentPatient && (
              <li>
                <button
                  onClick={() => setActiveTab("consultation")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                    activeTab === "consultation" ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {!sidebarCollapsed && (
                    <>
                      <span>Active Consultation</span>
                      {hasPendingOrders() && (
                        <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      )}
                    </>
                  )}
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Signature Button */}
        {!signature.isSigned && (
          <div className="px-4 mb-2">
            <button
              onClick={() => setShowSignatureModal(true)}
              className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Add Signature</span>
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeTab === "queue" && "Waiting Queue"}
                  {activeTab === "assigned" && "My Patients"}
                  {activeTab === "consultation" && "Active Consultation"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {hospitalInfo?.hospital_name} - {hospitalInfo?.service_name || 'OPD'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">ID: {user?.hospital_id}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-sm text-yellow-700">Queue: {queue.length}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-green-50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-sm text-green-700">My Patients: {assignedPatients.length}</span>
                  </div>
                </div>

                {signature.isSigned && (
                  <div className="hidden lg:flex items-center space-x-1 bg-green-50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-sm text-green-700">
                      {signature.signatureType === 'draw' ? '✍️ Signed' : '✓ Signed'}
                    </span>
                  </div>
                )}

                <div className="hidden lg:block text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <span>Dashboard</span>
              <span>/</span>
              <span className="capitalize text-gray-700 font-medium">{activeTab}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* Queue Tab */}
          {activeTab === "queue" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Patients Waiting in OPD</h2>
              
              {queue.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-500">No patients waiting</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queue.map((item) => (
                    <div key={item.queue_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-sm text-gray-500">
                              Position: #{item.position}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Patient Name</p>
                              <p className="font-semibold">{item.patient?.name || getFullName(item.patient)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Card Number</p>
                              <p className="font-mono">{item.patient?.card_number}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">Triage Results</p>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Temp:</span>{' '}
                                <span className="font-semibold">{item.triage_record?.temperature || 'N/A'}°C</span>
                              </div>
                              <div>
                                <span className="text-gray-500">HR:</span>{' '}
                                <span className="font-semibold">{item.triage_record?.heart_rate || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">BP:</span>{' '}
                                <span className="font-semibold">{item.triage_record?.blood_pressure || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Pain:</span>{' '}
                                <span className="font-semibold">{item.triage_record?.pain_level || 'N/A'}/10</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              Complaint: {item.complaint}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAssignPatient(item)}
                          disabled={loading}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ ASSIGNED PATIENTS TAB - NOW SHOWS DISCHARGED PATIENTS ============ */}
          {activeTab === "assigned" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">My Patients</h2>
              
              {assignedPatients.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No patients assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedPatients.map((item) => {
                    // Check if patient is discharged
                    const discharged = item.is_discharged === true || 
                                      item.status === 'discharged' || 
                                      item.status === 'completed';
                    
                    return (
                      <div 
                        key={item.visit_id} 
                        className={`border rounded-lg p-4 transition-all ${
                          discharged 
                            ? 'border-red-300 bg-red-50 relative overflow-hidden' 
                            : 'hover:shadow-md'
                        }`}
                      >
                        {/* Discharged Overlay Indicators */}
                        {discharged && (
                          <>
                            {/* Bold diagonal red lines */}
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 transform -rotate-12 origin-center"></div>
                              <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 transform rotate-12 origin-center"></div>
                            </div>
                            
                            {/* Red border glow */}
                            <div className="absolute inset-0 border-4 border-red-500 rounded-lg opacity-40 pointer-events-none"></div>
                            
                            {/* DISCHARGED stamp */}
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transform rotate-12 shadow-lg z-10">
                              DISCHARGED
                            </div>
                          </>
                        )}
                        
                        {/* Header */}
                        <div className={`${discharged ? 'bg-red-100' : 'bg-blue-50'} -m-4 mb-4 p-3 rounded-t-lg border-b ${
                          discharged ? 'border-red-300' : ''
                        }`}>
                          <div className="flex justify-between items-center">
                            <p className={`text-sm font-semibold ${
                              discharged ? 'text-red-800 line-through' : 'text-blue-800'
                            }`}>
                              Assigned: {formatDate(item.assigned_at)}
                              {discharged && ' (Discharged)'}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.triage?.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              item.triage?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.triage?.priority || 'medium'}
                            </span>
                          </div>
                          {discharged && item.discharged_at && (
                            <p className="text-xs text-red-600 mt-1">
                              Discharged: {formatDate(item.discharged_at)}
                            </p>
                          )}
                        </div>

                        {/* Patient Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Patient Information</h3>
                            <div className={`${discharged ? 'bg-red-50' : 'bg-gray-50'} p-3 rounded ${
                              discharged ? 'opacity-90' : ''
                            }`}>
                              <p className={`text-lg font-bold ${discharged ? 'line-through text-red-700' : 'text-gray-800'}`}>
                                {item.patient?.full_name || getFullName(item.patient)}
                              </p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="text-gray-500">Card:</span>{' '}
                                  <span className={`font-mono ${discharged ? 'line-through' : ''}`}>
                                    {item.patient?.card_number}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-gray-500">Age/Gender:</span>{' '}
                                  <span className={discharged ? 'line-through' : ''}>
                                    {item.patient?.age} yrs / {item.patient?.gender}
                                  </span>
                                </p>
                                {item.diagnosis && discharged && (
                                  <p className="text-sm mt-2">
                                    <span className="text-gray-500">Diagnosis:</span>{' '}
                                    <span className="text-green-600 font-medium">{item.diagnosis}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Triage Results</h3>
                            {item.triage && (
                              <div className={`${discharged ? 'bg-red-50' : 'bg-gray-50'} p-3 rounded ${
                                discharged ? 'opacity-90' : ''
                              }`}>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className={discharged ? 'line-through' : ''}>
                                    Temp: {item.triage.temperature || 'N/A'}°C
                                  </div>
                                  <div className={discharged ? 'line-through' : ''}>
                                    HR: {item.triage.heart_rate || 'N/A'} bpm
                                  </div>
                                  <div className={discharged ? 'line-through' : ''}>
                                    BP: {item.triage.blood_pressure || 'N/A'}
                                  </div>
                                  <div className={discharged ? 'line-through' : ''}>
                                    Pain: {item.triage.pain_level || 'N/A'}/10
                                  </div>
                                </div>
                                <p className={`text-sm mt-2 ${discharged ? 'line-through' : ''}`}>
                                  <span className="text-gray-500">Complaint:</span>{' '}
                                  {item.triage.chief_complaint || 'N/A'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => {
                              setCurrentPatient(item);
                              setActiveTab("consultation");
                            }}
                            disabled={discharged}
                            className={`px-4 py-2 rounded-lg ${
                              discharged 
                                ? 'bg-gray-400 cursor-not-allowed text-white opacity-50' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {discharged ? '✓ Consultation Completed' : 'Start Consultation'}
                          </button>
                        </div>

                        {/* Discharged message */}
                        {discharged && (
                          <div className="mt-2 text-right">
                            <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded">
                              ⚕️ This patient has been discharged
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Consultation Tab */}
          {activeTab === "consultation" && currentPatient && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Consultation</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-bold text-xl">{getFullName(currentPatient.patient)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Card Number</p>
                    <p className="font-mono font-bold text-xl bg-white px-4 py-2 rounded-lg border">
                      {currentPatient.patient?.card_number}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Age / Gender</p>
                    <p className="font-bold">{currentPatient.patient?.age} yrs / {currentPatient.patient?.gender}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-bold">{currentPatient.patient?.phone}</p>
                  </div>
                </div>

                {currentPatient.triage && (
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Triage Assessment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="font-semibold">{currentPatient.triage.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Heart Rate</p>
                        <p className="font-semibold">{currentPatient.triage.heart_rate} bpm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Blood Pressure</p>
                        <p className="font-semibold">{currentPatient.triage.blood_pressure}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pain Level</p>
                        <p className="font-semibold">{currentPatient.triage.pain_level}/10</p>
                      </div>
                    </div>
                    <p className="text-sm mt-3 pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Chief Complaint:</span>{' '}
                      {currentPatient.triage.chief_complaint}
                    </p>
                  </div>
                )}
              </div>

              {!signature.isSigned && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-yellow-700">Digital signature required before completing consultation</span>
                  </div>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    Add Signature
                  </button>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Disposition
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setConsultation({...consultation, disposition: "discharge"})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      consultation.disposition === "discharge" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-gray-200 hover:border-green-200"
                    }`}
                  >
                    <div className="font-semibold">🏠 Discharge</div>
                    <div className="text-xs mt-1">Send patient home</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultation({...consultation, disposition: "admit"})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      consultation.disposition === "admit" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="font-semibold">🏥 Admit</div>
                    <div className="text-xs mt-1">Admit to hospital</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultation({...consultation, disposition: "refer"})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      consultation.disposition === "refer" 
                        ? "border-purple-500 bg-purple-50 text-purple-700" 
                        : "border-gray-200 hover:border-purple-200"
                    }`}
                  >
                    <div className="font-semibold">↗️ Refer</div>
                    <div className="text-xs mt-1">Refer to specialist</div>
                  </button>
                </div>
              </div>

              {consultation.disposition === "admit" && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Admission Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Ward</label>
                      <select
                        value={admissionDetails.ward}
                        onChange={(e) => setAdmissionDetails({...admissionDetails, ward: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select Ward</option>
                        <option value="general">General Ward</option>
                        <option value="icu">ICU</option>
                        <option value="surgical">Surgical Ward</option>
                        <option value="pediatric">Pediatric Ward</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Room/Bed</label>
                      <input
                        type="text"
                        value={admissionDetails.room}
                        onChange={(e) => setAdmissionDetails({...admissionDetails, room: e.target.value})}
                        placeholder="e.g., 201-A"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Expected Stay (days)</label>
                      <input
                        type="number"
                        value={admissionDetails.expectedStay}
                        onChange={(e) => setAdmissionDetails({...admissionDetails, expectedStay: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Admitting Doctor</label>
                      <input
                        type="text"
                        value={admissionDetails.admittingDoctor}
                        onChange={(e) => setAdmissionDetails({...admissionDetails, admittingDoctor: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Reason for Admission</label>
                      <textarea
                        value={admissionDetails.reason}
                        onChange={(e) => setAdmissionDetails({...admissionDetails, reason: e.target.value})}
                        rows="2"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {consultation.disposition === "refer" && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">Referral Details - Official Referral Form</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Referral Type *</label>
                      <select
                        value={referralDetails.referralType}
                        onChange={(e) => setReferralDetails({...referralDetails, referralType: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="specialist">Specialist (Within Hospital)</option>
                        <option value="department">Department (Within Hospital)</option>
                        <option value="external">External Facility</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Priority *</label>
                      <select
                        value={referralDetails.priority}
                        onChange={(e) => setReferralDetails({...referralDetails, priority: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="routine">Routine (24-48 hrs)</option>
                        <option value="urgent">Urgent (Within 6 hrs)</option>
                        <option value="emergency">Emergency (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  {referralDetails.referralType !== 'external' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Department *</label>
                          <select
                            value={referralDetails.department}
                            onChange={(e) => setReferralDetails({...referralDetails, department: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select Department</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="neurology">Neurology</option>
                            <option value="orthopedics">Orthopedics</option>
                            <option value="pediatrics">Pediatrics</option>
                            <option value="surgery">Surgery</option>
                            <option value="internal">Internal Medicine</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Specialist Name (if known)</label>
                          <input
                            type="text"
                            value={referralDetails.specialistName}
                            onChange={(e) => setReferralDetails({...referralDetails, specialistName: e.target.value})}
                            placeholder="Dr. Name"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {referralDetails.referralType === 'external' && (
                    <div className="space-y-4 border-t pt-4 mt-2">
                      <h4 className="font-medium text-purple-700">External Facility Information</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Facility Name *</label>
                          <input
                            type="text"
                            value={referralDetails.externalFacility}
                            onChange={(e) => setReferralDetails({...referralDetails, externalFacility: e.target.value})}
                            placeholder="e.g., St. Paul Hospital, Alert Hospital"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Facility Type</label>
                          <select
                            value={referralDetails.externalFacilityType}
                            onChange={(e) => setReferralDetails({...referralDetails, externalFacilityType: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="hospital">Hospital</option>
                            <option value="clinic">Specialized Clinic</option>
                            <option value="healthCenter">Health Center</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Receiving Doctor</label>
                          <input
                            type="text"
                            value={referralDetails.externalDoctor}
                            onChange={(e) => setReferralDetails({...referralDetails, externalDoctor: e.target.value})}
                            placeholder="Dr. Name (if known)"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Facility Address</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Region *</label>
                            <select
                              value={referralDetails.externalAddress.region}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, region: e.target.value}
                              })}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="">Select Region</option>
                              <option value="addis_ababa">Addis Ababa</option>
                              <option value="oromia">Oromia</option>
                              <option value="amhara">Amhara</option>
                              <option value="snnpr">SNNPR</option>
                              <option value="tigray">Tigray</option>
                              <option value="sidama">Sidama</option>
                              <option value="afar">Afar</option>
                              <option value="somali">Somali</option>
                              <option value="benishangul">Benishangul-Gumuz</option>
                              <option value="gambela">Gambela</option>
                              <option value="harari">Harari</option>
                              <option value="dire_dawa">Dire Dawa</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Zone *</label>
                            <input
                              type="text"
                              value={referralDetails.externalAddress.zone}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, zone: e.target.value}
                              })}
                              placeholder="e.g., North Gondar"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Woreda *</label>
                            <input
                              type="text"
                              value={referralDetails.externalAddress.woreda}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, woreda: e.target.value}
                              })}
                              placeholder="e.g., Woreda 03"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">City/Town</label>
                            <input
                              type="text"
                              value={referralDetails.externalAddress.city}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, city: e.target.value}
                              })}
                              placeholder="City name"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Kebele</label>
                            <input
                              type="text"
                              value={referralDetails.externalAddress.kebele}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, kebele: e.target.value}
                              })}
                              placeholder="Kebele number"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">House No.</label>
                            <input
                              type="text"
                              value={referralDetails.externalAddress.houseNumber}
                              onChange={(e) => setReferralDetails({
                                ...referralDetails, 
                                externalAddress: {...referralDetails.externalAddress, houseNumber: e.target.value}
                              })}
                              placeholder="Building/House number"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            value={referralDetails.externalAddress.phone}
                            onChange={(e) => setReferralDetails({
                              ...referralDetails, 
                              externalAddress: {...referralDetails.externalAddress, phone: e.target.value}
                            })}
                            placeholder="+251-XXX-XXXXXX"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Email</label>
                          <input
                            type="email"
                            value={referralDetails.externalAddress.email}
                            onChange={(e) => setReferralDetails({
                              ...referralDetails, 
                              externalAddress: {...referralDetails.externalAddress, email: e.target.value}
                            })}
                            placeholder="facility@example.com"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={referralDetails.externalContactPerson}
                            onChange={(e) => setReferralDetails({...referralDetails, externalContactPerson: e.target.value})}
                            placeholder="Person to contact"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            value={referralDetails.externalContactPhone}
                            onChange={(e) => setReferralDetails({...referralDetails, externalContactPhone: e.target.value})}
                            placeholder="Contact person's phone"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-xs text-gray-600 mb-1">Reason for Referral *</label>
                    <textarea
                      value={referralDetails.reason}
                      onChange={(e) => setReferralDetails({...referralDetails, reason: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Detailed reason for referral including clinical findings and suspected diagnosis..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs text-gray-600 mb-1">Additional Notes / Special Instructions</label>
                    <textarea
                      value={referralDetails.notes}
                      onChange={(e) => setReferralDetails({...referralDetails, notes: e.target.value})}
                      rows="2"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Any specific instructions for the receiving facility..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs text-gray-600 mb-1">Attach Referral Letter (Optional)</label>
                    <div className="flex items-center space-x-3">
                      <button className="px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                        Choose File
                      </button>
                      <span className="text-xs text-gray-500">PDF, DOC up to 5MB</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Referring Doctor</p>
                        <p className="font-medium">Dr. {user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500">License: {signature.licenseNumber || 'N/A'}</p>
                      </div>
                      {signature.isSigned && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Signed</p>
                          {signature.signatureType === 'draw' ? (
                            <img 
                              src={signature.signatureData} 
                              alt="Signature" 
                              className="h-8 mt-1"
                            />
                          ) : (
                            <p className="text-xs text-green-600">{signature.signatureData?.name}</p>
                          )}
                          <p className="text-xs text-gray-500">{new Date(signature.signatureDate).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {consultation.disposition === "discharge" && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Discharge Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Discharge Summary *</label>
                      <textarea
                        value={dischargeDetails.dischargeSummary}
                        onChange={(e) => setDischargeDetails({...dischargeDetails, dischargeSummary: e.target.value})}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Summary of treatment, condition at discharge, and recommendations..."
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Medications Given at Discharge</label>
                        <button
                          onClick={handleAddDischargeMedication}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          + Add Medication
                        </button>
                      </div>
                      
                      {dischargeDetails.dischargeMedications.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No discharge medications added</p>
                      ) : (
                        <div className="space-y-2">
                          {dischargeDetails.dischargeMedications.map((med, index) => (
                            <div key={med.id} className="bg-white p-2 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-5 gap-2 text-sm">
                                  <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => handleDischargeMedicationChange(index, 'name', e.target.value)}
                                    placeholder="Medication"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={med.dosage}
                                    onChange={(e) => handleDischargeMedicationChange(index, 'dosage', e.target.value)}
                                    placeholder="Dosage"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={med.frequency}
                                    onChange={(e) => handleDischargeMedicationChange(index, 'frequency', e.target.value)}
                                    placeholder="Frequency"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={med.duration}
                                    onChange={(e) => handleDischargeMedicationChange(index, 'duration', e.target.value)}
                                    placeholder="Duration"
                                    className="px-2 py-1 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={med.quantity}
                                    onChange={(e) => handleDischargeMedicationChange(index, 'quantity', e.target.value)}
                                    placeholder="Quantity"
                                    className="px-2 py-1 border rounded"
                                  />
                                </div>
                                <button
                                  onClick={() => handleRemoveDischargeMedication(index)}
                                  className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                              <input
                                type="text"
                                value={med.instructions}
                                onChange={(e) => handleDischargeMedicationChange(index, 'instructions', e.target.value)}
                                placeholder="Instructions"
                                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">These medications are dispensed at discharge - no pharmacy response needed</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dischargeDetails.followUpRequired}
                        onChange={(e) => setDischargeDetails({...dischargeDetails, followUpRequired: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-700">Follow-up Required</label>
                    </div>
                    
                    {dischargeDetails.followUpRequired && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Follow-up Date</label>
                          <input
                            type="date"
                            value={dischargeDetails.followUpDate}
                            onChange={(e) => setDischargeDetails({...dischargeDetails, followUpDate: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Follow-up With</label>
                          <input
                            type="text"
                            value={dischargeDetails.followUpWith}
                            onChange={(e) => setDischargeDetails({...dischargeDetails, followUpWith: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Dr. / Department"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Discharging Doctor</p>
                          <p className="font-medium">Dr. {user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-gray-500">License: {signature.licenseNumber || 'N/A'}</p>
                        </div>
                        {signature.isSigned && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Signed</p>
                            {signature.signatureType === 'draw' ? (
                              <img 
                                src={signature.signatureData} 
                                alt="Signature" 
                                className="h-8 mt-1"
                              />
                            ) : (
                              <p className="text-xs text-green-600">{signature.signatureData?.name}</p>
                            )}
                            <p className="text-xs text-gray-500">{new Date(signature.signatureDate).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">🔬 Laboratory Tests</h3>
                  <button
                    onClick={() => setShowLabModal(true)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Order Tests
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(labTests).map(([test, data]) => (
                    <div key={test} className={`p-3 rounded-lg ${
                      data.ordered ? (
                        data.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'
                      ) : 'bg-gray-50'
                    }`}>
                      <p className="font-medium capitalize">{test} Test</p>
                      {data.ordered ? (
                        <div className="mt-2 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800 animate-pulse'
                          }`}>
                            {data.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                          </span>
                          {data.results ? (
                            <div className="mt-2 p-2 bg-white rounded">
                              <p className="font-medium text-xs">Results:</p>
                              <pre className="text-xs mt-1 overflow-auto max-h-24">
                                {JSON.stringify(data.results, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 mt-2">Ordered: {new Date(data.orderedAt).toLocaleTimeString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">Not ordered</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">🖼️ Radiology / Imaging</h3>
                  <button
                    onClick={() => setShowRadiologyModal(true)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Order Imaging
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(radiologyTests).map(([test, data]) => (
                    <div key={test} className={`p-3 rounded-lg ${
                      data.ordered ? (
                        data.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'
                      ) : 'bg-gray-50'
                    }`}>
                      <p className="font-medium uppercase">{test}</p>
                      {data.ordered ? (
                        <div className="mt-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800 animate-pulse'
                            }`}>
                              {data.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                            </span>
                            {data.bodyPart && (
                              <span className="text-xs text-gray-600">Area: {data.bodyPart}</span>
                            )}
                          </div>
                          {data.results ? (
                            <div className="mt-2 p-2 bg-white rounded">
                              <p className="font-medium text-xs">Report:</p>
                              <p className="text-xs mt-1">{data.results}</p>
                              {data.images && (
                                <div className="mt-2">
                                  <p className="text-xs text-blue-600">📷 Images available:</p>
                                  <div className="flex space-x-2 mt-1">
                                    {data.images.map((img, i) => (
                                      <img 
                                        key={i} 
                                        src={img} 
                                        alt={`${test} ${i+1}`} 
                                        className="w-16 h-16 object-cover rounded border"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 mt-2">Ordered: {new Date(data.orderedAt).toLocaleTimeString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">Not ordered</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {consultation.disposition === 'admit' && (
                <div className="mb-6 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">💊 Medications (Requires Pharmacy)</h3>
                    <button
                      onClick={() => setShowPharmacyModal(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Add Medications
                    </button>
                  </div>

                  {medications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No medications prescribed</p>
                  ) : (
                    <div className="space-y-3">
                      {medications.map((med, index) => (
                        <div key={med.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold">{med.name || 'Unnamed Medication'}</p>
                                {medicationResponses[med.id] ? (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    medicationResponses[med.id].status === 'dispensed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {medicationResponses[med.id].status}
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 animate-pulse">
                                    ⏳ Pending
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                                <div>Dosage: {med.dosage || 'N/A'}</div>
                                <div>Frequency: {med.frequency || 'N/A'}</div>
                                <div>Duration: {med.duration || 'N/A'}</div>
                                <div>Route: {med.route || 'oral'}</div>
                              </div>
                              {med.instructions && (
                                <p className="text-sm text-gray-600 mt-1">Instructions: {med.instructions}</p>
                              )}
                              {medicationResponses[med.id]?.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Pharmacy note: {medicationResponses[med.id].notes}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveMedication(index)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleCompleteConsultation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={consultation.diagnosis}
                    onChange={(e) => setConsultation({...consultation, diagnosis: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    value={consultation.notes}
                    onChange={(e) => setConsultation({...consultation, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about the patient..."
                  />
                </div>

                {signature.isSigned && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {signature.signatureType === 'draw' ? (
                          <img src={signature.signatureData} alt="Signature" className="h-8" />
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className="text-sm text-green-700">
                          Signed by Dr. {user?.first_name} {user?.last_name} on {new Date(signature.signatureDate).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSignatureModal(true)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPatient(null);
                      setActiveTab("assigned");
                    }}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !consultation.diagnosis || !signature.isSigned}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete &</span>
                        <span className="font-semibold">
                          {consultation.disposition === 'admit' ? 'Admit Patient' :
                           consultation.disposition === 'refer' ? 'Send Referral' :
                           'Discharge Patient'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Modals - Lab, Radiology, Pharmacy, Signature */}
      {showLabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">🔬 Order Laboratory Tests</h3>
            <p className="text-sm text-gray-600 mb-4">Patient: {getFullName(currentPatient?.patient)}</p>
            <div className="space-y-3">
              {Object.entries(labTests).map(([test, data]) => (
                <label key={test} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={data.required}
                    onChange={(e) => setLabTests({
                      ...labTests,
                      [test]: { ...data, required: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{test} Test</p>
                    <p className="text-sm text-gray-500">
                      {test === 'blood' && 'CBC, Chemistry, etc.'}
                      {test === 'urine' && 'Urinalysis, Culture'}
                      {test === 'stool' && 'Stool exam, Culture'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLabModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderLabTests}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Order Tests
              </button>
            </div>
          </div>
        </div>
      )}

      {showRadiologyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">🖼️ Order Radiology/Imaging</h3>
            <p className="text-sm text-gray-600 mb-4">Patient: {getFullName(currentPatient?.patient)}</p>
            <div className="space-y-4">
              {Object.entries(radiologyTests).map(([test, data]) => (
                <div key={test} className="border rounded-lg p-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.required}
                      onChange={(e) => setRadiologyTests({
                        ...radiologyTests,
                        [test]: { ...data, required: e.target.checked }
                      })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="font-medium uppercase">{test}</span>
                  </label>
                  {data.required && (
                    <div className="mt-2 ml-7">
                      <label className="block text-xs text-gray-500 mb-1">Body Part/Area</label>
                      <input
                        type="text"
                        value={data.bodyPart}
                        onChange={(e) => setRadiologyTests({
                          ...radiologyTests,
                          [test]: { ...data, bodyPart: e.target.value }
                        })}
                        placeholder="e.g., Chest, Lumbar spine, Abdomen"
                        className="w-full px-3 py-2 text-sm border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRadiologyModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderRadiology}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Order Imaging
              </button>
            </div>
          </div>
        </div>
      )}

      {showPharmacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">💊 Prescribe Medications (Requires Pharmacy)</h3>
            <p className="text-sm text-gray-600 mb-4">Patient: {getFullName(currentPatient?.patient)}</p>
            
            {medications.map((med, index) => (
              <div key={med.id} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Medication {index + 1}</h4>
                  <button
                    onClick={() => handleRemoveMedication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Medication Name *</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Amoxicillin"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dosage *</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Frequency *</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Duration *</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Route</label>
                    <select
                      value={med.route}
                      onChange={(e) => handleMedicationChange(index, 'route', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="oral">Oral</option>
                      <option value="iv">IV</option>
                      <option value="im">IM</option>
                      <option value="topical">Topical</option>
                      <option value="sublingual">Sublingual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="text"
                      value={med.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., 30 tablets"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Special Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Take with food"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddMedication}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              + Add Another Medication
            </button>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPharmacyModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToPharmacy}
                disabled={loading || medications.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Send to Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">✍️ Digital Signature</h3>
            <p className="text-sm text-gray-600 mb-4">Draw your signature below to authorize this consultation</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="draw"
                      checked={signatureInput.type === 'draw'}
                      onChange={(e) => setSignatureInput({...signatureInput, type: e.target.value})}
                      className="mr-2"
                    />
                    Draw Signature
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="typed"
                      checked={signatureInput.type === 'typed'}
                      onChange={(e) => setSignatureInput({...signatureInput, type: e.target.value})}
                      className="mr-2"
                    />
                    Type Signature
                  </label>
                </div>
              </div>

              {signatureInput.type === 'draw' ? (
                <>
                  <div className="border-2 border-gray-300 rounded-lg bg-white">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-48 cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      Clear
                    </button>
                    <p className="text-xs text-gray-500">Draw your signature using mouse or touch</p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type Your Full Name
                  </label>
                  <input
                    type="text"
                    value={signatureInput.typedName}
                    onChange={(e) => setSignatureInput({...signatureInput, typedName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Dr. John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number *
                </label>
                <input
                  type="text"
                  value={signatureInput.licenseNumber}
                  onChange={(e) => setSignatureInput({...signatureInput, licenseNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="LIC-12345"
                />
              </div>

              <p className="text-xs text-gray-500">
                By adding your signature, you confirm that you have personally examined the patient and the information provided is accurate.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignature}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;