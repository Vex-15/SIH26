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
      initial={{ opacity: 0, x: -14, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -14, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 72,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 290,
        maxHeight: 'min(500px, calc(100vh - 100px))',
        /* Neumorphic elevated panel */
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-out-lg)',
        borderRadius: 'var(--r-lg)',
        border: 'none',
        padding: '20px 18px 18px',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--neu-text-disabled)',
          marginBottom: 4,
        }}>
          Telemetry Parameter
        </div>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--neu-text-strong)',
          lineHeight: 1.2,
        }}>
          Hex Grid Metric
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--neu-text)',
          marginTop: 4,
        }}>
          Select metric to project on 1km hex grid
        </div>
      </div>

      {/* Inset divider */}
      <div style={{
        height: 1,
        background: 'transparent',
        boxShadow: 'inset 0 1px 2px var(--neu-dark), inset 0 -1px 1px var(--neu-light)',
        borderRadius: 1,
        marginBottom: 14,
      }} />

      {/* Metrics List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
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
                padding: '10px 12px',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                /* Neumorphic: inset when selected, elevated when not */
                background: 'var(--neu-base)',
                boxShadow: isSelected
                  ? `var(--neu-shadow-in-sm), 0 0 12px rgba(245,158,11,0.2)`
                  : 'var(--neu-shadow-out-sm)',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = 'var(--neu-shadow-out)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = 'var(--neu-shadow-out-sm)';
                }
              }}
            >
              {/* Left: Icon + Labels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--neu-base)',
                  boxShadow: isSelected
                    ? `inset 2px 2px 5px var(--neu-dark), inset -2px -2px 5px var(--neu-light), 0 0 10px rgba(245,158,11,0.3)`
                    : 'var(--neu-shadow-out-sm)',
                  color: isSelected ? 'var(--accent)' : 'var(--neu-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'box-shadow 0.2s, color 0.2s',
                }}>
                  <Icon size={15} strokeWidth={2} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isSelected ? 'var(--neu-text-strong)' : 'var(--neu-text-em)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.2s',
                  }}>
                    {config.label}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: isSelected ? 'var(--accent)' : 'var(--neu-text-disabled)',
                    transition: 'color 0.2s',
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
                  <Check size={15} strokeWidth={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
