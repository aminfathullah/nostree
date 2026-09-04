import { memo, useCallback, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  primaryColor?: string;
  bgColor?: string;
}

function QRCodeModalComponent({ 
  isOpen, 
  onClose, 
  url,
  primaryColor = '#6366f1',
  bgColor = '#09090b'
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      }).catch(console.error);
    }
  }, [isOpen, url, primaryColor]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'nostree-qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
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
          className="bg-card border border-border rounded-2xl shadow-elevated p-6 max-w-xs w-full pointer-events-auto animate-pop"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-txt-main">Share QR Code</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center p-3 rounded-xl mb-3.5 bg-white border border-border shadow-xs">
            <canvas ref={canvasRef} className="rounded-lg max-w-full" />
          </div>

          <p 
            className="text-xs text-center text-txt-muted mb-4 truncate px-2"
            title={url}
          >
            {url}
          </p>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:opacity-95 active:scale-[0.98] shadow-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Image</span>
          </button>
        </div>
      </div>
    </>
  );
}

export const QRCodeModal = memo(QRCodeModalComponent);
export default QRCodeModal;
