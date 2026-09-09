import { useState, useRef } from "react";
import type { Theme, Radius, Font } from "../../schemas/nostr";
import { 
  Sparkles, 
  Type, 
  Square, 
  Upload, 
  RotateCcw, 
  Check, 
  Image as ImageIcon,
  Sun,
  Moon,
  Paintbrush,
  Camera,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { THEME_PRESETS } from "./ThemeSelector";

interface AppearanceEditorProps {
  currentTheme: Theme | undefined;
  onThemeChange: (theme: Theme) => void;
  headerImage?: string;
  onHeaderChange?: (imageUrl: string | undefined) => void;
  disabled?: boolean;
}

const PRIMARY_PRESET_KEYS = [
  "obsidian",
  "cosmic",
  "sunset",
  "matrix",
  "cloud",
  "matcha",
  "mocha",
  "nordic",
  "emerald",
  "sapphire",
  "ruby",
  "amethyst",
  "candy",
  "azure",
  "amber",
  "neonsynth",
];

const RADIUS_OPTIONS: { value: Radius; label: string; previewClass: string }[] = [
  { value: "0", label: "Sharp", previewClass: "rounded-none" },
  { value: "0.5rem", label: "Subtle", previewClass: "rounded-md" },
  { value: "1rem", label: "Smooth", previewClass: "rounded-2xl" },
  { value: "9999px", label: "Pill", previewClass: "rounded-full" },
];

const FONT_OPTIONS: { value: Font; label: string; sample: string; category: string }[] = [
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", sample: "Clean Modern Sans", category: "Modern UI" },
  { value: "Outfit", label: "Outfit", sample: "Vibrant & Geometric", category: "Display" },
  { value: "Inter", label: "Inter", sample: "Neutral & Readable", category: "Workhorse" },
  { value: "Space Grotesk", label: "Space Grotesk", sample: "Tech & Cyber", category: "Monospace feel" },
  { value: "Playfair", label: "Playfair Display", sample: "Editorial & Luxury", category: "Serif" },
  { value: "Roboto", label: "Roboto", sample: "Friendly & Open", category: "Classic" },
];

const GRADIENT_PRESETS = [
  { label: "Obsidian", gradient: "linear-gradient(145deg, #09090b 0%, #17152b 50%, #0d0b1a 100%)" },
  { label: "Cosmic", gradient: "linear-gradient(145deg, #0b0518 0%, #200d3d 50%, #120625 100%)" },
  { label: "Sunset", gradient: "linear-gradient(145deg, #0f051d 0%, #2c0d3d 40%, #59133b 75%, #7e2439 100%)" },
  { label: "Emerald", gradient: "linear-gradient(145deg, #021a12 0%, #063d28 50%, #032216 100%)" },
  { label: "Sapphire", gradient: "linear-gradient(145deg, #030d1e 0%, #0a234c 50%, #051631 100%)" },
  { label: "Ruby", gradient: "linear-gradient(145deg, #1f0409 0%, #440b18 50%, #28060f 100%)" },
  { label: "Candy", gradient: "linear-gradient(145deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)" },
  { label: "Synth", gradient: "linear-gradient(145deg, #050510 0%, #15092a 50%, #09031a 100%)" },
];

const QUICK_ACCENTS = [
  "#4f46e5",
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#d946ef",
  "#8b5cf6"
];

type CategoryFilter = "all" | "aura" | "organic" | "jewel" | "vibrant";

export function AppearanceEditor({
  currentTheme,
  onThemeChange,
  headerImage,
  onHeaderChange,
  disabled = false,
}: AppearanceEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [activeSection, setActiveSection] = useState<"presets" | "custom">("presets");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const bgValue = currentTheme?.colors.background || "#f8fafc";
  const isBackgroundImage = bgValue.startsWith("url(");
  const isSolidColor = /^#[0-9A-Fa-f]{3,8}$/.test(bgValue);
  const hexBgColor = isSolidColor 
    ? (bgValue.length === 4 ? `#${bgValue[1]}${bgValue[1]}${bgValue[2]}${bgValue[2]}${bgValue[3]}${bgValue[3]}` : bgValue.slice(0, 7)) 
    : "#ffffff";
  const fgColor = currentTheme?.colors.foreground || "#0f172a";
  const primaryColor = currentTheme?.colors.primary || "#4f46e5";
  const radius = currentTheme?.colors.radius || "1rem";
  const font = currentTheme?.font || "Plus Jakarta Sans";

  const currentPresetKey = Object.entries(THEME_PRESETS).find(
    ([key, preset]) => 
      PRIMARY_PRESET_KEYS.includes(key) && 
      preset.colors.background === currentTheme?.colors.background
  )?.[0];

  const updateTheme = (updates: Partial<Theme["colors"]> & { font?: Font; mode?: "light" | "dark" | "custom" }) => {
    onThemeChange({
      mode: updates.mode ?? "custom",
      colors: {
        background: updates.background ?? bgValue,
        foreground: updates.foreground ?? fgColor,
        primary: updates.primary ?? primaryColor,
        radius: updates.radius ?? radius,
      },
      font: updates.font ?? font,
    });
  };

  const handleSelectPreset = (key: string) => {
    const preset = THEME_PRESETS[key];
    onThemeChange({
      mode: preset.mode,
      colors: preset.colors,
      font: preset.font,
    });
    toast.success(`Applied ${preset.name}`);
  };

  const handleReset = () => {
    const defaultTheme = THEME_PRESETS.cloud || THEME_PRESETS.light;
    onThemeChange({
      mode: defaultTheme.mode,
      colors: defaultTheme.colors,
      font: defaultTheme.font,
    });
    setImageUrl("");
    toast.success("Reset appearance to default");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadImageFile } = await import("../../lib/upload");
      const cdnUrl = await uploadImageFile(file);
      updateTheme({ background: `url(${cdnUrl})` });
      setIsUploading(false);
      toast.success("Background image updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsCoverUploading(true);
    try {
      const { uploadImageFile } = await import("../../lib/upload");
      const cdnUrl = await uploadImageFile(file);
      onHeaderChange?.(cdnUrl);
      setIsCoverUploading(false);
      toast.success("Cover image saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload cover image");
      setIsCoverUploading(false);
    }
  };

  const filteredPresetKeys = PRIMARY_PRESET_KEYS.filter((key) => {
    if (selectedCategory === "all") return true;
    return THEME_PRESETS[key].category === selectedCategory;
  });

  const categories = [
    { id: "all" as const, label: "All Themes" },
    { id: "aura" as const, label: "Aura & Dark" },
    { id: "organic" as const, label: "Organic & Light" },
    { id: "jewel" as const, label: "Jewel & Rich" },
    { id: "vibrant" as const, label: "Vibrant" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-txt-main tracking-tight">Appearance & Theme</h2>
          <p className="text-xs text-txt-dim">Customize your profile page visual world, typography, and accents</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-canvas border border-border rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSection("presets")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSection === "presets"
                  ? "bg-card text-txt-main shadow-xs"
                  : "text-txt-muted hover:text-txt-main"
              }`}
            >
              Curated Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("custom")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSection === "custom"
                  ? "bg-card text-txt-main shadow-xs"
                  : "text-txt-muted hover:text-txt-main"
              }`}
            >
              Custom Styling
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-txt-muted hover:text-txt-main bg-card border border-border hover:border-border-hover transition-colors shadow-2xs cursor-pointer active:scale-[0.97]"
            title="Reset to default theme"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {activeSection === "presets" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? "bg-brand text-brand-fg shadow-xs font-semibold"
                      : "bg-card text-txt-muted border border-border hover:text-txt-main hover:border-border-hover"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredPresetKeys.map((key) => {
              const preset = THEME_PRESETS[key];
              const isSelected = currentPresetKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  disabled={disabled}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.97] group min-h-[110px] ${
                    isSelected
                      ? "border-brand ring-2 ring-brand/40 shadow-md"
                      : "border-border hover:border-border-hover hover:shadow-xs"
                  }`}
                  style={{ background: preset.previewGradient }}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-2xs whitespace-nowrap"
                      style={{
                        backgroundColor: preset.mode === "dark" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.75)",
                        color: preset.mode === "dark" ? "#ffffff" : "#0f172a",
                      }}
                    >
                      {preset.font}
                    </span>

                    <div className="flex items-center gap-1">
                      {preset.mode === "dark" ? (
                        <Moon className="w-3 h-3 text-white/70" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-500" />
                      )}
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span 
                      className="text-xs font-bold block drop-shadow-xs tracking-tight"
                      style={{ color: preset.mode === "dark" ? "#ffffff" : "#0f172a" }}
                    >
                      {preset.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span 
                        className="w-3 h-3 rounded-full border border-black/10" 
                        style={{ backgroundColor: preset.colors.primary }} 
                      />
                      <span 
                        className="text-[10px] font-medium opacity-80"
                        style={{ color: preset.mode === "dark" ? "#ffffff" : "#0f172a" }}
                      >
                        Accent
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Atmospheric Gradients</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GRADIENT_PRESETS.map((p) => {
                const isSelected = bgValue === p.gradient;
                const isLightPreset = p.label === "Candy";
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      if (p.label === "Candy") {
                        updateTheme({
                          background: p.gradient,
                          foreground: "#4a044e",
                          primary: "#d946ef",
                          mode: "light",
                        });
                      } else {
                        updateTheme({ background: p.gradient });
                      }
                    }}
                    className={`h-11 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer active:scale-[0.96] shadow-2xs relative ${
                      isLightPreset ? "text-fuchsia-950 font-bold" : "text-white"
                    } ${
                      isSelected
                        ? "ring-2 ring-brand border-brand shadow-sm font-bold"
                        : isLightPreset
                        ? "border-fuchsia-300/60 hover:scale-[1.02]"
                        : "border-white/20 hover:scale-[1.02]"
                    }`}
                    style={{ background: p.gradient }}
                  >
                    <span>{p.label}</span>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 absolute right-2 stroke-[3] ${
                        isLightPreset ? "text-fuchsia-950" : "text-white"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Paintbrush className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Color Harmony</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-txt-muted">Solid Background</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hexBgColor}
                      onChange={(e) => updateTheme({ background: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgValue.startsWith("#") ? bgValue : hexBgColor}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          updateTheme({ background: e.target.value });
                        }
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-txt-muted">Text Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => updateTheme({ foreground: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          updateTheme({ foreground: e.target.value });
                        }
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-txt-muted">Brand Accent</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => updateTheme({ primary: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          updateTheme({ primary: e.target.value });
                        }
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-[11px] text-txt-dim block mb-2 font-medium">Quick Accent Palette</span>
                  <div className="flex gap-2 flex-wrap">
                    {QUICK_ACCENTS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateTheme({ primary: color })}
                        className={`w-7 h-7 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          primaryColor === color ? "border-txt-main ring-2 ring-brand/30 scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ImageIcon className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Custom Background Image</h3>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs bg-canvas border border-border rounded-xl focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrl.trim()) updateTheme({ background: `url(${imageUrl.trim()})` });
                    }}
                    disabled={!imageUrl.trim()}
                    className="px-3 py-1.5 bg-brand text-brand-fg text-xs font-semibold rounded-xl disabled:opacity-50 active:scale-95 cursor-pointer shadow-2xs transition-all"
                  >
                    Apply
                  </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 px-4 border border-dashed border-border rounded-xl hover:border-brand hover:bg-canvas text-center transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 mx-auto text-txt-muted mb-1" />
                  <span className="text-xs text-txt-muted font-medium">
                    {isUploading ? "Uploading image..." : "Upload from device (max 5MB)"}
                  </span>
                </button>

                {isBackgroundImage && (
                  <button
                    type="button"
                    onClick={() => {
                      updateTheme({ background: "#f8fafc" });
                      setImageUrl("");
                    }}
                    className="w-full py-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Profile Cover Photo</h3>
              </div>
              {headerImage && onHeaderChange && (
                <button
                  type="button"
                  onClick={() => onHeaderChange(undefined)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Cover</span>
                </button>
              )}
            </div>

            {headerImage ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-border shadow-2xs group bg-zinc-950">
                <img src={headerImage} alt="Cover preview" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onHeaderChange?.(undefined)}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-txt-muted">
                Cover photo appears as a wide banner at the top of your profile with your avatar overlapping it.
              </p>
            )}

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="flex-1 px-3 py-1.5 text-xs bg-canvas border border-border rounded-xl focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (coverUrlInput.trim() && onHeaderChange) {
                      onHeaderChange(coverUrlInput.trim());
                      setCoverUrlInput("");
                      toast.success("Cover image updated");
                    }
                  }}
                  disabled={!coverUrlInput.trim()}
                  className="px-3 py-1.5 bg-brand text-brand-fg text-xs font-semibold rounded-xl disabled:opacity-50 active:scale-95 cursor-pointer shadow-2xs transition-all"
                >
                  Apply
                </button>
              </div>

              <input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isCoverUploading}
                className="w-full py-3 px-4 border border-dashed border-border rounded-xl hover:border-brand hover:bg-canvas text-center transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 mx-auto text-txt-muted mb-1" />
                <span className="text-xs text-txt-muted font-medium">
                  {isCoverUploading ? "Uploading cover image..." : "Upload cover image from device (max 5MB)"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Type className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Typography</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => updateTheme({ font: f.value })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                      font === f.value
                        ? "border-brand bg-brand/5 ring-1 ring-brand"
                        : "border-border hover:border-border-hover bg-canvas/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-txt-main">{f.label}</span>
                      <span className="text-[10px] text-txt-dim">{f.category}</span>
                    </div>
                    <p className="text-[11px] text-txt-muted truncate">{f.sample}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Square className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">Card Corner Radius</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateTheme({ radius: opt.value })}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-[0.97] ${
                      radius === opt.value
                        ? "border-brand bg-brand/5 ring-1 ring-brand"
                        : "border-border hover:border-border-hover bg-canvas/40"
                    }`}
                  >
                    <div 
                      className={`w-10 h-7 mx-auto bg-brand/20 border border-brand/40 mb-2 ${opt.previewClass}`}
                      style={{ borderRadius: opt.value }}
                    />
                    <span className="text-xs font-semibold text-txt-main block">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppearanceEditor;
