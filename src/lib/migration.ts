import type { 
  NostreeData, 
  NostreeDataV1, 
  NostreeDataV2, 
  Theme 
} from "../schemas/nostr";
import { NostreeDataSchema } from "../schemas/nostr";
import { DEFAULT_SLUG } from "./slug-resolver";

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

export function isV1Data(data: NostreeData): data is NostreeDataV1 {
  return data.version === "1.0";
}

export function isV2Data(data: NostreeData): data is NostreeDataV2 {
  return data.version === "2.0";
}

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
  
  if (isV1Data(data)) {
    return {
      success: true,
      data: migrateV1toV2(data, slug || DEFAULT_SLUG),
    };
  }
  
  return { success: true, data };
}

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
