import { useState, useMemo } from 'react';

export interface DiurnalDataPoint {
  hour: number; // 0 - 23
  frp: number;  // Fire Radiative Power (MW)
  count?: number; // Detection count
}

interface DiurnalHeatRadarProps {
  /** Target Class ID (0: Wildfire, 1: Agricultural, 2: Industrial, 3: Gas Flare, 4: Accidental) */
  classId?: number;
  /** Custom hourly values (array of 24 points), or generated from archetype */
  hourlyData?: DiurnalDataPoint[];
  /** Diameter in pixels */
  size?: number;
  /** Primary accent color (default matches theme / class) */
  accentColor?: string;
  /** Show interactive hour hover readout */
  showInteractive?: boolean;
}

// 24-hour diurnal distribution archetypes based on satellite remote sensing patterns
const ARCHETYPES: Record<number, number[]> = {
  // Wildfire: Mid-afternoon peak with evening smoldering
  0: [2, 1, 1, 1, 2, 4, 8, 14, 25, 45, 65, 80, 88, 85, 75, 58, 40, 26, 16, 10, 6, 4, 3, 2],
  // Agricultural: Sharp post-harvest afternoon burning spike (13:00 - 15:30)
  1: [0, 0, 0, 0, 0, 1, 2, 5, 10, 22, 48, 75, 95, 98, 82, 50, 18, 5, 1, 0, 0, 0, 0, 0],
  // Industrial: 24/7 continuous operations with steady baseline
  2: [40, 42, 39, 41, 40, 45, 50, 52, 55, 54, 52, 50, 51, 53, 55, 52, 49, 46, 44, 43, 41, 42, 40, 39],
  // Gas Flare: Continuous baseline with distinct night flaring spikes
  3: [60, 65, 70, 68, 55, 45, 35, 30, 28, 25, 25, 28, 30, 32, 35, 40, 48, 58, 68, 75, 72, 68, 62, 58],
  // Accidental: Low baseline with an extreme isolated burst
  4: [5, 4, 3, 2, 2, 3, 4, 6, 8, 12, 18, 25, 30, 92, 70, 40, 20, 12, 8, 6, 5, 4, 4, 5],
};

const CLASS_COLORS: Record<number, string> = {
  0: '#ef4444', // Wildfire (Red)
  1: '#f59e0b', // Agricultural (Amber)
  2: '#6366f1', // Industrial (Indigo)
  3: '#a855f7', // Gas Flare (Purple)
  4: '#fb923c', // Accidental (Orange)
};

export function DiurnalHeatRadar({
  classId = 0,
  hourlyData,
  size = 140,
  accentColor,
  showInteractive = true,
}: DiurnalHeatRadarProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const color = accentColor || CLASS_COLORS[classId] || '#f59e0b';
  const center = size / 2;
  const maxRadius = (size / 2) - 16;
  const minRadius = 10;

  // Generate or normalize 24-hour points
  const points = useMemo(() => {
    const raw = hourlyData && hourlyData.length === 24
      ? hourlyData.map((d) => d.frp)
      : ARCHETYPES[classId] || ARCHETYPES[0];

    const maxVal = Math.max(...raw, 1);

    return raw.map((val, hour) => {
      // 0h at top ( -π/2 ), clockwise 24h cycle
      const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
      const normalizedRadius = minRadius + (val / maxVal) * (maxRadius - minRadius);
      const x = center + normalizedRadius * Math.cos(angle);
      const y = center + normalizedRadius * Math.sin(angle);
      return { hour, val, x, y, angle, radius: normalizedRadius };
    });
  }, [hourlyData, classId, center, minRadius, maxRadius]);

  // Generate SVG polygon points string
  const polygonPoints = useMemo(() => {
    return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  const activePoint = hoveredHour !== null ? points[hoveredHour] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible', userSelect: 'none' }}
      >
        <defs>
          <radialGradient id={`heatGrad-${classId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.08" />
            <stop offset="70%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.65" />
          </radialGradient>

          <filter id="spikeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Background Grid: Concentric Rings ── */}
        <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={center} cy={center} r={maxRadius * 0.66} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={center} cy={center} r={maxRadius * 0.33} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx={center} cy={center} r={minRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* ── Crosshair Axes ── */}
        <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* ── Hour Cardinal Labels ── */}
        <text x={center} y={center - maxRadius - 4} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono, Consolas, monospace" textAnchor="middle">00h</text>
        <text x={center + maxRadius + 7} y={center + 3} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono, Consolas, monospace" textAnchor="start">06h</text>
        <text x={center} y={center + maxRadius + 11} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono, Consolas, monospace" textAnchor="middle">12h</text>
        <text x={center - maxRadius - 7} y={center + 3} fill="#71717a" fontSize="8" fontFamily="JetBrains Mono, Consolas, monospace" textAnchor="end">18h</text>

        {/* ── 3PM Peak Burning Window Marker ── */}
        <text
          x={center + maxRadius * 0.72}
          y={center - maxRadius * 0.72}
          fill="#a1a1aa"
          fontSize="7"
          fontFamily="JetBrains Mono, Consolas, monospace"
          textAnchor="start"
        >
          3PM
        </text>

        {/* ── Heat Spike Starburst Polygon ── */}
        <polygon
          points={polygonPoints}
          fill={`url(#heatGrad-${classId})`}
          stroke={color}
          strokeWidth="1.75"
          strokeLinejoin="round"
          filter="url(#spikeGlow)"
          style={{
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* ── Active Hover / Spike Indicator ── */}
        {activePoint && (
          <g>
            <line
              x1={center}
              y1={center}
              x2={activePoint.x}
              y2={activePoint.y}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="4"
              fill={color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* ── Invisible Interactive Touch / Hover Sectors ── */}
        {showInteractive && points.map((p) => {
          const sliceAngle = (2 * Math.PI) / 24;
          const startAngle = p.angle - sliceAngle / 2;
          const endAngle = p.angle + sliceAngle / 2;
          const x1 = center + maxRadius * Math.cos(startAngle);
          const y1 = center + maxRadius * Math.sin(startAngle);
          const x2 = center + maxRadius * Math.cos(endAngle);
          const y2 = center + maxRadius * Math.sin(endAngle);

          return (
            <path
              key={p.hour}
              d={`M ${center} ${center} L ${x1} ${y1} A ${maxRadius} ${maxRadius} 0 0 1 ${x2} ${y2} Z`}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredHour(p.hour)}
              onMouseLeave={() => setHoveredHour(null)}
            />
          );
        })}
      </svg>

      {/* ── Minimal Readout Badge ── */}
      {showInteractive && (
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 10,
            color: activePoint ? color : '#71717a',
            transition: 'color 0.2s',
          }}
        >
          <span>{activePoint ? `${String(activePoint.hour).padStart(2, '0')}:00 UTC` : '24-HR CYCLE'}</span>
          <span>·</span>
          <span>{activePoint ? `${activePoint.val.toFixed(1)} MW` : 'DIURNAL PEAK ~14:00'}</span>
        </div>
      )}
    </div>
  );
}
