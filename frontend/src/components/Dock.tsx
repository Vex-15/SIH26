import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

interface DockProps {
  children: React.ReactNode;
  side: 'left' | 'right';
}

const DOCK_WIDTH = 52;
const GAP = 10;

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
          borderRadius: 'var(--r-full)',
          padding: '14px 8px',
          width: DOCK_WIDTH,
          /* Neumorphic dual shadow — elevated pill */
          boxShadow: 'var(--neu-shadow-out-sm)',
          border: 'none',
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

  const scaleTransform = useTransform(distance, [-120, 0, 120], [1.0, 1.35, 1.0]);
  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const resolvedAccent = accentColor ?? 'var(--accent)';

  return (
    <motion.button
      ref={iconRef}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        scale,
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        /* Active = inset (pressed); default = elevated */
        background: 'var(--neu-base)',
        boxShadow: active
          ? `var(--neu-shadow-in-sm), 0 0 10px ${resolvedAccent}44`
          : 'var(--neu-shadow-out-sm)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? resolvedAccent : 'var(--neu-text)',
        transition: 'box-shadow 0.2s ease, color 0.2s ease',
        outline: 'none',
        flexShrink: 0,
      }}
      className={className}
      whileHover={{
        color: active ? resolvedAccent : 'var(--neu-text-em)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = 'var(--neu-shadow-out)';
          e.currentTarget.style.color = 'var(--neu-text-em)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = 'var(--neu-shadow-out-sm)';
          e.currentTarget.style.color = 'var(--neu-text)';
        }
      }}
    >
      <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </motion.button>
  );
}
