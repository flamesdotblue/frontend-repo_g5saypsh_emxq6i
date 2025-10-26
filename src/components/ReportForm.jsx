import React, { useEffect, useRef, useState } from 'react';
import { Camera, MapPin, Send, Sparkles } from 'lucide-react';
import MapView from './MapView';

const CATEGORIES = [
  'Pothole',
  'Flooding',
  'Waste Accumulation',
  'Streetlight Outage',
  'Illegal Dumping',
  'Blocked Drain',
  'Other',
];

function heuristicCategory(description) {
  const d = (description || '').toLowerCase();
  if (/pothole|road|asphalt|hole/.test(d)) return 'Pothole';
  if (/flood|waterlogging|inundat/.test(d)) return 'Flooding';
  if (/waste|garbage|trash|litter|dump/.test(d)) return 'Waste Accumulation';
  if (/light|streetlight|lamp|bulb/.test(d)) return 'Streetlight Outage';
  if (/drain|sewer|blocked/.test(d)) return 'Blocked Drain';
  return 'Other';
}

export default function ReportForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (autoDetect) {
      const detected = heuristicCategory(description);
      setCategory(detected);
    }
  }, [description, autoDetect]);

  function pickLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
      },
      () => {
        // silently ignore, user can enter manually
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function reset() {
    setName('');
    setDescription('');
    setCategory('');
    setAutoDetect(true);
    setCoords({ lat: '', lng: '' });
    setAddress('');
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function submit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);

    const payload = {
      name: name.trim() || 'Citizen',
      description: description.trim(),
      category: (autoDetect ? heuristicCategory(description) : category) || 'Other',
      location: {
        lat: coords.lat ? Number(coords.lat) : null,
        lng: coords.lng ? Number(coords.lng) : null,
        address: address.trim() || '',
      },
      imageUrl: preview || '',
      timestamp: Date.now(),
    };

    onSubmit?.(payload);
    setSubmitting(false);
    reset();
  }

  const mapCenter = coords.lat && coords.lng
    ? { lat: Number(coords.lat), lng: Number(coords.lng) }
    : { lat: 28.6139, lng: 77.209 };
  const mapMarkers = coords.lat && coords.lng
    ? [{ lat: Number(coords.lat), lng: Number(coords.lng), label: 'Reported location' }]
    : [];

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Report an Issue</h2>
          <p className="text-sm text-gray-500">Be the city's eyes on the ground. Earn Civic Points for helpful reports.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full text-sm">
          <Sparkles size={16} /> AI Assist Enabled
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional — helps with leaderboard"
              className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, severity, nearby landmarks, etc."
              className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={autoDetect ? heuristicCategory(description) : category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={autoDetect}
                  className="w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600 disabled:bg-gray-50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                />
                Auto-detect with AI
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">Attach Photo</label>
              <div className="mt-1 flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="block w-full text-sm" />
                <div className="shrink-0 h-10 w-10 grid place-items-center rounded-md bg-gray-100 text-gray-600">
                  <Camera size={18} />
                </div>
              </div>
              {preview && (
                <img src={preview} alt="preview" className="mt-2 h-36 w-full object-cover rounded-md border" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Latitude</label>
              <input
                type="number"
                step="any"
                value={coords.lat}
                onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
                placeholder="Auto or manual"
                className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Longitude</label>
              <input
                type="number"
                step="any"
                value={coords.lng}
                onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))}
                placeholder="Auto or manual"
                className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Address (optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nearest address or landmark"
                className="mt-1 w-full rounded-md border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={pickLocation}
            className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800"
          >
            <MapPin size={16} /> Use my current location
          </button>

          <div className="pt-2">
            <MapView center={mapCenter} markers={mapMarkers} height="300px" />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="h-full rounded-lg border border-gray-200 p-4 bg-gradient-to-b from-emerald-50 to-white">
            <h3 className="font-medium">Civic Points</h3>
            <p className="text-sm text-gray-600 mt-1">Earn points for valid, high-quality reports. Misuse may result in deductions.</p>
            <ul className="mt-3 text-sm list-disc list-inside text-gray-700 space-y-1">
              <li>+20 for validated high-risk issues</li>
              <li>+10 for validated standard issues</li>
              <li>-25 for fake or malicious reports</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Send size={16} /> Submit Report
        </button>
      </div>
    </form>
  );
}
