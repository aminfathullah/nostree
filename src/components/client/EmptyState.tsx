import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Sparkles, Link2, Palette, Share2 } from "lucide-react";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  onCreateTree: () => void;
}

const steps = [
  { 
    icon: Link2, 
    title: "Create your tree", 
    desc: "Pick a unique slug for your public URL" 
  },
  { 
    icon: Plus, 
    title: "Add your links", 
    desc: "Add links to your social profiles, websites, and more" 
  },
  { 
    icon: Palette, 
    title: "Customize the look", 
    desc: "Choose from 16+ themes or create your own" 
  },
  { 
    icon: Share2, 
    title: "Share anywhere", 
    desc: "Your tree is live and ready to share" 
  },
];

/**
 * Enhanced empty state with interactive onboarding
 */
export function EmptyState({ onCreateTree }: EmptyStateProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated Tree Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <div className="text-8xl animate-float">🌲</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-brand" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-txt-main mb-2"
      >
        Create Your First Tree
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-txt-muted mb-8 text-center max-w-md"
      >
        Get started in seconds. Your links, your style, powered by Nostr.
      </motion.p>

      {/* Steps Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl w-full"
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onMouseEnter={() => setHoveredStep(index)}
            onMouseLeave={() => setHoveredStep(null)}
            className={`
              flex items-start gap-4 p-4 rounded-xl border transition-all duration-300
              ${hoveredStep === index 
                ? "bg-brand/5 border-brand/30 shadow-lg" 
                : "bg-card border-border hover:border-border-hover"
              }
            `}
          >
            <div 
              className={`
                p-2 rounded-lg transition-colors
                ${hoveredStep === index ? "bg-brand text-brand-fg" : "bg-brand/10 text-brand"}
              `}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-brand mb-1 block">
                Step {index + 1}
              </span>
              <h3 className="font-semibold text-txt-main text-sm">{step.title}</h3>
              <p className="text-xs text-txt-muted mt-1">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <Button
          size="lg"
          onClick={onCreateTree}
          className="animate-pulse-glow"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Tree
        </Button>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-txt-dim mt-6"
      >
        Or click "No Tree Selected" above to get started
      </motion.p>
    </div>
  );
}

export default EmptyState;
