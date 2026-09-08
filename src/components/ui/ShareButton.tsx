import { useState, useCallback, memo } from "react";
import { Share2, Check, Link2, QrCode, MessageCircle, Send } from "lucide-react";
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
      toast.success("Tautan berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Tautan berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleNativeShareOrToggle = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: `Kunjungi tautan ${title}`,
          url,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    setShowMenu((prev) => !prev);
  }, [title, url]);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Kunjungi tautan ${title}: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`Kunjungi tautan ${title}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-14 right-0 glass-card bg-card/95 border border-border rounded-2xl shadow-elevated overflow-hidden z-50 animate-pop min-w-[200px] p-1.5 space-y-0.5"
          >
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
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-txt-muted" />
                  <span>Salin Tautan</span>
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
                <span>Lihat QR Code</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Bagikan ke WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleTelegramShare}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-500" />
              <span>Bagikan ke Telegram</span>
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={handleNativeShareOrToggle}
        className="w-11 h-11 rounded-full shadow-elevated flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
        style={{
          backgroundColor: primaryColor,
          color: "#ffffff",
          boxShadow: `0 8px 24px -4px ${primaryColor}60`,
        }}
        aria-label="Bagikan halaman ini"
        title="Bagikan halaman"
      >
        {copied ? (
          <Check className="w-4 h-4 animate-pop" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export const ShareButton = memo(ShareButtonComponent);
export default ShareButton;
