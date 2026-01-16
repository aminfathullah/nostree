import { useState, useCallback, memo } from 'react';
import { Share2, Check, Link2, QrCode } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  onQRClick?: () => void;
  primaryColor?: string;
  bgColor?: string;
}

/**
 * Floating share button with copy and QR code functionality
 */
function ShareButtonComponent({ 
  url, 
  onQRClick,
  primaryColor = '#5E47B8',
  bgColor = '#ffffff'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleShare = useCallback(async () => {
    // Detect if this is a mobile device with touch support
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Use native share API only on mobile if available
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my links',
          url: url,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to menu
      }
    }
    // Show menu on desktop or if native share not available
    setShowMenu(prev => !prev);
  }, [url]);


  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div 
            className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-slide-up min-w-[180px]"
          >
            <button
              onClick={() => { handleCopy(); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Copy link</span>
                </>
              )}
            </button>
            {onQRClick && (
              <button
                onClick={() => { onQRClick(); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
              >
                <QrCode className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Show QR code</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Main Button */}
      <button
        onClick={handleShare}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ 
          backgroundColor: primaryColor, 
          color: bgColor,
          boxShadow: `0 4px 20px ${primaryColor}40`
        }}
        aria-label="Share this page"
      >
        {copied ? (
          <Check className="w-5 h-5 animate-bounce-in" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

export const ShareButton = memo(ShareButtonComponent);
export default ShareButton;
