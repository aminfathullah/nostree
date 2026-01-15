import * as React from "react";
import { useState, useEffect } from "react";
import { fetchUserTrees, slugToDTag, DEFAULT_SLUG } from "../../lib/slug-resolver";
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
  currentSlug: string;
  onSlugChange: (slug: string) => void;
  onTreeCreated?: (slug: string) => void;
}

/**
 * TreeSelector - Tree management component for the editor
 * Allows users to create, select, and manage multiple trees
 */
export function TreeSelector({ pubkey, currentSlug, onSlugChange, onTreeCreated }: TreeSelectorProps) {
  const [trees, setTrees] = useState<TreeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch user's trees on mount
  useEffect(() => {
    async function loadTrees() {
      if (!pubkey) {
        setIsLoading(false);
        setTrees([{ slug: DEFAULT_SLUG, dTag: slugToDTag(DEFAULT_SLUG) }]);
        return;
      }
      
      setIsLoading(true);
      try {
        // fetchEventsWithTimeout handles NDK connection internally
        const userTrees = await fetchUserTrees(pubkey);
        setTrees(userTrees);
        
        // If no trees exist, start with default
        if (userTrees.length === 0) {
          setTrees([{ slug: DEFAULT_SLUG, dTag: slugToDTag(DEFAULT_SLUG) }]);
        }
      } catch (err) {
        console.error("Failed to fetch trees:", err);
        // Start with default on error
        setTrees([{ slug: DEFAULT_SLUG, dTag: slugToDTag(DEFAULT_SLUG) }]);
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
    // Reserved slugs
    const reserved = ["admin", "login", "profile", "api", "u", "settings", "help", "about"];
    if (reserved.includes(slug)) {
      return "This slug is reserved";
    }
    return null;
  };

  const handleCreateTree = () => {
    const error = validateSlug(newSlug);
    if (error) {
      setSlugError(error);
      return;
    }
    
    // Add to local list and switch to it
    const newTree: TreeInfo = {
      slug: newSlug,
      dTag: slugToDTag(newSlug),
      createdAt: Math.floor(Date.now() / 1000),
    };
    
    setTrees(prev => [...prev, newTree]);
    onSlugChange(newSlug);
    onTreeCreated?.(newSlug);
    setIsCreating(false);
    setNewSlug("");
    setSlugError(null);
    
    toast.success("Tree created!", {
      description: `Your tree is available at /${newSlug}`,
    });
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${currentSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied!");
  };

  const currentTreeLabel = currentSlug === DEFAULT_SLUG ? "Default Tree" : `/${currentSlug}`;

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
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
              <button
                key={tree.slug}
                onClick={() => {
                  onSlugChange(tree.slug);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-card-hover transition-colors ${
                  tree.slug === currentSlug ? 'bg-brand/10' : ''
                }`}
              >
                <span className="text-sm font-medium text-txt-main">
                  {tree.slug === DEFAULT_SLUG ? "Default Tree" : `/${tree.slug}`}
                </span>
                {tree.slug === currentSlug && (
                  <span className="text-xs text-brand">Active</span>
                )}
              </button>
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
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default TreeSelector;
