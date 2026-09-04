import { memo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Link } from '../../schemas/nostr';
import { LinkItemIcon } from './LinkItemIcon';

interface TiltLinkCardProps {
  link: Link;
  index: number;
  cardBg: string;
  cardBorder: string;
  cardHoverBg: string;
  cardHoverBorder: string;
  fgColor: string;
  textColor: string;
  dimColor: string;
  borderRadius: string;
}

function TiltLinkCardComponent({
  link,
  index,
  cardBg,
  cardBorder,
  cardHoverBg,
  cardHoverBorder,
  textColor,
  dimColor,
  borderRadius,
}: TiltLinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group relative block w-full px-4 py-3 sm:px-5 sm:py-3.5 animate-slide-up backdrop-blur-md transition-all duration-150 ease-out hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      style={{
        backgroundColor: isHovered ? cardHoverBg : cardBg,
        border: `1px solid ${isHovered ? cardHoverBorder : cardBorder}`,
        borderRadius: borderRadius,
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        boxShadow: isHovered 
          ? '0 12px 28px -6px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)' 
          : '0 2px 6px rgba(0, 0, 0, 0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1 text-left">
          <LinkItemIcon 
            icon={link.icon} 
            emoji={link.emoji} 
            url={link.url} 
            size="md" 
          />
          <div className="min-w-0 flex-1">
            <span
              className="font-semibold text-sm sm:text-base tracking-tight truncate block"
              style={{ color: textColor }}
            >
              {link.title}
            </span>
            {link.subtitle && (
              <span
                className="text-xs truncate block mt-0.5 leading-snug"
                style={{ color: dimColor }}
              >
                {link.subtitle}
              </span>
            )}
          </div>
        </div>
        <div 
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ 
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <ExternalLink
            className="w-3.5 h-3.5 transition-opacity duration-200"
            style={{ 
              color: dimColor,
              opacity: isHovered ? 1 : 0.6,
            }}
          />
        </div>
      </div>
    </a>
  );
}

export const TiltLinkCard = memo(TiltLinkCardComponent);
export default TiltLinkCard;
