import { useState, useEffect } from 'react';
import { api } from '../api';

export default function FederalAdmin() {
  const [federalList, setFederalList] = useState([]);
  const [structure, setStructure] = useState([]);
  const [name, setName] = useState('');
  const [federalId, setFederalId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('list'); // list | add | addRegional | structure

  async function loadList() {
    try {
      const data = await api('/federal');
      setFederalList(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function loadStructure() {
    try {
      const data = await api('/federal/structure');
      setStructure(data.data || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (tab === 'structure') loadStructure();
  }, [tab]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api('/federal', { method: 'POST', body: { name: name.trim() } });
      setMessage({ type: 'success', text: 'Federal level added.' });
      setName('');
      loadList();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const [regionalName, setRegionalName] = useState('');
  async function handleAddRegional(e) {
    e.preventDefault();
    if (!regionalName.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api('/federal/regions', { method: 'POST', body: { name: regionalName.trim(), federal_id: federalId || null } });
      setMessage({ type: 'success', text: 'Regional level added. You can now add Regional admins and assign them to this region.' });
      setRegionalName('');
      loadStructure();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Federal Admin</h1>
      <p className="text-slate-600 text-sm mb-6">Manage federal level and view federal structure (regions).</p>
      <nav className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          List
        </button>
        <button
          onClick={() => setTab('add')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          Add Federal
        </button>
        <button
          onClick={() => setTab('addRegional')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'addRegional' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          Add Regional
        </button>
        <button
          onClick={() => setTab('structure')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'structure' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
        >
          Federal Structure
        </button>
      </nav>
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      {tab === 'list' && (
        <ul className="bg-white rounded-lg border border-slate-200 divide-y">
          {federalList.length === 0 && <li className="p-4 text-slate-500">No federal entries yet.</li>}
          {federalList.map((f) => (
            <li key={f.federal_id} className="p-4">{f.name}</li>
          ))}
        </ul>
      )}
      {tab === 'add' && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-slate-200 p-6">
          <label className="block text-slate-700 font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Federal level name"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Add
          </button>
        </form>
      )}
      {tab === 'addRegional' && (
        <form onSubmit={handleAddRegional} className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Add Regional level (so you can assign Regional admins to it)</h2>
          <label className="block text-slate-700 font-medium mb-1">Regional name *</label>
          <input
            value={regionalName}
            onChange={(e) => setRegionalName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4"
            placeholder="e.g. Oromia, Amhara"
          />
          <label className="block text-slate-700 font-medium mb-1">Federal ID (optional)</label>
          <input
            type="number"
            value={federalId}
            onChange={(e) => setFederalId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4"
            placeholder="Link to federal level"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Add Regional
          </button>
        </form>
      )}
      {tab === 'structure' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Federal → Regions</h2>
          {structure.length === 0 && <p className="text-slate-500">No structure data.</p>}
          <ul className="space-y-4">
            {structure.map((f) => (
              <li key={f.federal_id} className="border-l-2 border-blue-200 pl-4">
                <span className="font-medium">{f.name}</span>
                {f.RegionalLevels?.length > 0 && (
                  <ul className="mt-2 ml-4 text-slate-600">
                    {f.RegionalLevels.map((r) => (
                      <li key={r.regional_id}>→ {r.name}</li>
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
