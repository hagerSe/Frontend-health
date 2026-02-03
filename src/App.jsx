import { useState, useEffect } from 'react';
import { parseJwt } from './api';
import Login from './components/Login';
import FederalAdmin from './components/FederalAdmin';
import RegionalAdmin from './components/RegionalAdmin';
import ZoneAdmin from './components/ZoneAdmin';
import WoredaAdmin from './components/WoredaAdmin';
import KebeleAdmin from './components/KebeleAdmin';
import HospitalAdmin from './components/HospitalAdmin';
import AddAdminForm from './components/AddAdminForm';

const ROLE_COMPONENT = {
  Federal_Admin: FederalAdmin,
  Regional_Admin: RegionalAdmin,
  Zone_Admin: ZoneAdmin,
  Woreda_Admin: WoredaAdmin,
  Kebele_Admin: KebeleAdmin,
  Hospital_Admin: HospitalAdmin,
};

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      const stored = localStorage.getItem('admin');
      if (stored) {
        try {
          setAdmin(JSON.parse(stored));
          return;
        } catch {}
      }
      if (payload?.role) {
        setAdmin({ role: payload.role, email: payload.email });
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  }

  function handleLoginSuccess(adminData) {
    setAdmin(adminData);
  }

  if (!admin) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  const AdminPanel = ROLE_COMPONENT[admin.role];
  const canAddAdmin = ['Federal_Admin', 'Regional_Admin', 'Zone_Admin', 'Woreda_Admin', 'Kebele_Admin'].includes(admin.role);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">National Health Management System</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">
            {admin.first_name} {admin.last_name} <span className="font-medium text-slate-800">({admin.role})</span>
          </span>
          {canAddAdmin && (
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
            >
              {showAddAdmin ? 'Hide Add Admin' : 'Add Admin'}
            </button>
          )}
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200">
            Logout
          </button>
        </div>
      </header>
      <main className="py-6">
        {showAddAdmin && canAddAdmin && (
          <div className="max-w-4xl mx-auto px-6 mb-6">
            <AddAdminForm onSuccess={() => setShowAddAdmin(false)} onCancel={() => setShowAddAdmin(false)} />
          </div>
        )}
        {AdminPanel ? <AdminPanel /> : (
          <div className="max-w-4xl mx-auto p-6 text-slate-600">
            No dashboard for role: {admin.role}
          </div>
        )}
      </main>
    </div>
  );
}
