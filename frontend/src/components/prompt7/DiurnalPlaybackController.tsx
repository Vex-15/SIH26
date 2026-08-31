import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  Download, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface DailyStats {
  total: number;
  classes: Record<string, number>;
  maxFrp: number;
  avgBrightness: number;
  hourlyDistribution: number[];
}

const SPEED_OPTIONS = [1, 2, 5, 10];

export function DiurnalPlaybackController() {
  const {
    isPlaybackControllerOpen,
    setPlaybackControllerOpen,
    startDate,
    endDate,
    setDateRange,
    currentHour,
    setCurrentHour,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    setCalendarOpen,
    setExportOpen,
    mapMode,
  } = useAppStore();

  const [temporalIndex, setTemporalIndex] = useState<Record<string, DailyStats>>({});
  const histogramRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // ── Load Real 2024 Daily Satellite Index ─────────────────────────────────
  useEffect(() => {
    fetch('/data/daily_2024_temporal_index.json')
      .then((res) => res.json())
      .then((data) => setTemporalIndex(data))
      .catch((err) => console.warn('Failed to load daily temporal index:', err));
  }, []);

  // Helper to advance or retreat a date string by N days
  const shiftDate = useCallback((dateStr: string, days: number): string => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }, []);

  // ── Smooth Playback Animation Loop with Real Date Auto-Advance ────────────
  useEffect(() => {
    if (!isPlaying || !isPlaybackControllerOpen || mapMode === 'optical') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        // At 1x speed: 24 hours takes ~24 seconds (1 hr per second)
        const advanceHours = delta * playbackSpeed * 0.8;

        setCurrentHour((prev) => {
          const next = prev + advanceHours;
          if (next >= 24) {
            // Advance to next day in 2024 calendar
            const currDate = useAppStore.getState().startDate;
            const nextDate = shiftDate(currDate, 1);
            useAppStore.getState().setDateRange(nextDate, nextDate);
            return next - 24;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, setCurrentHour, shiftDate, isPlaybackControllerOpen, mapMode]);

  // ── Stepper Handlers (crossing midnight advances/retreats day) ────────────
  const handlePrevHour = () => {
    setCurrentHour((h) => {
      if (h <= 1) {
        const prevDate = shiftDate(startDate, -1);
        setDateRange(prevDate, prevDate);
        return 23.0;
      }
      return h - 1;
    });
  };

  const handleNextHour = () => {
    setCurrentHour((h) => {
      if (h >= 23) {
        const nextDate = shiftDate(startDate, 1);
        setDateRange(nextDate, nextDate);
        return 0.0;
      }
      return h + 1;
    });
  };

  // ── Scrubber Calculations ────────────────────────────────────────────────
  const handleScrub = useCallback((clientX: number) => {
    if (!histogramRef.current) return;
    const rect = histogramRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetHour = pct * 23.99;
    setCurrentHour(targetHour);
  }, [setCurrentHour]);

  const handlePointerDown = (e: React.PointerEvent) => {
    handleScrub(e.clientX);

    const onMove = (pe: PointerEvent) => handleScrub(pe.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // ── Active Daily Profile from Real 2024 Dataset ──────────────────────────
  const dayStats = temporalIndex[startDate] || {
    total: 83,
    hourlyDistribution: [0, 0, 0, 0, 0, 2, 1, 1, 17, 13, 13, 3, 5, 10, 7, 5, 0, 0, 2, 0, 2, 1, 1, 0],
  };

  const maxHourlyCount = Math.max(1, ...dayStats.hourlyDistribution);

  // ── Time Formatting (UTC and IST) ─────────────────────────────────────────
  const hoursInt = Math.floor(currentHour);
  const minutesInt = Math.floor((currentHour - hoursInt) * 60);

  const utcString = `${String(hoursInt).padStart(2, '0')}:${String(minutesInt).padStart(2, '0')} UTC`;

  // IST = UTC + 5 hours 30 minutes
  const totalIstMinutes = (hoursInt * 60 + minutesInt + 330) % 1440;
  const istHours = Math.floor(totalIstMinutes / 60);
  const istMinutes = totalIstMinutes % 60;
  const istString = `${String(istHours).padStart(2, '0')}:${String(istMinutes).padStart(2, '0')} IST`;

  // Format Date Range string e.g. "31 Aug 2024" or "22 May 2024 — 29 May 2024"
  const formatDateLabel = (dStr: string) => {
    try {
      const [y, m, d] = dStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return dStr;
    }
  };

  const isSingleDay = startDate === endDate;
  const dateRangeDisplay = isSingleDay 
    ? `${formatDateLabel(startDate)} (Single Day)` 
    : `${formatDateLabel(startDate)} — ${formatDateLabel(endDate)}`;

  const scrubPct = (currentHour / 24) * 100;

  return (
    <AnimatePresence>
      {isPlaybackControllerOpen && mapMode !== 'optical' && (
        <motion.div
          key="diurnal-controller"
          initial={{ opacity: 0, y: 30, x: '-50%', scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 30, x: '-50%', scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            zIndex: 45,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            userSelect: 'none',
          }}
        >
          {/* ── 1. Top Header Bar (docs/stitch/slider_redesign) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#1c1b1b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 9999,
              padding: '6px 14px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
              gap: 12,
            }}
          >
            {/* Date Range Capsule Selector Button */}
            <button
              onClick={() => setCalendarOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#1c1c1f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 9999,
                padding: '6px 14px',
                color: '#ffffff',
                fontSize: 12,
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1c1c1f';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <CalIcon size={14} color="#9ca3af" />
              <span>{dateRangeDisplay}</span>
              <span style={{ color: '#52525b', margin: '0 2px' }}>·</span>
              <span style={{ color: '#f59e0b', fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>
                {dayStats.total.toLocaleString()} HOTSPOTS
              </span>
              <ChevronDown size={14} color="#9ca3af" />
            </button>

            {/* Actions: Export Dossier + Close Overlay */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                paddingLeft: 12,
              }}
            >
              {/* Amber Download / Export Button */}
              <button
                onClick={() => setExportOpen(true)}
                title="Export Filtered Telemetry (CSV / GeoJSON / PDF)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #f59e0b',
                  background: 'transparent',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={15} strokeWidth={2.2} />
              </button>

              {/* Close Button: Restores full-year baseline */}
              <button
                onClick={() => setPlaybackControllerOpen(false)}
                title="Close Time-Series Player (Restore Year-Round Baseline)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── 2. Main Player Controller (docs/stitch/slider_redesign2) ── */}
          <div
            style={{
              width: 'min(92vw, 864px)',
              height: 64,
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 32,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* LEFT: Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Play / Pause Amber Engine Button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause Playback' : 'Play Playback'}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  border: 'none',
                  color: '#0d0d0d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.2s, transform 0.1s, box-shadow 0.2s',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.45)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fbbf24')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f59e0b')}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isPlaying ? <Pause size={18} fill="#0d0d0d" /> : <Play size={18} fill="#0d0d0d" style={{ marginLeft: 2 }} />}
              </button>

              {/* Step Backward */}
              <button
                onClick={handlePrevHour}
                title="Step Backward 1 Hour"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  border: 'none',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Step Forward */}
              <button
                onClick={handleNextHour}
                title="Step Forward 1 Hour"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  border: 'none',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.background = '#2a2a2a';
                }}
              >
                <ChevronRight size={15} />
              </button>

              {/* Speed Multiplier Pill */}
              <button
                onClick={() => {
                  const nextIdx = (SPEED_OPTIONS.indexOf(playbackSpeed) + 1) % SPEED_OPTIONS.length;
                  setPlaybackSpeed(SPEED_OPTIONS[nextIdx]);
                }}
                title="Toggle Speed (1×, 2×, 5×, 10×)"
                style={{
                  background: '#2a2a2a',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '4px 12px',
                  color: '#ffffff',
                  fontSize: 12,
                  fontFamily: 'Geist Mono, monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 4,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#383838')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#2a2a2a')}
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* CENTER: Sparkline Diurnal Histogram with Playhead */}
            <div
              ref={histogramRef}
              onPointerDown={handlePointerDown}
              style={{
                flex: 1,
                height: 36,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                cursor: 'pointer',
                margin: '0 24px',
                paddingBottom: 4,
              }}
            >
              {/* 24 Hourly Diurnal Bars */}
              <div
                style={{
                  width: '100%',
                  height: 28,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 3,
                }}
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const count = dayStats.hourlyDistribution[h] || 0;
                  const barHeightPct = Math.min(100, Math.max(18, (count / maxHourlyCount) * 100));

                  const isPeakHour = h >= 11 && h <= 18;
                  const isAnomalyHour = h === 9 && startDate === '2024-06-23';

                  let barColor = '#2a2a2a';
                  if (isAnomalyHour) {
                    barColor = '#ef4444';
                  } else if (isPeakHour) {
                    barColor = '#f59e0b';
                  }

                  const isCurrent = Math.floor(currentHour) === h;

                  return (
                    <div
                      key={h}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {isAnomalyHour && (
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: '#ef4444',
                            boxShadow: '0 0 6px #ef4444',
                            marginBottom: 2,
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: '100%',
                          height: `${barHeightPct}%`,
                          background: barColor,
                          borderRadius: '1px 1px 0 0',
                          opacity: isCurrent ? 1 : 0.85,
                          transition: 'height 0.2s ease, opacity 0.15s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Playhead Needle and Glowing Pip */}
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  bottom: 0,
                  left: `${scrubPct}%`,
                  width: 1.5,
                  background: '#ffffff',
                  pointerEvents: 'none',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.9)',
                  }}
                />
              </div>

              {/* Axis Labels */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -14,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 9,
                  fontFamily: 'Geist Mono, monospace',
                  color: '#666666',
                  pointerEvents: 'none',
                }}
              >
                <span>00:00-23:00</span>
                <span style={{ color: '#f59e0b' }}>11:00-18:00 (Peak)</span>
                <span>00:00-22:00</span>
              </div>
            </div>

            {/* RIGHT: Telemetry Cluster (Dual Timezone Readout) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                flexShrink: 0,
                paddingLeft: 16,
                paddingRight: 8,
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {utcString}
              </span>
              <span
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#888888',
                  lineHeight: 1,
                }}
              >
                {istString}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
