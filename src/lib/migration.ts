import type { 
  NostreeData, 
  NostreeDataV1, 
  NostreeDataV2, 
  Theme 
} from "../schemas/nostr";
import { 
  NostreeDataSchema, 
  NostreeDataSchemaV1, 
  NostreeDataSchemaV2 
} from "../schemas/nostr";
import { DEFAULT_SLUG } from "./slug-resolver";

/**
 * Default theme for new trees
 */
export const DEFAULT_THEME: Theme = {
  mode: "dark",
  colors: {
    background: "#09090b",
    foreground: "#f4f4f5",
    primary: "#8b5cf6",
    radius: "0.5rem",
  },
  font: "Inter",
};

/**
 * Check if data is v1.0 format
 */
export function isV1Data(data: NostreeData): data is NostreeDataV1 {
  return data.version === "1.0";
}

/**
 * Check if data is v2.0 format
 */
export function isV2Data(data: NostreeData): data is NostreeDataV2 {
  return data.version === "2.0";
}

/**
 * Migrate v1.0 data to v2.0 format
 * @param data - v1.0 data
 * @param slug - slug to assign (defaults to "default")
 */
export function migrateV1toV2(data: NostreeDataV1, slug: string = DEFAULT_SLUG): NostreeDataV2 {
  return {
    version: "2.0",
    treeMeta: {
      slug,
      title: data.profile?.name || undefined,
      isDefault: slug === DEFAULT_SLUG,
      createdAt: Date.now(),
    },
    profile: data.profile,
    links: data.links,
    socials: data.socials,
    theme: data.theme,
  };
}

/**
 * Parse and optionally migrate Nostree data
 * Returns v2.0 format data
 */
export function parseNostreeData(
  raw: unknown, 
  slug?: string
): { success: true; data: NostreeDataV2 } | { success: false; error: string } {
  const result = NostreeDataSchema.safeParse(raw);
  
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues[0]?.message || "Invalid data format" 
    };
  }
  
  const data = result.data;
  
  // If v1.0, migrate to v2.0
  if (isV1Data(data)) {
    return {
      success: true,
      data: migrateV1toV2(data, slug || DEFAULT_SLUG),
    };
  }
  
  // Already v2.0
  return { success: true, data };
}

/**
 * Create a new empty tree with default values
 */
export function createEmptyTree(slug: string, title?: string): NostreeDataV2 {
  return {
    version: "2.0",
    treeMeta: {
      slug,
      title: title || undefined,
      isDefault: slug === DEFAULT_SLUG,
      createdAt: Date.now(),
    },
    links: [],
    socials: [],
    theme: DEFAULT_THEME,
  };
}

export default {
  parseNostreeData,
  migrateV1toV2,
  createEmptyTree,
  isV1Data,
  isV2Data,
  DEFAULT_THEME,
};
