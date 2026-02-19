import React, { useEffect, useState, useRef } from "react";
import { FaBars } from "react-icons/fa";
import axios from "axios";
import ProfileImage from "../assets/brsh.jpg";

const HospitalAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [imagePreview, setImagePreview] = useState(ProfileImage);
  const [open, setOpen] = useState(true);
  const fileInputRef = useRef(null);

  const [showPages, setShowPages] = useState(false);
 
  const [selectedItem, setSelectedItem] = useState("");

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Female",
    email: "",
    password: "",
    kebele: "",
    woreda: "",
    zone: "",
    region: "",
    ward: "OPD",
    department: "Doctor",
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/user",
        formData
      );

      setMessage("✅ User added successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "Female",
        email: "",
        password: "",
        kebele: "",
        woreda: "",
        zone: "",
        region: "",
        ward: "OPD",
        department: "Doctor",
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add user");
    }
  };

  if (!admin) return null;

  return (
    <div>
      {/* Sidebar Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md"
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-gray-100 shadow-xl transition-all duration-300 ${
          open ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-6">

          <div className="bg-white p-6 rounded-2xl shadow-xl w-64 text-center mx-auto">

            <div className="bg-blue-500 w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg">
              <img
                src={imagePreview}
                alt="Profile"
                onClick={handleImageClick}
                className="w-28 h-28 object-cover rounded-full border-4 border-white cursor-pointer"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-4">
              <p className="font-semibold text-lg">
                {admin.first_name} {admin.last_name}
              </p>
              <p className="text-blue-600 font-medium">
                {admin.role}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="mt-6 space-y-3 font-semibold">

            <div>
              <div
                onClick={() => setShowPages(!showPages)}
                className="cursor-pointer p-2 bg-gray-200 rounded"
              >
                Pages
              </div>
              {showPages && (
                <div className="ml-4 mt-2 space-y-1">
                  <p onClick={() => setSelectedItem("User Add")} className="cursor-pointer hover:text-blue-600">User Add</p>
                  <p onClick={() => setSelectedItem("User Summary")} className="cursor-pointer hover:text-blue-600">User Summary</p>
                  <p onClick={() => setSelectedItem("Report")} className="cursor-pointer hover:text-blue-600">Report</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-80 p-6">

        {selectedItem === "User Add" && (
          <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">

            <h2 className="text-2xl font-bold mb-6 text-center">
              Add New User
            </h2>
<form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-lg max-w-5xl mx-auto"
>
  {/* First Name */}
  <div className="relative">
    <input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      placeholder=" "
      required
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      First Name
    </label>
  </div>

  {/* Last Name */}
  <div className="relative">
    <input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      placeholder=" "
      required
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Last Name
    </label>
  </div>

  {/* Age */}
  <div className="relative">
    <input
      type="number"
      name="age"
      value={formData.age}
      onChange={handleChange}
      placeholder=" "
      min="0"
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Age
    </label>
  </div>

  {/* Gender */}
  <div className="relative">
    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
    >
      <option value="" disabled hidden></option>
      <option>Female</option>
      <option>Male</option>
      <option>Other</option>
    </select>
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Gender
    </label>
  </div>

  {/* Email */}
  <div className="relative">
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder=" "
      required
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Email
    </label>
  </div>

  {/* Password */}
  <div className="relative">
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder=" "
      required
      minLength="6"
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Password
    </label>
  </div>
    

  {/* Kebele */}
  <div className="relative">
    <input
      type="text"
      name="kebele"
      value={formData.kebele}
      onChange={handleChange}
      placeholder=" "
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Kebele
    </label>
  </div>

  {/* Woreda */}
  <div className="relative">
    <input
      type="text"
      name="woreda"
      value={formData.woreda}
      onChange={handleChange}
      placeholder=" "
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Woreda
    </label>
  </div>

  {/* Zone */}
  <div className="relative">
    <input
      type="text"
      name="zone"
      value={formData.zone}
      onChange={handleChange}
      placeholder=" "
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Zone
    </label>
  </div>

  {/* Region */}
  <div className="relative">
    <input
      type="text"
      name="region"
      value={formData.region}
      onChange={handleChange}
      placeholder=" "
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Region
    </label>
  </div>

  {/* Ward */}
  <div className="relative">
    <select
      name="ward"
      value={formData.ward}
      onChange={handleChange}
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
    >
      <option value="" disabled hidden></option>
      <option>OPD</option>
      <option>Emergency</option>
      <option>ANC</option>
    </select>
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Ward
    </label>
  </div>

  {/* Department */}
  <div className="relative">
    <select
      name="department"
      value={formData.department}
      onChange={handleChange}
      className="peer w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
    >
      <option value="" disabled hidden></option>
      <option>Doctor</option>
      <option>Nurse</option>
      <option>Radiology</option>
      <option>Pharmacy</option>
      <option>Midwife</option>
      <option>Laboratory</option>
       <option>Bed Room</option>
      <option>Human Resource</option>
       <option>Triage</option>
        <option>Card Office</option>
      <option>Other</option>
    </select>
    <label className="absolute left-3 top-3 text-gray-400 text-sm transition-all
      peer-focus:-top-2 peer-focus:text-blue-500 peer-focus:text-sm">
      Department
    </label>
  </div>

  {/* Submit Button */}
  <div className="md:col-span-2 text-center">
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition"
    >
      Add User
    </button>
  </div>

  {/* Success Message */}
  {message && (
    <div className="md:col-span-2 text-center font-semibold text-green-600 mt-4">
      {message}
    </div>
  )}
</form>
     </div>
        )}
      </div>


     { selectedItem === "User Summary" && ( 
      <div className=" p-6 rounded shadow max-w-6xl mt-5">User Summery
        <div>
          
        </div>
        </div>

     )}
      </div>
  );
};

export default HospitalAdmin;
