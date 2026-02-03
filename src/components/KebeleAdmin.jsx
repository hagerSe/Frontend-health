import { useState, useEffect } from 'react';
import { api } from '../api';

export default function KebeleAdmin() {
  const [list, setList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const [name, setName] = useState('');
  const [woredaId, setWoredaId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalKebeleId, setHospitalKebeleId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('list');

  async function loadList() {
    try {
      const data = await api('/kebele');
      setList(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function loadHospitals() {
    try {
      const data = await api('/hospital');
      setHospitalList(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  useEffect(() => { loadList(); }, []);
  useEffect(() => { if (tab === 'hospitals' || tab === 'addHospital') loadHospitals(); }, [tab]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api('/kebele', { method: 'POST', body: { name: name.trim(), woreda_id: woredaId || null } });
      setMessage({ type: 'success', text: 'Kebele added.' });
      setName('');
      loadList();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHospital(e) {
    e.preventDefault();
    if (!hospitalName.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api('/hospital', { method: 'POST', body: { name: hospitalName.trim(), kebele_id: hospitalKebeleId || null } });
      setMessage({ type: 'success', text: 'Hospital added. You can now add Hospital admins and assign them to this hospital.' });
      setHospitalName('');
      loadHospitals();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Kebele Admin</h1>
      <p className="text-slate-600 text-sm mb-6">Manage kebele level.</p>
      <nav className="flex gap-2 mb-6">
        <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>List Kebeles</button>
        <button onClick={() => setTab('add')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Add Kebele</button>
        <button onClick={() => setTab('hospitals')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'hospitals' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Hospitals</button>
        <button onClick={() => setTab('addHospital')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'addHospital' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Add Hospital</button>
      </nav>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
      )}
      {tab === 'list' && (
        <ul className="bg-white rounded-lg border border-slate-200 divide-y">
          {list.length === 0 && <li className="p-4 text-slate-500">No kebele entries yet.</li>}
          {list.map((k) => (
            <li key={k.kebele_id} className="p-4">{k.name}</li>
          ))}
        </ul>
      )}
      {tab === 'add' && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-slate-700 font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" placeholder="Kebele name" />
          <label className="block text-slate-700 font-medium mb-1">Woreda ID (optional)</label>
          <input type="number" value={woredaId} onChange={(e) => setWoredaId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">Add</button>
        </form>
      )}
      {tab === 'hospitals' && (
        <ul className="bg-white rounded-lg border border-slate-200 divide-y">
          {hospitalList.length === 0 && <li className="p-4 text-slate-500">No hospitals yet. Add one with &quot;Add Hospital&quot;.</li>}
          {hospitalList.map((h) => (
            <li key={h.hospital_id} className="p-4">{h.name}</li>
          ))}
        </ul>
      )}
      {tab === 'addHospital' && (
        <form onSubmit={handleAddHospital} className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Add Hospital (so you can assign Hospital admins to it)</h2>
          <label className="block text-slate-700 font-medium mb-1">Hospital name *</label>
          <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" placeholder="e.g. Central Hospital" />
          <label className="block text-slate-700 font-medium mb-1">Kebele ID (optional)</label>
          <input type="number" value={hospitalKebeleId} onChange={(e) => setHospitalKebeleId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4" placeholder="Link to kebele" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Hospital</button>
        </form>
      )}
    </div>
  );
}
