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

/**
 * Modal displaying QR code for easy mobile sharing
 * Uses canvas-based qrcode library to avoid React hooks conflicts
 */
function QRCodeModalComponent({ 
  isOpen, 
  onClose, 
  url,
  primaryColor = '#5E47B8',
  bgColor = '#ffffff'
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: primaryColor,
          light: '#ffffff00', // Transparent background
        },
        errorCorrectionLevel: 'H',
      }).catch(console.error);
    }
  }, [isOpen, url, primaryColor]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full pointer-events-auto animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share via QR Code</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* QR Code */}
          <div 
            className="flex items-center justify-center p-6 rounded-xl mb-4"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <canvas ref={canvasRef} />
          </div>

          {/* URL display */}
          <p 
            className="text-sm text-center text-gray-500 mb-4 truncate px-4"
            title={url}
          >
            {url}
          </p>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, color: bgColor }}
          >
            <Download className="w-4 h-4" />
            <span>Download QR Code</span>
          </button>
        </div>
      </div>
    </>
  );
}

export const QRCodeModal = memo(QRCodeModalComponent);
export default QRCodeModal;
