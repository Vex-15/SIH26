import { Plus, Minus, Compass, Moon, Sun } from 'lucide-react';
import { Dock, DockIcon } from './Dock';
import { useAppStore } from '../store/useAppStore';
import { useRef, useCallback } from 'react';

// India center [lng, lat] and zoom
const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 4.6;

export function RightDock() {
  const { map, theme, toggleTheme } = useAppStore();
  const themeToggleRef = useRef<HTMLButtonElement>(null);

  const handleZoomIn = () => {
    if (map) map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut({ duration: 300 });
  };

  const handleRecenter = () => {
    if (!map) return;
    const currentBearing = map.getBearing();
    const currentPitch = map.getPitch();

    // Reset orientation first, if already flat then fly home
    if (currentBearing !== 0 || currentPitch !== 0) {
      map.easeTo({ bearing: 0, pitch: 0, duration: 800 });
    } else {
      map.flyTo({
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        essential: true,
        duration: 1200,
      });
    }
  };

  const handleThemeToggle = useCallback(() => {
    if (!map) return;
    
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    if (!(document as any).startViewTransition) {
      document.documentElement.dataset.theme = nextTheme;
      toggleTheme();
      return;
    }

    const btn = themeToggleRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.dataset.theme = nextTheme;

    try {
      const transition = (document as any).startViewTransition(() => {
        toggleTheme();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 350,
            easing: 'ease-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      }).catch(() => {});
    } catch {
      toggleTheme();
    }
  }, [map, theme, toggleTheme]);

  const isDark = theme === 'dark';

  return (
    <Dock side="right">
      <DockIcon onClick={handleZoomIn} ariaLabel="Zoom In">
        <Plus size={18} strokeWidth={1.5} />
      </DockIcon>
      
      <DockIcon onClick={handleZoomOut} ariaLabel="Zoom Out">
        <Minus size={18} strokeWidth={1.5} />
      </DockIcon>

      <DockIcon onClick={handleRecenter} ariaLabel="Recenter Map Orientation">
        <Compass size={18} strokeWidth={1.5} />
      </DockIcon>

      {/* Theme Toggle integrated directly into the spring dock icon list */}
      <DockIcon
        onClick={handleThemeToggle}
        ariaLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className="theme-toggle-dock-btn"
      >
        {/* Pass ref to get the correct click coordinate coordinates for clip-path animation */}
        <span ref={themeToggleRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isDark ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </span>
      </DockIcon>
    </Dock>
  );
}
