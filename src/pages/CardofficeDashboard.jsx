// import { useState } from "react";
// import { 
//   FaHome, 
//   FaUserPlus, 
//   FaUsers, 
//   FaSearch, 
//   FaChartBar 
// } from "react-icons/fa";

// export default function CardOfficeDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activeView, setActiveView] = useState("dashboard"); // controls main content

//   // Example patients
//   const patients = [
//     { id: 1, firstName: "John", middleName: "Doe", lastName: "Smith", hospital: "Hospital A", date: "2026-02-17", status: "Active" },
//     { id: 2, firstName: "Jane", middleName: "Mary", lastName: "Adams", hospital: "Hospital A", date: "2026-02-17", status: "Active" }
//   ];

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg p-4 transition-all duration-300`}>
//         {/* Sidebar Header */}
//         <div className="flex items-center justify-between mb-6">
//           <h2 className={`${sidebarOpen ? "block" : "hidden"} text-xl font-bold`}>Card Office</h2>
//           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>
//         </div>

//         {/* Sidebar Menu */}
//         <nav className="space-y-2">
//           <button onClick={() => setActiveView("dashboard")} className="flex items-center w-full px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition">
//             <FaHome className="mr-2" /> {sidebarOpen && "Dashboard"}
//           </button>
//           <button onClick={() => setActiveView("register")} className="flex items-center w-full px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition">
//             <FaUserPlus className="mr-2" /> {sidebarOpen && "Register Patient"}
//           </button>
//           <button onClick={() => setActiveView("queue")} className="flex items-center w-full px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition">
//             <FaUsers className="mr-2" /> {sidebarOpen && "Patient Queue"}
//           </button>
//           <button onClick={() => setActiveView("search")} className="flex items-center w-full px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition">
//             <FaSearch className="mr-2" /> {sidebarOpen && "Search Patient"}
//           </button>
//           <button onClick={() => setActiveView("reports")} className="flex items-center w-full px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition">
//             <FaChartBar className="mr-2" /> {sidebarOpen && "Reports"}
//           </button>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-6 overflow-auto">
//         {activeView === "dashboard" && (
//           <>
//             <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div className="bg-blue-100 p-4 rounded shadow">Total Registered Today: {patients.length}</div>
//               <div className="bg-green-100 p-4 rounded shadow">Active Patients: 35</div>
//               <div className="bg-gray-100 p-4 rounded shadow">Discharged: 8</div>
//             </div>
//           </>
//         )}

//         {activeView === "register" && (
//           <>
//             <h1 className="text-2xl font-bold mb-4">Register New Patient</h1>
//             <form className="max-w-lg p-4 bg-white rounded shadow-md space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <input type="text" placeholder="First Name" className="border p-2 rounded" />
//                 <input type="text" placeholder="Middle Name" className="border p-2 rounded" />
//                 <input type="text" placeholder="Last Name" className="border p-2 rounded" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input type="date" placeholder="Date of Birth" className="border p-2 rounded" />
//                 <select className="border p-2 rounded">
//                   <option>Gender</option>
//                   <option>Male</option>
//                   <option>Female</option>
//                   <option>Other</option>
//                 </select>
//               </div>
//               <input type="text" placeholder="Phone Number" className="border p-2 rounded w-full" />
//               <textarea placeholder="Address" className="border p-2 rounded w-full"></textarea>
//               <select className="border p-2 rounded w-full">
//                 <option>Hospital Name</option>
//                 <option>Hospital A</option>
//                 <option>Hospital B</option>
//               </select>
//               <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
//                 Register Patient
//               </button>
//             </form>
//           </>
//         )}

//         {activeView === "queue" && (
//           <>
//             <h1 className="text-2xl font-bold mb-4">Patient Queue</h1>
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse border border-gray-300">
//                 <thead className="bg-gray-200">
//                   <tr>
//                     <th className="border p-2">First Name</th>
//                     <th className="border p-2">Middle Name</th>
//                     <th className="border p-2">Last Name</th>
//                     <th className="border p-2">Hospital</th>
//                     <th className="border p-2">Registration Date</th>
//                     <th className="border p-2">Status</th>
//                     <th className="border p-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {patients.map((p) => (
//                     <tr key={p.id}>
//                       <td className="border p-2">{p.firstName}</td>
//                       <td className="border p-2">{p.middleName}</td>
//                       <td className="border p-2">{p.lastName}</td>
//                       <td className="border p-2">{p.hospital}</td>
//                       <td className="border p-2">{p.date}</td>
//                       <td className="border p-2">{p.status}</td>
//                       <td className="border p-2">
//                         <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Send to Triage</button>
//                         <button className="bg-gray-500 text-white px-2 py-1 rounded">View</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}

//         {activeView === "search" && <h1 className="text-2xl font-bold">Search Patient</h1>}
//         {activeView === "reports" && <h1 className="text-2xl font-bold">Reports</h1>}
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

const CardOfficeDashboard = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Card Office Dashboard</h1>

      {admin ? (
        <div className="bg-green-50 p-4 rounded-lg shadow-md w-full max-w-md space-y-2">
          <p>
            <span className="font-semibold">First Name:</span> {admin.first_name}
          </p>
          <p>
            <span className="font-semibold">Hospital Name:</span> {admin.hospital_name}
          </p>
        </div>
      ) : (
        <p>Loading admin info...</p>
      )}
    </div>
  );
};

export default CardOfficeDashboard;

