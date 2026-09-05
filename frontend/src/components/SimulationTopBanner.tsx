import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PANIPAT_CLUSTER } from './EmergencySimulationModal';

/**
 * Top Tactical Simulation Status Banner & Closed-System Exit Pill
 * Rendered ONLY when isSimulating === true.
 * Provides the explicit [✕ Exit Simulation] action to guarantee a closed system,
 * and renders a single dedicated semicircle on the right edge to re-open the drawer.
 */
export function SimulationTopBanner() {
  const { isSimulating, exitSimulation, selectedCluster, setSelectedCluster } = useAppStore();

  if (!isSimulating) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="sim-top-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(20, 20, 24, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 9999,
          padding: '6px 14px 6px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(239, 68, 68, 0.15)',
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#fafafa',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Pulsing indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ef4444',
            }}
          >
            MOCK SIMULATION
          </span>
        </div>

        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)' }} />

        {/* Incident info (Clean static telemetry text) */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#d4d4d8',
            fontFamily: 'Geist Mono, monospace',
          }}
        >
          Panipat MIDC · FRP 842.7 MW
        </span>

        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)' }} />

        {/* Exit & Restore Button */}
        <button
          onClick={exitSimulation}
          title="Exit simulation and restore baseline state"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 9999,
            padding: '4px 10px',
            color: '#f87171',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
            e.currentTarget.style.color = '#f87171';
          }}
        >
          <X size={12} strokeWidth={2.4} />
          <span>Exit Simulation</span>
        </button>
      </motion.div>

      {/* ── Semicircle Drawer Re-Open Trigger (Simulation only, visible when drawer is closed) ── */}
      {!selectedCluster && (
        <motion.button
          key="sim-semicircle-tab"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setSelectedCluster(PANIPAT_CLUSTER as any)}
          title="Open Incident Telemetry & ML Dossier"
          style={{
            position: 'fixed',
            top: '24%',
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 100,
            width: 32,
            height: 64,
            borderTopLeftRadius: 64,
            borderBottomLeftRadius: 64,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            background: 'rgba(20, 20, 24, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 4,
            paddingRight: 0,
            cursor: 'pointer',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.65), 0 0 14px rgba(245, 158, 11, 0.2)',
            transition: 'transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) translateX(-4px)';
            e.currentTarget.style.background = '#18181b';
            e.currentTarget.style.borderColor = '#f59e0b';
            e.currentTarget.style.boxShadow = '-6px 0 24px rgba(245, 158, 11, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
            e.currentTarget.style.background = 'rgba(20, 20, 24, 0.95)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            e.currentTarget.style.boxShadow = '-4px 0 20px rgba(0, 0, 0, 0.65), 0 0 14px rgba(245, 158, 11, 0.2)';
          }}
        >
          <ChevronLeft size={20} strokeWidth={2.6} color="#fbbf24" style={{ marginLeft: 2 }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
