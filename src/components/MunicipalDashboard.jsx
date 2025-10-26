import React from 'react';
import MapView from './MapView';
import ReportList from './ReportList';

export default function MunicipalDashboard({ reports, onStatusChange, onRemove, onCleanup }) {
  const markers = reports
    .filter((r) => r?.location?.lat != null && r?.location?.lng != null)
    .map((r) => ({ lat: r.location.lat, lng: r.location.lng, label: r.description.slice(0, 60) }));

  const center = markers[0] || { lat: 28.6139, lng: 77.209 };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Municipal Dashboard</h2>
            <p className="text-sm text-gray-500">Live map of incoming reports and management tools.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCleanup?.(7)}
              className="px-3 py-2 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Cleanup: Resolved > 7 days
            </button>
          </div>
        </div>
        <div className="mt-4">
          <MapView center={center} markers={markers} height="360px" />
        </div>
      </div>

      <ReportList reports={reports} onStatusChange={onStatusChange} onRemove={onRemove} adminMode />
    </div>
  );
}
