import { useState, useEffect } from "react";
import { getNDK, fetchEventsWithTimeout } from "../../lib/ndk";
import { npubToHex, isNpub, shortenNpub } from "../../lib/utils/nip19";
import { NostreeDataSchema, type NostreeData, type Link, type LinkGroup, type Social } from "../../schemas/nostr";
import { BadgeCheck, ExternalLink, Loader2 } from "lucide-react";

interface NostreeProfile {
  pubkey: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
}

interface ProfileViewerProps {
  npub: string;
}

export function ProfileViewer({ npub }: ProfileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<NostreeProfile | null>(null);
  const [appData, setAppData] = useState<NostreeData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting to relays...");

  useEffect(() => {
    if (!isNpub(npub)) {
      setError("Invalid npub format");
      setLoading(false);
      return;
    }

    const pubkey = npubToHex(npub);
    if (!pubkey) {
      setError("Failed to decode npub");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const ndk = getNDK();
        
        setConnectionStatus("Connecting to Nostr relays...");
        await ndk.connect();
        
        await new Promise(r => setTimeout(r, 1000));
        
        const connectedCount = ndk.pool.connectedRelays().length;
        setConnectionStatus(`Connected to ${connectedCount} relays. Fetching profile...`);

        const profileEvents = await fetchEventsWithTimeout({
          kinds: [0],
          authors: [pubkey!],
        }, 10000);

        if (profileEvents.size > 0) {
          const sortedEvents = Array.from(profileEvents).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0)
          );
          const profileEvent = sortedEvents[0];
          
          if (profileEvent?.content) {
            const data = JSON.parse(profileEvent.content);
            setProfile({
              pubkey: pubkey!,
              name: data.name || data.display_name,
              about: data.about,
              picture: data.picture || data.image,
              banner: data.banner,
              nip05: data.nip05,
              lud16: data.lud16,
            });
          }
        }

        setConnectionStatus("Fetching Nostree data...");

        const appDataEvents = await fetchEventsWithTimeout({
          kinds: [30078],
          authors: [pubkey!],
          "#d": ["nostree-data-v1"],
        }, 5000);

        if (appDataEvents.size > 0) {
          const sortedEvents = Array.from(appDataEvents).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0)
          );
          const latestEvent = sortedEvents[0];
          
          if (latestEvent?.content) {
            const parsed = JSON.parse(latestEvent.content);
            const validated = NostreeDataSchema.safeParse(parsed);
            if (validated.success) {
              setAppData(validated.data);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to connect to Nostr network");
        setLoading(false);
      }
    }

    fetchData();
  }, [npub]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-txt-muted text-sm">{connectionStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-6xl mb-4">🌲</div>
        <h1 className="text-2xl font-bold text-brand mb-2">Error</h1>
        <p className="text-txt-muted">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-6xl mb-4">🌲</div>
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-txt-muted max-w-md">
          No Nostr profile found for this npub. The user may not have published their profile yet.
        </p>
        <p className="text-txt-dim text-sm mt-4 font-mono">{shortenNpub(npub)}</p>
      </div>
    );
  }

  const displayName = appData?.profile?.name || profile.name || "Anonymous";
  const displayBio = appData?.profile?.bio || profile.about || "";
  const showVerification = appData?.profile?.show_verification ?? true;
  const links = appData?.links?.filter(l => l.visible) || [];
  const socials = appData?.socials || [];
  const theme = appData?.theme;

  const bgColor = theme?.colors.background || "#f5f5f7";
  const fgColor = theme?.colors.foreground || "#1f2937";
  const primaryColor = theme?.colors.primary || "#5E47B8";
  const borderRadius = theme?.colors.radius || "1rem";
  
  const cardBg = `${fgColor}10`;
  const cardBorder = `${fgColor}20`;
  const cardHoverBorder = `${fgColor}30`;
  const dimColor = `${fgColor}99`;

  return (
    <main 
      className="min-h-screen flex flex-col items-center px-4 py-12 pb-20 transition-colors"
      style={{ backgroundColor: bgColor, color: fgColor }}
    >
      <div className="w-full max-w-md mx-auto">
        {appData?.profile?.headerImage && (
          <div className="-mt-6 mb-0 overflow-hidden rounded-2xl shadow-elevated relative">
            <div className="w-full aspect-[2.6/1] sm:aspect-[2.9/1] min-h-[150px] sm:min-h-[185px] overflow-hidden bg-zinc-900">
              <img 
                src={appData.profile.headerImage} 
                alt="Cover" 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        <header className={`flex flex-col items-center text-center mb-8 ${appData?.profile?.headerImage ? '-mt-12 relative z-10' : ''}`}>
          <div className="relative mb-4">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden shadow-elevated"
              style={{ 
                backgroundColor: cardBg, 
                border: appData?.profile?.headerImage ? `4px solid ${bgColor}` : `2px solid ${cardBorder}` 
              }}
            >
              <img 
                src={appData?.profile?.picture || profile.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                alt={`${displayName}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {showVerification && profile.nip05 && (
              <div 
                className="absolute -bottom-1 -right-1 p-1 rounded-full shadow-xs"
                style={{ backgroundColor: primaryColor, color: bgColor }}
                title={`Verified: ${profile.nip05}`}
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: fgColor }}>{displayName}</h1>

          {showVerification && profile.nip05 && (
            <p className="text-sm mb-2 flex items-center gap-1" style={{ color: primaryColor }}>
              <span>✓</span>
              <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
            </p>
          )}

          {displayBio && (
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: dimColor }}>{displayBio}</p>
          )}
        </header>

        {links.length > 0 && (
          <nav className="flex flex-col gap-3" aria-label="Links">
            {links.flatMap((item, index) => {
              if ('type' in item && item.type === 'group') {
                const group = item as LinkGroup;
                if (!group.visible) return [];
                return group.links.filter(l => l.visible).map((link, subIndex) => (
                  <LinkCard 
                    key={link.id} 
                    link={link} 
                    index={index + subIndex} 
                    fgColor={fgColor}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    cardHoverBorder={cardHoverBorder}
                    borderRadius={borderRadius}
                    dimColor={dimColor}
                  />
                ));
              }
              const link = item as Link;
              return [
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  index={index} 
                  fgColor={fgColor}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  cardHoverBorder={cardHoverBorder}
                  borderRadius={borderRadius}
                  dimColor={dimColor}
                />
              ];
            })}
          </nav>
        )}

        {links.length === 0 && !appData && (
          <div className="text-center py-8" style={{ color: dimColor }}>
            <p className="text-lg">No Nostree links yet</p>
            <p className="text-sm mt-1">This user hasn't set up their Nostree profile.</p>
          </div>
        )}

        {socials.length > 0 && (
          <SocialIconsRow socials={socials} cardBg={cardBg} cardBorder={cardBorder} borderRadius={borderRadius} />
        )}

        {profile.lud16 && (
          <div className="mt-8 text-center">
            <a 
              href={`lightning:${profile.lud16}`}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-full transition-[transform,opacity] duration-200 ease-out hover:scale-105 active:scale-95 shadow-xs"
              style={{ backgroundColor: primaryColor, color: bgColor }}
            >
              <span>⚡</span>
              <span>Send a Zap</span>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

interface LinkCardProps {
  link: Link;
  index: number;
  fgColor: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  borderRadius: string;
  dimColor: string;
}

function LinkCard({ link, index, fgColor, cardBg, cardBorder, cardHoverBorder, borderRadius, dimColor }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block w-full p-4 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] group animate-slide-up"
      style={{ 
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: borderRadius,
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = cardHoverBorder;
        e.currentTarget.style.boxShadow = `0 4px 12px ${fgColor}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = cardBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-3">
        {link.emoji && <span className="text-xl">{link.emoji}</span>}
        <span className="font-medium text-center flex-1" style={{ color: fgColor }}>{link.title}</span>
        <ExternalLink className="w-4 h-4 transition-opacity" style={{ color: dimColor }} />
      </div>
    </a>
  );
}

interface SocialIconsRowProps {
  socials: Social[];
  cardBg: string;
  cardBorder: string;
  borderRadius: string;
}

function SocialIconsRow({ socials, cardBg, cardBorder, borderRadius }: SocialIconsRowProps) {
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
    telegram: "✈️",
    discord: "💬",
    facebook: "👤",
    spotify: "🎧",
    soundcloud: "☁️",
    medium: "📝",
    substack: "📰",
  };

  return (
    <nav className="flex justify-center gap-4 mt-8" aria-label="Social links">
      {socials.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="p-2 transition-transform duration-200 ease-out hover:scale-110 active:scale-95"
          style={{ 
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: borderRadius,
          }}
          title={social.platform}
        >
          <span className="text-lg">{platformEmoji[social.platform] || "🔗"}</span>
        </a>
      ))}
    </nav>
  );
}

export default ProfileViewer;
