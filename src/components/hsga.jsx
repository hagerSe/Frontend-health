// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { login } from '../api'; // your API call function
// // import { FaUserCircle, FaLock } from "react-icons/fa";

// // export default function Login() {
// //   const navigate = useNavigate();

// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   async function handleSubmit(e) {
// //     e.preventDefault();
// //     setError('');
// //     setLoading(true);

// //     try {
// //       const data = await login(email, password);
      
// //       // Save token and admin info
// //       localStorage.setItem('token', data.token);
// //       localStorage.setItem('admin', JSON.stringify(data.admin));

// //       // Get role (normalize to lowercase for safety)
// //       const role = data.admin.role.toLowerCase();

// //       // Automatic redirection based on role (your requirement)
// //       if (role === 'federal_admin') {
// //         navigate('/FederalAdmin');
// //       } else if (role === 'regional_admin') {
// //         navigate('/RegionalAdmin');
// //       } else if (role === 'zone_admin') {
// //         navigate('/ZoneAdmin');
// //       } else if (role === 'woreda_admin') {
// //         navigate('/WoredaAdmin');
// //       } else if (role === 'kebele_admin') {
// //         navigate('/KebeleAdmin');
// //       } else if (role === 'hospital_admin') {
// //         navigate('/HospitalAdmin');
// //       } else {
// //         setError('You do not have admin access');
// //       }
// //     } catch (err) {
// //       setError(err.message || 'Login failed');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-slate-300 p-4">
// //       <form
// //         onSubmit={handleSubmit}
// //         className="bg-slate-400 rounded-xl shadow-2xl p-8 w-full max-w-md"
// //       >
// //         {/* TITLE */}
// //         <div className="flex flex-col items-center mb-6">
// //           <FaUserCircle className="text-blue-600 text-6xl mb-2" />

// //           <h1 className="text-2xl font-bold text-slate-800 text-center">
// //             National Health
// //           </h1>

// //           <p className="text-sm text-gray-500 text-center">
// //             Management System Login
// //           </p>
// //         </div>

// //         {/* ERROR */}
// //         {error && (
// //           <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
// //             {error}
// //           </div>
// //         )}

// //         {/* EMAIL */}
// //         <div className="relative mb-6">
// //           <input
// //             type="email"
// //             id="email"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //             className="peer w-full border border-gray-400 rounded-lg px-10 py-3
// //               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
// //               transition-all duration-200"
// //             placeholder=" "
// //           />

// //           <label
// //             htmlFor="email"
// //             className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500
// //               peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
// //               peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600
// //               transition-all duration-200 cursor-text"
// //           >
// //             Email Address
// //           </label>

// //           <FaUserCircle className="absolute left-3 top-3.5 text-gray-500" />
// //         </div>

// //         {/* PASSWORD */}
// //         <div className="relative mb-6">
// //           <input
// //             type="password"
// //             id="password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //             className="peer w-full border border-gray-300 rounded-lg px-10 py-3
// //               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
// //               transition-all duration-200"
// //             placeholder=" "
// //           />

// //           <label
// //             htmlFor="password"
// //             className="absolute left-9 -top-2 bg-white px-1 text-xs text-gray-500
// //               peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
// //               peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600
// //               transition-all duration-200 cursor-text"
// //           >
// //             Password
// //           </label>

// //           <FaLock className="absolute left-3 top-3.5 text-gray-500" />
// //         </div>

// //         {/* BUTTON */}
// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className={`w-full py-3 rounded-lg text-white font-semibold transition
// //             ${loading 
// //               ? 'bg-blue-400 cursor-not-allowed' 
// //               : 'bg-blue-700 hover:bg-blue-800'
// //             } flex items-center justify-center gap-2`}
// //         >
// //           {loading ? (
// //             <>
// //               <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
// //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
// //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
// //               </svg>
// //               Signing In...
// //             </>
// //           ) : (
// //             "Sign In"
// //           )}
// //         </button>

// //         {/* FOOTER */}
// //         <p className="text-xs text-gray-900 text-center mt-4">
// //           Secure access for authorized administrators only
// //         </p>
// //       </form>
// //     </div>
// //   );
// // }




// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login } from '../api'; // your API call function
// import { FaUserCircle, FaLock } from "react-icons/fa";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const data = await login(email, password);

//       // Save token
//       localStorage.setItem('token', data.token);

//       // Save admin info
//       const admin = data.admin;

//       // Expected fields from backend
//       // admin = {
//       //   name, role, hospital_name, kebele, wereda, zone, region, federal
//       // }

//       localStorage.setItem('admin', JSON.stringify(admin));

//       // Save separately for easy access in header
//       localStorage.setItem('userName', admin.name || '');
//       localStorage.setItem('userRole', admin.role || '');
//       localStorage.setItem('hospitalName', admin.hospital_name || '');
//       localStorage.setItem('kebele', admin.kebele || '');
//       localStorage.setItem('wereda', admin.wereda || '');
//       localStorage.setItem('zone', admin.zone || '');
//       localStorage.setItem('region', admin.region || '');
//       localStorage.setItem('federal', admin.federal || '');

//       // Automatic redirection based on role
//       const role = (admin.role || '').toLowerCase();

//       if (role === 'federal_admin') {
//         navigate('/FederalAdmin');
//       } else if (role === 'regional_admin') {
//         navigate('/RegionalAdmin');
//       } else if (role === 'zone_admin') {
//         navigate('/ZoneAdmin');
//       } else if (role === 'woreda_admin') {
//         navigate('/WoredaAdmin');
//       } else if (role === 'kebele_admin') {
//         navigate('/KebeleAdmin');
//       } else if (role === 'hospital_admin') {
//         navigate('/HospitalAdmin');
//       } else {
//         setError('You do not have admin access');
//       }

//     } catch (err) {
//       setError(err.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded shadow-md w-96"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

//         {error && <p className="text-red-600 mb-4">{error}</p>}

//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">Email</label>
//           <div className="flex items-center border rounded px-2">
//             <FaUserCircle className="text-gray-400 mr-2" />
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full py-2 focus:outline-none"
//               placeholder="Enter your email"
//               required
//             />
//           </div>
//         </div>

//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">Password</label>
//           <div className="flex items-center border rounded px-2">
//             <FaLock className="text-gray-400 mr-2" />
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full py-2 focus:outline-none"
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
// }


     {/* <h1 className="text-2xl font-bold text-slate-800 mb-2">Regional Admin</h1>
      <p className="text-slate-600 text-sm mb-6">Manage regional level and view structure (zones).</p>
      <nav className="flex gap-2 mb-6">
        <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>List</button>
        <button onClick={() => setTab('add')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Add Zone</button>
        <button onClick={() => setTab('structure')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'structure' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Regional Structure</button>
      </nav>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
      )}
      {tab === 'list' && (
        <ul className="bg-white rounded-lg border border-slate-200 divide-y">
          {list.length === 0 && <li className="p-4 text-slate-500">No regional entries yet.</li>}
          {list.map((r) => (
            <li key={r.regional_id} className="p-4">{r.name}</li>
          ))}
        </ul>
      )}
      {tab === 'add' && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-slate-700 font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" placeholder="Regional name" />
          <label className="block text-slate-700 font-medium mb-1">Federal ID (optional)</label>
          <input type="number" value={federalId} onChange={(e) => setFederalId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" placeholder="Federal ID" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">Add</button>
        </form>
      )}
      {tab === 'structure' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Regional → Zones</h2>
          {structure.length === 0 && <p className="text-slate-500">No structure data.</p>}
          <ul className="space-y-4">
            {structure.map((r) => (
              <li key={r.regional_id} className="border-l-2 border-blue-200 pl-4">
                <span className="font-medium">{r.name}</span>
                {r.ZoneLevels?.length > 0 && (
                  <ul className="mt-2 ml-4 text-slate-600">
                    {r.ZoneLevels.map((z) => (
                      <li key={z.zone_id}>→ {z.name}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}  */}
  