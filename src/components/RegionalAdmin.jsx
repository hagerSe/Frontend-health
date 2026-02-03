import { useState, useEffect } from 'react';
import { api } from '../api';

export default function RegionalAdmin() {
  const [list, setList] = useState([]);
  const [structure, setStructure] = useState([]);
  const [name, setName] = useState('');
  const [federalId, setFederalId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('list');

  async function loadList() {
    try {
      const data = await api('/regional');
      setList(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function loadStructure() {
    try {
      const data = await api('/regional/structure');
      setStructure(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  useEffect(() => { loadList(); }, []);
  useEffect(() => { if (tab === 'structure') loadStructure(); }, [tab]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api('/regional', { method: 'POST', body: { name: name.trim(), federal_id: federalId || null } });
      setMessage({ type: 'success', text: 'Regional level added.' });
      setName('');
      loadList();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Regional Admin</h1>
      <p className="text-slate-600 text-sm mb-6">Manage regional level and view structure (zones).</p>
      <nav className="flex gap-2 mb-6">
        <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>List</button>
        <button onClick={() => setTab('add')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Add Regional</button>
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
      )}
    </div>
  );
}
