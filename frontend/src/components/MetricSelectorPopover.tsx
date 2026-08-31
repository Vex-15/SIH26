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
      initial={{ opacity: 0, x: -14, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -14, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: 68,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 280,
        maxHeight: 'min(480px, calc(100vh - 100px))',
        background: 'rgba(18, 21, 28, 0.96)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 16,
        padding: '16px 16px 14px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: 3,
          }}
        >
          TELEMETRY PARAMETER
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          Select metric to project on 1km hex grid
        </div>
      </div>

      {/* Metrics List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
          paddingRight: 4,
          scrollbarWidth: 'none',
        }}
      >
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
                borderRadius: 10,
                cursor: 'pointer',
                background: isSelected ? 'rgba(245, 158, 11, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }
              }}
            >
              {/* Left: Icon + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {config.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {config.unit}
                  </span>
                </div>
              </div>

              {/* Right: Checkmark for active selection */}
              {isSelected && (
                <div
                  style={{
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: 6,
                  }}
                >
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
