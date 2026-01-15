import * as React from "react";
import { useState, useEffect } from "react";
import { slugToDTag } from "../../lib/slug-resolver";
import { parseNostreeData } from "../../lib/migration";
import { fetchEventsWithTimeout } from "../../lib/ndk";
import type { NostreeDataV2 } from "../../schemas/nostr";
import { Loader2, BadgeCheck, ExternalLink } from "lucide-react";

// Profile cache for performance
const profileCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60000; // 1 minute

// Tree cache in localStorage for instant loading
const TREE_CACHE_KEY = 'nostree_tree_cache';
const TREE_CACHE_TTL = 30000; // 30 seconds

function getCachedTree(slug: string): NostreeDataV2 | null {
  try {
    const cache = JSON.parse(localStorage.getItem(TREE_CACHE_KEY) || '{}');
    const entry = cache[slug];
    if (entry && Date.now() - entry.ts < TREE_CACHE_TTL) {
      return entry.data;
    }
  } catch {}
  return null;
}

function setCachedTree(slug: string, data: NostreeDataV2): void {
  try {
    const cache = JSON.parse(localStorage.getItem(TREE_CACHE_KEY) || '{}');
    // Limit cache size - keep only last 10 trees
    const keys = Object.keys(cache);
    if (keys.length >= 10) {
      const oldest = keys.sort((a, b) => cache[a].ts - cache[b].ts)[0];
      delete cache[oldest];
    }
    cache[slug] = { data, ts: Date.now() };
    localStorage.setItem(TREE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

interface UserProfile {
  pubkey: string;
  name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
}

interface SlugTreeViewerProps {
  slug: string;
}

/**
 * SlugTreeViewer - Looks up a tree by its global custom slug
 * Searches across all users for a Kind 30078 with matching d-tag
 */
export function SlugTreeViewer({ slug }: SlugTreeViewerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [treeData, setTreeData] = useState<NostreeDataV2 | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function loadTree() {
      try {
        // Check cache first for instant display
        const cachedTree = getCachedTree(slug);
        if (cachedTree) {
          setTreeData(cachedTree);
          setStatus("ready");
          // Continue to fetch fresh data in background
        } else {
          setStatus("loading");
        }
        
        // Search for tree by slug d-tag (across all users)
        const dTag = slugToDTag(slug);
        
        // Search by d-tag (no special case for "default" - all trees use same format)
        const treeEvents = await fetchEventsWithTimeout({
          kinds: [30078],
          "#d": [dTag],
        }, 2000); // 2s timeout (cache handles slow networks)
        
        if (cancelled) return;
        
        if (treeEvents.size === 0) {
          // Only show error if we don't have cached data
          if (!cachedTree) {
            setError(`Tree "${slug}" not found`);
            setStatus("error");
          }
          return;
        }
        
        // Get the most recent event
        const sorted = Array.from(treeEvents).sort(
          (a, b) => (b.created_at || 0) - (a.created_at || 0)
        );
        const event = sorted[0];
        
        if (!event?.content) {
          setError("Invalid tree data");
          setStatus("error");
          return;
        }
        
        // Parse tree data
        const parsedContent = JSON.parse(event.content);
        const result = parseNostreeData(parsedContent, slug);
        
        if (!result.success) {
          setError("Failed to parse tree data");
          setStatus("error");
          return;
        }
        
        // Update with fresh data and cache it
        setTreeData(result.data);
        setStatus("ready");
        setCachedTree(slug, result.data);
        
        // Then load profile in background (non-blocking)
        const ownerPubkey = event.pubkey;
        const cached = profileCache.get(ownerPubkey);
        
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setProfile(cached.data);
        } else {
          // Fire and forget - don't block rendering
          fetchEventsWithTimeout({
            kinds: [0],
            authors: [ownerPubkey],
          }, 2000).then(profileEvents => {
            if (cancelled || profileEvents.size === 0) return;
            
            const profileSorted = Array.from(profileEvents).sort(
              (a, b) => (b.created_at || 0) - (a.created_at || 0)
            );
            const profileEvent = profileSorted[0];
            if (profileEvent?.content) {
              try {
                const data = JSON.parse(profileEvent.content);
                const profileData: UserProfile = {
                  pubkey: ownerPubkey,
                  name: data.name || data.display_name,
                  about: data.about,
                  picture: data.picture || data.image,
                  banner: data.banner,
                  nip05: data.nip05,
                  lud16: data.lud16,
                };
                setProfile(profileData);
                profileCache.set(ownerPubkey, { data: profileData, ts: Date.now() });
              } catch {}
            }
          });
        }
        
      } catch (err) {
        console.error("SlugTreeViewer error:", err);
        if (!cancelled) {
          setError("Failed to load tree");
          setStatus("error");
        }
      }
    }
    
    if (slug) {
      // Track completion with mutable flag (React state is stale in closures)
      let loadComplete = false;
      
      // Wrap loadTree to track completion
      const runLoad = async () => {
        await loadTree();
        loadComplete = true;
      };
      
      // Overall timeout protection - only fire if not completed
      const timeout = setTimeout(() => {
        if (!loadComplete && !cancelled) {
          setError(`Tree "${slug}" not found`);
          setStatus("error");
        }
      }, 6000); // 6s max
      
      runLoad();
      
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }
  }, [slug]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
        <p className="text-txt-muted text-sm">Loading tree...</p>
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

  // Ready state - render tree
  const displayName = treeData?.treeMeta?.title || treeData?.profile?.name || profile?.name || "Anonymous";
  const displayBio = treeData?.profile?.bio || profile?.about || "";
  const showVerification = treeData?.profile?.show_verification ?? true;
  const links = treeData?.links?.filter(l => l.visible) || [];
  const socials = treeData?.socials || [];
  const theme = treeData?.theme;

  // Apply theme
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
                src={profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`}
                alt={`${displayName}'s avatar`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            
            {showVerification && profile?.nip05 && (
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

          {/* Slug badge */}
          <p className="text-xs text-txt-dim bg-card px-2 py-0.5 rounded-full mb-2 border border-border">
            /{slug}
          </p>

          {/* NIP-05 */}
          {showVerification && profile?.nip05 && (
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
              <a
                key={link.id}
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
            ))}
          </nav>
        )}

        {/* Empty state */}
        {links.length === 0 && (
          <div className="text-center py-8 text-txt-muted">
            <p className="text-lg">No links yet</p>
            <p className="text-sm mt-1">This tree is empty.</p>
          </div>
        )}

        {/* Social Icons */}
        {socials.length > 0 && (
          <SocialIconsRow socials={socials} />
        )}

        {/* Zap Button */}
        {profile?.lud16 && (
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-txt-dim">
        <a href="/" className="hover:text-brand transition-colors">
          Powered by Nostree 🌲
        </a>
      </footer>
    </main>
  );
}

// Social icons component
function SocialIconsRow({ socials }: { socials: Array<{ platform: string; url: string }> }) {
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
          className="p-2 rounded-full bg-card border border-border hover:border-border-hover hover:bg-card-hover transition-all duration-200 hover:scale-110"
          title={social.platform}
        >
          <span className="text-lg">{platformEmoji[social.platform] || "🔗"}</span>
        </a>
      ))}
    </nav>
  );
}

export default SlugTreeViewer;
