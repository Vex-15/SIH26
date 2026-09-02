import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

interface DockProps {
  children: React.ReactNode;
  side: 'left' | 'right';
}

const DOCK_WIDTH = 48;
const GAP = 8;

export function Dock({ children, side }: DockProps) {
  const mouseRef = useMotionValue(Infinity);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
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
          background: 'var(--neu-base)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--r-full)',
          padding: '10px 6px',
          width: DOCK_WIDTH,
          boxShadow: 'var(--neu-shadow-out)',
          border: '1px solid var(--border-subtle)',
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
  accentColor?: string;
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
  accentColor,
  mouseRef,
  containerRef,
}: DockIconProps) {
  const iconRef = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseRef, (val: number) => {
    const bounds = iconRef.current?.getBoundingClientRect();
    const parentBounds = containerRef?.current?.getBoundingClientRect();
    if (!bounds || !parentBounds || val === Infinity) return Infinity;
    const iconCenter = bounds.top + bounds.height / 2 - parentBounds.top;
    return val - iconCenter;
  });

  const scaleTransform = useTransform(distance, [-100, 0, 100], [1.0, 1.25, 1.0]);
  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  const resolvedAccent = accentColor ?? 'var(--accent)';

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
        border: active ? `1px solid ${resolvedAccent}` : '1px solid transparent',
        background: active ? 'var(--accent-subtle)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? resolvedAccent : 'var(--neu-text)',
        transition: 'all 0.15s ease',
        outline: 'none',
        flexShrink: 0,
        position: 'relative',
      }}
      className={className}
      whileHover={{
        backgroundColor: active ? 'var(--accent-subtle)' : 'var(--neu-base-hover)',
        color: active ? resolvedAccent : 'var(--neu-text-strong)',
      }}
    >
      <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>

      {active && (
        <span style={{
          position: 'absolute',
          right: -2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: 3,
          borderRadius: '50%',
          backgroundColor: resolvedAccent,
        }} />
      )}
    </motion.button>
  );
}
