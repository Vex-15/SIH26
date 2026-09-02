import { motion } from 'framer-motion';
import {
  Thermometer,
  Flame,
  CloudFog,
  FlaskConical,
  Trees,
  Factory,
  Mountain,
  BrainCircuit,
  Check
} from 'lucide-react';
import { useAppStore, METRIC_CONFIGS } from '../store/useAppStore';
import type { VisualMetric } from '../store/useAppStore';

const ICONS: Record<VisualMetric, React.ElementType> = {
  brightness: Thermometer,
  frp: Flame,
  tropomi_no2: CloudFog,
  tropomi_so2: FlaskConical,
  land_cover_code: Trees,
  is_industrial: Factory,
  elevation: Mountain,
  Target_Class: BrainCircuit,
};

export function MetricSelectorPopover() {
  const { activeMetric, setActiveMetric } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 72,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 280,
        maxHeight: 'min(480px, calc(100vh - 80px))',
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--neu-shadow-out)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '16px',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--neu-text-disabled)',
          marginBottom: 2,
        }}>
          Telemetry Parameter
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--neu-text-strong)',
        }}>
          Hex Grid Metric
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--neu-text)',
          marginTop: 2,
        }}>
          Select metric to project on 1km grid
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 10 }} />

      {/* Metrics List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflowY: 'auto',
        paddingRight: 2,
      }}>
        {(Object.keys(METRIC_CONFIGS) as VisualMetric[]).map((key) => {
          const config = METRIC_CONFIGS[key];
          const isSelected = activeMetric === key;
          const Icon = ICONS[key];

          return (
            <div
              key={key}
              onClick={() => setActiveMetric(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                background: isSelected ? 'var(--neu-base-raised)' : 'transparent',
                border: '1px solid',
                borderColor: isSelected ? 'var(--accent)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Left: Icon + Labels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--r-sm)',
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--neu-base-raised)',
                  color: isSelected ? 'var(--accent)' : 'var(--neu-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  <Icon size={14} strokeWidth={2} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'var(--neu-text-strong)' : 'var(--neu-text-em)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {config.label}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--neu-text-disabled)',
                  }}>
                    {config.unit}
                  </span>
                </div>
              </div>

              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginLeft: 6,
                }}>
                  <Check size={14} strokeWidth={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
