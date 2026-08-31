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

          {/* ── Alert Card ── */}
          <motion.div
            key="anomaly-card"
            style={{
              position: 'fixed',
              zIndex: 997,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 480,
              maxWidth: 'calc(100vw - 2rem)',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            <div
              style={{
                background: 'var(--neu-base)',
                borderRadius: 'var(--r-xl)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                /* Neumorphic deep shadow + class accent glow */
                boxShadow: `var(--neu-shadow-out-lg), 0 0 30px ${color}25`,
                border: 'none',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  /* Neumorphic inset icon circle with accent */
                  background: 'var(--neu-base)',
                  boxShadow: `var(--neu-shadow-in-sm), 0 0 20px ${color}50`,
                  color: color,
                  flexShrink: 0,
                }}
              >
                {FireIcons[c.primaryClass.id] ?? FireIcons[4]}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 20,
                  fontWeight: 800,
                  color: 'var(--neu-text-strong)',
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
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  color: 'var(--neu-text)',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Z-Score Anomaly Engine — Critical Threshold Breached
              </p>

              {/* Divider */}
              <div style={{ width: '100%', height: 1, marginBottom: 20, background: 'transparent', boxShadow: `inset 0 1px 2px var(--neu-dark)` }} />

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

                <div style={{ width: 1, height: 48, alignSelf: 'center', background: 'transparent', boxShadow: `inset 1px 0 3px var(--neu-dark)` }} />

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
                      borderRadius: 'var(--r-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      /* Neumorphic inset metadata pill */
                      background: 'var(--neu-base)',
                      boxShadow: 'var(--neu-shadow-in-sm)',
                      border: 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--neu-text-disabled)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
                        fontSize: 11,
                        color: 'var(--neu-text-em)',
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
                  height: 48,
                  color: color,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  /* Neumorphic elevated button with accent glow */
                  background: 'var(--neu-base)',
                  boxShadow: `var(--neu-shadow-out), 0 0 18px ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease, transform 0.1s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `var(--neu-shadow-out-lg), 0 0 24px ${color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `var(--neu-shadow-out), 0 0 18px ${color}30`; }}
                onMouseDown={e => { e.currentTarget.style.boxShadow = `var(--neu-shadow-in), 0 0 12px ${color}20`; e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.boxShadow = `var(--neu-shadow-out), 0 0 18px ${color}30`; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Acknowledge &amp; Investigate
              </button>

              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--neu-text-disabled)', textAlign: 'center' }}>
                Opens detailed telemetry dossier · Silences this alert
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
