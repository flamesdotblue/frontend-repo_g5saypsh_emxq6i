import React, { useEffect, useRef } from 'react';

// Lightweight, defensive Map component
// - If VITE_MAPMYINDIA_TOKEN is set, attempts to load MapmyIndia JS SDK
// - Falls back to OpenStreetMap tiles via Leaflet (no extra install needed; provided by MapmyIndia SDK if loaded, otherwise loads Leaflet from CDN)
// - Renders markers for provided coordinates

const MMI_URL = (token) => `https://apis.mapmyindia.com/advancedmaps/v1/${token}/map_load?v=1.5.4`;
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export default function MapView({ center = { lat: 28.6139, lng: 77.209 }, markers = [], zoom = 13, height = '280px' }) {
  const mapRef = useRef(null);
  const elRef = useRef(null);

  // Load a script once
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.getElementsByTagName('script')).find((s) => s.src === src);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.addEventListener('load', () => {
        s.setAttribute('data-loaded', 'true');
        resolve();
      });
      s.addEventListener('error', (e) => reject(e));
      document.body.appendChild(s);
    });
  }

  function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  useEffect(() => {
    let mounted = true;
    const token = import.meta?.env?.VITE_MAPMYINDIA_TOKEN;

    async function init() {
      try {
        // Prefer MapmyIndia SDK if token present
        if (token) {
          await loadScript(MMI_URL(token));
        } else {
          // Ensure Leaflet is available if MMI SDK isn't used
          loadCss(LEAFLET_CSS);
          await loadScript(LEAFLET_JS);
        }

        if (!mounted || !elRef.current) return;

        const L = window.L; // Leaflet global used by both MMI SDK and pure Leaflet
        if (!L) throw new Error('Leaflet not available');

        // Initialize map once
        if (!mapRef.current) {
          mapRef.current = L.map(elRef.current).setView([center.lat, center.lng], zoom);

          // If MapmyIndia tiles available via SDK, use default; otherwise fallback to OSM tiles
          if (!token) {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapRef.current);
          } // MMI SDK injects its own tiles when present
        } else {
          mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
        }

        // Clear previous markers layer if any
        if (mapRef.current._markerLayer) {
          mapRef.current.removeLayer(mapRef.current._markerLayer);
        }
        const markerLayer = L.layerGroup();
        markers.forEach((m) => {
          if (m.lat != null && m.lng != null) {
            const marker = L.marker([m.lat, m.lng]);
            if (m.label) marker.bindPopup(m.label);
            marker.addTo(markerLayer);
          }
        });
        markerLayer.addTo(mapRef.current);
        mapRef.current._markerLayer = markerLayer;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Map initialization failed. Showing placeholder.', e);
      }
    }

    init();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, zoom, JSON.stringify(markers)]);

  return (
    <div>
      <div ref={elRef} className="w-full rounded-md overflow-hidden border" style={{ height }} />
      {!import.meta?.env?.VITE_MAPMYINDIA_TOKEN && (
        <p className="mt-2 text-xs text-gray-500">Using OpenStreetMap tiles. Set VITE_MAPMYINDIA_TOKEN in your environment to enable MapmyIndia maps.</p>
      )}
    </div>
  );
}
