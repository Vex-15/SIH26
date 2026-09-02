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
        const advanceHours = delta * playbackSpeed * 0.8;

        setCurrentHour((prev) => {
          const next = prev + advanceHours;
          if (next >= 24) {
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

  // ── Stepper Handlers ─────────────────────────────────────────────────────
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

  const dayStats = temporalIndex[startDate] || {
    total: 83,
    hourlyDistribution: [0, 0, 0, 0, 0, 2, 1, 1, 17, 13, 13, 3, 5, 10, 7, 5, 0, 0, 2, 0, 2, 1, 1, 0],
  };

  const maxHourlyCount = Math.max(1, ...dayStats.hourlyDistribution);

  const hoursInt = Math.floor(currentHour);
  const minutesInt = Math.floor((currentHour - hoursInt) * 60);
  const utcString = `${String(hoursInt).padStart(2, '0')}:${String(minutesInt).padStart(2, '0')} UTC`;

  const totalIstMinutes = (hoursInt * 60 + minutesInt + 330) % 1440;
  const istHours = Math.floor(totalIstMinutes / 60);
  const istMinutes = totalIstMinutes % 60;
  const istString = `${String(istHours).padStart(2, '0')}:${String(istMinutes).padStart(2, '0')} IST`;

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
    ? formatDateLabel(startDate) 
    : `${formatDateLabel(startDate)} — ${formatDateLabel(endDate)}`;

  const scrubPct = (currentHour / 24) * 100;

  return (
    <AnimatePresence>
      {isPlaybackControllerOpen && mapMode !== 'optical' && (
        <motion.div
          key="diurnal-controller"
          initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            zIndex: 45,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            userSelect: 'none',
          }}
        >
          {/* ── 1. Minimalist Top Bar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--neu-base)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-full)',
              padding: '4px 10px',
              boxShadow: 'var(--neu-shadow-out)',
              gap: 8,
            }}
          >
            {/* Date Range Selector Button */}
            <button
              onClick={() => setCalendarOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--neu-base-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-full)',
                padding: '4px 10px',
                color: 'var(--neu-text-strong)',
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <CalIcon size={12} color="var(--neu-text)" />
              <span>{dateRangeDisplay}</span>
              <span style={{ color: 'var(--neu-text-disabled)' }}>•</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {dayStats.total.toLocaleString()} pts
              </span>
              <ChevronDown size={12} color="var(--neu-text-disabled)" />
            </button>

            {/* Actions: Export & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setExportOpen(true)}
                className="neu-icon-btn"
                style={{ width: 26, height: 26 }}
                title="Export Telemetry Data"
              >
                <Download size={13} strokeWidth={2} />
              </button>

              <button
                onClick={() => setPlaybackControllerOpen(false)}
                className="neu-icon-btn"
                style={{ width: 26, height: 26 }}
                title="Close Time Player"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── 2. Minimalist Main Player Controller ── */}
          <div
            style={{
              width: 'min(90vw, 780px)',
              height: 52,
              background: 'var(--neu-base)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-full)',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--neu-shadow-out)',
            }}
          >
            {/* LEFT: Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Play / Pause Button */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--accent-glow)',
                }}
              >
                {isPlaying ? <Pause size={14} fill="#ffffff" /> : <Play size={14} fill="#ffffff" style={{ marginLeft: 1 }} />}
              </button>

              {/* Step Backward */}
              <button
                onClick={handlePrevHour}
                className="neu-icon-btn"
                style={{ width: 26, height: 26 }}
                title="Step -1h"
              >
                <ChevronLeft size={13} />
              </button>

              {/* Step Forward */}
              <button
                onClick={handleNextHour}
                className="neu-icon-btn"
                style={{ width: 26, height: 26 }}
                title="Step +1h"
              >
                <ChevronRight size={13} />
              </button>

              {/* Speed Multiplier Pill */}
              <button
                onClick={() => {
                  const nextIdx = (SPEED_OPTIONS.indexOf(playbackSpeed) + 1) % SPEED_OPTIONS.length;
                  setPlaybackSpeed(SPEED_OPTIONS[nextIdx]);
                }}
                className="neu-btn"
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--r-full)',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* CENTER: Clean Histogram Bar Scrubber */}
            <div
              ref={histogramRef}
              onPointerDown={handlePointerDown}
              style={{
                flex: 1,
                height: 30,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                cursor: 'pointer',
                margin: '0 18px',
                paddingBottom: 2,
              }}
            >
              {/* 24 Hourly Bars */}
              <div
                style={{
                  width: '100%',
                  height: 22,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2,
                }}
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const count = dayStats.hourlyDistribution[h] || 0;
                  const barHeightPct = Math.min(100, Math.max(15, (count / maxHourlyCount) * 100));

                  const isPeakHour = h >= 11 && h <= 18;
                  const isAnomalyHour = h === 9 && startDate === '2024-06-23';

                  let barColor = 'rgba(255, 255, 255, 0.12)';
                  if (isAnomalyHour) {
                    barColor = '#ef4444';
                  } else if (isPeakHour) {
                    barColor = 'var(--accent)';
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
                      <div
                        style={{
                          width: '100%',
                          height: `${barHeightPct}%`,
                          background: barColor,
                          borderRadius: '1px 1px 0 0',
                          opacity: isCurrent ? 1 : 0.65,
                          transition: 'height 0.15s ease, opacity 0.15s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Minimalist Needle */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
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
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Monospace Timestamps */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                flexShrink: 0,
                paddingLeft: 12,
                borderLeft: '1px solid var(--border-subtle)',
                height: '80%',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--neu-text-strong)',
                  lineHeight: 1.1,
                }}
              >
                {utcString}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--neu-text-disabled)',
                  lineHeight: 1.1,
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
