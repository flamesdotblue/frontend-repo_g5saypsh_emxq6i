import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Leaderboard from './components/Leaderboard';

// Simple client-side prioritization and scoring to simulate AI-driven outcomes
function prioritizeAndScore(report) {
  const d = report.description.toLowerCase();
  const isHighRisk = /flood|bridge|collapse|electri|fire|gas|sinkhole/.test(d);
  const looksFake = /prank|lol|fake|just testing/.test(d);

  const status = looksFake ? 'Rejected' : isHighRisk ? 'Validated' : 'In Review';
  const pointsAwarded = looksFake ? -25 : isHighRisk ? 20 : 10;

  return { ...report, status, pointsAwarded };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [reports, setReports] = useState([]);

  function addReport(newReport) {
    const processed = prioritizeAndScore({ id: crypto.randomUUID(), ...newReport, status: 'Submitted' });
    setReports((prev) => [{ ...processed }, ...prev]);
    setActiveTab('feed');
  }

  function changeStatus(id, nextStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
  }

  function removeReport(id) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  function cleanupResolved(days = 7) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    setReports((prev) => prev.filter((r) => !(r.status === 'Resolved' && r.timestamp < cutoff)));
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Header activeTab={activeTab} onChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'report' && (
          <>
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

        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Municipal Dashboard</h2>
                <p className="text-sm text-gray-500">Manage incoming reports, update statuses, and keep the feed tidy.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cleanupResolved(7)}
                  className="px-3 py-2 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Cleanup: Resolved > 7 days
                </button>
              </div>
            </div>
            <ReportList reports={reports} onStatusChange={changeStatus} onRemove={removeReport} adminMode />
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        Built with love for resilient cities • Civic-Sense
      </footer>
    </div>
  );
}
