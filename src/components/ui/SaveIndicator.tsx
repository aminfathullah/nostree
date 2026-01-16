import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

interface SaveIndicatorProps {
  isSaving: boolean;
  showSuccess?: boolean;
  className?: string;
}

/**
 * SaveIndicator - Shows saving state with animated checkmark on success
 */
function SaveIndicatorComponent({ 
  isSaving, 
  showSuccess = false,
  className = '' 
}: SaveIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isSaving && (
        <motion.div
          key="saving"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`flex items-center gap-2 text-sm text-brand ${className}`}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </motion.div>
      )}
      
      {!isSaving && showSuccess && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`flex items-center gap-2 text-sm text-success ${className}`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
          <span>Saved!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const SaveIndicator = memo(SaveIndicatorComponent);
export default SaveIndicator;
