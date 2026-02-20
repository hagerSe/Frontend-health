import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FaUserCircle, FaLock } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      try {
        data = await authService.adminLogin({ email, password });
      } catch (adminErr) {
        data = await authService.userLogin({ email, password });
      }

      if (data.admin) {
        const role = data.admin.role.toLowerCase();
        if (role === 'federal_admin') navigate('/FederalAdmin');
        else if (role === 'regional_admin') navigate('/RegionalAdmin');
        else if (role === 'zone_admin') navigate('/ZoneAdmin');
        else if (role === 'woreda_admin') navigate('/WoredaAdmin');
        else if (role === 'kebele_admin') navigate('/KebeleAdmin');
        else if (role === 'hospital_admin') navigate('/HospitalAdmin');
        else setError('Admin role not recognized');
      } else if (data.user) {
        const department = data.user.department.toLowerCase();
        if (department === 'doctor') navigate('/DoctorDashboard');
        else if (department === 'nurse') navigate('/NurseDashboard');
        else if (department === 'radiology') navigate('/RadiologyDashboard');
        else if (department === 'pharmacy') navigate('/PharmacyDashboard');
        else if (department === 'midwife') navigate('/MidwifeDashboard');
        else if (department === 'laboratory') navigate('/LabDashboard');
        else if (department === 'human resource') navigate('/HRDashboard');
        else if (department === 'card office') navigate('/card-office');
        else setError('Department dashboard not found');
      } else {
        setError('Login failed: no admin or user found');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-400 rounded-xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-blue-600 text-6xl mb-2" />
          <h1 className="text-2xl font-bold text-slate-800 text-center">National Health Login</h1>
          <p className="text-sm text-gray-500 text-center">Admin & User Access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="relative mb-6">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            placeholder=" "
          />
          <label htmlFor="email" className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">
            Email Address
          </label>
          <FaUserCircle className="absolute left-3 top-3.5 text-gray-500" />
        </div>

        <div className="relative mb-6">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="peer w-full border border-gray-300 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            placeholder=" "
          />
          <label htmlFor="password" className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">
            Password
          </label>
          <FaLock className="absolute left-3 top-3.5 text-gray-500" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} flex items-center justify-center gap-2`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account? <Link to="/register" className="text-blue-800 font-bold hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}
