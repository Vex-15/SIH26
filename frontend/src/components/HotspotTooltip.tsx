import { useAppStore } from '../store/useAppStore';

function ClassDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function Row({
  label,
  value,
  accent,
  warn,
  highlight,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: highlight ? 'var(--accent)' : 'var(--neu-text)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {warn && (
          <span style={{ color: '#ef4444', fontSize: 10, lineHeight: 1 }}>⚠</span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: accent || highlight ? 600 : 400,
            color: accent ? 'var(--accent)' : highlight ? 'var(--neu-text-strong)' : 'var(--neu-text-em)',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function HotspotTooltip() {
  const { hoveredCluster, tooltipPos, activeMetric } = useAppStore();

  if (!hoveredCluster || !tooltipPos) return null;

  const {
    totalHotspots,
    primaryClass,
    avgFrp,
    maxFrp,
    avgBrightness,
    avgNo2,
    avgSo2,
    elevation,
    landCover,
    isIndustrial,
    zScore,
    isAnomaly,
  } = hoveredCluster;

  const left = tooltipPos.x + 16;
  const top  = tooltipPos.y - 10;

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 100,
        width: 250,
        background: 'var(--neu-base)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--neu-shadow-out)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        fontFamily: 'var(--font-ui)',
        border: '1px solid var(--border-subtle)',
        pointerEvents: 'none',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--neu-base-raised)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--neu-text-disabled)',
          }}
        >
          1km Grid Cell
        </span>

        {isAnomaly && (
          <span
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              padding: '1px 6px',
              borderRadius: 'var(--r-full)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Spike
          </span>
        )}
      </div>

      {/* ── Metrics ── */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Row
          label="Observations"
          value={totalHotspots.toLocaleString()}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'Target_Class' ? 'var(--accent)' : 'var(--neu-text)' }}>Class</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ClassDot color={primaryClass.color} />
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--neu-text-strong)',
            }}>
              {primaryClass.name}
            </span>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />

        <Row
          label="Peak Radiance"
          value={`${avgBrightness.toFixed(1)} K`}
          highlight={activeMetric === 'brightness'}
        />
        <Row
          label="FRP (Avg / Max)"
          value={`${avgFrp.toFixed(1)} / ${maxFrp.toFixed(1)} MW`}
          accent
          highlight={activeMetric === 'frp'}
        />
        {avgNo2 > 0 && (
          <Row
            label="NO₂ Column"
            value={`${avgNo2.toFixed(3)}`}
            highlight={activeMetric === 'tropomi_no2'}
          />
        )}
        {avgSo2 > 0 && (
          <Row
            label="SO₂ Emissions"
            value={`${avgSo2.toFixed(3)}`}
            highlight={activeMetric === 'tropomi_so2'}
          />
        )}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />

        <Row
          label="Surface Type"
          value={landCover}
          highlight={activeMetric === 'land_cover_code'}
        />
        <Row
          label="Elevation"
          value={`${elevation} m`}
          highlight={activeMetric === 'elevation'}
        />
        {isIndustrial > 0 && (
          <Row
            label="Industrial Index"
            value={`${(isIndustrial * 100).toFixed(0)}%`}
            highlight={activeMetric === 'is_industrial'}
          />
        )}
      </div>

      {/* ── Z-Score footer if anomaly ── */}
      {isAnomaly && zScore !== null && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#ef4444',
            }}
          >
            Anomaly Z-Score
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: '#ef4444',
            }}
          >
            +{zScore.toFixed(2)}σ
          </span>
        </div>
      )}
    </div>
  );
}
