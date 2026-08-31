import { useAppStore, METRIC_CONFIGS, CLASS_META } from '../store/useAppStore';
import type { VisualMetric } from '../store/useAppStore';

const LEGEND_GRADIENTS: Record<VisualMetric, { gradient: string; low: string; high: string }> = {
  Target_Class: {
    gradient: 'linear-gradient(to right, #ef4444, #f59e0b, #6366f1, #a855f7, #ff3b30)',
    low: 'Wildfire',
    high: 'Accidental',
  },
  // Matches new quantile-calibrated interpolate expression using b_x
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

  // If Target_Class is active, show discrete classification badge chips
  if (activeMetric === 'Target_Class') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '8px 14px',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#a1a1aa',
            marginBottom: 6,
          }}
        >
          AI CLASSIFICATION CHANNELS
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {Object.entries(CLASS_META).map(([id, meta]) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: meta.color,
                }}
              />
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#e5e2e1',
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
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: '8px 14px',
        pointerEvents: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#a1a1aa',
          marginBottom: 6,
        }}
      >
        {cfg.label} ({cfg.unit})
      </div>

      {/* Dynamic gradient bar matching active metric */}
      <div
        style={{
          width: 220,
          height: 6,
          borderRadius: 999,
          background: leg.gradient,
          marginBottom: 5,
          transition: 'background 0.3s ease',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 9,
          color: '#71717a',
        }}
      >
        <span>{leg.low}</span>
        <span>{leg.high}</span>
      </div>
    </div>
  );
}

