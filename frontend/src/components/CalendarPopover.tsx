import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';


const PRESETS = [
  {
    start: '2024-06-23',
    end: '2024-06-23',
    title: 'Panipat Chemical Surge',
    desc: 'Accidental Industrial spike +4.12σ',
    tag: 'CRITICAL',
    tagColor: '#ef4444',
  },
  {
    start: '2024-11-01',
    end: '2024-11-07',
    title: 'Peak Stubble Season (7-Day)',
    desc: 'Punjab & Haryana intensive burning wave',
    tag: 'AGRICULTURAL',
    tagColor: '#f59e0b',
  },
  {
    start: '2024-05-01',
    end: '2024-05-05',
    title: 'Uttarakhand Wildfires',
    desc: 'Himalayan pine canopy fire outbreak (>900/day)',
    tag: 'WILDFIRE',
    tagColor: '#ef4444',
  },
  {
    start: '2024-03-01',
    end: '2024-03-01',
    title: 'Pre-Monsoon Baseline',
    desc: 'Quiet seasonal reference',
    tag: 'BASELINE',
    tagColor: '#6366f1',
  },
];

export function CalendarPopover() {
  const { 
    isCalendarOpen, 
    setCalendarOpen, 
    startDate, 
    endDate, 
    setDateRange,
    setPlaybackControllerOpen 
  } = useAppStore();

  const [activeMonth, setActiveMonth] = useState<number>(() => {
    try {
      const parts = startDate.split('-');
      return parseInt(parts[1], 10) - 1;
    } catch {
      return 7;
    }
  });
  const [activeYear, setActiveYear] = useState<number>(() => {
    try {
      const parts = startDate.split('-');
      return parseInt(parts[0], 10) || 2024;
    } catch {
      return 2024;
    }
  });
  const [rangeMode, setRangeMode] = useState<'single' | 'range'>('single');
  const [selectingEnd, setSelectingEnd] = useState<boolean>(false);
  const [dailyIndex, setDailyIndex] = useState<Record<string, { total: number; maxFrp: number }>>({});

  useEffect(() => {
    if (isCalendarOpen && startDate) {
      try {
        const parts = startDate.split('-');
        if (parts.length >= 2) {
          setActiveMonth(parseInt(parts[1], 10) - 1);
          setActiveYear(parseInt(parts[0], 10) || 2024);
        }
      } catch {}
    }
  }, [isCalendarOpen, startDate]);

  useEffect(() => {
    fetch('/data/daily_2024_temporal_index.json')
      .then((res) => res.json())
      .then((data) => setDailyIndex(data))
      .catch((err) => console.warn('Failed to load daily temporal index:', err));
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const startDay = new Date(activeYear, activeMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (rangeMode === 'single') {
      setDateRange(dateStr, dateStr);
      setPlaybackControllerOpen(true);
    } else {
      if (!selectingEnd) {
        setDateRange(dateStr, dateStr);
        setSelectingEnd(true);
      } else {
        if (dateStr >= startDate) {
          setDateRange(startDate, dateStr);
        } else {
          setDateRange(dateStr, startDate);
        }
        setSelectingEnd(false);
        setPlaybackControllerOpen(true);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="calendar-popover"
        initial={{ opacity: 0, x: -16, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -16, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 80,
          left: 72,
          zIndex: 60,
          width: 340,
          background: '#18181b',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 18,
          padding: '16px 18px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#fafafa',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={16} color="#f59e0b" />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              2024 TEMPORAL ARCHIVE
            </span>
          </div>
          <button
            onClick={() => setCalendarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector: Single Day vs Date Range (A-B) */}
        <div
          style={{
            display: 'flex',
            background: '#121214',
            borderRadius: 8,
            padding: 3,
            marginBottom: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <button
            onClick={() => { setRangeMode('single'); setSelectingEnd(false); }}
            style={{
              flex: 1,
              background: rangeMode === 'single' ? '#f59e0b' : 'transparent',
              color: rangeMode === 'single' ? '#0d0d0d' : '#a1a1aa',
              border: 'none',
              borderRadius: 6,
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            SINGLE DAY
          </button>
          <button
            onClick={() => { setRangeMode('range'); setSelectingEnd(false); }}
            style={{
              flex: 1,
              background: rangeMode === 'range' ? '#f59e0b' : 'transparent',
              color: rangeMode === 'range' ? '#0d0d0d' : '#a1a1aa',
              border: 'none',
              borderRadius: 6,
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            DATE RANGE (A ➔ B)
          </button>
        </div>

        {/* Selected Range Display Status */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 8,
            padding: '6px 10px',
            marginBottom: 12,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{startDate === endDate ? `Selected: ${startDate}` : `${startDate} ➔ ${endDate}`}</span>
          {rangeMode === 'range' && selectingEnd && (
            <span style={{ fontSize: 9, color: '#fafafa', background: '#ef4444', padding: '1px 5px', borderRadius: 4 }}>
              Pick End Date
            </span>
          )}
        </div>

        {/* Month Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#121214',
            padding: '6px 10px',
            borderRadius: 10,
            marginBottom: 10,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <button
            onClick={handlePrevMonth}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, Consolas, monospace' }}>
            {monthNames[activeMonth]} {activeYear}
          </span>
          <button
            onClick={handleNextMonth}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontSize: 9,
            color: '#71717a',
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          <span>SU</span>
          <span>MO</span>
          <span>TU</span>
          <span>WE</span>
          <span>TH</span>
          <span>FR</span>
          <span>SA</span>
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            marginBottom: 14,
          }}
        >
          {Array.from({ length: startDay }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ height: 28 }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isInRange = dateStr >= startDate && dateStr <= endDate;
            const isStart = dateStr === startDate;
            const isEnd = dateStr === endDate;

            const dayData = dailyIndex[dateStr];
            const hasData = !!dayData && dayData.total > 0;
            const isHighDensity = dayData && dayData.total > 300;

            let bgColor = 'transparent';
            let textColor = isHighDensity ? '#f87171' : '#d4d4d8';
            let border = 'none';

            if (isInRange) {
              bgColor = isStart || isEnd ? '#f59e0b' : 'rgba(245, 158, 11, 0.25)';
              textColor = isStart || isEnd ? '#0d0d0d' : '#f59e0b';
              border = '1px solid #f59e0b';
            } else if (isHighDensity) {
              bgColor = 'rgba(239, 68, 68, 0.15)';
            } else if (hasData) {
              bgColor = 'rgba(255, 255, 255, 0.03)';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dateStr)}
                title={hasData ? `${dayData.total} detections on ${dateStr}` : dateStr}
                style={{
                  height: 28,
                  borderRadius: 6,
                  border,
                  background: bgColor,
                  color: textColor,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, Consolas, monospace',
                  fontWeight: isInRange || isHighDensity ? 700 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {day}
                {hasData && !isInRange && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: isHighDensity ? '#ef4444' : '#f59e0b',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tactical Defense Historical Presets */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
          <div style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            QUICK DEFENSE PRESETS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {PRESETS.map((p) => {
              const isActive = startDate === p.start && endDate === p.end;
              return (
                <div
                  key={p.title}
                  onClick={() => {
                    setDateRange(p.start, p.end);
                    const [y, m] = p.start.split('-');
                    setActiveYear(parseInt(y, 10));
                    setActiveMonth(parseInt(m, 10) - 1);
                    setPlaybackControllerOpen(true);
                  }}
                  style={{
                    background: isActive ? 'rgba(245, 158, 11, 0.14)' : '#121214',
                    border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#f59e0b' : '#fafafa' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 9, color: '#71717a', marginTop: 1 }}>
                      {p.start === p.end ? p.start : `${p.start} ➔ ${p.end}`} · {p.desc}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: p.tagColor,
                      background: `${p.tagColor}18`,
                      padding: '2px 6px',
                      borderRadius: 999,
                      border: `1px solid ${p.tagColor}35`,
                    }}
                  >
                    {p.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
