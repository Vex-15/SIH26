import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Wind, Flame } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { PANIPAT_CLUSTER } from '../EmergencySimulationModal';
import {
  fetchLiveWindData,
  createFireSpreadGeoJson,
  generateWindStreamlines,
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
  const { selectedCluster, setSelectedCluster, currentHour, isSimulating } = useAppStore();
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

  // ── Dynamically update mathematical fire spread polygon as timeline scrubs ──
  useEffect(() => {
    if (!windData) return;
    const elapsedHours = Math.max(0.6, currentHour >= 11 ? currentHour - 11 : 2.5);
    const updatedGeoJson = createFireSpreadGeoJson(targetCoord[0], targetCoord[1], windData, elapsedHours);

    const thSource = thermalMapInst.current?.getSource('fire-spread-src') as maplibregl.GeoJSONSource | undefined;
    if (thSource && typeof thSource.setData === 'function') {
      thSource.setData(updatedGeoJson);
    }

    const optSource = opticalMapInst.current?.getSource('fire-spread-src') as maplibregl.GeoJSONSource | undefined;
    if (optSource && typeof optSource.setData === 'function') {
      optSource.setData(updatedGeoJson);
    }
  }, [currentHour, windData, targetCoord[0], targetCoord[1]]);

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

    // ── Static fire origin dot marker (clickable to open incident telemetry) ──
    const markerEl = document.createElement('div');
    markerEl.style.width = '12px';
    markerEl.style.height = '12px';
    markerEl.style.borderRadius = '50%';
    markerEl.style.background = '#ef4444';
    markerEl.style.border = '2px solid #ffffff';
    markerEl.style.cursor = 'pointer';
    markerEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.9)';
    markerEl.title = 'Click to open Panipat Incident Telemetry & ML Dossier';
    markerEl.onclick = () => {
      setSelectedCluster(PANIPAT_CLUSTER as any);
    };

    const threatMarker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
      .setLngLat(targetCoord)
      .addTo(thMap);

    const optMarkerEl = document.createElement('div');
    optMarkerEl.style.width = '12px';
    optMarkerEl.style.height = '12px';
    optMarkerEl.style.borderRadius = '50%';
    optMarkerEl.style.background = '#ef4444';
    optMarkerEl.style.border = '2px solid #ffffff';
    optMarkerEl.style.cursor = 'pointer';
    optMarkerEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.9)';
    optMarkerEl.title = 'Click to open Panipat Incident Telemetry & ML Dossier';
    optMarkerEl.onclick = () => {
      setSelectedCluster(PANIPAT_CLUSTER as any);
    };

    const optThreatMarker = new maplibregl.Marker({ element: optMarkerEl, anchor: 'center' })
      .setLngLat(targetCoord)
      .addTo(optMap);

    // ── Load Wind-Driven Rothermel Mathematical Layers on THERMAL Map (Left) ──
    thMap.on('load', async () => {
      try {
        const liveWind = await fetchLiveWindData(targetCoord[1], targetCoord[0]);
        const elapsedHours = Math.max(0.6, currentHour >= 11 ? currentHour - 11 : 2.5);

        // 1. Fire spread and smoke polygon source
        if (!thMap.getSource('fire-spread-src')) {
          const spreadGeoJson = createFireSpreadGeoJson(targetCoord[0], targetCoord[1], liveWind, elapsedHours);
          thMap.addSource('fire-spread-src', { type: 'geojson', data: spreadGeoJson });

          // Fill Layer: Semi-transparent hazard zones
          thMap.addLayer({
            id: 'fire-spread-fill',
            type: 'fill',
            source: 'fire-spread-src',
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'fill-color': [
                'match', ['get', 'tier'],
                'active', '#ff2222',
                '1h',     '#ef4444',
                '2h',     '#f97316',
                '4h',     '#f59e0b',
                '6h',     '#eab308',
                'smoke',  '#475569',
                '#ef4444',
              ],
              'fill-opacity': [
                'match', ['get', 'tier'],
                'active', 0.28,
                '1h',     0.20,
                '2h',     0.14,
                '4h',     0.09,
                '6h',     0.05,
                'smoke',  0.10,
                0.12,
              ],
            },
          });

          // Line Layer: Precision isochrone perimeter contours
          thMap.addLayer({
            id: 'fire-spread-lines',
            type: 'line',
            source: 'fire-spread-src',
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'line-color': [
                'match', ['get', 'tier'],
                'active', '#ffffff',
                '1h',     '#ef4444',
                '2h',     '#f97316',
                '4h',     '#f59e0b',
                '6h',     '#eab308',
                'smoke',  '#94a3b8',
                '#ef4444',
              ],
              'line-width': [
                'match', ['get', 'tier'],
                'active', 2.2,
                '1h',     1.8,
                '2h',     1.4,
                '4h',     1.2,
                '6h',     1.0,
                'smoke',  0.8,
                1.0,
              ],
              'line-opacity': [
                'match', ['get', 'tier'],
                'active', 0.95,
                '1h',     0.85,
                '2h',     0.70,
                '4h',     0.55,
                '6h',     0.45,
                'smoke',  0.40,
                0.60,
              ],
            },
          });
        }

        // 2. Wind streamlines
        if (!thMap.getSource('streamlines-src')) {
          const streamlines = generateWindStreamlines(targetCoord[0], targetCoord[1], liveWind);
          thMap.addSource('streamlines-src', { type: 'geojson', data: streamlines as any });
          thMap.addLayer({
            id: 'wind-streamlines',
            type: 'line',
            source: 'streamlines-src',
            paint: {
              'line-color': '#cbd5e1',
              'line-width': 1.2,
              'line-opacity': 0.42,
            },
          });
        }
      } catch (err) {
        console.warn('Failed to load wind-driven fire layers on thermal map:', err);
      }
    });

    // ── Also add fire spread polygons on Optical Satellite Map (Right) ──
    optMap.on('load', async () => {
      try {
        const liveWind = await fetchLiveWindData(targetCoord[1], targetCoord[0]);
        const elapsedHours = Math.max(0.6, currentHour >= 11 ? currentHour - 11 : 2.5);

        if (!optMap.getSource('fire-spread-src')) {
          const spreadGeoJson = createFireSpreadGeoJson(targetCoord[0], targetCoord[1], liveWind, elapsedHours);
          optMap.addSource('fire-spread-src', { type: 'geojson', data: spreadGeoJson });

          optMap.addLayer({
            id: 'fire-spread-fill-opt',
            type: 'fill',
            source: 'fire-spread-src',
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'fill-color': [
                'match', ['get', 'tier'],
                'active', '#ff2222',
                '1h',     '#ef4444',
                '2h',     '#f97316',
                '4h',     '#f59e0b',
                '6h',     '#eab308',
                'smoke',  '#475569',
                '#ef4444',
              ],
              'fill-opacity': [
                'match', ['get', 'tier'],
                'active', 0.28,
                '1h',     0.20,
                '2h',     0.14,
                '4h',     0.09,
                '6h',     0.05,
                'smoke',  0.10,
                0.12,
              ],
            },
          });

          optMap.addLayer({
            id: 'fire-spread-lines-opt',
            type: 'line',
            source: 'fire-spread-src',
            filter: ['==', '$type', 'Polygon'],
            paint: {
              'line-color': [
                'match', ['get', 'tier'],
                'active', '#ffffff',
                '1h',     '#ef4444',
                '2h',     '#f97316',
                '4h',     '#f59e0b',
                '6h',     '#eab308',
                'smoke',  '#94a3b8',
                '#ef4444',
              ],
              'line-width': [
                'match', ['get', 'tier'],
                'active', 2.2,
                '1h',     1.8,
                '2h',     1.4,
                '4h',     1.2,
                '6h',     1.0,
                'smoke',  0.8,
                1.0,
              ],
              'line-opacity': 0.80,
            },
          });
        }
      } catch (err) {
        console.warn('Failed to load fire polygons on optical map:', err);
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
      optThreatMarker.remove();
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

      {/* ── Sleek Minimal Top Sensor Pill (Visible only when not in simulation mode) ── */}
      {!isSimulating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 9999,
            padding: '7px 16px',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f59e0b',
            }}
          >
            THERMAL · VIIRS 375m
          </span>

          <span style={{ width: 1, height: 14, background: '#27272a', flexShrink: 0 }} />

          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
            }}
          >
            OPTICAL · SENTINEL‑2 10m
          </span>

          {windData && (
            <>
              <span style={{ width: 1, height: 14, background: '#27272a', flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Wind size={12} color="#38bdf8" />
                <span
                  style={{
                    fontFamily: 'Geist Mono, ui-monospace, monospace',
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
      )}

      {/* ── Fire Spread Dispersion HUD (Top-Left Telemetry Card — won't collide with drawer) ── */}
      {windData && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            position: 'fixed',
            top: 72,
            left: 80,
            zIndex: 45,
            width: 275,
            background: 'rgba(24, 24, 27, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: '14px 16px',
            fontFamily: 'Space Grotesk, sans-serif',
            color: '#fafafa',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} color="#ef4444" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ef4444' }}>
                FIRE SPREAD ANALYSIS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#86efac', fontWeight: 600 }}>
                {windData.isLiveApi ? 'LIVE API SYNC' : 'CALIBRATED'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div style={{ background: '#18181b', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: '#71717a' }}>WIND VECTOR</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontFamily: 'Geist Mono, monospace' }}>
                {windData.speedKmH.toFixed(1)} km/h {windData.compassDir}
              </div>
            </div>
            <div style={{ background: '#18181b', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: '#71717a' }}>RATE OF SPREAD</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: 'Geist Mono, monospace' }}>
                {windData.rateOfSpreadMPerHr} m/hr
              </div>
            </div>
          </div>

          {/* Atmospheric Air Quality & Smoke Plume Row */}
          <div style={{ background: '#131316', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8, fontSize: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: 2 }}>
              <span>TEMP / HUMIDITY</span>
              <span style={{ color: '#fafafa', fontFamily: 'Geist Mono, monospace' }}>{windData.tempC}°C · {windData.humidityPct}% RH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
              <span>SMOKE PM2.5 / AOD</span>
              <span style={{ color: '#f87171', fontFamily: 'Geist Mono, monospace' }}>{windData.pm25.toFixed(1)} µg/m³ · {windData.aod.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />
                <span style={{ color: '#d4d4d8' }}>1-Hr Immediate Hazard</span>
              </div>
              <span style={{ fontFamily: 'Geist Mono, monospace', color: '#ef4444', fontWeight: 600 }}>0.8 km</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f97316' }} />
                <span style={{ color: '#d4d4d8' }}>3-Hr Threat Corridor</span>
              </div>
              <span style={{ fontFamily: 'Geist Mono, monospace', color: '#f97316', fontWeight: 600 }}>2.4 km</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} />
                <span style={{ color: '#d4d4d8' }}>6-Hr Evacuation Perimeter</span>
              </div>
              <span style={{ fontFamily: 'Geist Mono, monospace', color: '#f59e0b', fontWeight: 600 }}>4.8 km</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Comparison Mode Selector (Bottom-Center) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 9999,
          padding: 4,
          display: 'flex',
          gap: 2,
        }}
      >
        {([
          { id: 'wipe',       label: 'WIPE ⟷'       },
          { id: 'sidebyside', label: 'SIDE-BY-SIDE' },
          { id: 'blend',      label: 'BLEND ◑'      },
        ] as { id: CompareMode; label: string }[]).map(({ id, label }) => {
          const isActive = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#f59e0b' : 'transparent',
                color: isActive ? '#0d0d0d' : '#71717a',
                transition: 'background 150ms ease, color 150ms ease',
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
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 9999,
          padding: '6px 12px',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 10,
          color: '#71717a',
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
