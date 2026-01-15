import * as React from "react";
import { useState, useEffect } from "react";
import { getNDK, fetchEventsWithTimeout } from "../../lib/ndk";
import { npubToHex, isNpub, shortenNpub } from "../../lib/utils/nip19";
import { NostreeDataSchema, type NostreeData, type Link, type Social } from "../../schemas/nostr";
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

/**
 * ProfileViewer - Full client-side profile display
 * Connects to Nostr relays and fetches Kind 0 and Kind 30078 data
 */
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
        
        // Wait for connections
        await new Promise(r => setTimeout(r, 1000));
        
        const connectedCount = ndk.pool.connectedRelays().length;
        setConnectionStatus(`Connected to ${connectedCount} relays. Fetching profile...`);

        // Fetch Kind 0 (profile)
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

        // Fetch Kind 30078 (app data)
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-txt-muted text-sm">{connectionStatus}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-6xl mb-4">🌲</div>
        <h1 className="text-2xl font-bold text-brand mb-2">Error</h1>
        <p className="text-txt-muted">{error}</p>
      </div>
    );
  }

  // No profile found
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

  // Compute display values
  const displayName = appData?.profile?.name || profile.name || "Anonymous";
  const displayBio = appData?.profile?.bio || profile.about || "";
  const showVerification = appData?.profile?.show_verification ?? true;
  const links = appData?.links?.filter(l => l.visible) || [];
  const socials = appData?.socials || [];
  const theme = appData?.theme;

  // Apply theme colors
  const themeStyles = theme ? {
    "--theme-bg": theme.colors.background,
    "--theme-fg": theme.colors.foreground,
    "--theme-primary": theme.colors.primary,
    "--theme-radius": theme.colors.radius,
  } as React.CSSProperties : {};

  return (
    <main 
      className="min-h-screen flex flex-col items-center px-4 py-12 pb-20"
      style={themeStyles}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-8">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-canvas bg-card">
              <img 
                src={profile.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                alt={`${displayName}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Verification Badge */}
            {showVerification && profile.nip05 && (
              <div 
                className="absolute -bottom-1 -right-1 bg-brand text-brand-fg p-1 rounded-full"
                title={`Verified: ${profile.nip05}`}
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-txt-main mb-1">{displayName}</h1>

          {/* NIP-05 */}
          {showVerification && profile.nip05 && (
            <p className="text-sm text-brand mb-2 flex items-center gap-1">
              <span>✓</span>
              <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
            </p>
          )}

          {/* Bio */}
          {displayBio && (
            <p className="text-txt-muted max-w-sm text-sm leading-relaxed">{displayBio}</p>
          )}
        </header>

        {/* Links */}
        {links.length > 0 && (
          <nav className="flex flex-col gap-3" aria-label="Links">
            {links.map((link, index) => (
              <LinkCard key={link.id} link={link} index={index} />
            ))}
          </nav>
        )}

        {/* No links message */}
        {links.length === 0 && !appData && (
          <div className="text-center py-8 text-txt-muted">
            <p className="text-lg">No Nostree links yet</p>
            <p className="text-sm mt-1">This user hasn't set up their Nostree profile.</p>
          </div>
        )}

        {/* Social Icons */}
        {socials.length > 0 && (
          <SocialIconsRow socials={socials} />
        )}

        {/* Zap Button */}
        {profile.lud16 && (
          <div className="mt-8 text-center">
            <a 
              href={`lightning:${profile.lud16}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-brand-fg font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
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

// Link Card Component
function LinkCard({ link, index }: { link: Link; index: number }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block w-full p-4 rounded-xl transition-all duration-200 bg-card hover:bg-card-hover border border-border hover:border-border-hover hover:scale-[1.02] active:scale-[0.98] hover:shadow-card group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3">
        {link.emoji && <span className="text-xl">{link.emoji}</span>}
        <span className="font-medium text-center flex-1 text-txt-main">{link.title}</span>
        <ExternalLink className="w-4 h-4 text-txt-dim group-hover:text-txt-muted transition-colors" />
      </div>
    </a>
  );
}

// Social Icons Component
function SocialIconsRow({ socials }: { socials: Social[] }) {
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
          className="p-2 rounded-full bg-card border border-border hover:border-border-hover hover:bg-card-hover transition-all duration-200 hover:scale-110"
          title={social.platform}
        >
          <span className="text-lg">{platformEmoji[social.platform] || "🔗"}</span>
        </a>
      ))}
    </nav>
  );
}

export default ProfileViewer;
