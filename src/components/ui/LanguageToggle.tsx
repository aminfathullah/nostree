import { motion, AnimatePresence } from "motion/react";
import { Globe } from "lucide-react";
import { useI18n } from "../../i18n/context";

interface LanguageToggleProps {
  className?: string;
  variant?: "button" | "pill";
}

export function LanguageToggle({ className = "", variant = "button" }: LanguageToggleProps) {
  const { locale, toggleLocale } = useI18n();

  const titleText = locale === "en" ? "Switch to Bahasa Indonesia" : "Ganti ke English";
  const ariaLabel = locale === "en" ? "Current language: English. Click to switch to Bahasa Indonesia." : "Bahasa saat ini: Bahasa Indonesia. Klik untuk ganti ke Bahasa Inggris.";

  if (variant === "pill") {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={toggleLocale}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-card border border-border hover:border-brand/40 text-txt-muted hover:text-txt-main transition-colors cursor-pointer shadow-xs ${className}`}
        title={titleText}
        aria-label={ariaLabel}
      >
        <Globe className="w-3.5 h-3.5 text-brand" />
        <span className="uppercase tracking-wider text-[11px] font-bold">
          {locale}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLocale}
      className={`p-2 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-border-hover transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-txt-main ${className}`}
      title={titleText}
      aria-label={ariaLabel}
    >
      <Globe className="w-4 h-4 text-brand" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={locale}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="text-xs font-bold uppercase tracking-wider text-txt-main min-w-[18px] text-center"
        >
          {locale}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default LanguageToggle;
