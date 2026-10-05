import { useState } from "react";
import { motion } from "motion/react";
import { Plus, ArrowRight, Link2, AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/context";
import { getSiteHost } from "../../config/site";
import { checkSlugAvailability } from "../../lib/slug-resolver";
import { toast } from "sonner";

interface EmptyStateProps {
  onCreateTree?: () => void;
  onCreateTreeDirect?: (slug: string, title: string) => Promise<boolean>;
  defaultSlug?: string;
}

export function EmptyState({ onCreateTree, onCreateTreeDirect, defaultSlug = "" }: EmptyStateProps) {
  const { t } = useI18n();
  const [slug, setSlug] = useState(defaultSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""));
  const [title, setTitle] = useState(defaultSlug ? defaultSlug.charAt(0).toUpperCase() + defaultSlug.slice(1) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const validateSlug = (val: string): string | null => {
    if (!val) return "Handle is required";
    if (val.length < 2) return "Handle must be at least 2 characters";
    if (val.length > 32) return "Handle must be 32 characters or less";
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(val)) {
      return t("editor.treeSelector.invalidSlug");
    }
    const reserved = ["admin", "login", "profile", "api", "u", "settings", "help", "about", "default"];
    if (reserved.includes(val)) {
      return t("editor.treeSelector.slugTaken");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    const error = validateSlug(cleanSlug);
    if (error) {
      setSlugError(error);
      return;
    }
    setSlugError(null);
    setIsSubmitting(true);

    try {
      const availability = await checkSlugAvailability(cleanSlug);
      if (!availability.available) {
        const msg = t("editor.treeSelector.slugTaken");
        setSlugError(msg);
        toast.error(msg);
        setIsSubmitting(false);
        return;
      }

      if (onCreateTreeDirect) {
        const success = await onCreateTreeDirect(cleanSlug, title.trim() || cleanSlug);
        if (!success) {
          setIsSubmitting(false);
        }
      } else {
        onCreateTree?.();
      }
    } catch (err) {
      console.error("Failed to create tree:", err);
      toast.error(t("common.error"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs text-left"
      >
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-txt-main tracking-tight">
              {t("emptyState.title")}
            </h2>
            <p className="text-xs text-txt-muted mt-0.5 leading-relaxed">
              {t("emptyState.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-txt-main mb-1.5">
              {t("editor.treeSelector.titleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("editor.treeSelector.titlePlaceholder")}
              className="w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs sm:text-sm text-txt-main placeholder:text-txt-dim focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-txt-main mb-1.5">
              {t("editor.treeSelector.slugLabel")}
            </label>
            <div className={`flex items-center bg-canvas border rounded-xl overflow-hidden focus-within:border-brand transition-colors ${slugError ? 'border-red-500' : 'border-border'}`}>
              <span className="text-xs font-semibold text-txt-muted select-none pl-3 pr-1 shrink-0">
                {getSiteHost()}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  if (slugError) setSlugError(null);
                }}
                placeholder={t("editor.treeSelector.slugPlaceholder")}
                required
                className="w-full py-2 pr-3 bg-transparent text-xs sm:text-sm font-medium text-txt-main placeholder:text-txt-dim focus:outline-none"
              />
            </div>
            {slugError ? (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{slugError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-txt-dim mt-1.5 leading-normal">
                {slug ? (
                  <span>
                    Your page will live at: <strong className="text-txt-main">{getSiteHost()}/{slug}</strong>
                  </span>
                ) : (
                  <span>{t("home.claimExample")}</span>
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !slug.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-brand-fg font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("common.creating")}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t("emptyState.button")}</span>
              </>
            )}
          </button>
        </form>

        {onCreateTree && (
          <div className="mt-4 pt-4 border-t border-border/60 text-center">
            <button
              type="button"
              onClick={onCreateTree}
              className="text-[11px] text-txt-dim hover:text-txt-main transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>{t("emptyState.hint")}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EmptyState;
