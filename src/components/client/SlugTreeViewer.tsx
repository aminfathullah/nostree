import { useState, useEffect } from "react";
import { resolveCanonicalSlugEvent } from "../../lib/slug-resolver";
import { parseNostreeData } from "../../lib/migration";
import { fetchEventsWithTimeout } from "../../lib/ndk";
import type { NostreeDataV2 } from "../../schemas/nostr";
import PublicTreeViewer from "./PublicTreeViewer";

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
  const [treeData, setTreeData] = useState<NostreeDataV2 | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    let foundAny = false;

    async function loadTree() {
      setStatus("loading");
      setError(null);

      try {
        const resolution = await resolveCanonicalSlugEvent(slug, (liveResolution) => {
          if (cancelled || !liveResolution.data) return;
          const result = parseNostreeData(liveResolution.data, slug);
          if (result.success) {
            foundAny = true;
            setTreeData(result.data);
            setStatus("ready");
          }
        });

        if (cancelled) return;

        if (resolution.status === "claimed" && resolution.data) {
          const result = parseNostreeData(resolution.data, slug);
          if (result.success) {
            foundAny = true;
            setTreeData(result.data);
            setStatus("ready");

            const ownerPubkey = resolution.ownerPubkey || resolution.event?.pubkey;
            if (ownerPubkey) {
              fetchEventsWithTimeout({
                kinds: [0],
                authors: [ownerPubkey],
              }, 1500).then(profileEvents => {
                if (cancelled || profileEvents.size === 0) return;
                const sorted = Array.from(profileEvents).sort(
                  (a, b) => (b.created_at || 0) - (a.created_at || 0)
                );
                const ev = sorted[0];
                if (ev?.content) {
                  try {
                    const data = JSON.parse(ev.content);
                    setProfile({
                      pubkey: ownerPubkey,
                      name: data.name || data.display_name,
                      about: data.about,
                      picture: data.picture || data.image,
                      banner: data.banner,
                      nip05: data.nip05,
                      lud16: data.lud16,
                    });
                  } catch {}
                }
              });
            }
            return;
          }
        }

        if (!foundAny) {
          setError(`Page "/${slug}" was not found`);
          setStatus("error");
        }
      } catch {
        if (!cancelled && !foundAny) {
          setError(`Page "/${slug}" was not found`);
          setStatus("error");
        }
      }
    }

    if (slug) {
      loadTree();
    }

    return () => {
      cancelled = true;
    };
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
