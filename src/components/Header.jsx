import React from 'react';
import { Trophy, ClipboardList, PlusCircle } from 'lucide-react';

const tabs = [
  { key: 'report', label: 'Report', icon: PlusCircle },
  { key: 'feed', label: 'Community Feed', icon: ClipboardList },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Header({ activeTab, onChange }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold">CS</div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Civic-Sense</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Crowdsourced Urban Resilience Platform</p>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === key ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={activeTab === key ? 'page' : undefined}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
        <div className="h-6 w-6" />
      </div>
    </header>
  );
}
