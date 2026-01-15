import { getNDK, fetchEventsWithTimeout } from "./ndk";

/**
 * Result of resolving a tree path
 */
export interface ResolvedTree {
  /** User's public key (hex) */
  pubkey: string;
  /** Tree slug (or "default") */
  slug: string;
  /** Full d-tag for querying (e.g., "nostree/portfolio") */
  dTag: string;
  /** Whether this was resolved via NIP-05 */
  viaIndexedAt?: string;
}

/**
 * D-tag prefix for all Nostree trees
 */
export const NOSTREE_PREFIX = "nostree";

/**
 * Default slug for primary tree
 */
export const DEFAULT_SLUG = "default";

/**
 * Create a d-tag from a slug
 */
export function slugToDTag(slug: string): string {
  return `${NOSTREE_PREFIX}/${slug}`;
}

/**
 * Extract slug from a d-tag
 */
export function dTagToSlug(dTag: string): string | null {
  if (dTag.startsWith(`${NOSTREE_PREFIX}/`)) {
    return dTag.slice(NOSTREE_PREFIX.length + 1);
  }
  // Handle legacy format
  if (dTag === "nostree-data-v1") {
    return DEFAULT_SLUG;
  }
  return null;
}

/**
 * Check if a d-tag is a Nostree tree
 */
export function isNostreeDTag(dTag: string): boolean {
  return dTag.startsWith(`${NOSTREE_PREFIX}/`) || dTag === "nostree-data-v1";
}

/**
 * Resolve NIP-05 identifier to pubkey
 * @param identifier - NIP-05 identifier (e.g., "maja@domain.com" or "_@domain.com")
 */
export async function resolveNip05(identifier: string): Promise<string | null> {
  try {
    // Parse identifier
    const parts = identifier.split("@");
    if (parts.length !== 2) return null;
    
    const [name, domain] = parts;
    const localPart = name || "_";
    
    // Fetch .well-known/nostr.json
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const pubkey = data?.names?.[localPart];
    
    if (typeof pubkey === "string" && pubkey.length === 64) {
      return pubkey;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse a path like "@maja/portfolio" or "npub.../portfolio"
 * Returns the components for tree resolution
 */
export function parseTreePath(path: string): {
  type: "nip05" | "npub" | "hex";
  identifier: string;
  slug: string;
} | null {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // Split into segments
  const segments = cleanPath.split("/").filter(Boolean);
  
  if (segments.length === 0) return null;
  
  const firstSegment = segments[0];
  const slug = segments[1] || DEFAULT_SLUG;
  
  // Check if it's a NIP-05 style path (starts with @)
  if (firstSegment.startsWith("@")) {
    // Could be @username (short) or @user@domain.com (full NIP-05)
    const identifier = firstSegment.slice(1); // Remove @
    return {
      type: "nip05",
      identifier,
      slug,
    };
  }
  
  // Check if it's an npub
  if (firstSegment.startsWith("npub1")) {
    return {
      type: "npub",
      identifier: firstSegment,
      slug,
    };
  }
  
  // Check if it's a hex pubkey (64 chars)
  if (/^[0-9a-f]{64}$/i.test(firstSegment)) {
    return {
      type: "hex",
      identifier: firstSegment.toLowerCase(),
      slug,
    };
  }
  
  return null;
}

/**
 * Fetch all trees for a given pubkey
 */
export async function fetchUserTrees(pubkey: string): Promise<Array<{
  slug: string;
  dTag: string;
  createdAt?: number;
}>> {
  const events = await fetchEventsWithTimeout({
    kinds: [30078],
    authors: [pubkey],
  }, 5000);
  
  const trees: Array<{ slug: string; dTag: string; createdAt?: number }> = [];
  
  for (const event of events) {
    const dTag = event.tags.find(t => t[0] === "d")?.[1];
    if (dTag && isNostreeDTag(dTag)) {
      const slug = dTagToSlug(dTag);
      if (slug) {
        // Check if tree is deleted by parsing content
        try {
          if (event.content) {
            const data = JSON.parse(event.content);
            // Skip trees that have been marked as deleted
            if (data?.treeMeta?.deletedAt) {
              continue;
            }
            // Also skip trees with empty links array AND no other meaningful data
            if (data?.links?.length === 0 && data?.treeMeta?.deletedAt !== undefined) {
              continue;
            }
          }
        } catch {
          // If we can't parse content, include the tree anyway
        }
        
        trees.push({
          slug,
          dTag,
          createdAt: event.created_at,
        });
      }
    }
  }
  
  // Sort by creation time (oldest first) or slug alphabetically
  trees.sort((a, b) => {
    if (a.slug === DEFAULT_SLUG) return -1;
    if (b.slug === DEFAULT_SLUG) return 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
  
  return trees;
}

export default {
  resolveNip05,
  parseTreePath,
  slugToDTag,
  dTagToSlug,
  fetchUserTrees,
  NOSTREE_PREFIX,
  DEFAULT_SLUG,
};
