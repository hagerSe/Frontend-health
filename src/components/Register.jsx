import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    sex: 'Male',
    age: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.adminRegister(form);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-400 rounded-xl shadow-2xl p-8 w-full max-w-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <FaUserPlus className="text-blue-600 text-6xl mb-2" />
          <h1 className="text-2xl font-bold text-slate-800 text-center">Federal Admin Registration</h1>
          <p className="text-sm text-gray-100 text-center">Register the first system administrator</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative mb-4">
            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">First Name</label>
            <FaUser className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <input type="text" name="middle_name" value={form.middle_name} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">Middle Name</label>
            <FaUser className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">Last Name</label>
            <FaUser className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">Email Address</label>
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">Phone Number</label>
            <FaPhone className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder=" " />
            <label className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all duration-200 cursor-text">Password</label>
            <FaLock className="absolute left-3 top-3.5 text-gray-500" />
          </div>

          <div className="relative mb-4">
            <select name="sex" value={form.sex} onChange={handleChange} className="w-full border border-gray-400 rounded-lg px-3 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="relative mb-4">
            <input type="number" name="age" value={form.age} onChange={handleChange} required className="peer w-full border border-gray-400 rounded-lg px-3 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200" placeholder="Age" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold mt-4 transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-800 font-bold hover:underline">Login here</Link>
        </p>
      </form>
    </div>
  );
}
