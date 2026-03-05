import React, { useEffect, useState } from "react";
import axios from "axios";

const WoredaAdmin = () => {
  const [admin, setAdmin] = useState(null);

  // 🔥 NEW: kebele form state
  const [kebeleForm, setKebeleForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    sex: "Male",
    age: "",
    kebele: ""
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  // 🔥 Handle input change
  const handleChange = (e) => {
    setKebeleForm({
      ...kebeleForm,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 Submit kebele admin
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          ...kebeleForm,
          role: "Kebele_Admin",
          region: admin.region,
          zone: admin.zone,
          woreda: admin.woreda
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Kebele Admin Created Successfully");

      setKebeleForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        sex: "Male",
        age: "",
        kebele: ""
      });

    } catch (error) {
      console.error(error);
      alert("Error creating Kebele Admin");
    }
  };

  return (
    <div className="relative p-6 min-h-screen">
     
      <h1 className="text-2xl font-bold mb-4">
        Woreda Admin Dashboard
      </h1>

      {admin && (
        <div className="absolute top-6 right-6 bg-blue-50 p-4 rounded-lg shadow-md w-72">
          <p><span className="font-semibold">First Name:</span> {admin.first_name}</p>
          <p><span className="font-semibold">Last Name:</span> {admin.last_name}</p>
          <p><span className="font-semibold">Role:</span> {admin.role}</p>
          <p><span className="font-semibold">Zone:</span> {admin.zone}</p>
          <p><span className="font-semibold">Region:</span> {admin.region}</p>
            <p><span className="font-semibold">Woreda:</span> {admin.woreda}</p>
        </div>
      )}

      {/* 🔥 NEW KEBELE ADMIN FORM */}
      {admin && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-xl">
          <h2 className="text-xl font-bold mb-4">
            Create Kebele Admin (Under {admin.woreda})
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={kebeleForm.first_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="middle_name"
              placeholder="Middle Name"
              value={kebeleForm.middle_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={kebeleForm.last_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={kebeleForm.email}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={kebeleForm.phone_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={kebeleForm.password}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <select
              name="sex"
              value={kebeleForm.sex}
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
              value={kebeleForm.age}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="kebele"
              placeholder="Kebele Name"
              value={kebeleForm.kebele}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Kebele Admin
            </button>

          </form>
        </div>
      )}

    </div>
  );
};

export default WoredaAdmin;
