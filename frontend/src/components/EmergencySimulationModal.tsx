import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, SendHorizontal, CheckCircle2, ShieldAlert, MapPin, Radio } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { playTacticalAlertSound } from '../utils/windSpreadModel';

export function EmergencySimulationModal() {
  const {
    isEmergencySimulationOpen,
    setEmergencySimulationOpen,
    setMapMode,
    setSelectedCluster,
  } = useAppStore();

  const [dispatchStage, setDispatchStage] = useState<'idle' | 'transmitting' | 'delivered'>('idle');

  if (!isEmergencySimulationOpen) return null;

  const handleLaunchOpticalRecon = () => {
    playTacticalAlertSound();

    setSelectedCluster({
      lat: 29.3909,
      lon: 76.9635,
      totalHotspots: 1,
      primaryClass: { id: 4, name: 'Accidental Fire', color: '#ef4444' },
      classCounts: { wildfire: 0, agricultural: 0, industrial: 0, gasflare: 0, accidental: 1 },
      avgFrp: 14.2,
      maxFrp: 18.5,
      avgBrightness: 368.2,
      maxBrightness: 372.4,
      avgNo2: 0.14,
      avgSo2: 0.23,
      elevation: 237,
      landCoverCode: 50,
      landCover: 'Built-up / Urban / Industrial',
      isIndustrial: 1.0,
      zScore: 4.12,
      isAnomaly: true,
      baselineMeanFrp: 3.2,
      source: 'VIIRS_JPSS1',
      acqDate: '2024-06-23',
    });

    setMapMode('optical');
    setEmergencySimulationOpen(false);
  };

  const handleDispatchWebhook = () => {
    if (dispatchStage !== 'idle') return;
    setDispatchStage('transmitting');

    setTimeout(() => {
      setDispatchStage('delivered');
      playTacticalAlertSound();
    }, 1200);
  };

  const handleDismiss = () => {
    setEmergencySimulationOpen(false);
  };

  return (
    <AnimatePresence>
      {/* ── Dark Backdrop ── */}
      <motion.div
        key="emergency-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1005,
        }}
      />

      {/* ── Emergency Anomaly Alert Screen ── */}
      <motion.div
        key="emergency-modal"
        initial={{ opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 1006,
          width: '92%',
          maxWidth: 540,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--r-xl)',
          padding: '22px',
          boxShadow: 'var(--neu-shadow-out-lg)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--neu-text-strong)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#ef4444',
                  }}
                >
                  CRITICAL DEFENSE ALERT · CLASS 4
                </span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)' }}>
                  TW-8842
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 0', color: 'var(--neu-text-strong)', letterSpacing: '-0.01em' }}>
                Accidental Chemical Fire Surge
              </h2>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="neu-icon-btn"
            style={{ width: 26, height: 26 }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Location Context Card */}
        <div
          style={{
            background: 'var(--neu-base-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-md)',
            padding: '12px 14px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <MapPin size={13} color="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neu-text-strong)' }}>
              Panipat MIDC Industrial Complex, Haryana
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--neu-text-disabled)', marginLeft: 'auto' }}>
              29.3909° N, 76.9635° E
            </span>
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--neu-text)', margin: 0 }}>
            Non-cyclical thermal spike in manufacturing zone. Sentinel-5P <strong style={{ color: 'var(--neu-text-strong)' }}>SO₂ (0.23 mol/m²)</strong> indicates hazardous material combustion.
          </p>
        </div>

        {/* AI Diagnostics Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ background: 'var(--neu-base-raised)', borderRadius: 'var(--r-sm)', padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Z-SCORE
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              +4.12σ
            </div>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', marginTop: 1 }}>Baseline &lt; 3.0σ</div>
          </div>

          <div style={{ background: 'var(--neu-base-raised)', borderRadius: 'var(--r-sm)', padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              RADIATIVE POWER
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--neu-text-strong)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              14.2 MW
            </div>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', marginTop: 1 }}>Peak 368.2 K</div>
          </div>

          <div style={{ background: 'var(--neu-base-raised)', borderRadius: 'var(--r-sm)', padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              AI CONFIDENCE
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              99.8%
            </div>
            <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', marginTop: 1 }}>Phase 6 Fused</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleLaunchOpticalRecon}
            className="neu-btn-accent"
            style={{
              width: '100%',
              padding: '11px',
              background: '#ef4444',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)',
              fontSize: 12,
            }}
          >
            <ExternalLink size={14} />
            <span>Launch High-Res Recon &amp; Plume Dispersion</span>
          </button>

          <button
            onClick={handleDispatchWebhook}
            disabled={dispatchStage !== 'idle'}
            className="neu-btn"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 12,
            }}
          >
            {dispatchStage === 'idle' && (
              <>
                <SendHorizontal size={14} />
                <span>Simulate Automated NDMA Dispatch Webhook</span>
              </>
            )}
            {dispatchStage === 'transmitting' && (
              <>
                <Radio size={14} className="animate-spin" />
                <span>Transmitting Encrypted Payload...</span>
              </>
            )}
            {dispatchStage === 'delivered' && (
              <>
                <CheckCircle2 size={14} color="#22c55e" />
                <span style={{ color: '#22c55e' }}>Payload Dispatched Successfully</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
