import { useAppStore } from '../store/useAppStore';
import type { MapMode } from '../store/useAppStore';

const MODES: { id: MapMode; label: string }[] = [
  { id: 'thermal', label: 'Thermal' },
  { id: 'optical', label: 'Optical' },
  { id: 'radar',   label: 'Radar'   },
];

export function ModePill() {
  const { mapMode, setMapMode } = useAppStore();

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 88,    // clear the right dock (56px) + 32px margin
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        background: '#201f1f',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 999,
        padding: 4,
        gap: 2,
      }}
    >
      {MODES.map(({ id, label }) => {
        const isActive = mapMode === id;
        return (
          <button
            key={id}
            onClick={() => setMapMode(id)}
            style={{
              padding: '4px 14px',
              borderRadius: 999,
              border: 'none',
              cursor: id === 'thermal' ? 'default' : 'pointer',
              background: isActive ? '#2a2a2a' : 'transparent',
              color: isActive ? '#e5e2e1' : '#71717a',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11,
              fontWeight: isActive ? 500 : 400,
              transition: 'color 0.15s, background 0.15s',
              outline: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
