import { z } from "zod";

export const ThemeIdEnum = z.enum(["dark", "light", "custom"]);

export const ButtonStyleEnum = z.enum(["solid", "outline", "glass", "ghost"]);

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

export const FontEnum = z.enum(["Inter", "Roboto", "Serif", "Mono"]);

export const RadiusEnum = z.enum(["0", "0.5rem", "1rem", "9999px"]);

export const LinkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(64, "Title too long"),
  subtitle: z.string().max(128, "Subtitle too long").optional(),
  url: z.string().url("Invalid URL format"),
  icon: z.string().optional(),
  emoji: z.string().optional(),
  badge: z.string().max(24).optional(),
  highlight: z.boolean().optional(),
  visible: z.boolean().default(true),
  clicks: z.number().int().nonnegative().optional().default(0),
  schedule: z
    .object({
      start: z.number().optional(),
      end: z.number().optional(),
    })
    .optional(),
});

export const LinkGroupSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("group"),
  title: z.string().min(1, "Group title is required").max(64, "Title too long"),
  emoji: z.string().optional(),
  collapsed: z.boolean().default(false),
  visible: z.boolean().default(true),
  links: z.array(LinkSchema).max(30, "Maximum 30 links per group"),
});

export const LinkItemSchema = z.union([
  LinkSchema,
  LinkGroupSchema,
]);

export const SocialSchema = z.object({
  platform: PlatformEnum,
  url: z.string().url("Invalid social URL"),
});

export const ThemeSchema = z.object({
  mode: ThemeIdEnum,
  colors: z.object({
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$|^url\(/, "Invalid background"),
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid foreground color"),
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid primary color"),
    radius: RadiusEnum,
  }),
  font: FontEnum.default("Inter"),
});

export const ProfileOverrideSchema = z.object({
  name: z.string().max(32, "Name too long").optional(),
  bio: z.string().max(160, "Bio too long").optional(),
  phone: z.string().max(32, "Phone too long").optional(),
  email: z.string().email("Invalid email").optional(),
  show_verification: z.boolean().default(true),
  picture: z.string().optional(),
  headerImage: z.string().optional(),
});

export const TreeMetaSchema = z.object({
  slug: z.string()
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, "Slug must be lowercase alphanumeric with hyphens")
    .min(1, "Slug required")
    .max(32, "Slug too long"),
  title: z.string().max(64, "Title too long").optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.number().optional(),
  deletedAt: z.number().optional(),
});

export const NostreeDataSchemaV2 = z.object({
  version: z.literal("2.0"),
  treeMeta: TreeMetaSchema,
  profile: ProfileOverrideSchema.optional(),
  links: z.array(LinkItemSchema).max(50, "Maximum 50 links/groups allowed"),
  socials: z.array(SocialSchema).max(10, "Maximum 10 social links allowed"),
  theme: ThemeSchema,
});

export const NostreeDataSchemaV1 = z.object({
  version: z.literal("1.0"),
  profile: ProfileOverrideSchema.optional(),
  links: z.array(LinkItemSchema).max(50),
  socials: z.array(SocialSchema).max(10),
  theme: ThemeSchema,
});

export const NostreeDataSchema = z.union([NostreeDataSchemaV2, NostreeDataSchemaV1]);

export type ThemeId = z.infer<typeof ThemeIdEnum>;
export type ButtonStyle = z.infer<typeof ButtonStyleEnum>;
export type Platform = z.infer<typeof PlatformEnum>;
export type Font = z.infer<typeof FontEnum>;
export type Radius = z.infer<typeof RadiusEnum>;

export type Link = z.infer<typeof LinkSchema>;
export type LinkGroup = z.infer<typeof LinkGroupSchema>;
export type LinkItem = z.infer<typeof LinkItemSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ProfileOverride = z.infer<typeof ProfileOverrideSchema>;
export type TreeMeta = z.infer<typeof TreeMetaSchema>;
export type NostreeDataV2 = z.infer<typeof NostreeDataSchemaV2>;
export type NostreeDataV1 = z.infer<typeof NostreeDataSchemaV1>;
export type NostreeData = z.infer<typeof NostreeDataSchema>;

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

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
