import * as React from "react";
import type { Link, Social, NostreeData } from "../../schemas/nostr";
import { BadgeCheck, ExternalLink } from "lucide-react";

interface MobilePreviewProps {
  profile: {
    name?: string;
    picture?: string;
    nip05?: string;
    lud16?: string;
    about?: string;
  };
  data: NostreeData | null;
  links: Link[];
}

/**
 * Live mobile preview component
 * Shows real-time preview of the profile as users edit
 */
export function MobilePreview({ profile, data, links }: MobilePreviewProps) {
  const displayName = data?.profile?.name || profile?.name || "Your Name";
  const displayBio = data?.profile?.bio || profile?.about || "";
  const showVerification = data?.profile?.show_verification ?? true;
  const visibleLinks = links.filter(l => l.visible);
  const socials = data?.socials || [];
  const theme = data?.theme;

  // Apply theme if present
  const themeStyles = theme ? {
    "--theme-bg": theme.colors.background,
    "--theme-fg": theme.colors.foreground,
    "--theme-primary": theme.colors.primary,
    "--theme-radius": theme.colors.radius,
  } as React.CSSProperties : {};

  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-medium text-txt-muted mb-3 text-center">
        Preview
      </h3>
      
      {/* Phone Frame */}
      <div 
        className="w-[375px] h-[700px] border-8 border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden bg-canvas mx-auto"
        style={themeStyles}
      >
        {/* Content */}
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="px-6 py-10">
            {/* Profile Header */}
            <header className="flex flex-col items-center text-center mb-8">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-canvas bg-card">
                  <img 
                    src={profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {showVerification && profile?.nip05 && (
                  <div className="absolute -bottom-1 -right-1 bg-brand text-brand-fg p-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className="text-xl font-bold text-txt-main mb-1">{displayName}</h1>

              {/* NIP-05 */}
              {showVerification && profile?.nip05 && (
                <p className="text-xs text-brand mb-2 flex items-center gap-1">
                  <span>✓</span>
                  <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
                </p>
              )}

              {/* Bio */}
              {displayBio && (
                <p className="text-txt-muted text-sm leading-relaxed max-w-[280px]">{displayBio}</p>
              )}
            </header>

            {/* Links */}
            {visibleLinks.length > 0 ? (
              <nav className="flex flex-col gap-3">
                {visibleLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="block w-full p-3 rounded-xl bg-card border border-border hover:bg-card-hover transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      {link.emoji && <span className="text-lg">{link.emoji}</span>}
                      <span className="font-medium text-sm text-center flex-1 text-txt-main truncate">
                        {link.title}
                      </span>
                      <ExternalLink className="w-3 h-3 text-txt-dim shrink-0" />
                    </div>
                  </div>
                ))}
              </nav>
            ) : (
              <div className="text-center py-6 text-txt-muted text-sm">
                <p>No visible links</p>
                <p className="text-xs mt-1">Add links to see them here</p>
              </div>
            )}

            {/* Social Icons */}
            {socials.length > 0 && (
              <SocialIconsPreview socials={socials} />
            )}

            {/* Zap Button */}
            {profile?.lud16 && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-brand-fg text-sm font-medium rounded-full">
                  <span>⚡</span>
                  <span>Send a Zap</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIconsPreview({ socials }: { socials: Social[] }) {
  const platformEmoji: Record<string, string> = {
    twitter: "𝕏",
    instagram: "📷",
    youtube: "▶️",
    github: "💻",
    linkedin: "💼",
    tiktok: "🎵",
    twitch: "🎮",
    nostr: "🟣",
    website: "🌐",
  };

  return (
    <nav className="flex justify-center gap-3 mt-6">
      {socials.map((social) => (
        <div
          key={social.platform}
          className="p-2 rounded-full bg-card border border-border text-sm"
        >
          {platformEmoji[social.platform] || "🔗"}
        </div>
      ))}
    </nav>
  );
}

export default MobilePreview;
