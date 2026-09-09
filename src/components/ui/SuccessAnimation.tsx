import { motion } from "motion/react";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SuccessAnimation({ size = "md", className = "" }: SuccessAnimationProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const circleSize = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={`${circleSize[size]} rounded-full bg-success/20 flex items-center justify-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 18,
          delay: 0.08,
        }}
      >
        <Check className={`${sizeClasses[size]} text-success`} />
      </motion.div>
    </motion.div>
  );
}

export function InlineSuccess({ className = "" }: { className?: string }) {
  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <Check className="w-4 h-4 text-success" />
    </motion.span>
  );
}

export default SuccessAnimation;
