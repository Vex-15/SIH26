import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

interface DockProps {
  children: React.ReactNode;
  side: 'left' | 'right';
}

const DOCK_WIDTH = 48;
const GAP = 12;

export function Dock({ children, side }: DockProps) {
  const mouseRef = useMotionValue(Infinity);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // For vertical dock, track mouse Y relative to the container
      mouseRef.set(e.clientY - rect.top);
    }
  };

  const handleMouseLeave = () => {
    mouseRef.set(Infinity);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        [side === 'left' ? 'left' : 'right']: 16,
        zIndex: 100,
      }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: GAP,
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--r-full)',
          padding: '12px 6px',
          width: DOCK_WIDTH,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              mouseRef,
              containerRef,
            });
          }
          return child;
        })}
      </motion.div>
    </div>
  );
}

interface DockIconProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
  // Injected by Dock parent component
  mouseRef?: any;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export function DockIcon({
  children,
  onClick,
  active = false,
  className = '',
  ariaLabel,
  mouseRef,
  containerRef,
}: DockIconProps) {
  const iconRef = useRef<HTMLButtonElement>(null);

  // Compute distance from mouse to center of this specific icon element
  const distance = useTransform(mouseRef, (val: number) => {
    const bounds = iconRef.current?.getBoundingClientRect();
    const parentBounds = containerRef?.current?.getBoundingClientRect();

    if (!bounds || !parentBounds || val === Infinity) {
      return Infinity;
    }

    // Get vertical center of the icon relative to the parent container top
    const iconCenter = bounds.top + bounds.height / 2 - parentBounds.top;
    return val - iconCenter;
  });

  // Calculate target scale (magnification) based on distance (range: -120 to +120 pixels)
  const scaleTransform = useTransform(distance, [-120, 0, 120], [1.0, 1.4, 1.0]);

  // Apply smooth spring physics to the scale transitions
  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.button
      ref={iconRef}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        scale,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        transition: 'background 200ms, color 200ms',
        outline: 'none',
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </motion.button>
  );
}
