// components/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Login attempt for email:", email);
      
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      console.log("✅ Login response:", res.data);

      if (res.data.success && res.data.token) {
        // Store token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        if (setAdmin) {
          setAdmin(res.data.user);
        }
        
        console.log("✅ Token stored");
        console.log("✅ User data:", res.data.user);

        // Get user role and department from response
        const userRole = res.data.user?.role;
        const userDepartment = res.data.user?.department;
        
        console.log("User role:", userRole);
        console.log("User department:", userDepartment);

        // ============= ADMIN ROUTES (based on role) =============
        if (userRole === 'federal') {
          console.log("➡️ Navigating to federal dashboard");
          navigate("/federal-dashboard", { replace: true });
        } 
        else if (userRole === 'regional') {
          console.log("➡️ Navigating to regional dashboard");
          navigate("/regional-dashboard", { replace: true });
        } 
        else if (userRole === 'zone') {
          console.log("➡️ Navigating to zone dashboard");
          navigate("/zone-dashboard", { replace: true });
        } 
        else if (userRole === 'woreda') {
          console.log("➡️ Navigating to woreda dashboard");
          navigate("/woreda-dashboard", { replace: true });
        } 
        else if (userRole === 'kebele') {
          console.log("➡️ Navigating to kebele dashboard");
          navigate("/kebele-dashboard", { replace: true });
        } 
        else if (userRole === 'hospital') {
          console.log("➡️ Navigating to hospital dashboard");
          navigate("/hospital-dashboard", { replace: true });
        }
        
        // ============= USER ROUTES (based on DEPARTMENT) =============
        else if (userDepartment === 'Doctor') {
          console.log("➡️ Navigating to doctor dashboard");
          navigate("/doctor-dashboard", { replace: true });
        }
        else if (userDepartment === 'Nurse') {
          console.log("➡️ Navigating to nurse dashboard");
          navigate("/nurse-dashboard", { replace: true });
        }
        else if (userDepartment === 'Midwifery') {
          console.log("➡️ Navigating to midwife dashboard");
          navigate("/midwife-dashboard", { replace: true });
        }
        else if (userDepartment === 'Radiology') {
          console.log("➡️ Navigating to radiology dashboard");
          navigate("/radiology-dashboard", { replace: true });
        }
        else if (userDepartment === 'Pharmacy') {
          console.log("➡️ Navigating to pharmacy dashboard");
          navigate("/pharmacy-dashboard", { replace: true });
        }
        else if (userDepartment === 'Laboratory') {
          console.log("➡️ Navigating to laboratory dashboard");
          navigate("/laboratory-dashboard", { replace: true });
        }
        else if (userDepartment === 'card office') {
          console.log("➡️ Navigating to card office dashboard");
          navigate("/card-office-dashboard", { replace: true });
        }
        else if (userDepartment === 'triage') {
          console.log("➡️ Navigating to triage dashboard");
          navigate("/triage-dashboard", { replace: true });
        }
        else if (userDepartment === 'bed management') {
          console.log("➡️ Navigating to bed management dashboard");
          navigate("/bed-management-dashboard", { replace: true });
        }
        else if (userDepartment === 'human resource') {
          console.log("➡️ Navigating to HR dashboard");
          navigate("/hr-dashboard", { replace: true });
        }
        else {
          console.log("⚠️ Unknown department:", userDepartment);
          setError("No dashboard configured for your department");
        }
      } else {
        setError(res.data.message || "Login failed");
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Connection timeout. Server may be down.");
      } else if (err.response) {
        // Server responded with error
        console.error("Error response:", err.response.data);
        
        if (err.response.status === 401) {
          setError("❌ Invalid email or password. Please try again.");
        } else {
          setError(err.response.data?.message || "Login failed");
        }
      } else if (err.request) {
        // Request made but no response
        setError("❌ Cannot connect to server. Make sure backend is running on port 5000.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to set demo credentials for testing
  const setDemoCredentials = (type) => {
    const demos = {
      // Admin accounts
      federal: { email: 'federal@hha.gov', password: 'admin123' },
      regional: { email: 'regional@hha.gov', password: 'region123' },
      zone: { email: 'zone@hha.gov', password: 'zone123' },
      woreda: { email: 'woreda@hha.gov', password: 'woreda123' },
      kebele: { email: 'kebele@hha.gov', password: 'kebele123' },
      hospital: { email: 'agerneshdereje34@gmail.com', password: '3434' },
      
      // Department staff (Users table)
      doctor: { email: 'doctor@hospital.com', password: 'password123' },
      nurse: { email: 'nurse@hospital.com', password: 'password123' },
      midwife: { email: 'midwife@hospital.com', password: 'password123' },
      radiology: { email: 'radiology@hospital.com', password: 'password123' },
      pharmacy: { email: 'pharmacy@hospital.com', password: 'password123' },
      laboratory: { email: 'lab@hospital.com', password: 'password123' },
      card_office: { email: 'agerneshdereje36@gmail.com', password: 'password123' },
      triage: { email: 'triage@hospital.com', password: 'password123' },
      bed_management: { email: 'bed@hospital.com', password: 'password123' },
      hr: { email: 'hr@hospital.com', password: 'password123' }
    };

    if (demos[type]) {
      setEmail(demos[type].email);
      setPassword(demos[type].password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Hospital Management System
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo credentials for testing */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2 text-center font-semibold">Demo Accounts:</p>
          
          <p className="text-xs text-gray-500 mt-2 mb-1">Admins:</p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <button 
              onClick={() => setDemoCredentials('hospital')}
              className="bg-purple-100 p-2 rounded hover:bg-purple-200"
            >
              Hospital Admin
            </button>
            <button 
              onClick={() => setDemoCredentials('kebele')}
              className="bg-purple-100 p-2 rounded hover:bg-purple-200"
            >
              Kebele Admin
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 mb-1">Hospital Staff (Users table):</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button 
              onClick={() => setDemoCredentials('doctor')}
              className="bg-green-100 p-2 rounded hover:bg-green-200"
            >
              Doctor
            </button>
            <button 
              onClick={() => setDemoCredentials('nurse')}
              className="bg-green-100 p-2 rounded hover:bg-green-200"
            >
              Nurse
            </button>
            <button 
              onClick={() => setDemoCredentials('midwife')}
              className="bg-green-100 p-2 rounded hover:bg-green-200"
            >
              Midwife
            </button>
            <button 
              onClick={() => setDemoCredentials('card_office')}
              className="bg-blue-100 p-2 rounded hover:bg-blue-200"
            >
              Card Office
            </button>
            <button 
              onClick={() => setDemoCredentials('triage')}
              className="bg-blue-100 p-2 rounded hover:bg-blue-200"
            >
              Triage
            </button>
            <button 
              onClick={() => setDemoCredentials('bed_management')}
              className="bg-blue-100 p-2 rounded hover:bg-blue-200"
            >
              Bed Mgmt
            </button>
            <button 
              onClick={() => setDemoCredentials('hr')}
              className="bg-yellow-100 p-2 rounded hover:bg-yellow-200"
            >
              HR
            </button>
            <button 
              onClick={() => setDemoCredentials('pharmacy')}
              className="bg-yellow-100 p-2 rounded hover:bg-yellow-200"
            >
              Pharmacy
            </button>
            <button 
              onClick={() => setDemoCredentials('laboratory')}
              className="bg-yellow-100 p-2 rounded hover:bg-yellow-200"
            >
              Lab
            </button>
            <button 
              onClick={() => setDemoCredentials('radiology')}
              className="bg-red-100 p-2 rounded hover:bg-red-200"
            >
              Radiology
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Users are redirected based on their DEPARTMENT
        </p>
        <p className="text-xs text-center text-gray-400 mt-1">
          Default password for all staff: password123
        </p>
      </div>
    </div>
  );
}

export default Login;