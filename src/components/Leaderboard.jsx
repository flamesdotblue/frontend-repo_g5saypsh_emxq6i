import React from 'react';
import { Trophy } from 'lucide-react';

export default function Leaderboard({ scores = [] }) {
  const top = [...scores]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Trophy className="text-amber-500" />
        <h2 className="text-lg font-semibold">Community Leaderboard</h2>
      </div>
      <p className="text-sm text-gray-500">Celebrate active citizens contributing to a resilient city.</p>

      <ol className="mt-4 divide-y divide-gray-100">
        {top.map((item, idx) => (
          <li key={item.name + idx} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 grid place-items-center rounded-full text-white text-sm font-semibold ${
                idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-800' : 'bg-emerald-600'
              }`}>
                {idx + 1}
              </div>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.reports} reports</div>
              </div>
            </div>
            <div className="text-emerald-700 font-semibold">{item.points} pts</div>
          </li>
        ))}
        {top.length === 0 && (
          <div className="text-center text-gray-500 py-8">No contributors yet. Be the first to report!</div>
        )}
      </ol>
    </div>
  );
}
