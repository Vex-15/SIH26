import { useState, useEffect, useRef } from 'react';
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
          background: rgba(249, 115, 22, 0.95);
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.9), 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
        </div>
      `;

      // Attach marker to map with high contrast popup
      const newMarker = new maplibregl.Marker({ element: el })
        .setLngLat([lonNum, latNum])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<b style="color:#0f172a;font-size:13px;font-family:sans-serif;">${name}</b><br/><span style="font-size:11px;color:#475569;font-family:monospace;">${latNum.toFixed(4)}, ${lonNum.toFixed(4)}</span>`
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
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 16,
        left: 72,
        zIndex: 50,
        width: 380,
        background: 'rgb(18, 22, 31)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: 14,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          style={{
            color: '#f97316',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          LOCATION TOOL
        </span>
        <button
          onClick={() => setLocationSearchOpen(false)}
          style={{
            backgroundColor: '#f97316',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
          title="Close Location Tool"
        >
          <X size={16} strokeWidth={2.8} />
        </button>
      </div>

      {/* ── 3 Tab Navigation Bar ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Tab 1: Current Location */}
        <button
          onClick={() => setActiveTab('current')}
          style={{
            padding: '10px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'current' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
            color: activeTab === 'current' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: activeTab === 'current' ? '2px solid #f97316' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'current' ? 700 : 500,
            fontSize: 11,
            transition: 'all 0.15s ease',
          }}
        >
          <Crosshair size={18} color={activeTab === 'current' ? '#f97316' : 'rgba(255, 255, 255, 0.5)'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div>Current</div>
            <div>Location</div>
          </div>
        </button>

        {/* Tab 2: Find Location */}
        <button
          onClick={() => setActiveTab('find')}
          style={{
            padding: '10px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'find' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
            color: activeTab === 'find' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: activeTab === 'find' ? '2px solid #f97316' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'find' ? 700 : 500,
            fontSize: 11,
            transition: 'all 0.15s ease',
          }}
        >
          <Search size={20} color={activeTab === 'find' ? '#f97316' : 'rgba(255, 255, 255, 0.5)'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Find</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>Location</div>
          </div>
        </button>

        {/* Tab 3: Saved Locations */}
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '10px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: activeTab === 'saved' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
            color: activeTab === 'saved' ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            borderBottom: activeTab === 'saved' ? '2px solid #f97316' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'saved' ? 700 : 500,
            fontSize: 11,
            transition: 'all 0.15s ease',
          }}
        >
          <Flag size={18} color={activeTab === 'saved' ? '#f97316' : 'rgba(255, 255, 255, 0.5)'} />
          <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <div>Saved</div>
            <div>Locations</div>
          </div>
        </button>
      </div>

      {/* ── Main Content Body ── */}
      <div style={{ padding: 14 }}>
        {/* ──────── TAB 1: FIND LOCATION ──────── */}
        {activeTab === 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Search Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for location or enter coordinates"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontWeight: 600,
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
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} strokeWidth={2.8} />
                </button>
              )}
            </div>

            {/* Coordinates Status Strip */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
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
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 2px 6px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <Plus size={12} /> SAVE
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Box */}
            {isLoading && (
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', padding: '6px 0', textAlign: 'center' }}>
                Searching locations...
              </div>
            )}

            {results.length > 0 && (
              <div
                style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
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
                        padding: '9px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <MapPin size={15} color="#f97316" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
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
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
              Pinpoint your browser's GPS location on the map.
            </div>
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              style={{
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
              }}
            >
              <Navigation size={16} />
              {isLocating ? 'Acquiring GPS Fix...' : 'Use My GPS Location'}
            </button>
            {gpsError && (
              <div style={{ fontSize: 11, color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 8, borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                {gpsError}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 3: SAVED LOCATIONS ──────── */}
        {activeTab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedLocations.length === 0 ? (
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '12px 0' }}>
                No saved locations yet.
              </div>
            ) : (
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedLocations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      onClick={() => handleSelectLocation(item.lat, item.lon, item.name)}
                      style={{ cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>{item.name}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.5)' }}>
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
                          borderRadius: 4,
                          padding: '4px 9px',
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
                          color: 'rgba(255, 255, 255, 0.4)',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Checkbox Bar ── */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '11px 16px',
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
          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#f97316' }}
        />
        <label
          htmlFor="allow-multiple"
          style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', userSelect: 'none' }}
        >
          Allow multiple location selection
        </label>
      </div>
    </motion.div>
  );
}
