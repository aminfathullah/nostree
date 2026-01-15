import { useState, useCallback, useOptimistic, startTransition, useEffect } from "react";
import { slugToDTag, DEFAULT_SLUG } from "../lib/slug-resolver";
import type { Link, NostreeData, Theme, TreeMeta } from "../schemas/nostr";
import { NostreeDataSchema } from "../schemas/nostr";
import { 
  getNDK, 
  fetchEventsWithTimeout, 
  publishEvent, 
  createNostreeEvent 
} from "../lib/ndk";
import { toast } from "sonner";

/**
 * Link action types for optimistic reducer
 */
type LinkAction = 
  | { type: "reorder"; links: Link[] }
  | { type: "add"; link: Link }
  | { type: "delete"; id: string }
  | { type: "update"; link: Link }
  | { type: "toggle_visibility"; id: string };

/**
 * Reducer for optimistic link updates
 */
function linkReducer(state: Link[], action: LinkAction): Link[] {
  switch (action.type) {
    case "reorder":
      return action.links;
    case "add":
      return [...state, action.link];
    case "delete":
      return state.filter(l => l.id !== action.id);
    case "update":
      return state.map(l => l.id === action.link.id ? action.link : l);
    case "toggle_visibility":
      return state.map(l => 
        l.id === action.id ? { ...l, visible: !l.visible } : l
      );
    default:
      return state;
  }
}

interface UseLinkTreeOptions {
  pubkey: string;
  slug?: string;
  initialData?: NostreeData;
}

interface UseLinkTreeReturn {
  /** Links with optimistic updates applied */
  links: Link[];
  /** Full Nostree data */
  data: NostreeData | null;
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Saving state (publishing to relays) */
  isSaving: boolean;
  /** Error message */
  error: string | null;
  /** Reorder links */
  reorderLinks: (newOrder: Link[]) => Promise<void>;
  /** Add a new link */
  addLink: (link: Omit<Link, "id">) => Promise<void>;
  /** Update an existing link */
  updateLink: (link: Link) => Promise<void>;
  /** Delete a link */
  deleteLink: (id: string) => Promise<void>;
  /** Toggle link visibility */
  toggleVisibility: (id: string) => Promise<void>;
  /** Update theme */
  updateTheme: (theme: Theme) => Promise<void>;
  /** Update tree metadata (title, etc.) */
  updateTreeMeta: (updates: Partial<TreeMeta>) => Promise<void>;
  /** Refresh data from relays */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing Nostree links with optimistic updates
 * Uses React 19 useOptimistic for instant UI feedback
 */
export function useLinkTree({ pubkey, slug = DEFAULT_SLUG, initialData }: UseLinkTreeOptions): UseLinkTreeReturn {
  const [data, setData] = useState<NostreeData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed d-tag
  const dTag = slug === DEFAULT_SLUG ? "nostree-data-v1" : slugToDTag(slug);

  // Authoritative links from state
  const authoritativeLinks = data?.links || [];

  // Optimistic links for instant UI updates
  const [optimisticLinks, applyOptimistic] = useOptimistic(
    authoritativeLinks,
    linkReducer
  );

  // Auto-fetch when slug or pubkey changes
  useEffect(() => {
    if (pubkey) {
      // Clear old data first to prevent showing stale links
      setData(null);
      setIsLoading(true);
      
      // Fetch new data for this tree
      (async () => {
        try {
          const events = await fetchEventsWithTimeout({
            kinds: [30078],
            authors: [pubkey],
            "#d": [dTag],
          }, 10000);

          if (events.size > 0) {
            const sorted = Array.from(events).sort(
              (a, b) => (b.created_at || 0) - (a.created_at || 0)
            );
            const latest = sorted[0];
            
            if (latest?.content) {
              const parsed = JSON.parse(latest.content);
              const validated = NostreeDataSchema.safeParse(parsed);
              
              if (validated.success) {
                setData(validated.data);
              }
            }
          }
        } catch (err) {
          setError("Failed to fetch data from relays");
          console.error("useLinkTree fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [pubkey, dTag]);

  /**
   * Fetch data from relays
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const events = await fetchEventsWithTimeout({
        kinds: [30078],
        authors: [pubkey],
        "#d": [dTag],
      }, 10000);

      if (events.size > 0) {
        const sorted = Array.from(events).sort(
          (a, b) => (b.created_at || 0) - (a.created_at || 0)
        );
        const latest = sorted[0];
        
        if (latest?.content) {
          const parsed = JSON.parse(latest.content);
          const validated = NostreeDataSchema.safeParse(parsed);
          
          if (validated.success) {
            setData(validated.data);
          }
        }
      } else if (slug === DEFAULT_SLUG) {
         // Fallback/Legacy check
      }
    } catch (err) {
      setError("Failed to fetch data from relays");
      console.error("useLinkTree fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, dTag]);

  /**
   * Publish updated data to relays
   */
  const publishData = useCallback(async (newLinks: Link[]): Promise<boolean> => {
    // allow saving even if data is null (creating new)
    const currentData: NostreeData = data || { 
      version: "2.0",
      treeMeta: {
        slug: slug,
        isDefault: slug === DEFAULT_SLUG,
        createdAt: Math.floor(Date.now() / 1000),
      },
      links: [],
      socials: [],
      theme: {
        mode: "light",
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: "#000000",
          radius: "0.5rem",
        },
        font: "Inter",
      }
    };
    
    setIsSaving(true);
    
    try {
      const updatedData: NostreeData = {
        ...currentData,
        links: newLinks,
      };
      
      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        setData(updatedData);
        toast.success("Saved!", {
          description: `Published to ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
        return true;
      } else {
        toast.error("Save failed", {
          description: "Could not publish to any relays",
        });
        return false;
      }
    } catch (err) {
      console.error("Publish error:", err);
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag]);

  /**
   * Reorder links
   */
  const reorderLinks = useCallback(async (newOrder: Link[]) => {
    // Apply optimistic update immediately
    startTransition(() => {
      applyOptimistic({ type: "reorder", links: newOrder });
    });
    
    // Publish in background
    await publishData(newOrder);
  }, [applyOptimistic, publishData]);

  /**
   * Add a new link
   */
  const addLink = useCallback(async (linkData: Omit<Link, "id">) => {
    const newLink: Link = {
      ...linkData,
      id: crypto.randomUUID(),
      visible: linkData.visible ?? true,
    };
    
    // Use current data.links to avoid stale closure issues on tree switch
    const currentLinks = data?.links || [];
    const newLinks = [...currentLinks, newLink];
    
    startTransition(() => {
      applyOptimistic({ type: "add", link: newLink });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Update a link
   */
  const updateLink = useCallback(async (link: Link) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(l => 
      l.id === link.id ? link : l
    );
    
    startTransition(() => {
      applyOptimistic({ type: "update", link });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Delete a link
   */
  const deleteLink = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.filter(l => l.id !== id);
    
    startTransition(() => {
      applyOptimistic({ type: "delete", id });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Toggle visibility
   */
  const toggleVisibility = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    );
    
    startTransition(() => {
      applyOptimistic({ type: "toggle_visibility", id });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Update theme
   */
  const updateTheme = useCallback(async (theme: Theme) => {
    // Merge with existing data to create new data object with updated theme
    const currentData: NostreeData = data || { 
      version: "2.0",
      treeMeta: {
        slug: slug,
        isDefault: slug === DEFAULT_SLUG,
        createdAt: Math.floor(Date.now() / 1000),
      },
      links: [],
      socials: [],
      theme: {
        mode: "light",
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: "#000000",
          radius: "0.5rem",
        },
        font: "Inter",
      }
    };
    
    setIsSaving(true);
    
    try {
      const updatedData: NostreeData = {
        ...currentData,
        theme,
      };
      
      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        setData(updatedData);
        toast.success("Theme updated!", {
          description: `Saved to ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Theme update failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
      console.error("Theme update error:", err);
      toast.error("Theme update failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag, slug]);

  /**
   * Update tree metadata (title, etc.)
   */
  const updateTreeMeta = useCallback(async (updates: Partial<TreeMeta>) => {
    const currentData: NostreeData = data || { 
      version: "2.0",
      treeMeta: {
        slug: slug,
        isDefault: slug === DEFAULT_SLUG,
        createdAt: Math.floor(Date.now() / 1000),
      },
      links: [],
      socials: [],
      theme: {
        mode: "light",
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: "#000000",
          radius: "0.5rem",
        },
        font: "Inter",
      }
    };
    
    setIsSaving(true);
    
    try {
      const updatedData: NostreeData = {
        ...currentData,
        treeMeta: {
          ...currentData.treeMeta,
          ...updates,
          // Don't allow overwriting slug from updates
          slug: currentData.treeMeta.slug,
        },
      };
      
      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        setData(updatedData);
        toast.success("Saved!", {
          description: `Updated on ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Save failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
      console.error("Tree meta update error:", err);
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag, slug]);

  return {
    links: optimisticLinks,
    data,
    isLoading,
    isSaving,
    error,
    reorderLinks,
    addLink,
    updateLink,
    deleteLink,
    toggleVisibility,
    updateTheme,
    updateTreeMeta,
    refresh: fetchData,
  };
}

export default useLinkTree;
