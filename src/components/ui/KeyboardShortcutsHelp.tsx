import { motion, AnimatePresence } from "motion/react";
import { Keyboard, X } from "lucide-react";
import { formatShortcut } from "../../hooks/useKeyboardShortcuts";
import { useI18n, type TranslationKey } from "../../i18n/context";

interface ShortcutDef {
  key: string;
  descKey: TranslationKey;
}

const shortcuts: ShortcutDef[] = [
  { key: "mod+s", descKey: "shortcuts.saveChanges" },
  { key: "mod+n", descKey: "shortcuts.addNewLink" },
  { key: "escape", descKey: "shortcuts.cancelClose" },
  { key: "mod+/", descKey: "shortcuts.showHelp" },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-brand" />
                  <h2 className="font-semibold text-txt-main">{t("shortcuts.title")}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-txt-muted" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-txt-main text-sm">{t(shortcut.descKey)}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-canvas border border-border rounded-md text-txt-muted">
                      {formatShortcut(shortcut.key)}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 bg-card-hover border-t border-border">
                <p className="text-xs text-txt-dim text-center">
                  {t("shortcuts.escToClose")}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-card-hover transition-colors group cursor-pointer"
      title={t("shortcuts.buttonTitle")}
      aria-label={t("shortcuts.buttonTitle")}
    >
      <Keyboard className="w-4 h-4 text-txt-dim group-hover:text-txt-muted" />
    </button>
  );
}

export default KeyboardShortcutsHelp;
