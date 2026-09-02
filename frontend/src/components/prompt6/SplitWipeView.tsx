import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Wind, Flame } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  fetchLiveWindData,
  createFireSpreadGeoJson,
  type WindTelemetry,
} from '../../utils/windSpreadModel';

type CompareMode = 'wipe' | 'sidebyside' | 'blend';

const MIN_PCT = 15;
const MAX_PCT = 85;

// High-precision Panipat MIDC Industrial Accidental Fire Coordinate
const DEFAULT_TARGET_COORD: [number, number] = [76.9635, 29.3909];
const DEFAULT_ZOOM = 14.2;

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
      maxzoom: 19,
    },
    'esri-boundaries-places': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'esri-places-layer',
      type: 'raster',
      source: 'esri-boundaries-places',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-opacity': 0.85,
      },
    },
  ],
};

const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function SplitWipeView() {
  const { selectedCluster } = useAppStore();
  const [wipePct, setWipePct]         = useState(50);
  const [mode, setMode]               = useState<CompareMode>('wipe');
  const [isDragging, setIsDragging]   = useState(false);
  const [isHovered, setIsHovered]     = useState(false);
  const [windData, setWindData]       = useState<WindTelemetry | null>(null);
  
  const targetCoord: [number, number] = selectedCluster
    ? [selectedCluster.lon, selectedCluster.lat]
    : DEFAULT_TARGET_COORD;

  const containerRef    = useRef<HTMLDivElement>(null);

  const opticalMapRef   = useRef<HTMLDivElement>(null);
  const thermalMapRef   = useRef<HTMLDivElement>(null);
  const opticalMapInst  = useRef<maplibregl.Map | null>(null);
  const thermalMapInst  = useRef<maplibregl.Map | null>(null);
  const isSyncingRef    = useRef(false);

  const clampPct = (raw: number) => Math.min(MAX_PCT, Math.max(MIN_PCT, raw));

  const onPointerMove = useCallback((e: PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setWipePct(clampPct(((e.clientX - rect.left) / rect.width) * 100));
  }, []);

  const stopDrag = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDrag);
  }, [onPointerMove]);

  const startDrag = useCallback(() => {
    setIsDragging(true);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
  }, [onPointerMove, stopDrag]);

  useEffect(() => () => stopDrag(), [stopDrag]);

  // ── Fetch Atmospheric Meteorological Wind Data ───────────────────────────
  useEffect(() => {
    let isMounted = true;
    fetchLiveWindData(targetCoord[1], targetCoord[0]).then((w) => {
      if (isMounted) setWindData(w);
    });
    return () => { isMounted = false; };
  }, [targetCoord[0], targetCoord[1]]);

  // ── Initialize Synchronized Dual MapLibre Instances ────────────────────────
  useEffect(() => {
    if (!opticalMapRef.current || !thermalMapRef.current) return;

    // 1. Optical Satellite Map Instance
    const optMap = new maplibregl.Map({
      container: opticalMapRef.current,
      style: SATELLITE_STYLE,
      center: targetCoord,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    // 2. Thermal Basemap Instance
    const thMap = new maplibregl.Map({
      container: thermalMapRef.current,
      style: CARTO_DARK_STYLE,
      center: targetCoord,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    opticalMapInst.current = optMap;
    thermalMapInst.current = thMap;

    // Map Event Synchronization Handlers
    const syncMaps = (source: maplibregl.Map, target: maplibregl.Map) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      target.jumpTo({
        center: source.getCenter(),
        zoom: source.getZoom(),
        bearing: source.getBearing(),
        pitch: source.getPitch(),
      });

      isSyncingRef.current = false;
    };


    optMap.on('move', () => syncMaps(optMap, thMap));
    thMap.on('move',  () => syncMaps(thMap, optMap));

    // ── Geographically Anchored Pulsing Threat Marker on Thermal Map ──
    const markerEl = document.createElement('div');
    markerEl.className = 'thermal-threat-marker';
    markerEl.style.width = '28px';
    markerEl.style.height = '28px';
    markerEl.style.position = 'relative';
    markerEl.style.cursor = 'pointer';

    markerEl.innerHTML = `
      <div style="position:absolute; inset:6px; border-radius:50%; background:#ef4444; box-shadow:0 0 16px #ef4444; z-index:2;"></div>
      <div class="pulse-ring r1" style="position:absolute; inset:0; border-radius:50%; border:1.5px solid #ef4444; animation:sonarPulse 2.4s ease-out infinite;"></div>
      <div class="pulse-ring r2" style="position:absolute; inset:0; border-radius:50%; border:1.5px solid #ef4444; animation:sonarPulse 2.4s ease-out 0.8s infinite;"></div>
      <div class="pulse-ring r3" style="position:absolute; inset:0; border-radius:50%; border:1.5px solid #ef4444; animation:sonarPulse 2.4s ease-out 1.6s infinite;"></div>
    `;

    const threatMarker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
      .setLngLat(targetCoord)
      .addTo(thMap);

    // ── Load Real GeoJSON Vectors on Optical Satellite Map ──
    optMap.on('load', async () => {
      const liveWind = await fetchLiveWindData(targetCoord[1], targetCoord[0]);
      const spreadGeoJson = createFireSpreadGeoJson(targetCoord[0], targetCoord[1], liveWind);

      if (!optMap.getSource('fire-spread-src')) {
        optMap.addSource('fire-spread-src', {
          type: 'geojson',
          data: spreadGeoJson,
        });

        // Fill Zones (1h, 3h, 6h)
        optMap.addLayer({
          id: 'fire-spread-fill',
          type: 'fill',
          source: 'fire-spread-src',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': [
              'match', ['get', 'tier'],
              '1h', '#ef4444',
              '3h', '#f97316',
              '6h', '#f59e0b',
              '#ef4444',
            ],
            'fill-opacity': [
              'match', ['get', 'tier'],
              '1h', 0.28,
              '3h', 0.18,
              '6h', 0.10,
              0.15,
            ],
          },
        });

        // Zone Outline Strokes
        optMap.addLayer({
          id: 'fire-spread-lines',
          type: 'line',
          source: 'fire-spread-src',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'line-color': [
              'match', ['get', 'tier'],
              '1h', '#ef4444',
              '3h', '#f97316',
              '6h', '#f59e0b',
              '#ef4444',
            ],
            'line-width': [
              'match', ['get', 'tier'],
              '1h', 2.0,
              '3h', 1.6,
              '6h', 1.2,
              1.5,
            ],
            'line-dasharray': [4, 2],
          },
        });

        // Atmospheric Wind Vector Line
        optMap.addLayer({
          id: 'wind-vector-line',
          type: 'line',
          source: 'fire-spread-src',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#38bdf8',
            'line-width': 3,
            'line-dasharray': [3, 2],
          },
        });
      }
    });

    // ── Load precision point hotspots onto the thermal map ──
    thMap.on('load', async () => {
      try {
        const res = await fetch('/data/india_hotspots_precision_points.geojson');
        if (!res.ok) return;
        const data = await res.json();

        if (thMap.getSource('thermal-points')) return;

        thMap.addSource('thermal-points', {
          type: 'geojson',
          data,
        });

        // Glow Layer
        thMap.addLayer({
          id: 'points-glow',
          type: 'circle',
          source: 'thermal-points',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 8, 15, 22],
            'circle-color': [
              'interpolate', ['linear'], ['get', 'brightness'],
              320, '#f59e0b',
              350, '#ef4444',
              370, '#ffffff',
            ],
            'circle-opacity': 0.35,
            'circle-blur': 0.8,
          },
        });

        // Core Point Layer
        thMap.addLayer({
          id: 'points-core',
          type: 'circle',
          source: 'thermal-points',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 10, 4, 15, 9],
            'circle-color': [
              'interpolate', ['linear'], ['get', 'brightness'],
              320, '#f59e0b',
              350, '#ef4444',
              370, '#ffffff',
            ],
            'circle-stroke-width': 1.0,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95,
          },
        });
      } catch (err) {
        console.warn('Failed to load thermal points in SplitWipeView:', err);
      }
    });

    return () => {
      threatMarker.remove();
      optMap.remove();
      thMap.remove();
    };
  }, [targetCoord[0], targetCoord[1]]);

  const effectivePct   = mode === 'sidebyside' ? 50 : wipePct;
  const thermalOpacity = mode === 'blend' ? 0.55 : 1;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: isDragging ? 'ew-resize' : 'default',
        userSelect: 'none',
        background: '#0d0d0d',
      }}
    >
      <style>{`
        @keyframes sonarPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(4.5); opacity: 0; }
        }
      `}</style>

      {/* ── Optical Map (Real Satellite Imagery) ── */}
      <div
        ref={opticalMapRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: '#0d0d0d',
        }}
      />

      {/* ── Thermal Map (Clipped Layer with VIIRS Hotspots) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - effectivePct}% 0 0)`,
          opacity: thermalOpacity,
          transition: mode !== 'wipe' ? 'clip-path 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease' : undefined,
        }}
      >
        <div
          ref={thermalMapRef}
          style={{
            width: '100%',
            height: '100%',
            background: '#0d0d0d',
          }}
        />
      </div>

      {/* ── Split Divider + Handle (Wipe Mode) ── */}
      <AnimatePresence>
        {mode === 'wipe' && (
          <motion.div
            key="divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${wipePct}%`,
              width: 2,
              background: 'rgba(255, 255, 255, 0.45)',
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <div
              onPointerDown={startDrag}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 72,
                borderRadius: 20,
                background: '#18181b',
                border: isDragging || isHovered
                  ? '1px solid rgba(255, 255, 255, 0.25)'
                  : '1px solid rgba(255, 255, 255, 0.10)',
                cursor: 'ew-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                pointerEvents: 'all',
                transition: 'border-color 150ms ease, background 150ms ease',
                zIndex: 31,
                boxShadow: isDragging ? '0 0 16px rgba(0,0,0,0.8)' : 'none',
              }}
            >
              <ChevronPair active={isDragging || isHovered} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sleek Minimal Top Sensor Pill (Clean & De-bloated) ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-full)',
          padding: '6px 14px',
          boxShadow: 'var(--neu-shadow-out-sm)',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          Thermal · VIIRS 375m
        </span>

        <span style={{ width: 1, height: 12, background: 'var(--border-subtle)', flexShrink: 0 }} />

        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--neu-text)',
          }}
        >
          Optical · Sentinel‑2 10m
        </span>

        {windData && (
          <>
            <span style={{ width: 1, height: 12, background: 'var(--border-subtle)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wind size={11} color="#38bdf8" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: '#38bdf8',
                  fontWeight: 600,
                }}
              >
                {windData.speedKmH.toFixed(0)} km/h {windData.compassDir}
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* ── Fire Spread Dispersion HUD (Bottom-Right Telemetry Card) ── */}
      {windData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 80,
            zIndex: 45,
            width: 260,
            background: 'var(--neu-base)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 14px',
            fontFamily: 'var(--font-ui)',
            color: 'var(--neu-text-strong)',
            boxShadow: 'var(--neu-shadow-out)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flame size={13} color="#ef4444" />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ef4444' }}>
                Fire Spread Analysis
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#22c55e', fontWeight: 600 }}>
                {windData.isLiveApi ? 'LIVE API' : 'CALIBRATED'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div style={{ background: 'var(--neu-base-raised)', padding: '6px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase' }}>Wind Vector</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {windData.speedKmH.toFixed(1)} km/h {windData.compassDir}
              </div>
            </div>
            <div style={{ background: 'var(--neu-base-raised)', padding: '6px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase' }}>Spread Rate</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {windData.rateOfSpreadMPerHr} m/hr
              </div>
            </div>
          </div>

          {/* Atmospheric Air Quality & Smoke Plume Row */}
          <div style={{ background: 'var(--neu-base-raised)', padding: '6px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)', marginBottom: 8, fontSize: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neu-text)', marginBottom: 2 }}>
              <span>Temp / Humidity</span>
              <span style={{ color: 'var(--neu-text-strong)', fontFamily: 'var(--font-mono)' }}>{windData.tempC}°C · {windData.humidityPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neu-text)' }}>
              <span>Smoke PM2.5 / AOD</span>
              <span style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{windData.pm25.toFixed(1)} · {windData.aod.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ color: 'var(--neu-text)' }}>1-Hr Hazard</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>0.8 km</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} />
                <span style={{ color: 'var(--neu-text)' }}>3-Hr Threat</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f97316', fontWeight: 600 }}>2.4 km</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ color: 'var(--neu-text)' }}>6-Hr Perimeter</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>4.8 km</span>
            </div>
          </div>

        </motion.div>
      )}

      {/* ── Comparison Mode Selector (Bottom-Center) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-full)',
          padding: 3,
          display: 'flex',
          gap: 2,
          boxShadow: 'var(--neu-shadow-out-sm)',
        }}
      >
        {([
          { id: 'wipe',       label: 'Wipe'       },
          { id: 'sidebyside', label: 'Side-by-Side' },
          { id: 'blend',      label: 'Blend'      },
        ] as { id: CompareMode; label: string }[]).map(({ id, label }) => {
          const isActive = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                padding: '5px 12px',
                borderRadius: 'var(--r-full)',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                background: isActive ? 'var(--neu-base-raised)' : 'transparent',
                color: isActive ? 'var(--neu-text-strong)' : 'var(--neu-text)',
                transition: 'all 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </motion.div>

      {/* ── Fixed Bottom-Left Credits Pill ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 50,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-full)',
          padding: '4px 10px',
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          color: 'var(--neu-text-disabled)',
          cursor: 'default',
        }}
      >
        © Esri · Sentinel-2 · VIIRS
      </div>
    </div>
  );
}

// ─── Chevron Pair Subcomponent ───────────────────────────────────────────────

function ChevronPair({ active }: { active: boolean }) {
  const color = active ? '#fafafa' : '#71717a';
  return (
    <>
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path
          d="M7 1L1 7L7 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke 150ms ease' }}
        />
      </svg>
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path
          d="M1 1L7 7L1 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke 150ms ease' }}
        />
      </svg>
    </>
  );
}
