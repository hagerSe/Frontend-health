import React, { useEffect, useState } from "react";
import axios from "axios";

const KebeleAdmin = () => {
  const [admin, setAdmin] = useState(null); // Woreda/Kebele Admin info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch current logged-in admin info
        const res = await axios.get("http://localhost:5000/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const adminData = res.data.admin || JSON.parse(localStorage.getItem("admin"));

        // Store in state and localStorage
        setAdmin(adminData);
        localStorage.setItem("admin", JSON.stringify(adminData));
      } catch (err) {
        console.error(err);
        // Fallback to localStorage
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  if (loading) return <p>Loading Kebele Admin info...</p>;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Kebele Admin Dashboard</h1>

      {admin ? (
        <div className="bg-blue-50 p-4 rounded-lg shadow-md w-96 space-y-2">
          <p>
            <span className="font-semibold">First Name:</span> {admin.first_name || "-"}
          </p>
          <p>
            <span className="font-semibold">Last Name:</span> {admin.last_name || "-"}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {admin.role || "-"}
          </p>
          <p>
            <span className="font-semibold">Region:</span> {admin.region || "-"}
          </p>
          <p>
            <span className="font-semibold">Zone:</span> {admin.zone || "-"}
          </p>
          <p>
            <span className="font-semibold">Woreda:</span> {admin.woreda || "-"}
          </p>
          <p>
            <span className="font-semibold">Kebele:</span> {admin.kebele || "-"}
          </p>
        </div>
      ) : (
        <p>No admin info available</p>
      )}
    </div>
  );
};

export default KebeleAdmin;
