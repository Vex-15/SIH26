import { useAppStore } from '../store/useAppStore';

function ClassDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 11, color: highlight ? '#f59e0b' : '#71717a', fontFamily: 'Space Grotesk, sans-serif' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {warn && (
          <span style={{ color: '#f59e0b', fontSize: 11, lineHeight: 1 }}>⚠</span>
        )}
        <span
          style={{
            fontFamily: 'Geist Mono, monospace',
            fontSize: accent ? 13 : 11,
            fontWeight: accent || highlight ? 600 : 500,
            color: accent ? '#f59e0b' : highlight ? '#fafafa' : '#e5e2e1',
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
        width: 284,
        background: '#18181b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'Space Grotesk, sans-serif',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px 9px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#1c1b1b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#71717a',
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
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 8,
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚠ Anomaly
          </span>
        )}
      </div>

      {/* ── Metrics ────────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <Row 
          label="Total Observations" 
          value={totalHotspots.toLocaleString()} 
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'Target_Class' ? '#f59e0b' : '#71717a' }}>Primary Class</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClassDot color={primaryClass.color} />
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: '#e5e2e1',
                textTransform: 'uppercase',
              }}
            >
              {primaryClass.name}
            </span>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

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

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

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

      {/* ── Z-Score footer if anomaly ──────────────────────────────────── */}
      {isAnomaly && zScore !== null && (
        <div
          style={{
            background: 'rgba(245,158,11,0.08)',
            borderTop: '1px solid rgba(245,158,11,0.15)',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#f59e0b',
            }}
          >
            Industrial Spike Z-Score
          </span>
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 12,
              fontWeight: 700,
              color: '#f59e0b',
            }}
          >
            {zScore.toFixed(2)}σ
          </span>
        </div>
      )}
    </div>
  );
}
