import { useEffect, useState } from "react";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      <p>Welcome, {user.firstName} {user.lastName}</p>
      <p>Ward: {user.ward}</p>
      <p>Department: {user.department}</p>
    </div>
  );
}
