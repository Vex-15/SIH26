import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Crosshair, Flag, MapPin, Trash2, Plus, Navigation } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import * as maplibregl from 'maplibre-gl';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

export function LocationSearchPopover() {
  const {
    map,
    setLocationSearchOpen,
    searchedLocation,
    setSearchedLocation,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    allowMultipleSelection,
    setAllowMultipleSelection,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'current' | 'find' | 'saved'>('find');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coordsDisplay, setCoordsDisplay] = useState<string>(
    searchedLocation
      ? `Coordinates: ${searchedLocation.lat.toFixed(4)}, ${searchedLocation.lon.toFixed(4)}`
      : 'Coordinates: lat, lon'
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map marker ref to keep track of added pin
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check if input is direct coordinates e.g., "28.6139, 77.2090" or "28.6139 77.2090"
    const coordMatch = query.trim().match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setResults([
          {
            place_id: 999999,
            display_name: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            lat: lat.toString(),
            lon: lon.toString(),
            type: 'Coordinates',
          },
        ]);
        return;
      }
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fly to location and place marker
  const handleSelectLocation = (latNum: number, lonNum: number, name: string) => {
    setSearchedLocation({ name, lat: latNum, lon: lonNum });
    setCoordsDisplay(`Coordinates: ${latNum.toFixed(4)}, ${lonNum.toFixed(4)}`);

    if (map) {
      map.flyTo({
        center: [lonNum, latNum],
        zoom: 11,
        duration: 2000,
        essential: true,
      });

      // Remove existing search marker if present
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create a glowing custom marker element
      const el = document.createElement('div');
      el.className = 'location-pulse-marker';
      el.innerHTML = `
        <div style="
          width: 26px;
          height: 26px;
          background: rgba(234, 88, 12, 0.9);
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 18px rgba(234, 88, 12, 0.9), 0 0 8px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
      `;

      // Attach marker to map
      const newMarker = new maplibregl.Marker({ element: el })
        .setLngLat([lonNum, latNum])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<b style="color:#0f172a;font-size:12px;">${name}</b><br/><span style="font-size:11px;color:#475569;">${latNum.toFixed(4)}, ${lonNum.toFixed(4)}</span>`
          )
        )
        .addTo(map);

      newMarker.togglePopup();
      markerRef.current = newMarker;
    }
  };

  // Get current user location via Geolocation API
  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleSelectLocation(latitude, longitude, 'My Current Location');
        setIsLocating(false);
      },
      (err) => {
        setGpsError(`Unable to retrieve location: ${err.message}`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: 16,
        left: 72,
        zIndex: 50,
        width: 380,
        backgroundColor: '#0b1928',
        border: '1px solid #1c3552',
        borderRadius: 6,
        boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* ── Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#071322',
          borderBottom: '1px solid #16293f',
        }}
      >
        <span
          style={{
            color: '#f95700',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          LOCATION TOOL
        </span>
        <button
          onClick={() => setLocationSearchOpen(false)}
          style={{
            backgroundColor: '#ea580c',
            color: '#ffffff',
            border: 'none',
            borderRadius: 3,
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Close Location Tool"
        >
          <X size={15} strokeWidth={3} />
        </button>
      </div>

      {/* ── 3 Tab Navigation Bar (Identical to NASA FIRMS UI) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          backgroundColor: '#102033',
          borderBottom: '1px solid #1a324d',
        }}
      >
        {/* Tab 1: Current Location */}
        <button
          onClick={() => setActiveTab('current')}
          style={{
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'current' ? '#071220' : '#14253b',
            color: activeTab === 'current' ? '#ffffff' : '#8ba5bd',
            border: 'none',
            borderRight: '1px solid #0d1b2c',
            borderBottom: activeTab === 'current' ? '2px solid #f95700' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'current' ? 700 : 500,
            fontSize: 11,
          }}
        >
          <Crosshair size={18} color={activeTab === 'current' ? '#ffffff' : '#8ba5bd'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div>Current</div>
            <div>Location</div>
          </div>
        </button>

        {/* Tab 2: Find Location */}
        <button
          onClick={() => setActiveTab('find')}
          style={{
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'find' ? '#071220' : '#14253b',
            color: activeTab === 'find' ? '#ffffff' : '#8ba5bd',
            border: 'none',
            borderRight: '1px solid #0d1b2c',
            borderBottom: activeTab === 'find' ? '2px solid #f95700' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'find' ? 700 : 500,
            fontSize: 11,
          }}
        >
          <Search size={22} color={activeTab === 'find' ? '#ffffff' : '#8ba5bd'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Find</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Location</div>
          </div>
        </button>

        {/* Tab 3: Saved Locations */}
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'saved' ? '#071220' : '#14253b',
            color: activeTab === 'saved' ? '#ffffff' : '#8ba5bd',
            border: 'none',
            borderBottom: activeTab === 'saved' ? '2px solid #f95700' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'saved' ? 700 : 500,
            fontSize: 11,
          }}
        >
          <Flag size={18} color={activeTab === 'saved' ? '#ffffff' : '#8ba5bd'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div>Saved</div>
            <div>Locations</div>
          </div>
        </button>
      </div>

      {/* ── Main Tab Content Area ── */}
      <div style={{ padding: 12, backgroundColor: '#0b1928' }}>
        {/* ──────── TAB 1: FIND LOCATION ──────── */}
        {activeTab === 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Search Input with Attached Orange Clear Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for location or enter coordinates"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                }}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Active Coordinates Sub-Bar */}
            <div
              style={{
                backgroundColor: '#08223e',
                border: '1px solid #1a3c63',
                borderRadius: 3,
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#93c5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{coordsDisplay}</span>
              {searchedLocation && (
                <button
                  onClick={() =>
                    addSavedLocation({
                      name: searchedLocation.name,
                      lat: searchedLocation.lat,
                      lon: searchedLocation.lon,
                    })
                  }
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 3,
                    padding: '2px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Plus size={11} /> SAVE
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Box */}
            {isLoading && (
              <div style={{ fontSize: 11, color: '#94a3b8', padding: '6px 0', textAlign: 'center' }}>
                Searching location data...
              </div>
            )}

            {results.length > 0 && (
              <div
                style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  backgroundColor: '#06111f',
                  border: '1px solid #1e3a5f',
                  borderRadius: 3,
                }}
              >
                {results.map((res) => {
                  const latNum = parseFloat(res.lat);
                  const lonNum = parseFloat(res.lon);
                  return (
                    <div
                      key={res.place_id}
                      onClick={() => handleSelectLocation(latNum, lonNum, res.display_name)}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #0d1e33',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#11233b')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <MapPin size={14} color="#f95700" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>
                          {res.display_name}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>
                          {latNum.toFixed(4)}, {lonNum.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 2: CURRENT LOCATION ──────── */}
        {activeTab === 'current' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', padding: '6px 0' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Pinpoint your browser's GPS hardware location on the map.
            </div>
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: 3,
                padding: '10px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Navigation size={15} />
              {isLocating ? 'Acquiring GPS Fix...' : 'Use My GPS Location'}
            </button>
            {gpsError && (
              <div style={{ fontSize: 11, color: '#f87171', backgroundColor: '#450a0a', padding: 6, borderRadius: 3 }}>
                {gpsError}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 3: SAVED LOCATIONS ──────── */}
        {activeTab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedLocations.length === 0 ? (
              <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
                No saved locations.
              </div>
            ) : (
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedLocations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#071322',
                      border: '1px solid #16293f',
                      borderRadius: 3,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      onClick={() => handleSelectLocation(item.lat, item.lon, item.name)}
                      style={{ cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{item.name}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>
                        {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleSelectLocation(item.lat, item.lon, item.name)}
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 2,
                          padding: '3px 8px',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Fly
                      </button>
                      <button
                        onClick={() => removeSavedLocation(item.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#94a3b8',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Checkbox Bar (Identical to NASA FIRMS UI) ── */}
      <div
        style={{
          backgroundColor: '#152438',
          borderTop: '1px solid #1e3654',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <input
          type="checkbox"
          id="allow-multiple"
          checked={allowMultipleSelection}
          onChange={(e) => setAllowMultipleSelection(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#ea580c' }}
        />
        <label
          htmlFor="allow-multiple"
          style={{ fontSize: 12, color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}
        >
          Allow multiple location selection
        </label>
      </div>
    </motion.div>
  );
}
