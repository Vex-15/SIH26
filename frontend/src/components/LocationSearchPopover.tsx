import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Crosshair, Bookmark, MapPin, Trash2, Plus, Navigation } from 'lucide-react';
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
      ? `${searchedLocation.lat.toFixed(4)}, ${searchedLocation.lon.toFixed(4)}`
      : 'Lat, Lon'
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map marker ref
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

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
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Fly to location and place clean marker
  const handleSelectLocation = (latNum: number, lonNum: number, name: string) => {
    setSearchedLocation({ name, lat: latNum, lon: lonNum });
    setCoordsDisplay(`${latNum.toFixed(4)}, ${lonNum.toFixed(4)}`);

    if (map) {
      map.flyTo({
        center: [lonNum, latNum],
        zoom: 11,
        duration: 1800,
        essential: true,
      });

      if (markerRef.current) {
        markerRef.current.remove();
      }

      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.background = 'var(--accent)';
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

      const newMarker = new maplibregl.Marker({ element: el })
        .setLngLat([lonNum, latNum])
        .setPopup(
          new maplibregl.Popup({ offset: 15 }).setHTML(
            `<div style="font-family:sans-serif;padding:2px 4px;"><b style="font-size:12px;">${name}</b><br/><span style="font-size:10px;color:#64748b;font-family:monospace;">${latNum.toFixed(4)}, ${lonNum.toFixed(4)}</span></div>`
          )
        )
        .addTo(map);

      newMarker.togglePopup();
      markerRef.current = newMarker;
    }
  };

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
        handleSelectLocation(latitude, longitude, 'My GPS Location');
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
      initial={{ opacity: 0, scale: 0.98, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -6 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 20,
        left: 72,
        zIndex: 95,
        width: 340,
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--neu-shadow-out)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--neu-text-strong)',
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
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--neu-text-disabled)',
          }}
        >
          Coordinates & Location
        </span>
        <button
          onClick={() => setLocationSearchOpen(false)}
          className="neu-icon-btn"
          style={{ width: 24, height: 24 }}
          title="Close"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>

      {/* ── Minimalist Segmented Tabs ── */}
      <div
        style={{
          display: 'flex',
          padding: '6px 12px',
          gap: 4,
          background: 'var(--neu-base-raised)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { id: 'find', label: 'Search', icon: Search },
          { id: 'current', label: 'GPS Fix', icon: Crosshair },
          { id: 'saved', label: 'Saved', icon: Bookmark },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                background: isActive ? 'var(--neu-base)' : 'transparent',
                color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: 11,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} strokeWidth={isActive ? 2 : 1.5} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Body ── */}
      <div style={{ padding: 12 }}>
        {activeTab === 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Search Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-sm)',
                padding: '2px 8px',
              }}
            >
              <Search size={14} color="var(--neu-text-disabled)" style={{ marginRight: 6 }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, district, or 28.61, 77.20"
                style={{
                  width: '100%',
                  padding: '7px 0',
                  background: 'transparent',
                  color: 'var(--neu-text-strong)',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  fontFamily: 'var(--font-ui)',
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
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neu-text-disabled)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Coordinates Status Strip */}
            <div
              style={{
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-sm)',
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--neu-text)',
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
                  className="neu-btn"
                  style={{ padding: '2px 8px', fontSize: 10 }}
                >
                  <Plus size={11} /> Save
                </button>
              )}
            </div>

            {/* Autocomplete Suggestions Box */}
            {isLoading && (
              <div style={{ fontSize: 11, color: 'var(--neu-text-disabled)', padding: '4px 0', textAlign: 'center' }}>
                Searching...
              </div>
            )}

            {results.length > 0 && (
              <div
                style={{
                  maxHeight: 160,
                  overflowY: 'auto',
                  background: 'var(--neu-base-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
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
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neu-base-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MapPin size={13} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--neu-text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.display_name}
                        </div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)', marginTop: 1 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center', padding: '4px 0' }}>
            <div style={{ fontSize: 11, color: 'var(--neu-text)' }}>
              Pinpoint your browser GPS fix on the map canvas.
            </div>
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="neu-btn"
              style={{ width: '100%', padding: '8px' }}
            >
              <Navigation size={14} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Locate Position'}</span>
            </button>
            {gpsError && (
              <div style={{ fontSize: 10, color: '#ef4444', padding: '6px 8px', borderRadius: 'var(--r-sm)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {gpsError}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 3: SAVED LOCATIONS ──────── */}
        {activeTab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {savedLocations.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--neu-text-disabled)', textAlign: 'center', padding: '12px 0' }}>
                No saved pins yet.
              </div>
            ) : (
              <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {savedLocations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--neu-base-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--r-sm)',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      onClick={() => handleSelectLocation(item.lat, item.lon, item.name)}
                      style={{ cursor: 'pointer', overflow: 'hidden', minWidth: 0, paddingRight: 8 }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--neu-text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)' }}>
                        {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => handleSelectLocation(item.lat, item.lon, item.name)}
                        className="neu-btn"
                        style={{ padding: '2px 8px', fontSize: 10 }}
                      >
                        Fly
                      </button>
                      <button
                        onClick={() => removeSavedLocation(item.id)}
                        className="neu-icon-btn"
                        style={{ width: 22, height: 22 }}
                        title="Remove"
                      >
                        <Trash2 size={11} />
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
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--neu-base-raised)',
        }}
      >
        <input
          type="checkbox"
          id="allow-multiple"
          checked={allowMultipleSelection}
          onChange={(e) => setAllowMultipleSelection(e.target.checked)}
          style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <label
          htmlFor="allow-multiple"
          style={{ fontSize: 11, color: 'var(--neu-text)', cursor: 'pointer', userSelect: 'none' }}
        >
          Allow multi-point selection
        </label>
      </div>
    </motion.div>
  );
}
