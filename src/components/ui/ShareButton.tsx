import { useState, useCallback, memo } from "react";
import { Share2, Check, Link2, QrCode, MessageCircle, Send, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title?: string;
  onQRClick?: () => void;
  primaryColor?: string;
  bgColor?: string;
}

function ShareButtonComponent({
  url,
  title = "Nostree Hub",
  onQRClick,
  primaryColor = "#6366f1",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleSystemShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: `Check out ${title}`,
          url,
        });
        setShowMenu(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
  }, [title, url]);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out ${title}: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`Check out ${title}: ${url}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setShowMenu(false)}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-14 right-0 glass-card bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-elevated overflow-hidden z-50 animate-pop min-w-[210px] p-1.5 space-y-0.5"
          >
            <div className="px-3 py-1.5 border-b border-border/60 mb-1">
              <p className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider">Share</p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleCopy();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-txt-muted" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {onQRClick && (
              <button
                type="button"
                onClick={() => {
                  onQRClick();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-txt-muted" />
                <span>View QR Code</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleTelegramShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-500" />
              <span>Share to Telegram</span>
            </button>

            {hasNativeShare && (
              <div className="pt-1 mt-1 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleSystemShare}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-dim hover:text-txt-main active:scale-[0.98] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-txt-dim" />
                  <span>More options...</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setShowMenu((prev) => !prev)}
        className="w-11 h-11 rounded-full shadow-elevated flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
        style={{
          backgroundColor: primaryColor,
          color: "#ffffff",
          boxShadow: `0 8px 24px -4px ${primaryColor}60`,
        }}
        aria-label={showMenu ? "Close share menu" : "Share this page"}
        title={showMenu ? "Close menu" : "Share page"}
      >
        {showMenu ? (
          <X className="w-4 h-4 animate-pop" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export const ShareButton = memo(ShareButtonComponent);
export default ShareButton;
