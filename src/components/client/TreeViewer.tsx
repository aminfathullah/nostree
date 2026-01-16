import { useState, useEffect } from "react";
import { parseTreePath, resolveNip05, slugToDTag, DEFAULT_SLUG } from "../../lib/slug-resolver";
import { parseNostreeData } from "../../lib/migration";
import { getNDK, fetchEventsWithTimeout } from "../../lib/ndk";
import { npubToHex } from "../../lib/utils/nip19";
import type { NostreeDataV2 } from "../../schemas/nostr";
import PublicTreeViewer from "./PublicTreeViewer";

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
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>(DEFAULT_SLUG);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [treeData, setTreeData] = useState<NostreeDataV2 | null>(null);

  // Resolve path and fetch data
  useEffect(() => {
    async function resolve() {
      try {
        setStatus("loading");
        
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
          return;
        }
        
        // At this point resolvedPubkey is guaranteed to be non-null
        const pubkey = resolvedPubkey;
        
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
              const parsedData = JSON.parse(event.content);
              const migrated = parseNostreeData(parsedData, DEFAULT_SLUG);
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

  return (
    <PublicTreeViewer
      status={status}
      error={error}
      treeData={treeData}
      profile={profile}
      slug={slug}
    />
  );
}

export default TreeViewer;
