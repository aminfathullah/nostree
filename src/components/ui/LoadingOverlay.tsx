import { motion } from "motion/react";

interface LoadingOverlayProps {
  message?: string;
  showProgress?: boolean;
}

/**
 * Full-page loading overlay with animated tree logo
 * Used for initial auth check and major transitions
 */
export function LoadingOverlay({ 
  message = "Loading...", 
  showProgress = false 
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas"
    >
      {/* Animated Tree Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-7xl mb-6"
      >
        <motion.span
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          🌲
        </motion.span>
      </motion.div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-txt-muted font-medium"
      >
        {message}
      </motion.p>

      {/* Progress Bar (optional) */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "12rem" }}
          transition={{ delay: 0.3 }}
          className="mt-6 h-1 bg-border rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-brand rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width: "50%" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default LoadingOverlay;
