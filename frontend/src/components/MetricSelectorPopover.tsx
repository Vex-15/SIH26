import { motion } from 'framer-motion';
import { 
  X, 
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
  const { activeMetric, setActiveMetric, isMetricSelectorOpen, setMetricSelectorOpen } = useAppStore();

  if (!isMetricSelectorOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: 76,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 310,
        maxHeight: 'min(480px, calc(100vh - 120px))',
        background: '#18181b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.6)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#1c1b1b',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f59e0b',
            }}
          >
            Telemetry Visualization Parameter
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11,
              color: '#71717a',
            }}
          >
            Select metric to project on 1km hex grid
          </span>
        </div>
        <button
          onClick={() => setMetricSelectorOpen(false)}
          aria-label="Close Parameter Selector"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#71717a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 180ms',
            outline: 'none',
            padding: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e2e1')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Parameter List with bounded scrolling */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 8, 
          gap: 4, 
          overflowY: 'auto',
          maxHeight: 'min(380px, calc(100vh - 200px))',
        }}
      >
        {(Object.keys(METRIC_CONFIGS) as VisualMetric[]).map((key) => {
          const cfg = METRIC_CONFIGS[key];
          const Icon = ICONS[key];
          const isActive = activeMetric === key;

          return (
            <div
              key={key}
              onClick={() => {
                setActiveMetric(key);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 150ms',
                background: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(245, 158, 11, 0.35)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Left Side: Icon + Label + Description */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#f59e0b' : '#a1a1aa',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 12,
                        fontWeight: 600,
                        color: isActive ? '#fafafa' : '#e4e4e7',
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Geist Mono, monospace',
                        fontSize: 9,
                        color: isActive ? '#f59e0b' : '#71717a',
                        background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        padding: '1px 5px',
                        borderRadius: 4,
                      }}
                    >
                      {cfg.unit}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 10,
                      color: '#71717a',
                    }}
                  >
                    {cfg.description}
                  </span>
                </div>
              </div>

              {/* Right Side: Checkmark if active */}
              {isActive && (
                <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
