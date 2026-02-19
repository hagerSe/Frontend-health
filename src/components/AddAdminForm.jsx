import { useState, useEffect } from 'react';
import { register, api } from '../api';

const CHILD_ROLE_LABEL = {
  Federal_Admin: 'Regional Admin',
  Regional_Admin: 'Zone Admin',
  Zone_Admin: 'Woreda Admin',
  Woreda_Admin: 'Kebele Admin',
  Kebele_Admin: 'Hospital Admin',
};

const ASSIGNMENT_LABEL = {
  Federal_Admin: 'Assign to Region',
  Regional_Admin: 'Assign to Zone',
  Zone_Admin: 'Assign to Woreda',
  Woreda_Admin: 'Assign to Kebele',
  Kebele_Admin: 'Assign to Hospital',
};

export default function AddAdminForm({ onSuccess, onCancel }) {
  const [admin, setAdmin] = useState(null);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api("/auth/me");
        setAdmin(data.admin);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const childLabel = admin ? (CHILD_ROLE_LABEL[admin.role] || 'Admin') : '...';
  const assignmentLabel = admin ? ASSIGNMENT_LABEL[admin.role] : null;

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    service_name: 'Public',
    sex: 'Male',
    region: '',
    zone: '',
    woreda: '',
    kebele: '',
    hospital_name: '',
  });
  const [assignmentOptions, setAssignmentOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      if (!admin || !admin.role || admin.role === 'Hospital_Admin') {
        setOptionsLoading(false);
        return;
      }
      setOptionsLoading(true);
      try {
        if (admin.role === 'Federal_Admin') {
          const data = await api('/federal/structure');
          const list = (data.data || []).flatMap((f) => f.RegionalLevels || []).map((r) => ({ value: r.name, label: r.name }));
          if (!cancelled) setAssignmentOptions(list);
        } else if (admin.role === 'Regional_Admin') {
          const data = await api('/regional/structure');
          const list = (data.data || []).flatMap((r) => r.ZoneLevels || []).map((z) => ({ value: z.name, label: z.name }));
          if (!cancelled) setAssignmentOptions(list);
        } else if (admin.role === 'Zone_Admin') {
          const data = await api('/zone/structure');
          const list = (data.data || []).flatMap((z) => z.WoredaLevels || []).map((w) => ({ value: w.name, label: w.name }));
          if (!cancelled) setAssignmentOptions(list);
        } else if (admin.role === 'Woreda_Admin') {
          const data = await api('/woreda/structure');
          const list = (data.data || []).flatMap((w) => w.KebeleLevels || []).map((k) => ({ value: k.name, label: k.name }));
          if (!cancelled) setAssignmentOptions(list);
        } else if (admin.role === 'Kebele_Admin') {
          const data = await api('/hospital');
          const list = (data.data || []).map((h) => ({ value: h.name, label: h.name }));
          if (!cancelled) setAssignmentOptions(list);
        }
      } catch {
        if (!cancelled) setAssignmentOptions([]);
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }
    loadOptions();
    return () => { cancelled = true; };
  }, [admin?.role]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setAssignment(value) {
    if (!admin) return;
    if (admin.role === 'Federal_Admin') setForm((f) => ({ ...f, region: value }));
    else if (admin.role === 'Regional_Admin') setForm((f) => ({ ...f, zone: value }));
    else if (admin.role === 'Zone_Admin') setForm((f) => ({ ...f, woreda: value }));
    else if (admin.role === 'Woreda_Admin') setForm((f) => ({ ...f, kebele: value }));
    else if (admin.role === 'Kebele_Admin') setForm((f) => ({ ...f, hospital_name: value }));
  }

  function getAssignmentValue() {
    if (!admin) return '';
    if (admin.role === 'Federal_Admin') return form.region;
    if (admin.role === 'Regional_Admin') return form.zone;
    if (admin.role === 'Zone_Admin') return form.woreda;
    if (admin.role === 'Woreda_Admin') return form.kebele;
    if (admin.role === 'Kebele_Admin') return form.hospital_name;
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form, token);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-2">Add {childLabel}</h2>
      <p className="text-slate-600 text-sm mb-4">You can only add one level below your role. The new admin is saved to the database with the assignment you choose.</p>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">First name *</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Middle name *</label>
            <input name="middle_name" value={form.middle_name} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Last name *</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Phone</label>
          <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">Password *</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2" />
        </div>
        {admin && admin.role !== 'Hospital_Admin' && assignmentLabel && (
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">{assignmentLabel}</label>
            {optionsLoading ? (
              <p className="text-slate-500 text-sm">Loading options…</p>
            ) : assignmentOptions.length > 0 ? (
              <select
                value={getAssignmentValue()}
                onChange={(e) => setAssignment(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="">— Select —</option>
                {assignmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={getAssignmentValue()}
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="Type name (create the level in your dashboard first if needed)"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            )}
            <p className="text-slate-500 text-xs mt-1">This value is saved to the database for the new admin.</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Service</label>
            <select name="service_name" value={form.service_name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">Sex</label>
            <select name="sex" value={form.sex} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Adding…' : 'Add ' + childLabel}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
