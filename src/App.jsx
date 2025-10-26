import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Leaderboard from './components/Leaderboard';
import { User as UserIcon } from 'lucide-react';

// Heuristic scoring as graceful fallback when backend is unavailable
function prioritizeAndScore(report) {
  const d = (report.description || '').toLowerCase();
  const isHighRisk = /flood|bridge|collapse|electri|fire|gas|sinkhole/.test(d);
  const looksFake = /prank|lol|fake|just testing/.test(d);
  const status = looksFake ? 'Rejected' : isHighRisk ? 'Validated' : 'In Review';
  const pointsAwarded = looksFake ? -25 : isHighRisk ? 20 : 10;
  return { ...report, status, pointsAwarded };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [reports, setReports] = useState([]);

  const backend = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    refreshReports();
  }, []);

  async function refreshReports() {
    if (!backend) return;
    try {
      const res = await fetch(`${backend}/reports`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch {
      // offline or backend not ready
    }
  }

  async function addReport(newReport) {
    // Try backend (public) first; fall back to client-only list if not available
    if (backend) {
      try {
        const res = await fetch(`${backend}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport),
        });
        if (res.ok) {
          const data = await res.json();
          setReports((prev) => [data, ...prev]);
          setActiveTab('feed');
          return;
        }
      } catch {
        // ignore and fall back
      }
    }

    const local = prioritizeAndScore({ id: crypto.randomUUID(), ...newReport, status: 'Submitted' });
    setReports((prev) => [local, ...prev]);
    setActiveTab('feed');
  }

  const leaderboard = useMemo(() => {
    const map = new Map();
    for (const r of reports) {
      const key = r.name || 'Citizen';
      const prev = map.get(key) || { name: key, points: 0, reports: 0 };
      map.set(key, { name: key, points: prev.points + (r.pointsAwarded || 0), reports: prev.reports + 1 });
    }
    return Array.from(map.values());
  }, [reports]);

  function navigate(tab) {
    setActiveTab(tab);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Header activeTab={activeTab} onChange={navigate} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'report' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                  <UserIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Report an issue</h2>
                  <p className="text-sm text-gray-600">No login required. Share details, location, and an optional photo.</p>
                </div>
              </div>
            </div>

            <ReportForm onSubmit={addReport} />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ReportList reports={reports} />
              </div>
              <Leaderboard scores={leaderboard} />
            </section>
          </>
        )}

        {activeTab === 'feed' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ReportList reports={reports} />
            </div>
            <Leaderboard scores={leaderboard} />
          </section>
        )}

        {activeTab === 'leaderboard' && <Leaderboard scores={leaderboard} />}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        Built with love for resilient cities • Civic-Sense
      </footer>
    </div>
  );
}
