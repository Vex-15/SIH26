import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAppStore, LAND_COVER_NAMES } from '../store/useAppStore';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

function AnimatedNumber({ to, decimals = 1, duration = 1.2 }: { to: number; decimals?: number; duration?: number }) {
  const mv = useMotionValue(0);
  const displayed = useTransform(mv, (v) => v.toFixed(decimals));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [to]);

  return <motion.span ref={spanRef}>{displayed}</motion.span>;
}

function formatSensor(src: string | null): string {
  if (!src) return 'VIIRS / MODIS';
  return src.replace(/_/g, ' ').replace('JPSS', 'JPSS·');
}

export function AnomalyAlertModal() {
  const { isAnomalyAlertOpen, setAnomalyAlertOpen, selectedCluster, setSelectedCluster, setHasAcknowledgedAnomaly } = useAppStore();

  const c = selectedCluster;
  const lcName = c ? (LAND_COVER_NAMES[c.landCoverCode] ?? c.landCover ?? '—') : '—';

  const handleAcknowledge = () => {
    setAnomalyAlertOpen(false);
    setHasAcknowledgedAnomaly(true);
  };

  const handleDismiss = () => {
    setAnomalyAlertOpen(false);
    setSelectedCluster(null);
    setHasAcknowledgedAnomaly(true);
  };

  return (
    <AnimatePresence>
      {isAnomalyAlertOpen && c && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="anomaly-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 996,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
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
              width: 440,
              maxWidth: 'calc(100vw - 2rem)',
              pointerEvents: 'auto',
            }}
            initial={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                background: 'var(--neu-base)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderRadius: 'var(--r-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--neu-shadow-out-lg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="neu-icon-btn"
                style={{ position: 'absolute', top: 16, right: 16, width: 26, height: 26 }}
              >
                <X size={13} strokeWidth={2} />
              </button>

              {/* Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ef4444' }}>
                    Phase 7 Anomaly Engine
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--neu-text-strong)', letterSpacing: '-0.01em' }}>
                    {c.primaryClass.name} Outlier
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 11, color: 'var(--neu-text)', marginBottom: 16, lineHeight: 1.4 }}>
                Statistical anomaly detected exceeding the 3σ operational threshold.
              </p>

              {/* Key Metrics Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 16,
                padding: '12px',
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Peak Radiative Power
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                      <AnimatedNumber to={c.maxFrp} decimals={1} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neu-text)' }}>MW</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Z-Score Deviation
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                      +<AnimatedNumber to={c.zScore ?? 3.5} decimals={2} />σ
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata 2x2 Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 18 }}>
                {[
                  { label: 'Coordinates', value: `${c.lat.toFixed(4)}° N, ${c.lon.toFixed(4)}° E`, mono: true },
                  { label: 'Date', value: c.acqDate ?? '2024-06-23', mono: true },
                  { label: 'Sensor', value: formatSensor(c.source), mono: true },
                  { label: 'Land Cover', value: lcName, mono: false },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 'var(--r-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      background: 'var(--neu-base-raised)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: 9, color: 'var(--neu-text-disabled)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
                        fontSize: 11,
                        color: 'var(--neu-text-em)',
                        fontWeight: mono ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleAcknowledge}
                className="neu-btn-accent"
                style={{
                  width: '100%',
                  height: 38,
                  background: '#ef4444',
                  boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)',
                  fontSize: 12,
                }}
              >
                <span>Acknowledge & Investigate</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
