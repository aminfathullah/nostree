
import { useState, useEffect } from "react";
import { fetchUserTrees, slugToDTag, checkSlugAvailability } from "../../lib/slug-resolver";
import { publishEvent, createNostreeEvent } from "../../lib/ndk";
import { Button } from "../ui/Button";
import { Plus, ChevronDown, Trash2, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TreeInfo {
  slug: string;
  dTag: string;
  createdAt?: number;
}

interface TreeSelectorProps {
  pubkey: string;
  currentSlug: string | null;
  onSlugChange: (slug: string | null) => void;
  onTreeCreated?: (slug: string) => void;
  /** External control to force open the dropdown */
  forceOpen?: boolean;
  /** Callback when dropdown open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * TreeSelector - Tree management component for the editor
 * Allows users to create, select, and manage multiple trees
 */
export function TreeSelector({ pubkey, currentSlug, onSlugChange, onTreeCreated, forceOpen, onOpenChange }: TreeSelectorProps) {
  const [trees, setTrees] = useState<TreeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync external forceOpen state
  useEffect(() => {
    if (forceOpen !== undefined && forceOpen !== isDropdownOpen) {
      setIsDropdownOpen(forceOpen);
      // When force opening, go directly to create mode if no trees exist
      if (forceOpen && trees.length === 0) {
        setIsCreating(true);
      }
    }
  }, [forceOpen]);

  // Wrapper to handle dropdown state changes
  const handleDropdownChange = (open: boolean) => {
    setIsDropdownOpen(open);
    onOpenChange?.(open);
    if (!open) {
      setIsCreating(false);
      setNewSlug("");
      setSlugError(null);
    }
  };

  // Fetch user's trees on mount
  useEffect(() => {
    async function loadTrees() {
      if (!pubkey) {
        setIsLoading(false);
        setTrees([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // fetchEventsWithTimeout handles NDK connection internally
        const userTrees = await fetchUserTrees(pubkey);
        setTrees(userTrees);
        
        // If user has trees but none selected, select the first one
        if (userTrees.length > 0 && !currentSlug) {
          onSlugChange(userTrees[0].slug);
        } else if (userTrees.length === 0) {
          // No trees exist - user starts with 0 trees
          onSlugChange(null);
        }
      } catch (err) {
        console.error("Failed to fetch trees:", err);
        // Start with no trees on error
        setTrees([]);
        onSlugChange(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTrees();
  }, [pubkey]);

  // Validate slug format
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
    // Reserved slugs (including "default" which was previously auto-created)
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
    
    // Set creating state to show loading
    setIsLoading(true);
    
    try {
      // GLOBAL CHECK: Check if slug is available across ALL users
      const availability = await checkSlugAvailability(newSlug);
      if (!availability.available) {
        const message = availability.owner === pubkey
          ? "You already have a tree with this slug"
          : "This slug is already taken by another user";
        setSlugError(message);
        toast.error("Slug unavailable", { description: message });
        setIsLoading(false);
        return;
      }
      
      // Create the tree data
      const dTag = slugToDTag(newSlug);
      const newTreeData = {
        version: "2.0" as const,
        treeMeta: {
          slug: newSlug,
          title: newSlug, // Use slug as default title, user can change later
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
      
      // Publish to Nostr IMMEDIATELY
      const event = createNostreeEvent(newTreeData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (!result.success || result.relaysAccepted === 0) {
        toast.error("Failed to create tree", {
          description: "Could not publish to any relays. Please try again.",
        });
        setIsLoading(false);
        return;
      }
      
      // Add to local list and switch to it
      const newTree: TreeInfo = {
        slug: newSlug,
        dTag: dTag,
        createdAt: Math.floor(Date.now() / 1000),
      };
      
      setTrees(prev => [...prev, newTree]);
      onSlugChange(newSlug);
      onTreeCreated?.(newSlug);
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
      setIsLoading(false);
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
    // Note: No longer have a "default" tree that can't be deleted
    // All user-created trees can be deleted
    
    // Confirm deletion
    if (!window.confirm(`Delete tree "/${slug}"? This will permanently remove all links in this tree.`)) {
      return;
    }
    

    
    // Remove from local list IMMEDIATELY
    setTrees(prev => {
      const filtered = prev.filter(t => t.slug !== slug);
      return filtered;
    });
    
    // If we deleted the currently active tree, switch to first available or null
    if (slug === currentSlug) {
      const remaining = trees.filter(t => t.slug !== slug);
      onSlugChange(remaining.length > 0 ? remaining[0].slug : null);
    }
    
    toast.success(`Tree "/${slug}" deleted`);
    
    // Try to publish empty data to Nostr in background (fire and forget)
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
      // Don't await - let it run in background
      publishEvent(event).then(result => {
        if (result.success) {
          // Success - silently handled in background
        } else {
          console.warn("Could not publish tree deletion to relays");
        }
      }).catch(err => {
        console.error("Failed to publish tree deletion:", err);
      });
    } catch (err) {
      console.error("Failed to create delete event:", err);
    }
  };

  const currentTreeLabel = currentSlug ? `/${currentSlug}` : "No Tree Selected";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin text-txt-muted" />
        <span className="text-sm text-txt-muted">Loading trees...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main selector button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDropdownChange(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors"
        >
          <span className="text-sm font-medium text-txt-main">{currentTreeLabel}</span>
          <ChevronDown className={`w-4 h-4 text-txt-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Copy URL button */}
        <button
          onClick={handleCopyUrl}
          className="p-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors"
          title="Copy public URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-txt-muted" />
          )}
        </button>
        
        {/* Open in new tab */}
        <a
          href={`/${currentSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors"
          title="View public page"
        >
          <ExternalLink className="w-4 h-4 text-txt-muted" />
        </a>
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Tree list */}
          <div className="max-h-48 overflow-y-auto">
            {trees.map((tree) => (
              <div
                key={tree.slug}
                className={`flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors ${
                  tree.slug === currentSlug ? 'bg-brand/10' : ''
                }`}
              >
                <button
                  onClick={() => {
                    onSlugChange(tree.slug);
                    handleDropdownChange(false);
                  }}
                  className="flex-1 text-left"
                >
                  <span className="text-sm font-medium text-txt-main">
                    {`/${tree.slug}`}
                  </span>
                  {tree.slug === currentSlug && (
                    <span className="ml-2 text-xs text-brand">Active</span>
                  )}
                </button>
                {/* Delete button */}
                {(
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const slugToDelete = tree.slug;
                      // Don't close dropdown here, let handleDeleteTree handle it or do it after
                      // Call delete directly - confirm is inside the function
                      handleDeleteTree(slugToDelete);
                      // Close dropdown after the specific action is initiated/confirmed
                      handleDropdownChange(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors group"
                    title={`Delete /${tree.slug}`}
                  >
                    <Trash2 className="w-4 h-4 text-txt-dim group-hover:text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Divider */}
          <div className="border-t border-border" />
          
          {/* New tree section */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-card-hover transition-colors text-brand"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create New Tree</span>
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-txt-muted block mb-1">Custom slug</label>
                <div className="flex items-center gap-1 bg-canvas border border-border rounded-lg px-3 py-2">
                  <span className="text-txt-dim text-sm">/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setSlugError(null);
                    }}
                    placeholder="my-links"
                    className="flex-1 bg-transparent text-sm text-txt-main focus:outline-none"
                    autoFocus
                  />
                </div>
                {slugError && (
                  <p className="text-xs text-red-400 mt-1">{slugError}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateTree}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setNewSlug("");
                    setSlugError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => handleDropdownChange(false)}
        />
      )}
    </div>
  );
}

export default TreeSelector;
