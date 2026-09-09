import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useLinkTree } from "../../hooks/useLinkTree";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { LinkEditorV2 } from "./LinkEditorV2";
import { MobilePreview } from "./MobilePreview";
import { TreeSelector, TreeInfo } from "./TreeSelector";
import { AppearanceEditor } from "./AppearanceEditor";
import { EmptyState } from "./EmptyState";
import { Button } from "../ui/Button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { KeyboardShortcutsHelp, KeyboardShortcutsButton } from "../ui/KeyboardShortcutsHelp";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useI18n } from "../../i18n/context";
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Key, 
  Laptop, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff, 
  X,
  ExternalLink,
  ShieldCheck,
  Link2,
  Palette,
  Share2
} from "lucide-react";
import { SocialLinkPreviewModal } from "../ui/SocialLinkPreviewModal";
import { fetchEventsWithTimeout, createNostreeEvent, publishEvent } from "../../lib/ndk";
import { dTagToSlug, isNostreeDTag, slugToDTag } from "../../lib/slug-resolver";
import { toast } from "sonner";
import type { NostreeData } from "../../schemas/nostr";

interface UserProfile {
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
}

function EditorSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 animate-pulse">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-card border border-border rounded-lg" />
            <div className="h-4 w-72 bg-card/60 border border-border/60 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-card border border-border rounded-xl" />
            <div className="h-9 w-28 bg-card border border-border rounded-xl" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-8 bg-card-hover rounded-md" />
                <div className="w-10 h-10 rounded-xl bg-card-hover shrink-0" />
                <div className="space-y-2 flex-1 max-w-xs">
                  <div className="h-4 w-3/4 bg-card-hover rounded-md" />
                  <div className="h-3 w-1/2 bg-card-hover/70 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-card-hover" />
                <div className="w-8 h-8 rounded-lg bg-card-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-24 bg-card border border-border rounded-xl" />
          <div className="h-8 w-24 bg-card border border-border rounded-xl" />
        </div>
        
        <div className="w-[340px] h-[640px] mx-auto rounded-[48px] bg-card border-[7px] border-border/80 p-5 flex flex-col items-center">
          <div className="w-24 h-4 bg-border rounded-full mb-8" />
          <div className="w-18 h-18 rounded-full bg-card-hover mb-4" />
          <div className="h-5 w-32 bg-card-hover rounded-md mb-8" />
          <div className="w-full space-y-3">
            <div className="h-12 w-full rounded-xl bg-card-hover" />
            <div className="h-12 w-full rounded-xl bg-card-hover" />
            <div className="h-12 w-full rounded-xl bg-card-hover" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkTreeEditor({ 
  pubkey, 
  slug, 
  profile,
  initialData,
}: { 
  pubkey: string; 
  slug: string; 
  profile: UserProfile;
  initialData?: NostreeData;
}) {
  const { t } = useI18n();
  const linkTree = useLinkTree({ 
    pubkey,
    slug,
    initialData,
  });

  const [activeTab, setActiveTab] = useState<"links" | "appearance">("links");
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-5 min-w-0">
        <div className="flex items-center justify-between gap-3 p-1.5 bg-card border border-border rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "links"
                  ? "bg-brand text-brand-fg shadow-xs"
                  : "text-txt-muted hover:text-txt-main hover:bg-card-hover"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{t("editor.tabs.links")}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "links" ? "bg-white/20 text-white" : "bg-canvas text-txt-dim"
              }`}>
                {linkTree.links.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "appearance"
                  ? "bg-brand text-brand-fg shadow-xs"
                  : "text-txt-muted hover:text-txt-main hover:bg-card-hover"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t("editor.tabs.appearance")}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {slug && (
              <button
                type="button"
                onClick={() => setIsSocialPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand/10 border border-brand/20 hover:bg-brand/15 text-brand shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
                title={t("socialPreview.modalSubtitle")}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t("socialPreview.buttonLabel")}</span>
              </button>
            )}

            {slug && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-canvas border border-border hover:border-brand/40 text-txt-main shadow-2xs transition-all active:scale-[0.97]"
                title={t("editor.treeSelector.openPageTitle")}
              >
                <span>{t("common.viewLive")}</span>
                <ExternalLink className="w-3 h-3 text-txt-dim" />
              </a>
            )}
          </div>
        </div>

        {activeTab === "links" ? (
          <LinkEditorV2
            links={linkTree.links}
            isSaving={linkTree.isSaving}
            onReorder={linkTree.reorderLinks}
            onAdd={linkTree.addLink}
            onAddGroup={linkTree.addGroup}
            onUpdate={linkTree.updateLink}
            onUpdateGroup={linkTree.updateGroup}
            onDelete={linkTree.deleteLink}
            onDeleteGroup={linkTree.deleteGroup}
            onToggleVisibility={linkTree.toggleVisibility}
            onToggleGroupCollapse={linkTree.toggleGroupCollapse}
            onMoveToGroup={linkTree.moveToGroup}
            onReorderWithinGroup={linkTree.reorderWithinGroup}
          />
        ) : (
          <AppearanceEditor
            currentTheme={linkTree.data?.theme}
            onThemeChange={linkTree.updateTheme}
            headerImage={linkTree.data?.profile?.headerImage}
            onHeaderChange={(headerImage) => linkTree.updateProfile({ headerImage })}
            title={(linkTree.data && "treeMeta" in linkTree.data ? linkTree.data.treeMeta?.title : undefined) || profile?.name}
            onTitleChange={(title) => linkTree.updateTreeMeta({ title })}
            bio={linkTree.data?.profile?.bio || profile?.about}
            onBioChange={(bio) => linkTree.updateProfile({ bio })}
            disabled={linkTree.isSaving}
          />
        )}
      </div>

      <div className="hidden lg:block space-y-4 sticky top-20 self-start">
        <MobilePreview
          profile={profile}
          data={linkTree.data}
          links={linkTree.links as any}
          onAvatarChange={(picture) => linkTree.updateProfile({ picture })}
          onHeaderChange={(headerImage) => linkTree.updateProfile({ headerImage })}
          onTitleChange={(title) => linkTree.updateTreeMeta({ title })}
          disabled={linkTree.isSaving}
        />
      </div>

      <SocialLinkPreviewModal
        isOpen={isSocialPreviewOpen}
        onClose={() => setIsSocialPreviewOpen(false)}
        slug={slug}
        displayName={(linkTree.data && "treeMeta" in linkTree.data ? linkTree.data.treeMeta?.title : undefined) || profile?.name}
        bio={linkTree.data?.profile?.bio || profile?.about}
        avatarUrl={profile?.picture}
        linksCount={linkTree.links.length}
        primaryColor={linkTree.data?.theme?.colors?.primary}
      />
    </div>
  );
}

function KeyBackupModal({
  isOpen,
  onClose,
  privateKey,
  npub,
}: {
  isOpen: boolean;
  onClose: () => void;
  privateKey: string | null;
  npub: string | null;
}) {
  const { t } = useI18n();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !privateKey) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      toast.success(t("qrModal.linkCopied"));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDownload = () => {
    const payload = {
      description: "Nostree account secret key backup",
      warning: "Keep this secret and never share it. Anyone with this key can edit your profile.",
      npub,
      nsec: privateKey,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nostree-backup-${npub?.slice(0, 10) || "key"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("common.saved"));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-txt-main">{t("auth.backupModalTitle")}</h3>
              <p className="text-xs text-txt-muted">{t("auth.backupModalDesc")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-txt-main space-y-1">
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              {t("auth.localKeyWarningTitle")}
            </p>
            <p className="text-txt-muted leading-relaxed">
              {t("auth.localKeyWarningDesc")}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-txt-muted">nsec</label>
              <button
                onClick={() => setShowKey(!showKey)}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKey ? t("editor.links.hideLink") : t("editor.links.showLink")}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={privateKey}
                className="w-full px-3.5 py-2 text-xs bg-canvas border border-border rounded-xl font-mono text-txt-main select-all focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button
              onClick={handleCopy}
              variant="solid"
              size="md"
              className="flex-1 text-xs"
              prefixIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? t("common.copied") : t("auth.copyKey")}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="md"
              className="flex-1 text-xs"
              prefixIcon={<Download className="w-3.5 h-3.5" />}
            >
              {t("auth.downloadKey")}
            </Button>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-txt-dim">
            <span>Nostr Extension (NIP-07)</span>
            <a
              href="https://getalby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
            >
              <span>Alby</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="px-5 py-3 bg-card-hover border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
            {t("auth.done")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function EditorContent() {
  const { t } = useI18n();
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    pubkey, 
    npub, 
    switchToLocalAccount, 
    authMethod, 
    getLocalKey, 
    login 
  } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const claimParam = searchParams.get("claim")?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  const [profile, setProfile] = useState<UserProfile>({});
  const [trees, setTrees] = useState<TreeInfo[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const cached = localStorage.getItem("nostree_cached_trees");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [treesDataMap, setTreesDataMap] = useState<Map<string, NostreeData>>(new Map());
  const [slug, setSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const claim = new URLSearchParams(window.location.search).get("claim")?.trim().toLowerCase();
    if (claim) return claim;
    try {
      return localStorage.getItem("nostree_cached_active_slug") || null;
    } catch {
      return null;
    }
  });
  const [isDataLoading, setIsDataLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const cached = localStorage.getItem("nostree_cached_trees");
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  const [openTreeSelector, setOpenTreeSelector] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [dismissedLocalWarning, setDismissedLocalWarning] = useState(false);

  useKeyboardShortcuts({
    "mod+/": () => setShowKeyboardHelp(true),
    "escape": () => {
      setShowKeyboardHelp(false);
      setShowBackupModal(false);
    },
  }, isAuthenticated && !authLoading);

  useEffect(() => {
    if (!pubkey || !isAuthenticated) return;

    let mounted = true;

    async function loadAdminData() {
      try {
        const events = await fetchEventsWithTimeout({
          kinds: [0, 5, 30078],
          authors: [pubkey!],
        }, 3500, 100);

        if (!mounted) return;

        let latestProfileEvent: any = null;
        const deletedDTags = new Map<string, number>();
        const eventsByDTag = new Map<string, any>();

        for (const event of events) {
          if (event.kind === 0) {
            if (!latestProfileEvent || (event.created_at || 0) > (latestProfileEvent.created_at || 0)) {
              latestProfileEvent = event;
            }
          } else if (event.kind === 5) {
            for (const tag of event.tags) {
              if (tag[0] === "a") {
                const parts = tag[1]?.split(":");
                if (parts && parts[0] === "30078" && parts[1] === pubkey && parts[2]) {
                  const dTag = parts[2];
                  const existingTime = deletedDTags.get(dTag) || 0;
                  const eventTime = event.created_at || 0;
                  if (eventTime > existingTime) {
                    deletedDTags.set(dTag, eventTime);
                  }
                }
              }
            }
          } else if (event.kind === 30078) {
            const dTag = event.tags.find((t: string[]) => t[0] === "d")?.[1];
            if (dTag && isNostreeDTag(dTag)) {
              const existing = eventsByDTag.get(dTag);
              if (!existing || (event.created_at || 0) > (existing.created_at || 0)) {
                eventsByDTag.set(dTag, event);
              }
            }
          }
        }

        if (latestProfileEvent?.content) {
          try {
            const pData = JSON.parse(latestProfileEvent.content);
            setProfile({
              name: pData.name || pData.display_name,
              picture: pData.picture || pData.image,
              about: pData.about,
              nip05: pData.nip05,
              lud16: pData.lud16,
            });
          } catch {}
        }

        const userTrees: TreeInfo[] = [];
        const dataMap = new Map<string, NostreeData>();

        for (const [dTag, event] of eventsByDTag.entries()) {
          const deletionTime = deletedDTags.get(dTag);
          if (deletionTime && (event.created_at || 0) <= deletionTime) {
            continue;
          }

          const parsedSlug = dTagToSlug(dTag);
          if (parsedSlug && parsedSlug !== "default") {
            let treePayload: any = undefined;
            if (event.content) {
              try {
                const parsed = JSON.parse(event.content);
                if (parsed?.treeMeta?.deletedAt) continue;
                if (parsed?.links?.length === 0 && parsed?.treeMeta?.deletedAt !== undefined) continue;
                treePayload = parsed;
                dataMap.set(parsedSlug, parsed);
              } catch {
                continue;
              }
            }

            userTrees.push({
              slug: parsedSlug,
              dTag,
              createdAt: event.created_at,
              data: treePayload,
            });
          }
        }

        if (claimParam && !userTrees.some(t => t.slug === claimParam)) {
          const dTag = slugToDTag(claimParam);
          const newTreeData: NostreeData = {
            version: "2.0",
            treeMeta: {
              slug: claimParam,
              title: claimParam,
              isDefault: false,
              createdAt: Math.floor(Date.now() / 1000),
            },
            links: [],
            socials: [],
            theme: {
              mode: "light",
              colors: {
                background: "#ffffff",
                foreground: "#000000",
                primary: "#5E47B8",
                radius: "0.5rem",
              },
              font: "Inter",
            },
          };
          const newEntry: TreeInfo = {
            slug: claimParam,
            dTag,
            createdAt: Math.floor(Date.now() / 1000),
            data: newTreeData,
          };
          userTrees.push(newEntry);
          dataMap.set(claimParam, newTreeData);

          const event = createNostreeEvent(newTreeData, pubkey!, dTag);
          publishEvent(event).catch(() => {});
        }

        if (userTrees.length > 0) {
          userTrees.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setTrees(userTrees);
          setTreesDataMap(dataMap);

          try {
            localStorage.setItem("nostree_cached_trees", JSON.stringify(userTrees));
            localStorage.setItem(`nostree_trees_${pubkey}`, JSON.stringify(userTrees));
          } catch {}

          if (claimParam && userTrees.some(t => t.slug === claimParam)) {
            setSlug(claimParam);
            try {
              localStorage.setItem("nostree_cached_active_slug", claimParam);
              localStorage.setItem(`nostree_active_slug_${pubkey}`, claimParam);
            } catch {}
            searchParams.delete("claim");
            setSearchParams(searchParams, { replace: true });
          } else {
            setSlug(prev => {
              const active = (prev && userTrees.some(t => t.slug === prev)) ? prev : userTrees[0].slug;
              try {
                localStorage.setItem("nostree_cached_active_slug", active);
                localStorage.setItem(`nostree_active_slug_${pubkey}`, active);
              } catch {}
              return active;
            });
          }
        } else {
          const cached = localStorage.getItem(`nostree_trees_${pubkey}`) || localStorage.getItem("nostree_cached_trees");
          if (cached) {
            try {
              const parsed: TreeInfo[] = JSON.parse(cached);
              if (parsed.length > 0) {
                setTrees(parsed);
                const active = localStorage.getItem(`nostree_active_slug_${pubkey}`) || localStorage.getItem("nostree_cached_active_slug") || parsed[0].slug;
                setSlug(active);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        if (mounted) {
          setIsDataLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, [pubkey, isAuthenticated, claimParam]);

  if (authLoading) {
    return <LoadingOverlay message={t("common.connecting")} showProgress />;
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-txt-muted text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  const localPrivateKey = getLocalKey();

  const handleSlugChange = (newSlug: string | null) => {
    setSlug(newSlug);
    if (newSlug) {
      try {
        localStorage.setItem("nostree_cached_active_slug", newSlug);
        if (pubkey) localStorage.setItem(`nostree_active_slug_${pubkey}`, newSlug);
      } catch {}
    }
  };

  const handleTreeCreated = (newSlug: string, newTreeData?: any) => {
    const newEntry: TreeInfo = {
      slug: newSlug,
      dTag: slugToDTag(newSlug),
      createdAt: Math.floor(Date.now() / 1000),
      data: newTreeData,
    };
    setTrees(prev => {
      const updated = [...prev, newEntry];
      try {
        localStorage.setItem("nostree_cached_trees", JSON.stringify(updated));
        if (pubkey) localStorage.setItem(`nostree_trees_${pubkey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (newTreeData) {
      setTreesDataMap(prev => new Map(prev).set(newSlug, newTreeData));
    }
    setSlug(newSlug);
    try {
      localStorage.setItem("nostree_cached_active_slug", newSlug);
      if (pubkey) localStorage.setItem(`nostree_active_slug_${pubkey}`, newSlug);
    } catch {}
  };

  const handleTreeDeleted = (deletedSlug: string) => {
    setTrees(prev => {
      const remaining = prev.filter(t => t.slug !== deletedSlug);
      const nextActive = remaining.length > 0 ? remaining[0].slug : null;
      if (slug === deletedSlug) {
        setSlug(nextActive);
      }
      try {
        localStorage.setItem("nostree_cached_trees", JSON.stringify(remaining));
        if (pubkey) localStorage.setItem(`nostree_trees_${pubkey}`, JSON.stringify(remaining));
        if (nextActive) {
          localStorage.setItem("nostree_cached_active_slug", nextActive);
          if (pubkey) localStorage.setItem(`nostree_active_slug_${pubkey}`, nextActive);
        } else {
          localStorage.removeItem("nostree_cached_active_slug");
          if (pubkey) localStorage.removeItem(`nostree_active_slug_${pubkey}`);
        }
      } catch {}
      return remaining;
    });
    setTreesDataMap(prev => {
      const next = new Map(prev);
      next.delete(deletedSlug);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
              <img src={logo} alt="Nostree" className="w-7 h-7 object-contain" />
              <span className="text-base font-bold text-txt-main tracking-tight hidden sm:inline">Nostree</span>
            </Link>

            {slug && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-canvas border border-border text-txt-muted hover:text-txt-main hover:border-brand/40 transition-colors"
              >
                <span>/{slug}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <TreeSelector
              pubkey={pubkey || ""}
              currentSlug={slug}
              onSlugChange={handleSlugChange}
              onTreeCreated={handleTreeCreated}
              onTreeDeleted={handleTreeDeleted}
              forceOpen={openTreeSelector}
              onOpenChange={setOpenTreeSelector}
              trees={trees}
              isLoading={isDataLoading}
            />

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-border-hover transition-colors shadow-xs active:scale-[0.98]"
              >
                {profile.picture ? (
                  <img 
                    src={profile.picture} 
                    alt="" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-txt-muted" />
                )}
                <span className="text-xs text-txt-muted font-mono hidden md:inline">
                  {npub?.slice(0, 8)}...
                </span>
                {authMethod === "local" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="This browser only" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Extension synced" />
                )}
                <ChevronDown className="w-3 h-3 text-txt-dim" />
              </button>

              {showAccountMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAccountMenu(false)} 
                  />
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-pop"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3 mb-2">
                        {profile.picture ? (
                          <img 
                            src={profile.picture} 
                            alt="" 
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-card-hover flex items-center justify-center">
                            <User className="w-4 h-4 text-txt-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-txt-main truncate text-xs">
                            {profile.name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-txt-dim font-mono truncate">
                            {npub}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        {authMethod === "local" ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                            <Laptop className="w-3 h-3" />
                            <span>{t("auth.browserOnlyBadge")}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t("auth.extensionSyncedBadge")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {authMethod === "local" ? (
                        <>
                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setShowBackupModal(true);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs font-medium cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5 text-brand" />
                            <span>{t("auth.backupKey")}</span>
                          </button>

                          <button
                            onClick={async () => {
                              setShowAccountMenu(false);
                              const ok = await login();
                              if (ok) {
                                toast.success(t("auth.switchedToExtension"));
                              } else {
                                toast.error(t("auth.extensionNotFound"));
                              }
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs font-medium cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{t("auth.switchToExtension")}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              setShowAccountMenu(false);
                              const ok = await switchToLocalAccount();
                              if (ok) {
                                toast.success(t("auth.switchedToLocal"));
                              } else {
                                toast.error(t("common.error"));
                              }
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs font-medium cursor-pointer"
                          >
                            <Laptop className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t("auth.switchToLocal")}</span>
                          </button>

                          <button
                            onClick={async () => {
                              setShowAccountMenu(false);
                              await switchToLocalAccount();
                              toast.success(t("auth.extensionDisconnected"));
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-card-hover transition-colors text-txt-muted w-full text-left text-xs cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{t("auth.disconnectExtension")}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <LanguageToggle />
            <KeyboardShortcutsButton onClick={() => setShowKeyboardHelp(true)} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      <AnimatePresence>
        {showBackupModal && (
          <KeyBackupModal
            isOpen={showBackupModal}
            onClose={() => setShowBackupModal(false)}
            privateKey={localPrivateKey}
            npub={npub}
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {authMethod === "local" && !dismissedLocalWarning && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Key className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-txt-main">
                    {t("auth.localKeyWarningTitle")}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {t("auth.browserOnlyBadge")}
                  </span>
                </div>
                <p className="text-[11px] text-txt-muted">
                  {t("auth.localKeyWarningDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBackupModal(true)}
                prefixIcon={<Key className="w-3 h-3" />}
                className="text-xs h-7 px-2.5 font-semibold bg-card border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15"
              >
                {t("auth.backupButton")}
              </Button>
              <button
                onClick={() => setDismissedLocalWarning(true)}
                className="p-1 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card/50 transition-colors"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {isDataLoading ? (
          <EditorSkeleton />
        ) : slug ? (
          <LinkTreeEditor 
            key={slug} 
            pubkey={pubkey || ""} 
            slug={slug} 
            profile={profile}
            initialData={treesDataMap.get(slug)}
          />
        ) : (
          <EmptyState onCreateTree={() => setOpenTreeSelector(true)} />
        )}
      </main>
    </div>
  );
}

export function EditorApp() {
  return <EditorContent />;
}

export default EditorApp;
