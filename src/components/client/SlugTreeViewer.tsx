import { useState, useEffect } from "react";
import { resolveCanonicalSlugEvent } from "../../lib/slug-resolver";
import { parseNostreeData } from "../../lib/migration";
import { fetchEventsWithTimeout } from "../../lib/ndk";
import type { NostreeDataV2 } from "../../schemas/nostr";
import PublicTreeViewer from "./PublicTreeViewer";

const profileCache = new Map<string, { data: UserProfile; ts: number }>();
const PROFILE_CACHE_TTL = 600000;

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

export function SlugTreeViewer({ slug }: SlugTreeViewerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [treeData, setTreeData] = useState<NostreeDataV2 | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadComplete = false;
    
    async function loadTree() {
      try {
        setStatus("loading");
        const resolution = await resolveCanonicalSlugEvent(slug);
        
        if (cancelled) return;
        
        if (resolution.status !== "claimed" || !resolution.event || !resolution.data) {
          setError(`Halaman "/${slug}" tidak ditemukan`);
          setStatus("error");
          return;
        }
        
        const event = resolution.event;
        const result = parseNostreeData(resolution.data, slug);
        
        if (!result.success) {
          setError("Gagal memuat data tautan");
          setStatus("error");
          return;
        }
        
        setTreeData(result.data);
        setStatus("ready");
        
        const ownerPubkey = event.pubkey;
        const cachedProfile = profileCache.get(ownerPubkey);
        
        if (cachedProfile && Date.now() - cachedProfile.ts < PROFILE_CACHE_TTL) {
          setProfile(cachedProfile.data);
        } else {
          fetchEventsWithTimeout({
            kinds: [0],
            authors: [ownerPubkey],
          }, 1500, 80).then(profileEvents => {
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
        if (!cancelled) {
          setError("Failed to load tree");
          setStatus("error");
        }
      } finally {
        loadComplete = true;
      }
    }
    
    if (slug) {
      loadTree();
      
      const timeout = setTimeout(() => {
        if (!loadComplete && !cancelled) {
          setError(`Tree "${slug}" not found`);
          setStatus("error");
        }
      }, 2500);
      
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }
  }, [slug]);

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

export default SlugTreeViewer;
