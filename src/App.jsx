import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Leaderboard from './components/Leaderboard';
import AuthModal from './components/AuthModal';
import MunicipalDashboard from './components/MunicipalDashboard';
import { Shield, User as UserIcon } from 'lucide-react';

// Simple client-side fallback prioritization (server also scores)
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

  // Authentication state: null | { role: 'user' | 'municipal', email, name, token }
  const [auth, setAuth] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('user');

  const backend = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

  // Load session and reports on mount
  useEffect(() => {
    const saved = localStorage.getItem('civicsense_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAuth(parsed);
      } catch {}
    }
    refreshReports();
  }, []);

  async function refreshReports() {
    try {
      const res = await fetch(`${backend}/reports`);
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch {
      // ignore
    }
  }

  function handleLogin(info) {
    setAuth(info);
    localStorage.setItem('civicsense_auth', JSON.stringify(info));
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem('civicsense_auth');
  }

  async function addReport(newReport) {
    if (backend && auth?.token) {
      try {
        const payload = { user_email: auth.email, ...newReport };
        const res = await fetch(`${backend}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setReports((prev) => [data, ...prev]);
          setActiveTab('feed');
          return;
        }
      } catch {
        // fall back to client
      }
    }
    const processed = prioritizeAndScore({ id: crypto.randomUUID(), ...newReport, status: 'Submitted' });
    setReports((prev) => [{ ...processed }, ...prev]);
    setActiveTab('feed');
  }

  async function changeStatus(id, nextStatus) {
    if (!backend || !auth?.token) return;
    try {
      const res = await fetch(`${backend}/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
      }
    } catch {}
  }

  async function removeReport(id) {
    if (!backend || !auth?.token) return;
    try {
      const res = await fetch(`${backend}/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {}
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

  // Guarded navigation
  function navigate(tab) {
    if (tab === 'report' && (!auth || auth.role !== 'user')) {
      setActiveTab(tab);
      setAuthInitialMode('user');
      setAuthOpen(true);
      return;
    }
    if (tab === 'admin' && (!auth || auth.role !== 'municipal')) {
      setActiveTab(tab);
      setAuthInitialMode('municipal');
      setAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Header
        activeTab={activeTab}
        onChange={navigate}
        auth={auth}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'report' && (
          <>
            {!auth || auth.role !== 'user' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                    <UserIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Sign in to report an issue</h2>
                    <p className="text-sm text-gray-600">Create a citizen account to submit and track your reports, and earn Civic Points.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAuthInitialMode('user'); setAuthOpen(true); }}
                  className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <ReportForm onSubmit={addReport} />
            )}

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
          <>
            {!auth || auth.role !== 'municipal' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                    <Shield />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Municipal access required</h2>
                    <p className="text-sm text-gray-600">Sign in with a municipal account to manage reports and update statuses.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAuthInitialMode('municipal'); setAuthOpen(true); }}
                  className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign in as Municipal
                </button>
              </div>
            ) : (
              <MunicipalDashboard
                reports={reports}
                onStatusChange={changeStatus}
                onRemove={removeReport}
                onCleanup={cleanupResolved}
              />
            )}
          </>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        Built with love for resilient cities • Civic-Sense
      </footer>

      <AuthModal
        open={authOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthOpen(false)}
        onLogin={(info) => handleLogin(info)}
      />
    </div>
  );
}
