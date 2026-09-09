import { memo, useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  slug?: string;
  avatarUrl?: string;
  displayName?: string;
  primaryColor?: string;
  bgColor?: string;
}

function QRCodeModalComponent({
  isOpen,
  onClose,
  url,
  slug,
  avatarUrl,
  displayName,
  primaryColor = "#6366f1",
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedImage, setCopiedImage] = useState(false);

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

    const canvasWidth = 360;
    const canvasHeight = 420;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const tempCanvas = document.createElement("canvas");
    QRCode.toCanvas(tempCanvas, url, {
      width: 280,
      margin: 1,
      color: {
        dark: "#09090b",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then(() => {
        if (!isMounted) return;
        const qrX = (canvasWidth - 280) / 2;
        const qrY = 24;
        ctx.drawImage(tempCanvas, qrX, qrY);

        const centerX = qrX + 140;
        const centerY = qrY + 140;
        const radius = 26;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = primaryColor;
        ctx.stroke();
        ctx.restore();

        const drawLabel = () => {
          ctx.save();
          ctx.textAlign = "center";
          ctx.fillStyle = "#09090b";
          ctx.font = "bold 15px Inter, system-ui, sans-serif";
          ctx.fillText(displayName || (slug ? `/${slug}` : "Nostree"), canvasWidth / 2, 345);

          ctx.fillStyle = "#71717a";
          ctx.font = "12px monospace";
          const displayUrl = url.replace(/^https?:\/\//, "");
          const truncatedUrl = displayUrl.length > 34 ? displayUrl.slice(0, 31) + "..." : displayUrl;
          ctx.fillText(truncatedUrl, canvasWidth / 2, 375);
          ctx.restore();
        };

        if (avatarUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            if (!isMounted) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
            ctx.restore();
            drawLabel();
          };
          img.onerror = () => {
            if (!isMounted) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText((displayName || "N")[0].toUpperCase(), centerX, centerY);
            ctx.restore();
            drawLabel();
          };
          img.src = avatarUrl;
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((displayName || "N")[0].toUpperCase(), centerX, centerY);
          ctx.restore();
          drawLabel();
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, url, slug, avatarUrl, displayName, primaryColor]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${(slug || "nostree").toLowerCase().replace(/[^a-z0-9-_]/g, "-")}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR Code downloaded");
  }, [slug]);

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopiedImage(true);
        toast.success("QR Code copied to clipboard");
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch {
      toast.error("Failed to copy image, please download directly");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="bg-card border border-border rounded-2xl shadow-elevated p-5 max-w-xs w-full pointer-events-auto animate-pop"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 id="qr-modal-title" className="text-sm font-semibold text-txt-main">Share QR Code</h3>
              <p className="text-[11px] text-txt-muted">Ready to print or display on your bio</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center p-2 rounded-xl mb-3 bg-white border border-border shadow-xs overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-auto rounded-lg max-w-[260px]" />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:opacity-95 active:scale-[0.98] shadow-xs text-white cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-canvas border border-border hover:bg-card-hover text-txt-main transition-colors active:scale-[0.98] cursor-pointer"
              title="Copy QR Image"
            >
              {copiedImage ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-txt-muted" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export const QRCodeModal = memo(QRCodeModalComponent);
export default QRCodeModal;
