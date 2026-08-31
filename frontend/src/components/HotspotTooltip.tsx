import { useAppStore } from '../store/useAppStore';

// SVG Icon Components for the 5 AI Classes
function ClassHeroIcon({ clsId, color }: { clsId: number; color: string }) {
  switch (clsId) {
    case 0: // Wildfire: Stylized flame
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C9.5 6 7 8.5 7 12.5C7 15.5 9.2 18 12 18C14.8 18 17 15.5 17 12.5C17 9.5 15.5 7 12 2Z"
            fill={color}
          />
          <path
            d="M12 9C10.5 11.5 9.5 13 9.5 14.5C9.5 16 10.6 17 12 17C13.4 17 14.5 16 14.5 14.5C14.5 13 13.5 11.5 12 9Z"
            fill="#ffffff"
          />
        </svg>
      );
    case 1: // Agricultural: Bold wheat sheaf / crop burn
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 21V3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="12" cy="4.5" rx="1.8" ry="2.8" fill={color} />
          <path d="M12 9C10 7 7.5 7.5 6 9C7.5 10.5 10 10.5 12 9Z" fill={color} />
          <path d="M12 9C14 7 16.5 7.5 18 9C16.5 10.5 14 10.5 12 9Z" fill={color} />
          <path d="M12 13C9.8 11 7 11.5 5.5 13.2C7.2 14.8 10 14.8 12 13Z" fill={color} />
          <path d="M12 13C14.2 11 17 11.5 18.5 13.2C16.8 14.8 14 14.8 12 13Z" fill={color} />
          <path d="M12 17C10 15.2 7.5 15.8 6.2 17.4C7.8 18.8 10.2 18.8 12 17Z" fill={color} />
          <path d="M12 17C14 15.2 16.5 15.8 17.8 17.4C16.2 18.8 13.8 18.8 12 17Z" fill={color} />
        </svg>
      );
    case 2: // Industrial: Sawtooth factory
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 21H21V11L16 14V10L11 13V7L3 11V21Z"
            fill={color}
          />
          <rect x="6" y="14" width="2" height="3" fill="#18181b" />
          <rect x="11" y="15" width="2" height="3" fill="#18181b" />
          <rect x="16" y="15" width="2" height="3" fill="#18181b" />
        </svg>
      );
    case 3: // Gas Flare: Upward torch derrick flame
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 21L11 9H13L17 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 16H15.5" stroke={color} strokeWidth="1.8" />
          <path d="M9.8 12H14.2" stroke={color} strokeWidth="1.8" />
          <path
            d="M12 2C13.5 3.8 14.5 5.2 14.5 6.8C14.5 8.2 13.4 9.2 12 9.2C10.6 9.2 9.5 8.2 9.5 6.8C9.5 5.2 10.5 3.8 12 2Z"
            fill={color}
          />
        </svg>
      );
    case 4: // Accidental Fire: Warning octagon + exclamation
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon
            points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"
            fill={color}
          />
          <line x1="12" y1="8" x2="12" y2="13" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.2" fill="#ffffff" />
        </svg>
      );
  }
}

const CLASS_DESCRIPTORS: Record<number, string> = {
  0: 'Uncontrolled Forest Fire',
  1: 'Stubble / Crop Burn Event',
  2: 'Persistent Industrial Heat',
  3: 'Upstream Flaring Activity',
  4: '⚠ ANOMALY DETECTED',
};

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
    isAnomaly,
  } = hoveredCluster;

  const clsId = primaryClass.id ?? 1;
  const color = primaryClass.color || '#f97316';
  const descriptor = CLASS_DESCRIPTORS[clsId] ?? 'Thermal Anomaly Event';

  // Smart viewport collision prevention
  const cardWidth = 320;
  const cardHeight = 360;
  const padding = 16;

  let left = tooltipPos.x + 16;
  let top = tooltipPos.y - 40;

  if (typeof window !== 'undefined') {
    if (left + cardWidth > window.innerWidth - padding) {
      left = tooltipPos.x - cardWidth - 16;
    }
    if (top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }
  }

  const effectiveFrp = maxFrp > 0 ? maxFrp : avgFrp;

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 9999,
        width: cardWidth,
        background: '#111113',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
        fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, sans-serif',
        boxShadow: '0 12px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
        pointerEvents: 'none',
        transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), opacity 120ms ease',
        transformOrigin: 'top left',
      }}
    >
      {/* ── CARD HEADER ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#52525b',
            }}
          >
            1KM CELL TELEMETRY
          </span>
        </div>
        {isAnomaly && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚠ High Anomaly
          </span>
        )}
      </div>

      {/* ── ZONE 1: CLASS HERO BLOCK (Max Clarity Under 1s) ──────────────── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          background: `linear-gradient(90deg, ${color}14 0%, rgba(17,17,19,0) 100%)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        {/* Large Rounded Icon Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 12,
            background: '#1a1a1e',
            border: `1px solid ${color}33`,
            flexShrink: 0,
            boxShadow: `0 4px 16px ${color}22`,
          }}
        >
          <ClassHeroIcon clsId={clsId} color={color} />
        </div>

        {/* Primary Big & Bold Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: color,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
              textTransform: 'uppercase',
            }}
          >
            {primaryClass.name}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#8b8b93',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {descriptor}
          </span>
        </div>
      </div>

      {/* ── ZONE 2: CRITICAL METRICS STRIP (3-Column Grid) ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.25)',
        }}
      >
        {/* Tile 1: FRP Peak */}
        <div
          style={{
            padding: '10px 12px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: 'Geist Mono, monospace',
              fontWeight: 600,
              color: '#52525b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            [FRP PEAK]
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 17,
                fontWeight: 700,
                color: effectiveFrp > 5.0 ? color : '#f4f4f5',
                lineHeight: 1.1,
              }}
            >
              {effectiveFrp.toFixed(1)}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#52525b' }}>MW</span>
          </div>
        </div>

        {/* Tile 2: Brightness */}
        <div
          style={{
            padding: '10px 12px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: 'Geist Mono, monospace',
              fontWeight: 600,
              color: '#52525b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            [BRIGHTNESS]
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 17,
                fontWeight: 700,
                color: avgBrightness > 345 ? '#fef08a' : '#f4f4f5',
                lineHeight: 1.1,
              }}
            >
              {avgBrightness.toFixed(1)}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#52525b' }}>K</span>
          </div>
        </div>

        {/* Tile 3: Observations */}
        <div
          style={{
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: 'Geist Mono, monospace',
              fontWeight: 600,
              color: '#52525b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            [COUNT]
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 17,
                fontWeight: 700,
                color: '#f4f4f5',
                lineHeight: 1.1,
              }}
            >
              {totalHotspots.toLocaleString()}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: '#52525b' }}>OBS</span>
          </div>
        </div>
      </div>

      {/* ── ZONE 3: ENVIRONMENTAL CONTEXT ───────────────────────────────── */}
      <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'tropomi_no2' ? '#f59e0b' : '#6b7280' }}>
            NO₂ Index
          </span>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500, color: '#d4d4d8' }}>
            {avgNo2.toFixed(3)} mmol/m²
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'tropomi_so2' ? '#f59e0b' : '#6b7280' }}>
            SO₂ Emissions
          </span>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500, color: '#d4d4d8' }}>
            {avgSo2.toFixed(3)} mDU
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'land_cover_code' ? '#f59e0b' : '#6b7280' }}>
            Land Cover
          </span>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500, color: '#d4d4d8' }}>
            {landCover}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'elevation' ? '#f59e0b' : '#6b7280' }}>
            Elevation
          </span>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500, color: '#d4d4d8' }}>
            {elevation} m
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: activeMetric === 'is_industrial' ? '#f59e0b' : '#6b7280' }}>
            Industrial Ratio
          </span>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 500, color: '#d4d4d8' }}>
            {(isIndustrial * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
