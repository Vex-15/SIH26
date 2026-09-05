import { motion } from 'framer-motion';
import { useAppStore, METRIC_CONFIGS, CLASS_META, METRIC_SCALE_TIERS } from '../store/useAppStore';
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
  const {
    activeMetric,
    activeFilters,
    setSoloFilter,
    resetActiveFilters,
    metricScaleFilter,
    setMetricScaleFilter,
  } = useAppStore();

  const cfg = METRIC_CONFIGS[activeMetric];
  const leg = LEGEND_GRADIENTS[activeMetric];
  const tiers = METRIC_SCALE_TIERS[activeMetric];

  // 1. Target_Class: 5-Class Multi-Modal AI (synced with LeftDock Fire Class Filter)
  if (activeMetric === 'Target_Class') {
    const activeCount = Object.values(activeFilters).filter(Boolean).length;
    const isFiltered = activeCount < 5;

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
          border: isFiltered ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '8px 14px',
          pointerEvents: 'auto',
          userSelect: 'none',
          boxShadow: isFiltered
            ? '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(245, 158, 11, 0.12)'
            : '0 8px 24px rgba(0,0,0,0.6)',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isFiltered ? '#f59e0b' : '#a1a1aa',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>AI CLASSIFICATION CHANNELS</span>
            {isFiltered && (
              <span
                style={{
                  fontSize: 8,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                FILTERED ({activeCount}/5)
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetActiveFilters();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 4,
                padding: '2px 7px',
                color: '#e4e4e7',
                fontSize: 8.5,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
              title="Reset filters — show all channels"
            >
              RESET ALL
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Object.entries(CLASS_META).map(([id, meta]) => {
            const isActive = activeFilters[meta.key];
            const isSoleActive = isFiltered && isActive && activeCount === 1;

            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => setSoloFilter(meta.key)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                title={
                  isSoleActive
                    ? `${meta.name} is isolated. Click again to show all channels.`
                    : `Click to isolate ${meta.name} (filters out other channels)`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: isActive
                    ? isFiltered
                      ? `1px solid ${meta.color}90`
                      : '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid transparent',
                  background: isActive
                    ? isFiltered
                      ? `${meta.color}22`
                      : 'rgba(255, 255, 255, 0.04)'
                    : 'transparent',
                  boxShadow: isFiltered && isActive ? `0 0 10px ${meta.color}35` : 'none',
                  opacity: isActive ? 1 : 0.35,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: meta.color,
                    boxShadow: isActive ? `0 0 6px ${meta.color}80` : 'none',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#f4f4f5' : '#71717a',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                  }}
                >
                  {meta.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Continuous & Discrete Telemetry Metrics (Brightness, FRP, NO2, SO2, Land Cover, Industrial, Elevation)
  const isScaleFiltered = metricScaleFilter !== null && metricScaleFilter.metric === activeMetric;

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
        border: isScaleFiltered ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: '8px 14px',
        pointerEvents: 'auto',
        userSelect: 'none',
        boxShadow: isScaleFiltered
          ? '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(245, 158, 11, 0.12)'
          : '0 8px 24px rgba(0,0,0,0.6)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isScaleFiltered ? '#f59e0b' : '#a1a1aa',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{cfg.label} ({cfg.unit})</span>
          {isScaleFiltered && (
            <span
              style={{
                fontSize: 8,
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(245, 158, 11, 0.16)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              FILTERED: {metricScaleFilter.label}
            </span>
          )}
        </div>

        {isScaleFiltered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMetricScaleFilter(null);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 4,
              padding: '2px 7px',
              color: '#e4e4e7',
              fontSize: 8.5,
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
            title="Reset filter — show all ranges"
          >
            RESET ALL
          </button>
        )}
      </div>

      {/* Interactive Scale Tiers */}
      {tiers && tiers.length > 0 ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          {tiers.map((tier) => {
            const isSelected = isScaleFiltered && metricScaleFilter?.tierId === tier.id;
            const isMuted = isScaleFiltered && !isSelected;

            return (
              <motion.button
                key={tier.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setMetricScaleFilter(null);
                  } else {
                    setMetricScaleFilter({
                      metric: activeMetric,
                      tierId: tier.id,
                      min: tier.min,
                      max: tier.max,
                      codes: tier.codes,
                      label: tier.rangeLabel,
                    });
                  }
                }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                title={
                  isSelected
                    ? `${tier.name} (${tier.rangeLabel}) is active. Click to reset filter.`
                    : `Click to filter map to ${tier.name} (${tier.rangeLabel})`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 7px',
                  borderRadius: 6,
                  border: isSelected
                    ? `1px solid ${tier.color}90`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? `${tier.color}24`
                    : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: isSelected ? `0 0 10px ${tier.color}40` : 'none',
                  opacity: isMuted ? 0.35 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    backgroundColor: tier.color,
                    boxShadow: isSelected ? `0 0 6px ${tier.color}90` : 'none',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 9.5,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#f4f4f5' : '#a1a1aa',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                  }}
                >
                  {tier.name}
                </span>
                <span
                  style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 8.5,
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {tier.rangeLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : null}

      {/* Dynamic gradient bar matching active metric */}
      <div
        style={{
          width: '100%',
          height: 4,
          borderRadius: 999,
          background: leg.gradient,
          marginBottom: 4,
          transition: 'background 0.3s ease',
          opacity: isScaleFiltered ? 0.6 : 0.9,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 8.5,
          color: '#71717a',
        }}
      >
        <span>{leg.low}</span>
        <span>{leg.high}</span>
      </div>
    </div>
  );
}
