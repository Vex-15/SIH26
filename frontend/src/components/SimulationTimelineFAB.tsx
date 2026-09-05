import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * Bottom-Left Yellow FAB for Diurnal Player in Emergency Simulation Mode
 * Placed at the exact location highlighted by the user (next to left dock).
 * ONLY renders when isSimulating === true.
 * Converts to a Cross (X) icon when the player is open.
 * When pressed to start the player, closes the side drawer automatically.
 */
export function SimulationTimelineFAB() {
  const {
    isSimulating,
    isPlaybackControllerOpen,
    setPlaybackControllerOpen,
    setSelectedCluster,
  } = useAppStore();

  if (!isSimulating) return null;

  const handleClick = () => {
    if (!isPlaybackControllerOpen) {
      // 1. When player starts, drawer closes
      setSelectedCluster(null);
      setPlaybackControllerOpen(true);
    } else {
      // 2. When cross is clicked, player closes
      setPlaybackControllerOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.button
        key="sim-timeline-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        onClick={handleClick}
        title={isPlaybackControllerOpen ? 'Close Timeline Player' : 'Start Simulation Timeline Player'}
        aria-label={isPlaybackControllerOpen ? 'Close Timeline Player' : 'Start Simulation Timeline Player'}
        style={{
          position: 'fixed',
          bottom: 28,
          left: 88,
          zIndex: 80,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#f59e0b',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45), 0 4px 12px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {isPlaybackControllerOpen ? (
          <X size={24} color="#0d0d0d" strokeWidth={2.8} />
        ) : (
          <Play size={22} color="#0d0d0d" strokeWidth={2.4} fill="#0d0d0d" style={{ marginLeft: 2 }} />
        )}
      </motion.button>
    </AnimatePresence>
  );
}
