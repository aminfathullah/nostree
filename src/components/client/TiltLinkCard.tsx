import { memo, useState } from "react";
import { ExternalLink, Play, ChevronUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Link } from "../../schemas/nostr";
import { LinkItemIcon } from "./LinkItemIcon";
import { extractYouTubeId, isWhatsAppUrl } from "../../lib/embeds";

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
  fgColor,
  textColor,
  dimColor,
  borderRadius,
}: TiltLinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  const youtubeId = extractYouTubeId(link.url);
  const isWhatsApp = isWhatsAppUrl(link.url);


  return (
    <div
      className="w-full animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div
        className={`group relative block w-full px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out transform-gpu active:scale-[0.99] outline-none ${
          link.highlight ? "ring-2 ring-offset-2 shadow-md" : ""
        }`}
        style={{
          backgroundColor: isHovered ? cardHoverBg : cardBg,
          border: `1px solid ${isHovered ? cardHoverBorder : cardBorder}`,
          borderRadius,
          boxShadow: isHovered
            ? "0 10px 25px -4px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)"
            : "0 2px 6px rgba(0, 0, 0, 0.04)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between gap-3">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-3.5 min-w-0 flex-1 text-left text-inherit no-underline outline-none"
          >
            <LinkItemIcon
              icon={link.icon}
              emoji={link.emoji}
              url={link.url}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-semibold text-sm sm:text-base tracking-tight truncate block"
                  style={{ color: textColor }}
                >
                  {link.title}
                </span>

                {link.badge && (
                  <span
                    className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full shrink-0 shadow-2xs whitespace-nowrap"
                    style={{
                      backgroundColor: `${fgColor}20`,
                      color: fgColor,
                      border: `1px solid ${fgColor}35`,
                    }}
                  >
                    {link.badge}
                  </span>
                )}

                {isWhatsApp && !link.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 whitespace-nowrap">
                    <MessageCircle className="w-2.5 h-2.5" />
                    <span>WhatsApp</span>
                  </span>
                )}
              </div>

              {link.subtitle && (
                <span
                  className="text-xs truncate block mt-0.5 leading-snug"
                  style={{ color: dimColor }}
                >
                  {link.subtitle}
                </span>
              )}
            </div>
          </a>

          <div className="flex items-center gap-1.5 shrink-0">
            {youtubeId && (
              <button
                type="button"
                onClick={() => setIsVideoExpanded((prev) => !prev)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-[transform,background-color] duration-150 active:scale-95 cursor-pointer shadow-2xs shrink-0"
                style={{
                  backgroundColor: isVideoExpanded ? fgColor : `${fgColor}18`,
                  color: isVideoExpanded ? "#ffffff" : fgColor,
                  border: `1px solid ${fgColor}35`,
                }}
                title={isVideoExpanded ? "Tutup video" : "Tonton video langsung"}
              >
                {isVideoExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span className="text-[11px]">Tutup</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span className="text-[11px]">Video</span>
                  </>
                )}
              </button>
            )}

            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="w-7 h-7 rounded-full flex items-center justify-center transition-[background-color,opacity] duration-150"
              style={{
                backgroundColor: isHovered
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.04)",
              }}
              aria-label={link.title}
            >
              <ExternalLink
                className="w-3.5 h-3.5 transition-opacity duration-150"
                style={{
                  color: dimColor,
                  opacity: isHovered ? 1 : 0.6,
                }}
              />
            </a>
          </div>
        </div>

        <AnimatePresence>
          {youtubeId && isVideoExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-black/10 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={link.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const TiltLinkCard = memo(TiltLinkCardComponent);
export default TiltLinkCard;
