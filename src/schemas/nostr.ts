import { z } from "zod";

// ============================================
// ENUMS
// ============================================

/**
 * Theme mode options
 */
export const ThemeIdEnum = z.enum(["dark", "light", "custom"]);

/**
 * Button styling variants
 */
export const ButtonStyleEnum = z.enum(["solid", "outline", "glass", "ghost"]);

/**
 * Supported social platforms
 */
export const PlatformEnum = z.enum([
  "twitter",
  "instagram",
  "youtube",
  "github",
  "linkedin",
  "tiktok",
  "twitch",
  "nostr",
  "website",
  "telegram",
  "discord",
  "facebook",
  "spotify",
  "soundcloud",
  "medium",
  "substack",
]);

/**
 * Font family options
 */
export const FontEnum = z.enum(["Inter", "Roboto", "Serif", "Mono"]);

/**
 * Border radius options
 */
export const RadiusEnum = z.enum(["0", "0.5rem", "1rem", "9999px"]);

// ============================================
// SUB-SCHEMAS
// ============================================

/**
 * Individual link schema
 */
export const LinkSchema = z.object({
  /** Unique identifier for the link */
  id: z.string().uuid(),
  
  /** Display title for the link */
  title: z.string().min(1, "Title is required").max(64, "Title too long"),
  
  /** Destination URL */
  url: z.string().url("Invalid URL format"),
  
  /** Optional emoji icon */
  emoji: z.string().optional(),
  
  /** Whether the link is visible on the public profile */
  visible: z.boolean().default(true),
  
  /** Click count (for analytics) */
  clicks: z.number().int().nonnegative().optional().default(0),
  
  /** Optional scheduling window */
  schedule: z
    .object({
      start: z.number().optional(), // Unix timestamp
      end: z.number().optional(),   // Unix timestamp
    })
    .optional(),
});

/**
 * Social media link schema
 */
export const SocialSchema = z.object({
  /** Platform identifier */
  platform: PlatformEnum,
  
  /** Profile URL on the platform */
  url: z.string().url("Invalid social URL"),
});

/**
 * Theme configuration schema
 */
export const ThemeSchema = z.object({
  /** Theme mode (dark/light/custom) */
  mode: ThemeIdEnum,
  
  /** Color configuration */
  colors: z.object({
    /** Background color (hex or url for image) */
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$|^url\(/, "Invalid background"),
    
    /** Foreground/text color (hex) */
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid foreground color"),
    
    /** Primary/accent color (hex) */
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid primary color"),
    
    /** Border radius for buttons/cards */
    radius: RadiusEnum,
  }),
  
  /** Font family */
  font: FontEnum.default("Inter"),
});

/**
 * Profile override schema
 */
export const ProfileOverrideSchema = z.object({
  /** Override the name from Kind 0 */
  name: z.string().max(32, "Name too long").optional(),
  
  /** Override the bio from Kind 0 */
  bio: z.string().max(160, "Bio too long").optional(),
  
  /** Whether to show NIP-05 verification badge */
  show_verification: z.boolean().default(true),
  
  /** Custom profile picture URL (overrides Kind 0 picture) */
  picture: z.string().optional(),
  
  /** Header/banner image URL (displayed above profile) */
  headerImage: z.string().optional(),
});

/**
 * Tree metadata schema (for multi-tree support)
 */
export const TreeMetaSchema = z.object({
  /** URL slug for this tree (e.g., "portfolio", "music") */
  slug: z.string()
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(1, "Slug required")
    .max(32, "Slug too long"),
  
  /** Display title for this tree */
  title: z.string().max(64, "Title too long").optional(),
  
  /** Whether this is the user's default tree */
  isDefault: z.boolean().default(false),
  
  /** Created timestamp */
  createdAt: z.number().optional(),
});

// ============================================
// MAIN SCHEMA (Kind 30078 Content)
// ============================================

/**
 * Main Nostree data schema v2.0
 * Supports multiple trees per user with custom slugs
 */
export const NostreeDataSchemaV2 = z.object({
  /** Schema version */
  version: z.literal("2.0"),
  
  /** Tree metadata (slug, title, isDefault) */
  treeMeta: TreeMetaSchema,
  
  /** Optional profile overrides */
  profile: ProfileOverrideSchema.optional(),
  
  /** Array of links (max 50) */
  links: z.array(LinkSchema).max(50, "Maximum 50 links allowed"),
  
  /** Array of social links (max 10) */
  socials: z.array(SocialSchema).max(10, "Maximum 10 social links allowed"),
  
  /** Theme configuration */
  theme: ThemeSchema,
});

/**
 * Legacy v1.0 schema (backward compatible)
 */
export const NostreeDataSchemaV1 = z.object({
  version: z.literal("1.0"),
  profile: ProfileOverrideSchema.optional(),
  links: z.array(LinkSchema).max(50),
  socials: z.array(SocialSchema).max(10),
  theme: ThemeSchema,
});

/**
 * Combined schema that accepts both versions
 * Use parseNostreeData() for type-safe parsing with migration
 */
export const NostreeDataSchema = z.union([NostreeDataSchemaV2, NostreeDataSchemaV1]);

// ============================================
// TYPE EXPORTS
// ============================================

export type ThemeId = z.infer<typeof ThemeIdEnum>;
export type ButtonStyle = z.infer<typeof ButtonStyleEnum>;
export type Platform = z.infer<typeof PlatformEnum>;
export type Font = z.infer<typeof FontEnum>;
export type Radius = z.infer<typeof RadiusEnum>;

export type Link = z.infer<typeof LinkSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ProfileOverride = z.infer<typeof ProfileOverrideSchema>;
export type TreeMeta = z.infer<typeof TreeMetaSchema>;
export type NostreeDataV2 = z.infer<typeof NostreeDataSchemaV2>;
export type NostreeDataV1 = z.infer<typeof NostreeDataSchemaV1>;
export type NostreeData = z.infer<typeof NostreeDataSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate Nostree data and return result
 */
export function validateNostreeData(data: unknown): {
  success: boolean;
  data?: NostreeData;
  errors?: z.ZodError;
} {
  const result = NostreeDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Check if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
