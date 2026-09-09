import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Sparkles, Link2, Palette, Share2 } from "lucide-react";
import { Button } from "../ui/Button";
import logo from "../../assets/logo.png";

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

export function EmptyState({ onCreateTree }: EmptyStateProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative mb-6"
      >
        <img src={logo} alt="Nostree Logo" className="w-24 h-24 object-contain animate-float" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 16 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-brand" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="text-2xl font-bold text-txt-main mb-2 tracking-tight"
      >
        Create Your First Tree
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="text-txt-muted mb-8 text-center max-w-md text-sm leading-relaxed"
      >
        Get started in seconds. Your links, your style, powered by Nostr.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl w-full"
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.06, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onMouseEnter={() => setHoveredStep(index)}
            onMouseLeave={() => setHoveredStep(null)}
            className={`
              flex items-start gap-4 p-4 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 ease-out
              ${hoveredStep === index 
                ? "bg-brand/5 border-brand/30 shadow-md" 
                : "bg-card border-border hover:border-border-hover"
              }
            `}
          >
            <div 
              className={`
                p-2 rounded-lg transition-colors duration-150 ease-out shrink-0
                ${hoveredStep === index ? "bg-brand text-brand-fg" : "bg-brand/10 text-brand"}
              `}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-brand mb-1 block">
                Step {index + 1}
              </span>
              <h3 className="font-semibold text-txt-main text-sm">{step.title}</h3>
              <p className="text-xs text-txt-muted mt-1 leading-normal">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 250, damping: 18 }}
      >
        <Button
          size="lg"
          onClick={onCreateTree}
          className="shadow-md cursor-pointer active:scale-[0.97]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Tree
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-txt-dim mt-6"
      >
        Or use the tree selector above to switch or create trees
      </motion.p>
    </div>
  );
}

export default EmptyState;
