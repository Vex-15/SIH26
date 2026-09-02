import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const PRESETS = [
  {
    start: '2024-06-23',
    end: '2024-06-23',
    title: 'Panipat Chemical Surge',
    desc: 'Accidental spike +4.12σ',
    tag: 'CRITICAL',
    tagColor: '#ef4444',
  },
  {
    start: '2024-11-01',
    end: '2024-11-07',
    title: 'Peak Stubble Burning',
    desc: 'Punjab & Haryana intensive wave',
    tag: 'AGRI',
    tagColor: '#f59e0b',
  },
  {
    start: '2024-05-01',
    end: '2024-05-05',
    title: 'Uttarakhand Wildfires',
    desc: 'Himalayan canopy outbreak',
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
        initial={{ opacity: 0, x: -10, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -10, scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 70,
          left: 72,
          zIndex: 95,
          width: 320,
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          padding: '14px 16px',
          boxShadow: 'var(--neu-shadow-out)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--neu-text-strong)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={14} color="var(--accent)" />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--neu-text-disabled)' }}>
              Temporal Index
            </span>
          </div>
          <button
            onClick={() => setCalendarOpen(false)}
            className="neu-icon-btn"
            style={{ width: 22, height: 22 }}
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>

        {/* Mode Selector */}
        <div
          style={{
            display: 'flex',
            background: 'var(--neu-base-raised)',
            borderRadius: 'var(--r-sm)',
            padding: 2,
            marginBottom: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => { setRangeMode('single'); setSelectingEnd(false); }}
            style={{
              flex: 1,
              background: rangeMode === 'single' ? 'var(--neu-base)' : 'transparent',
              color: rangeMode === 'single' ? 'var(--neu-text-strong)' : 'var(--neu-text)',
              border: rangeMode === 'single' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              padding: '4px 0',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Single Day
          </button>
          <button
            onClick={() => { setRangeMode('range'); setSelectingEnd(false); }}
            style={{
              flex: 1,
              background: rangeMode === 'range' ? 'var(--neu-base)' : 'transparent',
              color: rangeMode === 'range' ? 'var(--neu-text-strong)' : 'var(--neu-text)',
              border: rangeMode === 'range' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              padding: '4px 0',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Date Range
          </button>
        </div>

        {/* Selected Range Display Status */}
        <div
          style={{
            background: 'var(--neu-base-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-sm)',
            padding: '5px 8px',
            marginBottom: 10,
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{startDate === endDate ? startDate : `${startDate} → ${endDate}`}</span>
          {rangeMode === 'range' && selectingEnd && (
            <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>
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
            background: 'var(--neu-base-raised)',
            padding: '4px 8px',
            borderRadius: 'var(--r-sm)',
            marginBottom: 8,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handlePrevMonth}
            className="neu-icon-btn"
            style={{ width: 20, height: 20, border: 'none' }}
          >
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {monthNames[activeMonth]} {activeYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="neu-icon-btn"
            style={{ width: 20, height: 20, border: 'none' }}
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontSize: 9,
            color: 'var(--neu-text-disabled)',
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            marginBottom: 12,
          }}
        >
          {Array.from({ length: startDay }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ height: 24 }} />
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
            let textColor = isHighDensity ? '#f87171' : 'var(--neu-text-em)';
            let border = '1px solid transparent';

            if (isInRange) {
              bgColor = isStart || isEnd ? 'var(--accent)' : 'var(--accent-subtle)';
              textColor = isStart || isEnd ? '#ffffff' : 'var(--accent)';
              border = isStart || isEnd ? '1px solid var(--accent)' : '1px solid var(--border-subtle)';
            } else if (isHighDensity) {
              bgColor = 'rgba(239, 68, 68, 0.08)';
            } else if (hasData) {
              bgColor = 'var(--neu-base-raised)';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dateStr)}
                title={hasData ? `${dayData.total} detections on ${dateStr}` : dateStr}
                style={{
                  height: 24,
                  borderRadius: 4,
                  border,
                  background: bgColor,
                  color: textColor,
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isInRange || isHighDensity ? 600 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s ease',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick Defense Historical Presets */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Presets
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                    background: isActive ? 'var(--accent-subtle)' : 'var(--neu-base-raised)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                    borderRadius: 'var(--r-sm)',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--neu-text-strong)' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--neu-text-disabled)', marginTop: 1 }}>
                      {p.start} · {p.desc}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: p.tagColor,
                      background: `${p.tagColor}15`,
                      padding: '1px 5px',
                      borderRadius: 'var(--r-full)',
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
