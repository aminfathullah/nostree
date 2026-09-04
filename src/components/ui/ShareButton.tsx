import { useState, useCallback, memo } from 'react';
import { Share2, Check, Link2, QrCode } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  onQRClick?: () => void;
  primaryColor?: string;
  bgColor?: string;
}

function ShareButtonComponent({ 
  url, 
  onQRClick,
  primaryColor = '#6366f1',
  bgColor = '#09090b'
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handleShare = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div 
            className="absolute bottom-14 right-0 glass-card bg-card/95 border border-border rounded-2xl shadow-elevated overflow-hidden z-50 animate-pop min-w-[170px] p-1.5 space-y-1"
          >
            <button
              onClick={() => { handleCopy(); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98]"
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
                onClick={() => { onQRClick(); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-left text-xs font-medium text-txt-main active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4 text-txt-muted" />
                <span>Show QR Code</span>
              </button>
            )}
          </div>
        </>
      )}

      <button
        onClick={handleShare}
        className="w-11 h-11 rounded-full shadow-elevated flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{ 
          backgroundColor: primaryColor, 
          color: '#ffffff',
          boxShadow: `0 8px 24px -4px ${primaryColor}60`
        }}
        aria-label="Share this page"
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
