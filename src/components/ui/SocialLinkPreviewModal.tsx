import { memo, useCallback, useEffect, useRef, useState } from "react";
import { X, Download, Share2, Copy, Check, MessageSquare, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useI18n } from "../../i18n/context";

interface SocialLinkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  linksCount?: number;
  primaryColor?: string;
}

function SocialLinkPreviewModalComponent({
  isOpen,
  onClose,
  slug = "my-hub",
  displayName,
  bio,
  avatarUrl,
  linksCount = 0,
  primaryColor = "#6366f1",
}: SocialLinkPreviewModalProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "twitter">("whatsapp");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cleanSlug = (slug || "hub").replace(/^\/+/, "");
  const titleText = displayName || `/${cleanSlug}`;
  const bioText = bio || "Explore my curated links, resources, and contact info.";
  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${cleanSlug}`
    : `https://nostree.me/${cleanSlug}`;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#09090b");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#18181b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const glow1 = ctx.createRadialGradient(180, 140, 0, 180, 140, 280);
    glow1.addColorStop(0, "rgba(99, 102, 241, 0.3)");
    glow1.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(180, 140, 280, 0, Math.PI * 2);
    ctx.fill();

    const glow2 = ctx.createRadialGradient(1020, 480, 0, 1020, 480, 320);
    glow2.addColorStop(0, "rgba(168, 85, 247, 0.25)");
    glow2.addColorStop(1, "rgba(168, 85, 247, 0)");
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(1020, 480, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(63, 63, 70, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(24, 24, width - 48, height - 48, 28);
    ctx.stroke();

    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect(80, 80, 240, 42, 21);
    ctx.fill();
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(100, 101, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4f4f5";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`nostree.me/${cleanSlug}`, 116, 106);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 52px -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";
    const truncatedTitle = titleText.length > 24 ? titleText.slice(0, 22) + "…" : titleText;
    ctx.fillText(truncatedTitle, 80, 220);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "400 20px -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";
    const truncatedBio = bioText.length > 58 ? bioText.slice(0, 55) + "…" : bioText;
    ctx.fillText(truncatedBio, 80, 275);

    const renderMockup = (loadedImg?: HTMLImageElement) => {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;

      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.roundRect(760, 90, 360, 450, 36);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "#3f3f46";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(760, 90, 360, 450, 36);
      ctx.stroke();

      const avatarX = 760 + 180;
      const avatarY = 90 + 75;
      const radius = 38;

      if (loadedImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(loadedImg, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((titleText[0] || "N").toUpperCase(), avatarX, avatarY);
      }

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, radius + 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 17px -apple-system, sans-serif";
      ctx.fillText(truncatedTitle, avatarX, avatarY + 58);

      ctx.fillStyle = "#71717a";
      ctx.font = "500 12px monospace";
      ctx.fillText(`nostree.me/${cleanSlug}`, avatarX, avatarY + 78);

      const drawButton = (y: number, text: string, icon: string, isPrimary = false) => {
        ctx.fillStyle = isPrimary ? primaryColor : "#27272a";
        ctx.beginPath();
        ctx.roundRect(760 + 36, y, 288, 44, 14);
        ctx.fill();

        if (!isPrimary) {
          ctx.strokeStyle = "#3f3f46";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = isPrimary ? "bold 13px sans-serif" : "500 12px sans-serif";
        ctx.fillText(`${icon}  ${text}`, avatarX, y + 26);
      };

      drawButton(275, "Featured Links & Projects", "★", false);
      drawButton(330, "Important Documents", "📄", false);
      drawButton(385, "Contact & Discussion", "💬", false);
      drawButton(440, "⚡ Send Lightning Tip", "", true);

      ctx.save();
      ctx.translate(980, 290);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 16);
      ctx.lineTo(9, 16);
      ctx.lineTo(13, 25);
      ctx.lineTo(7, 27);
      ctx.lineTo(3, 18);
      ctx.lineTo(-4, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    if (avatarUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!isMounted) return;
        renderMockup(img);
      };
      img.onerror = () => {
        if (!isMounted) return;
        renderMockup();
      };
      img.src = avatarUrl;
    } else {
      renderMockup();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, cleanSlug, titleText, bioText, avatarUrl, linksCount, primaryColor]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success(t("socialPreview.linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [fullUrl, t]);

  const handleShareWhatsApp = useCallback(() => {
    const text = `${titleText}\n${bioText}\n\n${fullUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }, [titleText, bioText, fullUrl]);

  const handleDownloadCard = useCallback(() => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.download = `${cleanSlug}-social-card.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      toast.success(t("socialPreview.cardDownloaded"));
    } catch {
      toast.error("Failed to download image");
    } finally {
      setDownloading(false);
    }
  }, [cleanSlug, t]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none overflow-y-auto">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="social-preview-title"
          className="bg-card border border-border rounded-3xl shadow-elevated p-5 sm:p-6 max-w-xl w-full pointer-events-auto animate-pop my-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-semibold mb-1 border border-brand/20">
                <span>{t("socialPreview.previewBadge")}</span>
              </div>
              <h3 id="social-preview-title" className="text-base font-bold text-txt-main">
                {t("socialPreview.modalTitle")}
              </h3>
              <p className="text-xs text-txt-muted mt-0.5">
                {t("socialPreview.modalSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer"
              aria-label={t("common.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-canvas border border-border rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "whatsapp"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs"
                  : "text-txt-muted hover:text-txt-main"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t("socialPreview.whatsappTab")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("twitter")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "twitter"
                  ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs"
                  : "text-txt-muted hover:text-txt-main"
              }`}
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>{t("socialPreview.twitterTab")}</span>
            </button>
          </div>

          <div className="rounded-2xl p-3 sm:p-4 bg-canvas/80 border border-border mb-4">
            <AnimatePresence mode="wait">
              {activeTab === "whatsapp" ? (
                <motion.div
                  key="whatsapp-bubble"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-md mx-auto"
                >
                  <div className="bg-[#1f2c34] text-white rounded-2xl overflow-hidden shadow-md border border-white/10 text-left">
                    <div className="relative aspect-[1.91/1] w-full bg-black/40 overflow-hidden">
                      <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 bg-[#182229]">
                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {titleText}
                      </h4>
                      <p className="text-xs text-white/70 line-clamp-2 mt-0.5 leading-relaxed">
                        {bioText}
                      </p>
                      <span className="text-[11px] text-white/40 block mt-1.5 font-mono">
                        nostree.me/{cleanSlug}
                      </span>
                    </div>

                    <div className="px-3 pb-2 pt-1 flex items-center justify-between text-[11px] text-white/50 border-t border-white/5">
                      <span className="text-emerald-400 truncate max-w-[240px] underline">
                        {fullUrl}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span>11:42</span>
                        <span className="text-sky-400">✓✓</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="twitter-card"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-md mx-auto"
                >
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs text-left">
                    <div className="relative aspect-[1.91/1] w-full bg-black/30 overflow-hidden">
                      <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 bg-canvas/60">
                      <span className="text-[11px] text-txt-dim font-mono">nostree.me</span>
                      <h4 className="font-bold text-xs sm:text-sm text-txt-main mt-0.5 line-clamp-1">
                        {titleText}
                      </h4>
                      <p className="text-[11px] text-txt-muted line-clamp-2 mt-0.5">
                        {bioText}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t("socialPreview.shareWhatsapp")}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={downloading}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-brand hover:bg-brand-hover active:scale-[0.98] text-brand-fg transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? t("socialPreview.downloading") : t("socialPreview.downloadCard")}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-canvas border border-border hover:bg-card-hover text-txt-main transition-all active:scale-[0.98] cursor-pointer"
              title={t("socialPreview.copyLink")}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-txt-muted" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export const SocialLinkPreviewModal = memo(SocialLinkPreviewModalComponent);
export default SocialLinkPreviewModal;
