import { useAppStore, METRIC_CONFIGS, CLASS_META } from '../store/useAppStore';
import type { VisualMetric } from '../store/useAppStore';

const LEGEND_GRADIENTS: Record<VisualMetric, { gradient: string; low: string; high: string }> = {
  Target_Class: {
    gradient: 'linear-gradient(to right, #ef4444, #f59e0b, #6366f1, #a855f7, #ff3b30)',
    low: 'Wildfire',
    high: 'Accidental',
  },
  brightness: {
    gradient: 'linear-gradient(to right, #3b0764, #7e0037, #dc2626, #f97316, #facc15, #fef08a)',
    low: '< 325 K',
    high: '> 345 K',
  },
  frp: {
    gradient: 'linear-gradient(to right, #1e1b4b, #581c87, #9d174d, #e11d48, #fb923c)',
    low: '< 5 MW',
    high: '> 100 MW',
  },
  tropomi_no2: {
    gradient: 'linear-gradient(to right, #03045e, #0077b6, #00b4d8, #ffb703, #fb8500)',
    low: 'Low (0.04)',
    high: 'Plume (>0.22)',
  },
  tropomi_so2: {
    gradient: 'linear-gradient(to right, #132a13, #31572c, #4f772d, #90a955, #f9c74f)',
    low: 'Clean (<0.02)',
    high: 'Dense (>0.25)',
  },
  land_cover_code: {
    gradient: 'linear-gradient(to right, #059669, #84cc16, #eab308, #f97316, #6366f1)',
    low: 'Forest',
    high: 'Urban/Built',
  },
  is_industrial: {
    gradient: 'linear-gradient(to right, #27272a, #4338ca, #6366f1, #a855f7, #f59e0b)',
    low: '0% Non-Ind',
    high: '100% Facility',
  },
  elevation: {
    gradient: 'linear-gradient(to right, #1e1b4b, #312e81, #6b21a8, #b91c1c, #fbbf24)',
    low: '0 m (Lowlands)',
    high: '>1500 m (Highlands)',
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
          bottom: 28,
          left: 96,
          zIndex: 40,
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '10px 14px',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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
            marginBottom: 8,
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
        bottom: 28,
        left: 96,
        zIndex: 40,
        background: '#18181b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '10px 14px',
        pointerEvents: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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
