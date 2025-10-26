import React, { useEffect, useState } from 'react';
import { X, User, Shield } from 'lucide-react';

export default function AuthModal({ open, onClose, onLogin, initialMode = 'user' }) {
  const [mode, setMode] = useState(initialMode); // 'user' | 'municipal'
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setIsRegister(false);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }, [initialMode, open]);

  if (!open) return null;

  const backend = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const url = isRegister ? `${backend}/auth/register` : `${backend}/auth/login`;
      const body = isRegister
        ? { name: name || 'Citizen', email, password, role: mode }
        : { email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || 'Authentication failed');
      }
      const userInfo = { role: data?.user?.role || mode, email: data?.user?.email, name: data?.user?.name };
      const token = data?.token;
      onLogin?.({ ...userInfo, token });
      onClose?.();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'user' ? <User className="text-emerald-600" /> : <Shield className="text-emerald-600" />}
            <h3 className="text-lg font-semibold">
              {isRegister ? (mode === 'user' ? 'Citizen Sign Up' : 'Municipal Sign Up') : (mode === 'user' ? 'Citizen Sign In' : 'Municipal Sign In')}
            </h3>
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
          {isRegister && (
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Your full name"
                required
              />
            </div>
          )}
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

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegister(false)} className="text-emerald-700 hover:underline">Sign in</button>
              </>
            ) : (
              <>
                New here?{' '}
                <button type="button" onClick={() => setIsRegister(true)} className="text-emerald-700 hover:underline">Create an account</button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
