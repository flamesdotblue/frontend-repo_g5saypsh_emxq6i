import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Filter, MapPin, Trash2 } from 'lucide-react';

const statusColors = {
  Submitted: 'bg-gray-100 text-gray-700',
  'In Review': 'bg-amber-100 text-amber-800',
  Validated: 'bg-blue-100 text-blue-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
};

export default function ReportList({ reports, onStatusChange, onRemove, adminMode = false }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(reports.map((r) => r.category)))], [reports]);
  const statuses = ['All', 'Submitted', 'In Review', 'Validated', 'Resolved', 'Rejected'];

  const filtered = reports.filter((r) => {
    const matchQuery = !query || r.description.toLowerCase().includes(query.toLowerCase()) || (r.location?.address || '').toLowerCase().includes(query.toLowerCase());
    const matchStatus = status === 'All' || r.status === status;
    const matchCategory = category === 'All' || r.category === category;
    return matchQuery && matchStatus && matchCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">{adminMode ? 'Reports Management' : 'Community Reports'}</h2>
          <p className="text-sm text-gray-500">Real-time issues reported by citizens across the city.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={16} className="text-gray-500" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border-gray-300 text-sm">
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border-gray-300 text-sm">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search description or address"
            className="rounded-md border-gray-300 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.category} className="h-44 w-full object-cover" />
            ) : (
              <div className="h-44 w-full bg-gray-50 grid place-items-center text-gray-400">
                <AlertTriangle className="opacity-70" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>
                <span className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>
                  {r.location?.address || (r.location?.lat && r.location?.lng ? `${r.location.lat}, ${r.location.lng}` : 'No location provided')}
                </span>
              </div>
              <p className="text-sm">{r.description}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="font-medium">Category:</span> {r.category}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reporter:</span> {r.name}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t">
                <div className="text-sm text-emerald-700 font-medium">Civic Points: {r.pointsAwarded ?? 0}</div>
                {adminMode ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={(e) => onStatusChange?.(r.id, e.target.value)}
                      className="rounded-md border-gray-300 text-sm"
                    >
                      {['Submitted', 'In Review', 'Validated', 'Resolved', 'Rejected'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-sm"
                      onClick={() => onRemove?.(r.id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {r.status === 'Validated' && <span className="inline-flex items-center gap-1 text-blue-700"><CheckCircle size={14} /> Validated by AI</span>}
                    {r.status === 'Rejected' && <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle size={14} /> Marked as Fake</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">No reports match your filters.</div>
        )}
      </div>
    </div>
  );
}
