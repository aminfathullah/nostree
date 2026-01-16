import { useRef, useState, useCallback, type MouseEvent, memo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Link } from '../../schemas/nostr';

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

/**
 * TiltLinkCard - Link card with 3D tilt effect on hover
 * Provides premium feel with perspective-based rotation
 */
function TiltLinkCardComponent({
  link,
  index,
  cardBg,
  cardBorder,
  cardHoverBg,
  cardHoverBorder,
  fgColor,
  textColor,
  dimColor,
  borderRadius,
}: TiltLinkCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle tilt (max 5 degrees)
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTilt({ rotateX, rotateY, scale: 1.02 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setTilt(prev => ({ ...prev, scale: 1.02 }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  return (
    <a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group block w-full p-4 animate-slide-up backdrop-blur-sm"
      style={{
        backgroundColor: isHovered ? cardHoverBg : cardBg,
        border: `1px solid ${isHovered ? cardHoverBorder : cardBorder}`,
        borderRadius: borderRadius,
        animationDelay: `${150 + index * 60}ms`,
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        transition: 'transform 300ms cubic-bezier(0.03, 0.98, 0.52, 0.99), background-color 200ms, border-color 200ms',
        boxShadow: isHovered ? `0 12px 35px ${fgColor}20, 0 0 0 1px ${fgColor}05` : 'none',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3">
        {link.emoji && (
          <span 
            className="text-xl transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}
          >
            {link.emoji}
          </span>
        )}
        <span
          className="font-medium text-center flex-1"
          style={{ color: textColor }}
        >
          {link.title}
        </span>
        <ExternalLink
          className="w-4 h-4 transition-all duration-300"
          style={{ 
            color: dimColor,
            opacity: isHovered ? 0.8 : 0.4,
            transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
          }}
        />
      </div>
    </a>
  );
}

export const TiltLinkCard = memo(TiltLinkCardComponent);
export default TiltLinkCard;
