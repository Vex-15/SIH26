import { useAppStore } from '../store/useAppStore';

function ClassDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}88`,
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 10, color: highlight ? 'var(--accent)' : 'var(--neu-text)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {warn && (
          <span style={{ color: 'var(--accent)', fontSize: 10, lineHeight: 1 }}>⚠</span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: accent ? 12 : 10,
            fontWeight: accent || highlight ? 600 : 500,
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

  const left = tooltipPos.x + 18;
  const top  = tooltipPos.y - 20;

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 100,
        width: 288,
        /* Neumorphic elevated tooltip */
        background: 'var(--neu-base)',
        boxShadow: 'var(--neu-shadow-out-lg)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        fontFamily: 'var(--font-ui)',
        border: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px 9px',
          background: 'var(--neu-base)',
          boxShadow: '0 2px 6px var(--neu-dark)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--neu-text-disabled)',
            }}
          >
            1km Cell Telemetry
          </span>
        </div>
        {isAnomaly && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--neu-base)',
              boxShadow: 'var(--neu-shadow-in-sm)',
              color: 'var(--accent)',
              padding: '2px 8px',
              borderRadius: 'var(--r-full)',
              fontSize: 8,
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚠ Anomaly
          </span>
        )}
      </div>

      {/* ── Metrics ── */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Row
          label="Total Observations"
          value={totalHotspots.toLocaleString()}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: activeMetric === 'Target_Class' ? 'var(--accent)' : 'var(--neu-text)' }}>Primary Class</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClassDot color={primaryClass.color} />
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--neu-text-em)',
              textTransform: 'uppercase',
            }}>
              {primaryClass.name}
            </span>
          </div>
        </div>

        {/* Neumorphic inset divider */}
        <div style={{
          height: 1,
          background: 'transparent',
          boxShadow: 'inset 0 1px 2px var(--neu-dark)',
          margin: '2px 0',
        }} />

        <Row
          label="Brightness Temp"
          value={`${avgBrightness.toFixed(1)} K`}
          highlight={activeMetric === 'brightness'}
        />
        <Row
          label="Avg / Max FRP"
          value={`${avgFrp.toFixed(1)} / ${maxFrp.toFixed(1)} MW`}
          accent
          highlight={activeMetric === 'frp'}
        />
        <Row
          label="NO₂ Index"
          value={`${avgNo2.toFixed(3)} mmol/m²`}
          highlight={activeMetric === 'tropomi_no2'}
        />
        <Row
          label="SO₂ Emissions"
          value={`${avgSo2.toFixed(3)} mDU`}
          highlight={activeMetric === 'tropomi_so2'}
        />

        <div style={{
          height: 1,
          background: 'transparent',
          boxShadow: 'inset 0 1px 2px var(--neu-dark)',
          margin: '2px 0',
        }} />

        <Row
          label="Land Cover"
          value={landCover}
          highlight={activeMetric === 'land_cover_code'}
        />
        <Row
          label="Elevation"
          value={`${elevation} m`}
          highlight={activeMetric === 'elevation'}
        />
        <Row
          label="Industrial Ratio"
          value={`${(isIndustrial * 100).toFixed(0)}%`}
          highlight={activeMetric === 'is_industrial'}
        />
      </div>

      {/* ── Z-Score footer if anomaly ── */}
      {isAnomaly && zScore !== null && (
        <div
          style={{
            background: 'var(--neu-base)',
            boxShadow: 'inset 0 2px 6px var(--neu-dark)',
            padding: '8px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            Industrial Spike Z-Score
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {zScore.toFixed(2)}σ
          </span>
        </div>
      )}
    </div>
  );
}
