import { useRef, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// ─── View Transition Theme Toggle ────────────────────────────────────────────
// Uses the native View Transition API (document.startViewTransition) to create
// a circular clip-path reveal from the button centre — identical to the
// Portfolio ThemeToggle referenced in the design spec.
// Falls back gracefully in browsers without View Transition support.

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = useCallback(() => {
    if (!(document as any).startViewTransition) {
      // Fallback: instant swap
      document.documentElement.classList.toggle('light-theme', theme === 'dark');
      toggleTheme();
      return;
    }

    const btn = buttonRef.current;
    if (!btn) return;

    // Get the click origin (button center) for the radial reveal
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Compute max radius so the circle covers the full viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Toggle DOM class BEFORE the transition so the new snapshot is the new theme
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;

    const transition = (document as any).startViewTransition(() => {
      toggleTheme();
    });

    transition.ready.then(() => {
      // Animate the new page growing outward from the click origin
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }, [theme, toggleTheme]);

  const isDark = theme === 'dark';

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        transition: 'color 200ms',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
    >
      {isDark ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
    </button>
  );
}
