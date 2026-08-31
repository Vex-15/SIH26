import type React from 'react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppStore, CLASS_META, LAND_COVER_NAMES } from '../store/useAppStore';

/* ── Fire-class SVG icons (inline, explicit dimensions) ── */
const FireIcons: Record<number, React.ReactNode> = {
  0: ( // Wildfire — flame
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/>
    </svg>
  ),
  1: ( // Agricultural — sprout
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0 0c-3.5 0-7-2-7-6 0-2 1-4 3-5m4 11c3.5 0 7-2 7-6 0-2-1-4-3-5"/>
    </svg>
  ),
  2: ( // Industrial Persistent — factory
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"/>
    </svg>
  ),
  3: ( // Gas Flare — bolt
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/>
    </svg>
  ),
  4: ( // Accidental — warning triangle
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
    </svg>
  ),
};

/* ── Animated counter hook ── */
function AnimatedNumber({ to, decimals = 1, duration = 1.4 }: { to: number; decimals?: number; duration?: number }) {
  const mv = useMotionValue(0);
  const displayed = useTransform(mv, (v) => v.toFixed(decimals));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [to]);

  return <motion.span ref={spanRef}>{displayed}</motion.span>;
}

/* ── Source label cleanup ── */
function formatSensor(src: string | null): string {
  if (!src) return 'VIIRS / MODIS';
  return src.replace(/_/g, ' ').replace('JPSS', 'JPSS·');
}

/* ── Main component ── */
export function AnomalyAlertModal() {
  const { isAnomalyAlertOpen, setAnomalyAlertOpen, selectedCluster, setSelectedCluster, setHasAcknowledgedAnomaly } = useAppStore();

  const c = selectedCluster;
  const cls = c ? CLASS_META[c.primaryClass.id] : null;
  const color = cls?.color ?? '#ef4444';
  const lcName = c ? (LAND_COVER_NAMES[c.landCoverCode] ?? c.landCover ?? '—') : '—';

  // Acknowledge: close alert, keep selectedCluster so InspectorDrawer opens
  const handleAcknowledge = () => {
    setAnomalyAlertOpen(false);
    setHasAcknowledgedAnomaly(true);
  };

  // Dismiss entirely
  const handleDismiss = () => {
    setAnomalyAlertOpen(false);
    setSelectedCluster(null);
    setHasAcknowledgedAnomaly(true);
  };

  return (
    <AnimatePresence>
      {isAnomalyAlertOpen && c && (
        <>
          {/* ── Crimson pulsing overlay ── */}
          <motion.div
            key="anomaly-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 995,
              pointerEvents: 'none',
              backgroundColor: `${color}18`,
            }}
            animate={{ opacity: [0.6, 0.25, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Backdrop (click to dismiss) ── */}
          <motion.div
            key="anomaly-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 996,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* ── Modal Container (Flexbox Centering & Scrollable if needed) ── */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 997,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="anomaly-card"
              style={{
                width: 480,
                maxWidth: 'min(480px, 92vw)',
                maxHeight: 'calc(100vh - 32px)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <div
                style={{
                  position: 'relative',
                  background: '#0e0e12',
                  border: `1.5px solid ${color}`,
                  borderRadius: 20,
                  padding: '24px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: `0 24px 60px rgba(0, 0, 0, 0.95), 0 0 35px ${color}35`,
                  overflowY: 'auto',
                }}
              >
                {/* Close '×' button in top-right */}
                <button
                  onClick={handleDismiss}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#a1a1aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a1a1aa';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  ✕
                </button>

                {/* Icon circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    backgroundColor: color,
                    color: '#ffffff',
                    boxShadow: `0 0 18px ${color}60`,
                    flexShrink: 0,
                  }}
                >
                  {FireIcons[c.primaryClass.id] ?? FireIcons[4]}
                </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#ffffff',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {c.primaryClass.name} Anomaly Detected
              </h1>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Z-Score Anomaly Engine — Critical Threshold Breached
              </p>

              {/* Divider */}
              <div style={{ width: '100%', height: 1, marginBottom: 20, backgroundColor: `${color}40` }} />

              {/* Key metrics */}
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Max FRP
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 32, fontWeight: 700, lineHeight: 1, color }}>
                      <AnimatedNumber to={c.maxFrp} decimals={1} />
                    </span>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, color: 'rgba(255, 255, 255, 0.4)' }}>MW</span>
                  </div>
                </div>

                <div style={{ width: 1, height: 48, alignSelf: 'center', backgroundColor: `${color}30` }} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Z-Score Deviation
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 32, fontWeight: 700, lineHeight: 1, color }}>
                      <AnimatedNumber to={c.zScore ?? 3.5} decimals={2} />
                    </span>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 26, fontWeight: 700, lineHeight: 1, color }}>
                      σ
                    </span>
                  </div>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: 'rgba(255, 255, 255, 0.3)' }}>Normal: &lt; 3.00σ</span>
                </div>
              </div>

              {/* Metadata grid */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  {
                    label: 'Coordinates',
                    value: `${c.lat.toFixed(4)}° N, ${c.lon.toFixed(4)}° E`,
                    mono: true,
                  },
                  {
                    label: 'Acquisition Date',
                    value: c.acqDate ?? '2024',
                    mono: true,
                  },
                  {
                    label: 'Sensor',
                    value: formatSensor(c.source),
                    mono: true,
                  },
                  {
                    label: 'Land Cover',
                    value: lcName,
                    mono: false,
                  },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      background: '#18181b',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono ? 'Geist Mono, monospace' : 'Space Grotesk, sans-serif',
                        fontSize: 11,
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: 1.3,
                        fontWeight: mono ? 600 : 500,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Acknowledge CTA */}
              <button
                onClick={handleAcknowledge}
                style={{
                  width: '100%',
                  height: 46,
                  color: '#ffffff',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: color,
                  boxShadow: `0 0 18px ${color}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
              >
                Acknowledge &amp; Investigate
              </button>

              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, color: 'rgba(255, 255, 255, 0.35)', textAlign: 'center' }}>
                Opens detailed telemetry dossier · Silences this alert
              </p>
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
  );
}
