import { useState, useCallback, useOptimistic, startTransition, useEffect } from "react";
import { slugToDTag, DEFAULT_SLUG } from "../lib/slug-resolver";
import type { Link, LinkItem, LinkGroup, NostreeData, Theme, TreeMeta, ProfileOverride } from "../schemas/nostr";
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
  | { type: "reorder"; links: LinkItem[] }
  | { type: "add"; link: Link }
  | { type: "add_group"; group: LinkGroup }
  | { type: "delete"; id: string }
  | { type: "update"; link: Link }
  | { type: "update_group"; group: LinkGroup }
  | { type: "toggle_visibility"; id: string }
  | { type: "toggle_group_collapse"; groupId: string }
  | { type: "move_to_group"; linkId: string; groupId: string | null }
  | { type: "reorder_within_group"; groupId: string; links: Link[] };

/**
 * Reducer for optimistic link updates
 */
function linkReducer(state: LinkItem[], action: LinkAction): LinkItem[] {
  switch (action.type) {
    case "reorder":
      return action.links;
    case "add":
      return [...state, action.link];
    case "add_group":
      return [...state, action.group];
    case "delete":
      return state.filter(item => {
        if ('type' in item && item.type === 'group') {
          // Don't delete groups by link deletion
          return true;
        }
        return item.id !== action.id;
      }).map(item => {
        // Also remove from groups
        if ('type' in item && item.type === 'group') {
          return {
            ...item,
            links: item.links.filter(l => l.id !== action.id)
          };
        }
        return item;
      });
    case "update":
      return state.map(item => {
        if ('type' in item && item.type === 'group') {
          // Update link within group
          return {
            ...item,
            links: item.links.map(l => l.id === action.link.id ? action.link : l)
          };
        }
        return item.id === action.link.id ? action.link : item;
      });
    case "update_group":
      return state.map(item => 
        ('type' in item && item.type === 'group' && item.id === action.group.id) 
          ? action.group 
          : item
      );
    case "toggle_visibility":
      return state.map(item => {
        if ('type' in item && item.type === 'group') {
          if (item.id === action.id) {
            return { ...item, visible: !item.visible };
          }
          return {
            ...item,
            links: item.links.map(l => 
              l.id === action.id ? { ...l, visible: !l.visible } : l
            )
          };
        }
        return item.id === action.id ? { ...item, visible: !item.visible } : item;
      });
    case "toggle_group_collapse":
      return state.map(item => 
        ('type' in item && item.type === 'group' && item.id === action.groupId)
          ? { ...item, collapsed: !item.collapsed }
          : item
      );
    case "move_to_group": {
      // Find and extract the link
      let linkToMove: Link | null = null;
      
      // Remove link from current position
      const withoutLink = state.filter(item => {
        if ('type' in item && item.type === 'group') {
          return true; // Keep groups for now
        }
        if (item.id === action.linkId) {
          linkToMove = item as Link;
          return false;
        }
        return true;
      }).map(item => {
        if ('type' in item && item.type === 'group') {
          const foundInGroup = item.links.find(l => l.id === action.linkId);
          if (foundInGroup) {
            linkToMove = foundInGroup;
            return {
              ...item,
              links: item.links.filter(l => l.id !== action.linkId)
            };
          }
        }
        return item;
      });
      
      if (!linkToMove) return state;
      
      // Add to target (group or root)
      if (action.groupId === null) {
        // Move to root level
        return [...withoutLink, linkToMove];
      } else {
        // Move to specific group
        return withoutLink.map(item => 
          ('type' in item && item.type === 'group' && item.id === action.groupId)
            ? { ...item, links: [...item.links, linkToMove!] }
            : item
        );
      }
    }
    case "reorder_within_group":
      return state.map(item =>
        ('type' in item && item.type === 'group' && item.id === action.groupId)
          ? { ...item, links: action.links }
          : item
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
  links: LinkItem[];
  /** Full Nostree data */
  data: NostreeData | null;
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Saving state (publishing to relays) */
  isSaving: boolean;
  /** Error message */
  error: string | null;
  /** Reorder links */
  reorderLinks: (newOrder: LinkItem[]) => Promise<void>;
  /** Add a new link */
  addLink: (link: Omit<Link, "id">) => Promise<void>;
  /** Add a new group */
  addGroup: (group: Omit<LinkGroup, "id" | "type" | "links">) => Promise<void>;
  /** Update an existing link */
  updateLink: (link: Link) => Promise<void>;
  /** Update a group */
  updateGroup: (group: LinkGroup) => Promise<void>;
  /** Delete a link */
  deleteLink: (id: string) => Promise<void>;
  /** Delete a group */
  deleteGroup: (id: string) => Promise<void>;
  /** Toggle link visibility */
  toggleVisibility: (id: string) => Promise<void>;
  /** Toggle group collapse state */
  toggleGroupCollapse: (groupId: string) => Promise<void>;
  /** Move link to a group (or root if groupId is null) */
  moveToGroup: (linkId: string, groupId: string | null) => Promise<void>;
  /** Reorder links within a group */
  reorderWithinGroup: (groupId: string, links: Link[]) => Promise<void>;
  /** Update theme */
  updateTheme: (theme: Theme) => Promise<void>;
  /** Update tree metadata (title, etc.) */
  updateTreeMeta: (updates: Partial<TreeMeta>) => Promise<void>;
  /** Update profile overrides (headerImage, etc.) */
  updateProfile: (updates: Partial<ProfileOverride>) => Promise<void>;
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
  const publishData = useCallback(async (newLinks: LinkItem[]): Promise<boolean> => {
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
  const reorderLinks = useCallback(async (newOrder: LinkItem[]) => {
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
    
    // Update link in root or within groups
    const newLinks = currentLinks.map(item => {
      if ('type' in item && item.type === 'group') {
        return {
          ...item,
          links: item.links.map(l => l.id === link.id ? link : l)
        };
      }
      return item.id === link.id ? link : item;
    });
    
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
    
    // Remove from root or from groups
    const newLinks = currentLinks.filter(item => {
      if ('type' in item && item.type === 'group') {
        return true; // Keep groups
      }
      return item.id !== id;
    }).map(item => {
      if ('type' in item && item.type === 'group') {
        return {
          ...item,
          links: item.links.filter(l => l.id !== id)
        };
      }
      return item;
    });
    
    startTransition(() => {
      applyOptimistic({ type: "delete", id });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Add a new group
   */
  const addGroup = useCallback(async (groupData: Omit<LinkGroup, "id" | "type" | "links">) => {
    const newGroup: LinkGroup = {
      ...groupData,
      id: crypto.randomUUID(),
      type: "group",
      links: [],
      visible: true,
      collapsed: groupData.collapsed ?? false,
    };
    
    const currentLinks = data?.links || [];
    const newLinks = [...currentLinks, newGroup];
    
    startTransition(() => {
      applyOptimistic({ type: "add_group", group: newGroup });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Update a group
   */
  const updateGroup = useCallback(async (group: LinkGroup) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item => 
      ('type' in item && item.type === 'group' && item.id === group.id) 
        ? group 
        : item
    );
    
    startTransition(() => {
      applyOptimistic({ type: "update_group", group });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Delete a group (moves its links to root)
   */
  const deleteGroup = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    
    // Find the group and extract its links
    let linksToMove: Link[] = [];
    const newLinks = currentLinks.filter(item => {
      if ('type' in item && item.type === 'group' && item.id === id) {
        linksToMove = item.links;
        return false; // Remove the group
      }
      return true;
    });
    
    // Add the group's links to the root level
    const finalLinks = [...newLinks, ...linksToMove];
    
    startTransition(() => {
      applyOptimistic({ type: "delete", id });
    });
    
    await publishData(finalLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Toggle group collapse state
   */
  const toggleGroupCollapse = useCallback(async (groupId: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item =>
      ('type' in item && item.type === 'group' && item.id === groupId)
        ? { ...item, collapsed: !item.collapsed }
        : item
    );
    
    startTransition(() => {
      applyOptimistic({ type: "toggle_group_collapse", groupId });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Move a link to a group (or root if groupId is null)
   */
  const moveToGroup = useCallback(async (linkId: string, groupId: string | null) => {
    const currentLinks = data?.links || [];
    
    // Find and extract the link
    let linkToMove: Link | null = null;
    
    const withoutLink = currentLinks.filter(item => {
      if ('type' in item && item.type === 'group') {
        return true; // Keep groups for now
      }
      if (item.id === linkId) {
        linkToMove = item as Link;
        return false;
      }
      return true;
    }).map(item => {
      if ('type' in item && item.type === 'group') {
        const foundInGroup = item.links.find(l => l.id === linkId);
        if (foundInGroup) {
          linkToMove = foundInGroup;
          return {
            ...item,
            links: item.links.filter(l => l.id !== linkId)
          };
        }
      }
      return item;
    });
    
    if (!linkToMove) return;
    
    // Add to target (group or root)
    let newLinks: LinkItem[];
    if (groupId === null) {
      // Move to root level
      newLinks = [...withoutLink, linkToMove];
    } else {
      // Move to specific group
      newLinks = withoutLink.map(item => 
        ('type' in item && item.type === 'group' && item.id === groupId)
          ? { ...item, links: [...item.links, linkToMove!] }
          : item
      );
    }
    
    startTransition(() => {
      applyOptimistic({ type: "move_to_group", linkId, groupId });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Reorder links within a specific group
   */
  const reorderWithinGroup = useCallback(async (groupId: string, links: Link[]) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item =>
      ('type' in item && item.type === 'group' && item.id === groupId)
        ? { ...item, links }
        : item
    );
    
    startTransition(() => {
      applyOptimistic({ type: "reorder_within_group", groupId, links });
    });
    
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  /**
   * Toggle visibility
   */
  const toggleVisibility = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    
    // Handle both links and groups
    const newLinks = currentLinks.map(item => {
      if ('type' in item && item.type === 'group') {
        if (item.id === id) {
          return { ...item, visible: !item.visible };
        }
        // Also check links within groups
        return {
          ...item,
          links: item.links.map(l => 
            l.id === id ? { ...l, visible: !l.visible } : l
          )
        };
      }
      return item.id === id ? { ...item, visible: !item.visible } : item;
    });
    
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

  /**
   * Update profile overrides (headerImage, name, bio, etc.)
   */
  const updateProfile = useCallback(async (updates: Partial<ProfileOverride>) => {
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
        profile: {
          show_verification: true,
          ...currentData.profile,
          ...updates,
        },
      };
      
      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        setData(updatedData);
        toast.success("Profile updated!", {
          description: `Saved to ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Profile update failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Profile update failed", {
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
    addGroup,
    updateLink,
    updateGroup,
    deleteLink,
    deleteGroup,
    toggleVisibility,
    toggleGroupCollapse,
    moveToGroup,
    reorderWithinGroup,
    updateTheme,
    updateTreeMeta,
    updateProfile,
    refresh: fetchData,
  };
}

export default useLinkTree;
