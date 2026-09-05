import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { playEmergencyKlaxon } from '../utils/windSpreadModel';

// ── Simulation target: Panipat MIDC Accidental Industrial Fire ───────────────

export const PANIPAT_CLUSTER = {
  lat: 29.3909,
  lon: 76.9635,
  totalHotspots: 1,
  primaryClass: { id: 4, name: 'Accidental Fire', color: '#ef4444' },
  classCounts: { wildfire: 0, agricultural: 0, industrial: 0, gasflare: 0, accidental: 1 },
  avgFrp: 14.2,
  maxFrp: 842.7,
  avgBrightness: 368.2,
  maxBrightness: 372.4,
  avgNo2: 0.14,
  avgSo2: 0.23,
  elevation: 237,
  landCoverCode: 50,
  landCover: 'Built-up / Urban / Industrial',
  isIndustrial: 1.0,
  zScore: 4.87,
  isAnomaly: true,
  baselineMeanFrp: 3.2,
  source: 'VIIRS_JPSS1',
  acqDate: '2024-06-23',
};

type SimStage = 'consent' | 'countdown' | 'siren';

/**
 * Short tactical beep using Web Audio API for the 3 -> 2 -> 1 countdown
 */
function playCountdownTick(pitch: number = 600) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

// ── Root component ────────────────────────────────────────────────────────────

export function EmergencySimulationModal() {
  const {
    isEmergencySimulationOpen,
    setEmergencySimulationOpen,
    setMapMode,
    setSelectedCluster,
    map,
    setLayersOpen,
    setMetricSelectorOpen,
    setLocationSearchOpen,
    setCalendarOpen,
    setAnomalyAlertOpen,
    setPlaybackControllerOpen,
    setIsSimulating,
    setDateRange,
    setCurrentHour,
    setIsPlaying,
  } = useAppStore();

  const [stage, setStage] = useState<SimStage>('consent');
  const [countdown, setCountdown] = useState<number>(3);
  const [strobeActive, setStrobeActive] = useState(false);

  const audioRef            = useRef<HTMLAudioElement | null>(null);
  const strobeTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orchestrationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset to consent every time the modal opens fresh
  useEffect(() => {
    if (isEmergencySimulationOpen) {
      setStage('consent');
      setCountdown(3);
      setStrobeActive(false);
    }
  }, [isEmergencySimulationOpen]);

  // Hard cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (strobeTimerRef.current) clearTimeout(strobeTimerRef.current);
      orchestrationTimers.current.forEach(clearTimeout);
    };
  }, []);

  if (!isEmergencySimulationOpen) return null;

  // ── Shared helpers ────────────────────────────────────────────────────────

  const stopSirenAndStrobe = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (strobeTimerRef.current) {
      clearTimeout(strobeTimerRef.current);
      strobeTimerRef.current = null;
    }
    setStrobeActive(false);
  };

  const cancelAllTimers = () => {
    orchestrationTimers.current.forEach(clearTimeout);
    orchestrationTimers.current = [];
  };

  // ── Trigger Siren: called when 3 -> 2 -> 1 finishes ────────────────────────

  const triggerSiren = () => {
    setStage('siren');
    setStrobeActive(true);
    audioRef.current = playEmergencyKlaxon();
    strobeTimerRef.current = setTimeout(() => setStrobeActive(false), 10000);
    const audioOff = setTimeout(() => { audioRef.current?.pause(); }, 10000);
    orchestrationTimers.current.push(audioOff);
  };

  // ── Proceed: consent → countdown screen (3 -> 2 -> 1) → siren ──────────────

  const handleProceed = () => {
    setStage('countdown');
    setCountdown(3);
    playCountdownTick(600);

    const t1 = setTimeout(() => {
      setCountdown(2);
      playCountdownTick(600);
    }, 1000);

    const t2 = setTimeout(() => {
      setCountdown(1);
      playCountdownTick(900);
    }, 2000);

    const t3 = setTimeout(() => {
      triggerSiren();
    }, 3000);

    orchestrationTimers.current.push(t1, t2, t3);
  };

  // ── Exit: closed-system guarantee ─────────────────────────────────────────
  // Only closes the modal — zero main-screen state changes.

  const handleExit = () => {
    stopSirenAndStrobe();
    cancelAllTimers();
    setEmergencySimulationOpen(false);
    setIsSimulating(false);
  };

  // ── Acknowledge: sequential panel orchestration ───────────────────────────

  const handleAcknowledge = () => {
    stopSirenAndStrobe();
    cancelAllTimers();

    // t=0 — close all conflicting panels and enter simulation
    setLayersOpen(false);
    setMetricSelectorOpen(false);
    setLocationSearchOpen(false);
    setCalendarOpen(false);
    setAnomalyAlertOpen(false);
    setIsSimulating(true);

    // t=150ms — dismiss siren screen
    const t0 = setTimeout(() => setEmergencySimulationOpen(false), 150);

    // t=500ms — pin Panipat cluster + set incident date/hour + fly map
    const t1 = setTimeout(() => {
      setSelectedCluster(PANIPAT_CLUSTER as any);
      setDateRange('2024-06-23', '2024-06-23');
      setCurrentHour(13);
      setIsPlaying(false);
      setPlaybackControllerOpen(false);
      if (map) {
        map.flyTo({ center: [76.9635, 29.3909], zoom: 13, duration: 1800, essential: true });
      }
    }, 500);

    // t=1800ms — switch to optical recon (mathematical spread model visible)
    const t2 = setTimeout(() => setMapMode('optical'), 1800);

    orchestrationTimers.current = [t0, t1, t2];
  };

  return (
    <>
      <AnimatePresence>
        {stage === 'consent' && (
          <ConsentGate key="consent" onProceed={handleProceed} onCancel={handleExit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'countdown' && (
          <CountdownScreen
            key="countdown"
            count={countdown}
            onAbort={handleExit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'siren' && (
          <SirenScreen
            key="siren"
            strobeActive={strobeActive}
            onAcknowledge={handleAcknowledge}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Stage 1: Consent Gate ────────────────────────────────────────────────────

function ConsentGate({ onProceed, onCancel }: { onProceed: () => void; onCancel: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1,    y: '-50%', x: '-50%' }}
        exit={{   opacity: 0, scale: 0.96, y: '-48%', x: '-50%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          zIndex: 1101,
          width: '90%', maxWidth: 440,
          background: '#141416',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '28px 28px 24px',
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#ef4444' }}>
            Mock Simulation Warning
          </span>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.65, color: '#a1a1aa', margin: '0 0 14px' }}>
          The system is about to enter{' '}
          <strong style={{ color: '#fafafa' }}>emergency simulation mode</strong>. It will
          replicate anomalous behaviour matching a real accidental fire detection event.
          Audio alarms will play at full volume.
        </p>

        <p style={{ fontSize: 10, color: '#52525b', margin: '0 0 22px', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.04em' }}>
          THIS IS A SIMULATION · NO REAL INCIDENT IN PROGRESS
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#71717a',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            style={{
              flex: 2, padding: '11px 0',
              borderRadius: 12, border: 'none',
              background: '#ef4444', color: '#ffffff',
              fontSize: 13, fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.04em', cursor: 'pointer',
            }}
          >
            Proceed with Simulation
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Stage 1.5: Pure Minimal Countdown Screen (3 -> 2 -> 1) ──────────────────

function CountdownScreen({
  count,
  onAbort,
}: {
  count: number;
  onAbort: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      {/* Subtle radial red emergency glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.22) 0%, rgba(9, 9, 11, 0.98) 65%)',
        }}
      />

      {/* Pure, large, punchy 3 - 2 - 1 number */}
      <div
        style={{
          position: 'relative',
          width: 220,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.65, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 160,
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#ef4444',
              lineHeight: 1,
              userSelect: 'none',
              textShadow: '0 0 50px rgba(239, 68, 68, 0.85), 0 0 100px rgba(239, 68, 68, 0.45)',
            }}
          >
            {count}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Discreet abort button */}
      <button
        onClick={onAbort}
        style={{
          marginTop: 40,
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 9999,
          padding: '6px 18px',
          color: '#71717a',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#71717a';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        }}
      >
        Cancel
      </button>
    </motion.div>
  );
}

// ─── Stage 2: Full-screen Red Siren Screen ────────────────────────────────────

const METADATA = [
  { label: 'Coordinates', value: '29.3909°N\n76.9635°E' },
  { label: 'Acquired',    value: '13:42:08\nUTC'        },
  { label: 'Sensor',      value: 'NASA VIIRS\nJPSS-1'   },
  { label: 'Land Cover',  value: 'Industrial\n/ Urban'   },
] as const;

function SirenScreen({
  strobeActive,
  onAcknowledge,
  onExit,
}: {
  strobeActive: boolean;
  onAcknowledge: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 1200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#7f0000',
        animation: strobeActive ? 'emergencyStrobe 0.22s steps(1) infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes emergencyStrobe {
          0%,  49% { background: #7f0000; }
          50%, 100% { background: #b01010; }
        }
      `}</style>

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(0,0,0,0.58) 100%)',
      }} />

      {/* ALERT 2/3 — top right */}
      <div style={{
        position: 'absolute', top: 18, right: 20,
        fontFamily: 'Geist Mono, monospace', fontSize: 10,
        letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)',
      }}>
        ALERT 2 / 3
      </div>

      {/* Central card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '90%', maxWidth: 500,
        background: '#0d0d0d',
        border: '1.5px solid rgba(239,68,68,0.45)',
        borderRadius: 20,
        padding: '32px 26px 22px',
        fontFamily: 'Space Grotesk, sans-serif',
        color: '#fafafa',
        textAlign: 'center',
      }}>
        {/* Warning icon — static */}
        <div style={{ marginBottom: 16 }}>
          <AlertTriangle size={38} color="#ef4444" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 21, fontWeight: 800, letterSpacing: '0.02em',
          textTransform: 'uppercase', color: '#ffffff',
          margin: '0 0 6px', lineHeight: 1.18,
        }}>
          Accidental Industrial<br />Fire Detected
        </h1>

        <p style={{ fontSize: 12, color: '#71717a', margin: '0 0 18px', lineHeight: 1.5 }}>
          Z-Score Anomaly Engine — Critical Threshold Breached
        </p>

        {/* Facility */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Facility
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fafafa' }}>Panipat Refinery Complex</div>
          <div style={{ fontSize: 12, color: '#71717a' }}>Panipat, Haryana · North India</div>
        </div>

        {/* 2-col metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Current FRP',      val: '842.7', unit: 'MW'              },
            { label: 'Z-Score Deviation', val: '4.87σ', unit: 'Normal < 3.00σ' },
          ].map(({ label, val, unit }) => (
            <div key={label} style={{ background: '#19191d', borderRadius: 10, padding: '12px 8px' }}>
              <div style={{ fontSize: 8, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', fontFamily: 'Geist Mono, monospace', marginTop: 2, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: '#52525b', marginTop: 2 }}>{unit}</div>
            </div>
          ))}
        </div>

        {/* 4-col metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 18 }}>
          {METADATA.map(({ label, value }) => (
            <div key={label} style={{ background: '#19191d', borderRadius: 8, padding: '8px 4px' }}>
              <div style={{ fontSize: 8, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 9, color: '#a1a1aa', fontFamily: 'Geist Mono, monospace', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Acknowledge button — no shadow, no glow */}
        <button
          onClick={onAcknowledge}
          style={{
            width: '100%', padding: '13px 0',
            borderRadius: 12, border: 'none',
            background: '#ef4444', color: '#ffffff',
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer', marginBottom: 10,
          }}
        >
          ⚠ Acknowledge &amp; Investigate
        </button>

        <p style={{ fontSize: 10, color: '#52525b', margin: 0 }}>
          Silences alarm · Auto-navigates to event · Opens threat dossier
        </p>
      </div>

      {/* KLAXON ACTIVE — bottom centre */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 500,
        color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      }}>
        🔊 Emergency Klaxon Active
      </div>

      {/* Exit simulation — far bottom right, very subtle */}
      <button
        onClick={onExit}
        style={{
          position: 'absolute', bottom: 16, right: 20,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.18)', fontSize: 10,
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: 'pointer', letterSpacing: '0.04em', padding: 0,
        }}
      >
        Exit Simulation
      </button>
    </motion.div>
  );
}
