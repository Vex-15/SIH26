import { motion } from 'framer-motion';
import { X, RotateCcw, Flame, Thermometer, Mountain, CloudFog } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { FireClass } from '../store/useAppStore';

const CLASSES: { id: FireClass; label: string; count: string; color: string }[] = [
  { id: 'wildfire', label: 'Wildfire', count: '170,987', color: 'var(--wildfire)' },
  { id: 'agricultural', label: 'Agricultural', count: '1,072,341', color: 'var(--agricultural)' },
  { id: 'industrial', label: 'Industrial', count: '125,965', color: 'var(--industrial)' },
  { id: 'gasflare', label: 'Gas Flare', count: '5,076', color: 'var(--gasflare)' },
  { id: 'accidental', label: 'Accidental', count: '1,666', color: 'var(--accidental)' },
];

export function LayersPopover() {
  const { 
    activeFilters, 
    toggleFilter, 
    filterSettings, 
    setFilterSettings, 
    resetFilterSettings,
    isLayersOpen, 
    setLayersOpen 
  } = useAppStore();

  if (!isLayersOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: 76,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 90,
        width: 300,
        maxHeight: 'min(500px, calc(100vh - 120px))',
        background: '#18181b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.6)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#1c1b1b',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#f59e0b',
            flexGrow: 1,
          }}
        >
          Telemetry & Class Filters
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={resetFilterSettings}
            title="Reset Filters"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#71717a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e2e1')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
          >
            <RotateCcw size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => setLayersOpen(false)}
            aria-label="Close Filter Panel"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#71717a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e2e1')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '8px 10px', 
          gap: 8, 
          maxHeight: 'min(420px, calc(100vh - 180px))', 
          overflowY: 'auto' 
        }}
      >
        {/* Section 1: Fire Classes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Classification Channels
          </span>
          {CLASSES.map((cls) => {
            const active = activeFilters[cls.id];
            return (
              <div
                key={cls.id}
                onClick={() => toggleFilter(cls.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 6px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cls.color }} />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 500, color: '#e5e2e1' }}>
                    {cls.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#71717a' }}>
                    {cls.count}
                  </span>
                  <div
                    style={{
                      width: 24,
                      height: 13,
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: active ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(245, 158, 11, 0.2)' : '#27272a',
                      position: 'relative',
                    }}
                  >
                    <motion.div
                      animate={{ x: active ? 11 : 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: active ? '#f59e0b' : '#fafafa',
                        position: 'absolute',
                        top: 1,
                        left: 1,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {/* Section 2: Numerical Filtering Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Telemetry Filter Sliders
          </span>

          {/* Min Brightness */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Thermometer size={11} color="#f59e0b" /> Min Brightness
              </span>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#f59e0b' }}>
                {filterSettings.minBrightness} K
              </span>
            </div>
            <input
              type="range"
              min={300}
              max={360}
              step={2}
              value={filterSettings.minBrightness}
              onChange={(e) => setFilterSettings({ minBrightness: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer', height: 3 }}
            />
          </div>

          {/* Min FRP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Flame size={11} color="#ef4444" /> Min FRP Power
              </span>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#ef4444' }}>
                {filterSettings.minFrp} MW
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={filterSettings.minFrp}
              onChange={(e) => setFilterSettings({ minFrp: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer', height: 3 }}
            />
          </div>

          {/* Min NO2 Plume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CloudFog size={11} color="#06b6d4" /> Min NO₂ Plume
              </span>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#06b6d4' }}>
                {filterSettings.minNo2.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.02}
              value={filterSettings.minNo2}
              onChange={(e) => setFilterSettings({ minNo2: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer', height: 3 }}
            />
          </div>

          {/* Max Elevation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Mountain size={11} color="#8b5cf6" /> Max Elevation
              </span>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#8b5cf6' }}>
                {filterSettings.maxElevation} m
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={4000}
              step={100}
              value={filterSettings.maxElevation}
              onChange={(e) => setFilterSettings({ maxElevation: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer', height: 3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
