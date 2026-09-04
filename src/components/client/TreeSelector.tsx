import { useState, useEffect } from "react";
import { fetchUserTrees, slugToDTag, checkSlugAvailability } from "../../lib/slug-resolver";
import { publishEvent, createNostreeEvent, createDeletionEvent } from "../../lib/ndk";
import { Button } from "../ui/Button";
import { Plus, ChevronDown, Trash2, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
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

  const handleDeleteTree = (slug: string) => {
    if (!window.confirm(`Delete tree "/${slug}"? This will permanently remove all links in this tree.`)) {
      return;
    }
    
    setInternalTrees(prev => prev.filter(t => t.slug !== slug));
    
    if (slug === currentSlug) {
      const remaining = trees.filter(t => t.slug !== slug);
      const nextSlug = remaining.length > 0 ? remaining[0].slug : null;
      onSlugChange(nextSlug);
    }
    
    toast.success(`Tree "/${slug}" deleted`);
    
    try {
      const dTag = slugToDTag(slug);
      const emptyData = {
        version: "2.0" as const,
        treeMeta: {
          slug,
          isDefault: false,
          deletedAt: Math.floor(Date.now() / 1000),
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
      publishEvent(event).catch(err => {
        console.error("Failed to publish tree deletion:", err);
      });
      const delEvent = createDeletionEvent(pubkey, dTag);
      publishEvent(delEvent).catch(() => {});
    } catch (err) {
      console.error("Failed to create delete event:", err);
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
          onClick={() => handleDropdownChange(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl hover:border-border-hover transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <span className="text-xs sm:text-sm font-semibold text-txt-main">{currentTreeLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-txt-muted transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {currentSlug && (
          <>
            <button
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
          <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-pop origin-top-left">
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {trees.map((tree) => (
                <div
                  key={tree.slug}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl hover:bg-card-hover transition-colors ${
                    tree.slug === currentSlug ? 'bg-brand/10' : ''
                  }`}
                >
                  <button
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
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteTree(tree.slug);
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
    </div>
  );
}

export default TreeSelector;
