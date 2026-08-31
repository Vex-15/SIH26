import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, SendHorizontal, CheckCircle2, ShieldAlert, MapPin } from 'lucide-react';
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

    // Target the Panipat Industrial Accidental Incident
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
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(8px)',
          zIndex: 1005,
        }}
      />

      {/* ── Emergency Anomaly Alert Screen (Stitch Prompt 5 / Prompt 8 Spec) ── */}
      <motion.div
        key="emergency-modal"
        initial={{ opacity: 0, scale: 0.94, y: '-48%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.94, y: '-48%', x: '-50%' }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 1006,
          width: '92%',
          maxWidth: 620,
          background: '#141416',
          border: '1.5px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 22,
          padding: '24px 28px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(239, 68, 68, 0.2)',
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#fafafa',
        }}
      >
        {/* Top Header & Alert Banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(239, 68, 68, 0.16)',
                border: '1.5px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
              }}
            >
              <ShieldAlert size={26} className="animate-pulse" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                  }}
                >
                  CRITICAL DEFENSE ALERT · CLASS 4
                </span>
                <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: '#71717a' }}>
                  TW-INCIDENT-8842
                </span>
              </div>
              <h1 style={{ fontSize: 19, fontWeight: 700, margin: '4px 0 0', color: '#ffffff', letterSpacing: '-0.01em' }}>
                Accidental Industrial Chemical Fire Surge
              </h1>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Location & Geographic Context Card */}
        <div
          style={{
            background: '#19191d',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MapPin size={15} color="#ef4444" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>
              Panipat MIDC Industrial Complex, Haryana
            </span>
            <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: '#a1a1aa', marginLeft: 'auto' }}>
              29.3909° N, 76.9635° E
            </span>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: '#a1a1aa', margin: 0 }}>
            Non-cyclical thermal spike detected in high-density manufacturing zone. High co-located Sentinel-5P <strong style={{ color: '#fafafa' }}>SO₂ emissions (0.23 mol/m²)</strong> confirm hazardous material combustion.
          </p>
        </div>

        {/* AI Diagnostics & Anomaly Metrics Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div style={{ background: '#1c1c20', borderRadius: 12, padding: '12px 14px', borderLeft: '3px solid #ef4444' }}>
            <div style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ANOMALY Z-SCORE
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
              +4.12σ
            </div>
            <div style={{ fontSize: 9, color: '#71717a', marginTop: 2 }}>Baseline: &lt; 3.0σ normal</div>
          </div>

          <div style={{ background: '#1c1c20', borderRadius: 12, padding: '12px 14px', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              FIRE RADIATIVE POWER
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fafafa', fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
              14.2 MW
            </div>
            <div style={{ fontSize: 9, color: '#22c55e', marginTop: 2 }}>Peak: 368.2 K Temp</div>
          </div>

          <div style={{ background: '#1c1c20', borderRadius: 12, padding: '12px 14px', borderLeft: '3px solid #38bdf8' }}>
            <div style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI META-CONFIDENCE
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', fontFamily: 'Geist Mono, monospace', marginTop: 2 }}>
              99.8%
            </div>
            <div style={{ fontSize: 9, color: '#71717a', marginTop: 2 }}>Phase 6 Fused Stacking</div>
          </div>
        </div>

        {/* Action Controls & Dispatch Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Primary Action: Launch Optical Recon & Wind Spread */}
          <button
            onClick={handleLaunchOpticalRecon}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              border: 'none',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.45)',
              transition: 'transform 0.1s, background 0.15s',
            }}
          >
            <span>🛰️ LAUNCH SENTINEL-2 OPTICAL RECON & WIND SPREAD</span>
            <ExternalLink size={15} />
          </button>

          {/* Secondary Action: Dispatch Emergency Webhook (Prompt 8 Spec) */}
          <button
            onClick={handleDispatchWebhook}
            disabled={dispatchStage === 'delivered'}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: 14,
              border: dispatchStage === 'delivered'
                ? '1px solid rgba(34, 197, 94, 0.4)'
                : '1px solid rgba(239, 68, 68, 0.3)',
              background: dispatchStage === 'delivered'
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(239, 68, 68, 0.06)',
              color: dispatchStage === 'delivered' ? '#22c55e' : '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: dispatchStage === 'delivered' ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {dispatchStage === 'idle' && (
              <>
                <SendHorizontal size={14} />
                <span>DISPATCH EMERGENCY WEBHOOK (SDMA / NDRF COMMAND)</span>
              </>
            )}
            {dispatchStage === 'transmitting' && (
              <>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#ef4444' }} className="animate-spin" />
                <span style={{ fontFamily: 'Geist Mono, monospace' }}>TRANSMITTING ENCRYPTED TELEMETRY...</span>
              </>
            )}
            {dispatchStage === 'delivered' && (
              <>
                <CheckCircle2 size={15} color="#22c55e" />
                <span style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>PAYLOAD DELIVERED · SDMA ACKNOWLEDGED</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Audit Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 10, color: '#52525b', fontFamily: 'Geist Mono, monospace' }}>
          <span>LIVE SATELLITE AUDIT · VIIRS JPSS-1 · OPEN-METEO SYNC</span>
          <span onClick={handleDismiss} style={{ color: '#71717a', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontSize: 11 }}>
            Dismiss
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


