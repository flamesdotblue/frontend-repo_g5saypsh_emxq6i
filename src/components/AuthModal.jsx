import React, { useEffect, useState } from 'react';
import { X, User, Shield } from 'lucide-react';

export default function AuthModal({ open, onClose, onLogin, initialMode = 'user' }) {
  const [mode, setMode] = useState(initialMode); // 'user' | 'municipal'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    if (!email || !password) return;
    // Local-only auth stub; integrate real backend later
    onLogin?.({ role: mode, email });
    onClose?.();
    setEmail('');
    setPassword('');
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'user' ? <User className="text-emerald-600" /> : <Shield className="text-emerald-600" />}
            <h3 className="text-lg font-semibold">{mode === 'user' ? 'Citizen Sign In' : 'Municipal Sign In'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode('user')}
            className={`flex-1 px-3 py-2 rounded-md text-sm ${mode === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
          >
            Citizen
          </button>
          <button
            onClick={() => setMode('municipal')}
            className={`flex-1 px-3 py-2 rounded-md text-sm ${mode === 'municipal' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
          >
            Municipal
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            Sign In
          </button>
          <p className="text-xs text-gray-500 text-center">By signing in you agree to our civic guidelines.</p>
        </form>
      </div>
    </div>
  );
}
