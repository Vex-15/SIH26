import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function LoadingScreen() {
  const isMapReady = useAppStore((s) => s.isMapReady);
  const [progress, setProgress] = useState(5);
  const [show, setShow] = useState(true);

  // Smooth realistic progression while WebGL & vector tiles initialize in background
  useEffect(() => {
    const startTime = Date.now();
    // Typical initial tile download + WebGL pipeline takes ~1.5 - 2.0s
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress((prev) => {
        if (prev >= 92) return prev; // Hold at 92% until MapLibre idle event fires
        // Asymptotic progression: fast start, gradual deceleration approaching 90%
        const target = Math.min(92, Math.floor(10 + 82 * (1 - Math.exp(-elapsed / 800))));
        return Math.max(prev, target);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // When MapLibre signals that all tiles and layers are 100% compiled & rendered in WebGL
  useEffect(() => {
    if (isMapReady) {
      setProgress(100);
      // Give 250ms for the 100% bar to animate smoothly, then dissolve the black cover
      const dismissTimer = setTimeout(() => {
        setShow(false);
      }, 350);
      return () => clearTimeout(dismissTimer);
    }
  }, [isMapReady]);

  // Safety fallback: Never keep user locked out longer than 10 seconds
  useEffect(() => {
    const fallback = setTimeout(() => {
      setShow(false);
    }, 10000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="minimal-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            pointerEvents: 'all',
          }}
        >
          {/* Minimalist white progress bar on pure black background */}
          <div
            style={{
              width: '280px',
              maxWidth: '80vw',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '9999px',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </div>

          {/* Slower machine notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 450,
                letterSpacing: '0.3px',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Please allow 5–10 seconds for full website to initialize
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '0.2px',
                color: 'rgba(255, 255, 255, 0.38)',
              }}
            >
              (refreshing would help with load speeds)
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
