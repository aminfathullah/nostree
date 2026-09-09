import { motion } from "motion/react";
import logo from "../../assets/logo.png";
import { useI18n } from "../../i18n/context";

interface LoadingOverlayProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingOverlay({ 
  message, 
  showProgress = false 
}: LoadingOverlayProps) {
  const { t } = useI18n();
  const displayMessage = message ?? t("common.loading");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="mb-6"
      >
        <motion.span
          animate={{ 
            scale: [1, 1.04, 1],
            rotate: [0, 1.5, -1.5, 0]
          }}
          transition={{ 
            duration: 2.2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          <img src={logo} alt="Nostree Logo" className="w-20 h-20 object-contain" />
        </motion.span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="text-txt-muted text-sm font-medium"
      >
        {displayMessage}
      </motion.p>

      {showProgress && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-5 h-1 w-48 bg-border rounded-full overflow-hidden origin-center"
        >
          <motion.div
            className="h-full bg-brand rounded-full"
            animate={{ transform: ["translateX(-100%)", "translateX(200%)"] }}
            transition={{
              duration: 1.4,
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
