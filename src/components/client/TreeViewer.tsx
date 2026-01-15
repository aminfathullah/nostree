import { useState, useEffect } from "react";
import { parseTreePath, resolveNip05, slugToDTag, DEFAULT_SLUG } from "../../lib/slug-resolver";
import { parseNostreeData } from "../../lib/migration";
import { getNDK, fetchEventsWithTimeout } from "../../lib/ndk";
import { npubToHex } from "../../lib/utils/nip19";
import type { NostreeDataV2 } from "../../schemas/nostr";
import { Loader2, BadgeCheck, ExternalLink } from "lucide-react";

// Profile cache for performance
const profileCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60000; // 1 minute

interface UserProfile {
  pubkey: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
}

interface TreeViewerProps {
  path: string;
}

/**
 * TreeViewer - Client-side tree display with custom URL support
 * Resolves /@username/tree paths and displays the tree
 */
export function TreeViewer({ path }: TreeViewerProps) {
  const [status, setStatus] = useState<"resolving" | "loading" | "ready" | "error">("resolving");
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>(DEFAULT_SLUG);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [treeData, setTreeData] = useState<NostreeDataV2 | null>(null);

  // Resolve path and fetch data
  useEffect(() => {
    async function resolve() {
      try {
        setStatus("resolving");
        
        // Parse the path
        const parsed = parseTreePath(path);
        if (!parsed) {
          setError("Invalid URL format");
          setStatus("error");
          return;
        }
        
        setSlug(parsed.slug);
        
        // Resolve pubkey based on type
        let resolvedPubkey: string | null = null;
        
        if (parsed.type === "nip05") {
          // Check if it's a full NIP-05 (contains @) or just username
          const identifier = parsed.identifier.includes("@") 
            ? parsed.identifier 
            : `${parsed.identifier}@nostree.me`; // Default domain
          
          resolvedPubkey = await resolveNip05(identifier);
          if (!resolvedPubkey) {
            setError(`Could not resolve NIP-05: ${parsed.identifier}`);
            setStatus("error");
            return;
          }
        } else if (parsed.type === "npub") {
          resolvedPubkey = npubToHex(parsed.identifier);
          if (!resolvedPubkey) {
            setError("Invalid npub");
            setStatus("error");
            return;
          }
        } else if (parsed.type === "hex") {
          resolvedPubkey = parsed.identifier;
        }
        
        if (!resolvedPubkey) {
          setError("Could not resolve user");
          setStatus("error");
        }
        setStatus("loading");
        
        // At this point resolvedPubkey is guaranteed to be non-null
        const pubkey = resolvedPubkey!;
        
        // Connect and fetch data
        const ndk = getNDK();
        await ndk.connect();
        await new Promise(r => setTimeout(r, 500));
        
        // Fetch profile (with cache)
        const cached = profileCache.get(pubkey);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setProfile(cached.data);
        } else {
          const profileEvents = await fetchEventsWithTimeout({
            kinds: [0],
            authors: [pubkey],
          }, 10000);
          
          if (profileEvents.size > 0) {
            const sorted = Array.from(profileEvents).sort(
              (a, b) => (b.created_at || 0) - (a.created_at || 0)
            );
            const profileEvent = sorted[0];
            if (profileEvent?.content) {
              const data = JSON.parse(profileEvent.content);
              const profileData: UserProfile = {
                pubkey: pubkey,
                name: data.name || data.display_name,
                about: data.about,
                picture: data.picture || data.image,
                banner: data.banner,
                nip05: data.nip05,
                lud16: data.lud16,
              };
              setProfile(profileData);
              profileCache.set(pubkey, { data: profileData, ts: Date.now() });
            }
          }
        }
        
        // Fetch tree data
        const dTag = slugToDTag(parsed.slug);
        const treeEvents = await fetchEventsWithTimeout({
          kinds: [30078],
          authors: [pubkey],
          "#d": [dTag],
        }, 8000);
        
        // Also try legacy format for default slug
        if (treeEvents.size === 0 && parsed.slug === DEFAULT_SLUG) {
          const legacyEvents = await fetchEventsWithTimeout({
            kinds: [30078],
            authors: [pubkey],
            "#d": ["nostree-data-v1"],
          }, 5000);
          
          if (legacyEvents.size > 0) {
            const sorted = Array.from(legacyEvents).sort(
              (a, b) => (b.created_at || 0) - (a.created_at || 0)
            );
            const event = sorted[0];
            if (event?.content) {
              const parsed = JSON.parse(event.content);
              const migrated = parseNostreeData(parsed, DEFAULT_SLUG);
              if (migrated.success) {
                setTreeData(migrated.data);
                setStatus("ready");
                return;
              }
            }
          }
        }
        
        if (treeEvents.size > 0) {
          const sorted = Array.from(treeEvents).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0)
          );
          const event = sorted[0];
          if (event?.content) {
            const parsedContent = JSON.parse(event.content);
            const result = parseNostreeData(parsedContent, parsed.slug);
            if (result.success) {
              setTreeData(result.data);
              setStatus("ready");
              return;
            }
          }
        }
        
        // No tree found
        setError(`Tree "${parsed.slug}" not found`);
        setStatus("error");
        
      } catch (err) {
        console.error("TreeViewer error:", err);
        setError("Failed to load tree");
        setStatus("error");
      }
    }
    
    resolve();
  }, [path]);

  // Loading state
  if (status === "resolving" || status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-txt-muted text-sm">
          {status === "resolving" ? "Resolving..." : "Loading tree..."}
        </p>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-6xl mb-4">🌲</div>
        <h1 className="text-2xl font-bold text-brand mb-2">Not Found</h1>
        <p className="text-txt-muted max-w-md">{error}</p>
        <a href="/" className="mt-6 text-brand hover:underline">
          Go to Homepage
        </a>
      </div>
    );
  }

  // Ready state
  const displayName = treeData?.treeMeta?.title || treeData?.profile?.name || profile?.name || "Anonymous";
  const displayBio = treeData?.profile?.bio || profile?.about || "";
  const showVerification = treeData?.profile?.show_verification ?? true;
  const links = treeData?.links?.filter(l => l.visible) || [];
  const socials = treeData?.socials || [];
  const theme = treeData?.theme;

  // Theme colors with fallbacks
  const bgColor = theme?.colors.background || "#f5f5f7";
  const fgColor = theme?.colors.foreground || "#1f2937";
  const primaryColor = theme?.colors.primary || "#5E47B8";
  const borderRadius = theme?.colors.radius || "1rem";
  
  // Computed styles for theme
  const cardBg = `${fgColor}10`; // 10% opacity of foreground
  const cardBorder = `${fgColor}20`; // 20% opacity
  const cardHoverBorder = `${fgColor}30`;
  const dimColor = `${fgColor}99`; // 60% opacity

  return (
    <main 
      className="min-h-screen flex flex-col items-center px-4 py-12 pb-20 transition-colors"
      style={{ backgroundColor: bgColor, color: fgColor }}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Profile Header */}
        <header className="flex flex-col items-center text-center mb-8">
          {/* Avatar */}
          <div className="relative mb-4">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden"
              style={{ backgroundColor: cardBg, boxShadow: `0 0 0 4px ${bgColor}` }}
            >
              <img 
                src={profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                alt={`${displayName}'s avatar`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            
            {showVerification && profile?.nip05 && (
              <div 
                className="absolute -bottom-1 -right-1 p-1 rounded-full"
                style={{ backgroundColor: primaryColor, color: bgColor }}
                title={`Verified: ${profile.nip05}`}
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold mb-1" style={{ color: fgColor }}>{displayName}</h1>

          {/* Tree slug badge */}
          {slug !== DEFAULT_SLUG && (
            <p 
              className="text-xs px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, color: dimColor }}
            >
              /{slug}
            </p>
          )}

          {/* NIP-05 */}
          {showVerification && profile?.nip05 && (
            <p className="text-sm mb-2 flex items-center gap-1" style={{ color: primaryColor }}>
              <span>✓</span>
              <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
            </p>
          )}

          {/* Bio */}
          {displayBio && (
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: dimColor }}>{displayBio}</p>
          )}
        </header>

        {/* Links */}
        {links.length > 0 && (
          <nav className="flex flex-col gap-3" aria-label="Links">
            {links.map((link, index) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block w-full p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group animate-slide-up"
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
            ))}
          </nav>
        )}

        {/* Empty state */}
        {links.length === 0 && (
          <div className="text-center py-8" style={{ color: dimColor }}>
            <p className="text-lg">No links yet</p>
            <p className="text-sm mt-1">This tree is empty.</p>
          </div>
        )}

        {/* Social Icons */}
        {socials.length > 0 && (
          <SocialIconsRow socials={socials} cardBg={cardBg} cardBorder={cardBorder} borderRadius={borderRadius} />
        )}

        {/* Zap Button */}
        {profile?.lud16 && (
          <div className="mt-8 text-center">
            <a 
              href={`lightning:${profile.lud16}`}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: primaryColor, color: bgColor }}
            >
              <span>⚡</span>
              <span>Send a Zap</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs" style={{ color: dimColor }}>
        <a href="/" className="transition-colors hover:opacity-80">
          Powered by Nostree 🌲
        </a>
      </footer>
    </main>
  );
}

// Social icons component
interface SocialIconsRowProps {
  socials: Array<{ platform: string; url: string }>;
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
  };

  return (
    <nav className="flex justify-center gap-4 mt-8" aria-label="Social links">
      {socials.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="p-2 transition-all duration-200 hover:scale-110"
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

export default TreeViewer;
