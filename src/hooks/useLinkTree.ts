import { useState, useCallback, useOptimistic, startTransition, useEffect } from "react";
import { slugToDTag, DEFAULT_SLUG } from "../lib/slug-resolver";
import type { Link, LinkItem, LinkGroup, NostreeData, Theme, TreeMeta, ProfileOverride } from "../schemas/nostr";
import { NostreeDataSchema } from "../schemas/nostr";
import { 
  fetchEventsWithTimeout, 
  publishEvent, 
  createNostreeEvent 
} from "../lib/ndk";
import { toast } from "sonner";

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
          return true;
        }
        return item.id !== action.id;
      }).map(item => {
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
      let linkToMove: Link | null = null;
      
      const withoutLink = state.filter(item => {
        if ('type' in item && item.type === 'group') {
          return true;
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
      
      if (action.groupId === null) {
        return [...withoutLink, linkToMove];
      } else {
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

export interface UseLinkTreeOptions {
  pubkey: string;
  slug?: string;
  initialData?: NostreeData;
}

export interface UseLinkTreeReturn {
  links: LinkItem[];
  data: NostreeData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  reorderLinks: (newOrder: LinkItem[]) => Promise<void>;
  addLink: (link: Omit<Link, "id">) => Promise<void>;
  addGroup: (group: Omit<LinkGroup, "id" | "type" | "links">) => Promise<void>;
  updateLink: (link: Link) => Promise<void>;
  updateGroup: (group: LinkGroup) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  toggleGroupCollapse: (groupId: string) => Promise<void>;
  moveToGroup: (linkId: string, groupId: string | null) => Promise<void>;
  reorderWithinGroup: (groupId: string, links: Link[]) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateTreeMeta: (updates: Partial<TreeMeta>) => Promise<void>;
  updateProfile: (updates: Partial<ProfileOverride>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLinkTree({ pubkey, slug = DEFAULT_SLUG, initialData }: UseLinkTreeOptions): UseLinkTreeReturn {
  const [data, setData] = useState<NostreeData | null>(() => {
    if (initialData) {
      const validated = NostreeDataSchema.safeParse(initialData);
      if (validated.success) return validated.data;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dTag = slug === DEFAULT_SLUG ? "nostree-data-v1" : slugToDTag(slug);
  const authoritativeLinks = data?.links || [];

  const [optimisticLinks, applyOptimistic] = useOptimistic(
    authoritativeLinks,
    linkReducer
  );

  useEffect(() => {
    if (initialData) {
      const validated = NostreeDataSchema.safeParse(initialData);
      if (validated.success) {
        setData(validated.data);
        setIsLoading(false);
        return;
      }
    }

    if (!pubkey || !slug) return;

    setIsLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const events = await fetchEventsWithTimeout({
          kinds: [30078],
          authors: [pubkey],
          "#d": [dTag],
        }, 1800, 60);

        if (cancelled) return;

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
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pubkey, dTag, slug, initialData]);

  const fetchData = useCallback(async () => {
    if (!data) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const events = await fetchEventsWithTimeout({
        kinds: [30078],
        authors: [pubkey],
        "#d": [dTag],
      }, 1800, 60);

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
      if (!data) {
        setError("Failed to fetch data from relays");
      }
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, dTag, data]);

  const publishData = useCallback(async (newLinks: LinkItem[]): Promise<boolean> => {
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
      
      setData(updatedData);

      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
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
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag, slug]);

  const reorderLinks = useCallback(async (newOrder: LinkItem[]) => {
    startTransition(() => {
      applyOptimistic({ type: "reorder", links: newOrder });
    });
    await publishData(newOrder);
  }, [applyOptimistic, publishData]);

  const addLink = useCallback(async (linkData: Omit<Link, "id">) => {
    const newLink: Link = {
      ...linkData,
      id: crypto.randomUUID(),
    };
    const currentLinks = data?.links || [];
    const newLinks = [...currentLinks, newLink];
    startTransition(() => {
      applyOptimistic({ type: "add", link: newLink });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const addGroup = useCallback(async (groupData: Omit<LinkGroup, "id" | "type" | "links">) => {
    const newGroup: LinkGroup = {
      ...groupData,
      id: crypto.randomUUID(),
      type: "group",
      links: [],
    };
    const currentLinks = data?.links || [];
    const newLinks = [...currentLinks, newGroup];
    startTransition(() => {
      applyOptimistic({ type: "add_group", group: newGroup });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const updateLink = useCallback(async (updatedLink: Link) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item => {
      if ('type' in item && item.type === 'group') {
        return {
          ...item,
          links: item.links.map(l => l.id === updatedLink.id ? updatedLink : l)
        };
      }
      return item.id === updatedLink.id ? updatedLink : item;
    });
    startTransition(() => {
      applyOptimistic({ type: "update", link: updatedLink });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const updateGroup = useCallback(async (updatedGroup: LinkGroup) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item => 
      ('type' in item && item.type === 'group' && item.id === updatedGroup.id)
        ? updatedGroup
        : item
    );
    startTransition(() => {
      applyOptimistic({ type: "update_group", group: updatedGroup });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const deleteLink = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.filter(item => {
      if ('type' in item && item.type === 'group') {
        return true;
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

  const deleteGroup = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.filter(item => 
      !('type' in item && item.type === 'group' && item.id === id)
    );
    startTransition(() => {
      applyOptimistic({ type: "delete", id });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const toggleVisibility = useCallback(async (id: string) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item => {
      if ('type' in item && item.type === 'group') {
        if (item.id === id) {
          return { ...item, visible: !item.visible };
        }
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

  const moveToGroup = useCallback(async (linkId: string, groupId: string | null) => {
    const currentLinks = data?.links || [];
    let linkToMove: Link | null = null;
    
    const withoutLink = currentLinks.filter(item => {
      if ('type' in item && item.type === 'group') {
        return true;
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
    
    let newLinks: LinkItem[];
    if (groupId === null) {
      newLinks = [...withoutLink, linkToMove];
    } else {
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

  const reorderWithinGroup = useCallback(async (groupId: string, newGroupLinks: Link[]) => {
    const currentLinks = data?.links || [];
    const newLinks = currentLinks.map(item => 
      ('type' in item && item.type === 'group' && item.id === groupId)
        ? { ...item, links: newGroupLinks }
        : item
    );
    startTransition(() => {
      applyOptimistic({ type: "reorder_within_group", groupId, links: newGroupLinks });
    });
    await publishData(newLinks);
  }, [data, applyOptimistic, publishData]);

  const updateTheme = useCallback(async (theme: Theme) => {
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
      
      setData(updatedData);

      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        toast.success("Theme updated!", {
          description: `Saved to ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Theme update failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
      toast.error("Theme update failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag, slug]);

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
          slug: currentData.treeMeta.slug,
        },
      };
      
      setData(updatedData);

      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        toast.success("Saved!", {
          description: `Updated on ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Save failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, pubkey, dTag, slug]);

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
      
      setData(updatedData);

      const event = createNostreeEvent(updatedData, pubkey, dTag);
      const result = await publishEvent(event);
      
      if (result.success) {
        toast.success("Profile updated!", {
          description: `Saved to ${result.relaysAccepted} relay${result.relaysAccepted !== 1 ? 's' : ''}`,
        });
      } else {
        toast.error("Profile update failed", {
          description: "Could not publish to any relays",
        });
      }
    } catch (err) {
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
