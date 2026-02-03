import { useState } from 'react';

export default function HospitalAdmin() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Hospital Admin</h1>
      <p className="text-slate-600 text-sm mb-6">Hospital-level dashboard. Add hospital-specific forms and data here.</p>
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-slate-600">
        <p>You are logged in as <strong>Hospital Admin</strong>. Only hospital admin forms and data are visible at this level.</p>
      </div>
    </div>
  );
}
