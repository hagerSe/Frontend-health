


import React, { useEffect, useState } from "react";
import axios from "axios";

const RegionalAdmin = () => {
  const [admin, setAdmin] = useState(null);

  // 🔥 NEW: zone admin form state
  const [zoneForm, setZoneForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    sex: "Male",
    age: "",
    zone: ""
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  // 🔥 Handle input change
  const handleChange = (e) => {
    setZoneForm({
      ...zoneForm,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Submit zone admin
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          ...zoneForm,
          region: admin.region // 🔥 VERY IMPORTANT
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Zone Admin Created Successfully");

      // Clear form
      setZoneForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        sex: "Male",
        age: "",
        zone: ""
      });

    } catch (error) {
      console.error(error);
      alert("Error creating Zone Admin");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Regional Admin Dashboard</h1>

      {admin ? (
        <div className="bg-blue-50 p-4 rounded-lg shadow-md w-full max-w-md space-y-2">
          <p>
            <span className="font-semibold">First Name:</span> {admin.first_name}
          </p>
          <p>
            <span className="font-semibold">Last Name:</span> {admin.last_name}
          </p>
          <p>
            <span className="font-semibold">Region Name:</span> {admin.region}
              <p><span className="font-semibold">federal Admin: Ethiopia</span> {admin.federal}</p>
          </p>
        </div>
      ) : (
        <p>Loading admin info...</p>
      )}

      {/* 🔥 NEW ZONE ADMIN FORM */}
      {admin && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-xl">
          <h2 className="text-xl font-bold mb-4">
            Create Zone Admin (Under {admin.region})
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={zoneForm.first_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="middle_name"
              placeholder="Middle Name"
              value={zoneForm.middle_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={zoneForm.last_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={zoneForm.email}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={zoneForm.phone_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={zoneForm.password}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <select
              name="sex"
              value={zoneForm.sex}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={zoneForm.age}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="zone"
              placeholder="Zone Name"
              value={zoneForm.zone}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Zone Admin
            </button>

          </form>
        </div>
      )}
    </div>
  );
};

export default RegionalAdmin;
