import { useAppStore, METRIC_CONFIGS, CLASS_META } from '../store/useAppStore';
import type { VisualMetric } from '../store/useAppStore';

const LEGEND_GRADIENTS: Record<VisualMetric, { gradient: string; low: string; high: string }> = {
  Target_Class: {
    gradient: 'linear-gradient(to right, #ef4444, #f59e0b, #6366f1, #a855f7, #ff3b30)',
    low: 'Wildfire',
    high: 'Accidental',
  },
  brightness: {
    gradient: 'linear-gradient(to right, #0d0221, #2d1160, #6b1f7a, #a0195a, #d62f2f, #e8621a, #f5961a, #fabb18, #fef08a, #ffffff)',
    low: '< 312 K',
    high: '> 367 K',
  },
  frp: {
    gradient: 'linear-gradient(to right, #0d0221, #2d1160, #7b1fa2, #c2185b, #e53935, #fb923c, #fef08a)',
    low: '< 5 MW',
    high: '> 500 MW',
  },
  tropomi_no2: {
    gradient: 'linear-gradient(to right, #03045e, #023e8a, #0077b6, #00b4d8, #90e0ef, #ffb703, #fb8500, #e85d04)',
    low: 'Clean (0.0)',
    high: 'Plume (>0.3)',
  },
  tropomi_so2: {
    gradient: 'linear-gradient(to right, #132a13, #1b4332, #2d6a4f, #52b788, #b7e4c7, #f9c74f, #f3722c)',
    low: 'Clean (<0.02)',
    high: 'Dense (>0.3)',
  },
  land_cover_code: {
    gradient: 'linear-gradient(to right, #059669, #84cc16, #eab308, #f97316, #6366f1, #2563eb, #06b6d4)',
    low: 'Forest',
    high: 'Urban/Built',
  },
  is_industrial: {
    gradient: 'linear-gradient(to right, #18181b, #312e81, #4338ca, #7c3aed, #a855f7, #e879f9, #fbbf24)',
    low: '0% Non-Ind',
    high: '100% Facility',
  },
  elevation: {
    gradient: 'linear-gradient(to right, #0f172a, #1e3a5f, #1d4ed8, #7c3aed, #be123c, #f59e0b, #fef3c7)',
    low: '0 m (Sea Level)',
    high: '>3500 m (Alpine)',
  },
};

export function ThermalLegend() {
  const { activeMetric } = useAppStore();
  const cfg = METRIC_CONFIGS[activeMetric];
  const leg = LEGEND_GRADIENTS[activeMetric];

  // Discrete class classification view
  if (activeMetric === 'Target_Class') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--neu-shadow-out-sm)',
          borderRadius: 'var(--r-full)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {Object.entries(CLASS_META).map(([id, meta]) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: meta.color,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--neu-text-em)',
                }}
              >
                {meta.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--neu-shadow-out-sm)',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-subtle)',
        padding: '8px 14px',
        pointerEvents: 'none',
        minWidth: 240,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--neu-text-disabled)',
          marginBottom: 6,
        }}
      >
        <span>{cfg.label}</span>
        <span style={{ color: 'var(--neu-text)', textTransform: 'none' }}>{cfg.unit}</span>
      </div>

      <div
        style={{
          height: 5,
          borderRadius: 3,
          background: leg.gradient,
          marginBottom: 5,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--neu-text)',
        }}
      >
        <span>{leg.low}</span>
        <span>{leg.high}</span>
      </div>
    </div>
  );
}
