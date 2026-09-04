import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { fetchUserTrees, slugToDTag, checkSlugAvailability } from "../../lib/slug-resolver";
import { publishEvent, createNostreeEvent, createDeletionEvent } from "../../lib/ndk";
import { Button } from "../ui/Button";
import { Plus, ChevronDown, Trash2, Copy, Check, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export interface TreeInfo {
  slug: string;
  dTag: string;
  createdAt?: number;
  data?: any;
}

interface TreeSelectorProps {
  pubkey: string;
  currentSlug: string | null;
  onSlugChange: (slug: string | null) => void;
  onTreeCreated?: (slug: string, newTreeData?: any) => void;
  onTreeDeleted?: (slug: string) => void;
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trees?: TreeInfo[];
  isLoading?: boolean;
}

export function TreeSelector({ 
  pubkey, 
  currentSlug, 
  onSlugChange, 
  onTreeCreated, 
  onTreeDeleted,
  forceOpen, 
  onOpenChange,
  trees: propTrees,
  isLoading: propIsLoading,
}: TreeSelectorProps) {
  const [internalTrees, setInternalTrees] = useState<TreeInfo[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(!propTrees);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<string | null>(null);
  const [isDeletingTree, setIsDeletingTree] = useState(false);

  const trees = propTrees !== undefined ? propTrees : internalTrees;
  const isLoading = propIsLoading !== undefined ? propIsLoading : internalLoading;

  useEffect(() => {
    if (forceOpen !== undefined && forceOpen !== isDropdownOpen) {
      setIsDropdownOpen(forceOpen);
      if (forceOpen && trees.length === 0) {
        setIsCreating(true);
      }
    }
  }, [forceOpen]);

  const handleDropdownChange = (open: boolean) => {
    setIsDropdownOpen(open);
    onOpenChange?.(open);
    if (!open) {
      setIsCreating(false);
      setNewSlug("");
      setSlugError(null);
    }
  };

  useEffect(() => {
    if (propTrees !== undefined) return;
    if (!pubkey) {
      setInternalTrees([]);
      setInternalLoading(false);
      return;
    }

    let mounted = true;

    async function loadTrees() {
      try {
        const userTrees = await fetchUserTrees(pubkey);
        if (!mounted) return;
        setInternalTrees(userTrees);
        
        if (userTrees.length > 0 && !currentSlug) {
          onSlugChange(userTrees[0].slug);
        } else if (userTrees.length === 0) {
          onSlugChange(null);
        }
      } catch (err) {
        console.error("Failed to fetch trees:", err);
      } finally {
        if (mounted) {
          setInternalLoading(false);
        }
      }
    }
    
    loadTrees();

    return () => {
      mounted = false;
    };
  }, [pubkey, propTrees]);

  const validateSlug = (slug: string): string | null => {
    if (!slug) return "Slug is required";
    if (slug.length < 2) return "Slug must be at least 2 characters";
    if (slug.length > 32) return "Slug must be 32 characters or less";
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug)) {
      return "Only lowercase letters, numbers, and hyphens allowed";
    }
    if (trees.some(t => t.slug === slug)) {
      return "You already have a tree with this slug";
    }
    const reserved = ["admin", "login", "profile", "api", "u", "settings", "help", "about", "default"];
    if (reserved.includes(slug)) {
      return "This slug is reserved";
    }
    return null;
  };

  const handleCreateTree = async () => {
    const error = validateSlug(newSlug);
    if (error) {
      setSlugError(error);
      return;
    }
    
    setInternalLoading(true);
    
    try {
      const availability = await checkSlugAvailability(newSlug);
      if (!availability.available) {
        const message = availability.owner === pubkey
          ? "You already have a tree with this slug"
          : "This slug is already taken by another user";
        setSlugError(message);
        toast.error("Slug unavailable", { description: message });
        setInternalLoading(false);
        return;
      }
      
      const dTag = slugToDTag(newSlug);
      const newTreeData = {
        version: "2.0" as const,
        treeMeta: {
          slug: newSlug,
          title: newSlug,
          isDefault: false,
          createdAt: Math.floor(Date.now() / 1000),
        },
        links: [],
        socials: [],
        theme: {
          mode: "light" as const,
          colors: {
            background: "#ffffff",
            foreground: "#000000",
            primary: "#5E47B8",
            radius: "0.5rem",
          },
          font: "Inter",
        },
      };
      
      const event = createNostreeEvent(newTreeData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (!result.success || result.relaysAccepted === 0) {
        toast.error("Failed to create tree", {
          description: "Could not publish to any relays. Please try again.",
        });
        setInternalLoading(false);
        return;
      }
      
      const newTree: TreeInfo = {
        slug: newSlug,
        dTag: dTag,
        createdAt: Math.floor(Date.now() / 1000),
        data: newTreeData,
      };
      
      setInternalTrees(prev => [...prev, newTree]);
      onSlugChange(newSlug);
      onTreeCreated?.(newSlug, newTreeData);
      setIsCreating(false);
      setNewSlug("");
      setSlugError(null);
      
      toast.success("Tree created!", {
        description: `Published to ${result.relaysAccepted} relays. Available at /${newSlug}`,
      });
    } catch (err) {
      console.error("Failed to create tree:", err);
      toast.error("Failed to create tree", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${currentSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied!");
  };

  const executeDeleteTree = async (slug: string) => {
    setIsDeletingTree(true);
    try {
      setInternalTrees(prev => prev.filter(t => t.slug !== slug));
      onTreeDeleted?.(slug);
      
      if (slug === currentSlug) {
        const remaining = trees.filter(t => t.slug !== slug);
        const nextSlug = remaining.length > 0 ? remaining[0].slug : null;
        onSlugChange(nextSlug);
      }
      
      const dTag = slugToDTag(slug);
      const now = Math.floor(Date.now() / 1000);
      const emptyData = {
        version: "2.0" as const,
        treeMeta: {
          slug,
          isDefault: false,
          deletedAt: now,
        },
        links: [],
        socials: [],
        theme: {
          mode: "light" as const,
          colors: {
            background: "#ffffff",
            foreground: "#000000",
            primary: "#000000",
            radius: "0.5rem",
          },
          font: "Inter",
        },
      };
      
      const event = createNostreeEvent(emptyData, pubkey, dTag);
      event.created_at = now;
      const delEvent = createDeletionEvent(pubkey, dTag);
      delEvent.created_at = now;

      await Promise.allSettled([
        publishEvent(event),
        publishEvent(delEvent)
      ]);

      toast.success(`Halaman "/${slug}" berhasil dihapus`);
    } catch (err) {
      console.error("Failed to delete tree:", err);
      toast.error("Gagal menghapus halaman");
    } finally {
      setIsDeletingTree(false);
      setTreeToDelete(null);
    }
  };

  const currentTreeLabel = currentSlug ? `/${currentSlug}` : "No Tree Selected";

  if (isLoading && trees.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl shadow-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-txt-muted" />
        <span className="text-xs text-txt-muted font-medium">Memuat pohon...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleDropdownChange(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl hover:border-border-hover transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <span className="text-xs sm:text-sm font-semibold text-txt-main">{currentTreeLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-txt-muted transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {currentSlug && (
          <>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-2 bg-card border border-border rounded-xl hover:border-border-hover transition-colors shadow-xs cursor-pointer active:scale-[0.95]"
              title="Salin tautan publik"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-txt-muted" />
              )}
            </button>
            
            <a
              href={`/${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-card border border-border rounded-xl hover:border-border-hover transition-colors shadow-xs cursor-pointer active:scale-[0.95]"
              title="Buka halaman publik"
            >
              <ExternalLink className="w-3.5 h-3.5 text-txt-muted" />
            </a>
          </>
        )}
      </div>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => handleDropdownChange(false)}
          />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-pop origin-top-left"
          >
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {trees.map((tree) => (
                <div
                  key={tree.slug}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl hover:bg-card-hover transition-colors ${
                    tree.slug === currentSlug ? 'bg-brand/10' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSlugChange(tree.slug);
                      handleDropdownChange(false);
                    }}
                    className="flex-1 text-left cursor-pointer min-w-0 pr-2"
                  >
                    <span className="text-xs font-semibold text-txt-main truncate block">
                      {`/${tree.slug}`}
                    </span>
                    {tree.slug === currentSlug && (
                      <span className="text-[10px] text-brand font-medium">Aktif</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTreeToDelete(tree.slug);
                      handleDropdownChange(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors cursor-pointer group active:scale-[0.92]"
                    title={`Hapus /${tree.slug}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-txt-dim group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border" />
            
            {!isCreating ? (
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-card-hover transition-colors text-brand text-xs font-semibold cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Pohon Tautan Baru</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-txt-muted block mb-1">Slug / URL</label>
                  <div className="flex items-center gap-1.5 bg-canvas border border-border rounded-xl px-3 py-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <span className="text-txt-dim text-xs font-mono">/</span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setSlugError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTree();
                        }
                      }}
                      placeholder="tautan-anda"
                      className="flex-1 bg-transparent text-xs text-txt-main focus:outline-none font-mono"
                      autoFocus
                    />
                  </div>
                  {slugError && (
                    <p className="text-xs text-red-500 mt-1">{slugError}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateTree}
                    className="flex-1 text-xs"
                  >
                    Buat
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false);
                      setNewSlug("");
                      setSlugError(null);
                    }}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {treeToDelete && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => !isDeletingTree && setTreeToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elevated overflow-hidden animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-txt-main">Hapus Halaman Tautan?</h3>
                  <p className="text-xs font-mono text-txt-muted">/{treeToDelete}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeletingTree}
                onClick={() => setTreeToDelete(null)}
                className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 space-y-1">
                <p className="font-semibold">Tindakan ini permanen di jaringan Nostr</p>
                <p className="text-txt-muted leading-relaxed">
                  Semua tautan dan konfigurasi pada halaman ini akan dihapus. Setelah dihapus, nama slug <span className="font-mono font-semibold text-txt-main">/{treeToDelete}</span> akan dilepaskan dan dapat didaftarkan kembali.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-canvas/60 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                id="btn-cancel-delete-tree"
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeletingTree}
                onClick={() => setTreeToDelete(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                id="btn-confirm-delete-tree"
                type="button"
                variant="solid"
                size="sm"
                disabled={isDeletingTree}
                onClick={() => executeDeleteTree(treeToDelete)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer active:scale-[0.98]"
                prefixIcon={isDeletingTree ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              >
                {isDeletingTree ? "Menghapus..." : "Hapus Halaman"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default TreeSelector;
