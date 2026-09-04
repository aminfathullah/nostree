import { fetchEventsWithTimeout } from "./ndk";

export interface ResolvedTree {
  pubkey: string;
  slug: string;
  dTag: string;
  viaIndexedAt?: string;
}

export interface UserTreeEntry {
  slug: string;
  dTag: string;
  createdAt?: number;
  data?: any;
}

export const NOSTREE_PREFIX = "nostree";
export const DEFAULT_SLUG = "default";

export function slugToDTag(slug: string): string {
  return `${NOSTREE_PREFIX}/${slug}`;
}

export function dTagToSlug(dTag: string): string | null {
  if (dTag.startsWith(`${NOSTREE_PREFIX}/`)) {
    return dTag.slice(NOSTREE_PREFIX.length + 1);
  }
  if (dTag === "nostree-data-v1") {
    return DEFAULT_SLUG;
  }
  return null;
}

export function isNostreeDTag(dTag: string): boolean {
  return dTag.startsWith(`${NOSTREE_PREFIX}/`) || dTag === "nostree-data-v1";
}

export async function resolveNip05(identifier: string): Promise<string | null> {
  try {
    const parts = identifier.split("@");
    if (parts.length !== 2) return null;
    
    const [name, domain] = parts;
    const localPart = name || "_";
    
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
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

export function parseTreePath(path: string): {
  type: "nip05" | "npub" | "hex";
  identifier: string;
  slug: string;
} | null {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const segments = cleanPath.split("/").filter(Boolean);
  
  if (segments.length === 0) return null;
  
  const firstSegment = segments[0];
  const slug = segments[1] || DEFAULT_SLUG;
  
  if (firstSegment.startsWith("@")) {
    const identifier = firstSegment.slice(1);
    return {
      type: "nip05",
      identifier,
      slug,
    };
  }
  
  if (firstSegment.startsWith("npub1")) {
    return {
      type: "npub",
      identifier: firstSegment,
      slug,
    };
  }
  
  if (/^[0-9a-f]{64}$/i.test(firstSegment)) {
    return {
      type: "hex",
      identifier: firstSegment.toLowerCase(),
      slug,
    };
  }
  
  return null;
}

export async function fetchUserTrees(pubkey: string): Promise<UserTreeEntry[]> {
  const events = await fetchEventsWithTimeout({
    kinds: [30078],
    authors: [pubkey],
  }, 1600, 60);
  
  const eventsByDTag = new Map<string, any>();
  
  for (const event of events) {
    const dTag = event.tags.find((t: string[]) => t[0] === "d")?.[1];
    if (dTag && isNostreeDTag(dTag)) {
      const existing = eventsByDTag.get(dTag);
      if (!existing || (event.created_at || 0) > (existing.created_at || 0)) {
        eventsByDTag.set(dTag, event);
      }
    }
  }

  const trees: UserTreeEntry[] = [];
  
  for (const [dTag, event] of eventsByDTag.entries()) {
    const slug = dTagToSlug(dTag);
    if (slug) {
      if (slug === "default") {
        continue;
      }
      
      let parsedData: any = undefined;
      try {
        if (event.content) {
          const data = JSON.parse(event.content);
          if (data?.treeMeta?.deletedAt) {
            continue;
          }
          if (data?.links?.length === 0 && data?.treeMeta?.deletedAt !== undefined) {
            continue;
          }
          parsedData = data;
        }
      } catch {}
      
      trees.push({
        slug,
        dTag,
        createdAt: event.created_at,
        data: parsedData,
      });
    }
  }
  
  trees.sort((a, b) => {
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
  
  return trees;
}

export async function checkSlugAvailability(slug: string): Promise<{
  available: boolean;
  owner?: string;
}> {
  const reserved = ["admin", "login", "profile", "api", "u", "settings", "help", "about", "default"];
  if (reserved.includes(slug)) {
    return { available: false };
  }
  
  const dTag = slugToDTag(slug);
  
  try {
    const events = await fetchEventsWithTimeout({
      kinds: [30078],
      "#d": [dTag],
    }, 2000, 60);
    
    if (events.size === 0) {
      return { available: true };
    }
    
    for (const event of events) {
      try {
        if (event.content) {
          const data = JSON.parse(event.content);
          if (data?.treeMeta?.deletedAt) {
            continue;
          }
          return {
            available: false,
            owner: event.pubkey,
          };
        }
      } catch {
        return {
          available: false,
          owner: event.pubkey,
        };
      }
    }
    
    return { available: true };
  } catch (err) {
    return { available: false };
  }
}

export default {
  resolveNip05,
  parseTreePath,
  slugToDTag,
  dTagToSlug,
  fetchUserTrees,
  checkSlugAvailability,
  NOSTREE_PREFIX,
  DEFAULT_SLUG,
};
