import { useState } from "react";
import type { Theme } from "../../schemas/nostr";
import { Check, Palette, X } from "lucide-react";

export interface ThemePresetInfo extends Theme {
  name: string;
  category: "aura" | "organic" | "jewel" | "vibrant";
  previewGradient: string;
}

export const THEME_PRESETS: Record<string, ThemePresetInfo> = {
  obsidian: {
    name: "Obsidian Glow",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #09090b 0%, #17152b 50%, #0d0b1a 100%)",
      foreground: "#f8fafc",
      primary: "#818cf8",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #09090b 0%, #312e81 100%)",
  },
  cosmic: {
    name: "Cosmic Nebula",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #0b0518 0%, #200d3d 50%, #120625 100%)",
      foreground: "#fdf4ff",
      primary: "#c084fc",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #1b0736 0%, #701a75 100%)",
  },
  sunset: {
    name: "Sunset Horizon",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #0f051d 0%, #2c0d3d 40%, #59133b 75%, #7e2439 100%)",
      foreground: "#fff7ed",
      primary: "#fb923c",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #18052e 0%, #9a3412 100%)",
  },
  matrix: {
    name: "Cyber Matrix",
    category: "aura",
    mode: "dark",
    colors: {
      background: "#050508",
      foreground: "#a3e635",
      primary: "#22d3ee",
      radius: "0.5rem",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #050508 0%, #064e3b 100%)",
  },
  cloud: {
    name: "Cloud Dancer",
    category: "organic",
    mode: "light",
    colors: {
      background: "#faf8f5",
      foreground: "#1c1917",
      primary: "#9a3412",
      radius: "1rem",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #f5efe6 100%)",
  },
  matcha: {
    name: "Matcha Cream",
    category: "organic",
    mode: "light",
    colors: {
      background: "#f4f6f0",
      foreground: "#14261c",
      primary: "#16a34a",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #e2ebd8 100%)",
  },
  mocha: {
    name: "Mocha Mousse",
    category: "organic",
    mode: "light",
    colors: {
      background: "#fdfbf7",
      foreground: "#291809",
      primary: "#78350f",
      radius: "9999px",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #fdfbf7 0%, #ebdacf 100%)",
  },
  nordic: {
    name: "Nordic Slate",
    category: "organic",
    mode: "light",
    colors: {
      background: "#f8fafc",
      foreground: "#0f172a",
      primary: "#2563eb",
      radius: "0.5rem",
    },
    font: "Inter",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
  },
  emerald: {
    name: "Royal Emerald",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #021a12 0%, #063d28 50%, #032216 100%)",
      foreground: "#ecfdf5",
      primary: "#34d399",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #021a12 0%, #047857 100%)",
  },
  sapphire: {
    name: "Midnight Sapphire",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #030d1e 0%, #0a234c 50%, #051631 100%)",
      foreground: "#f0f9ff",
      primary: "#38bdf8",
      radius: "1rem",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #030d1e 0%, #0369a1 100%)",
  },
  ruby: {
    name: "Velvet Ruby",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #1f0409 0%, #440b18 50%, #28060f 100%)",
      foreground: "#fff1f2",
      primary: "#fb7185",
      radius: "1rem",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #1f0409 0%, #9f1239 100%)",
  },
  amethyst: {
    name: "Amethyst Dusk",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #130421 0%, #2e0d49 50%, #1a072d 100%)",
      foreground: "#faf5ff",
      primary: "#e879f9",
      radius: "9999px",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #130421 0%, #7e22ce 100%)",
  },
  candy: {
    name: "Candy Pastel",
    category: "vibrant",
    mode: "light",
    colors: {
      background: "linear-gradient(145deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)",
      foreground: "#4a044e",
      primary: "#d946ef",
      radius: "9999px",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #fae8ff 0%, #f0abfc 100%)",
  },
  azure: {
    name: "Azure Breeze",
    category: "vibrant",
    mode: "light",
    colors: {
      background: "#f0f9ff",
      foreground: "#082f49",
      primary: "#0284c7",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 100%)",
  },
  amber: {
    name: "Solar Amber",
    category: "vibrant",
    mode: "light",
    colors: {
      background: "#fffbeb",
      foreground: "#451a03",
      primary: "#d97706",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #fffbeb 0%, #fcd34d 100%)",
  },
  neonsynth: {
    name: "Neon Synth",
    category: "vibrant",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #050510 0%, #15092a 50%, #09031a 100%)",
      foreground: "#22d3ee",
      primary: "#f43f5e",
      radius: "0",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #050510 0%, #f43f5e 100%)",
  },
  light: {
    name: "Cloud Dancer",
    category: "organic",
    mode: "light",
    colors: {
      background: "#faf8f5",
      foreground: "#1c1917",
      primary: "#9a3412",
      radius: "1rem",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #f5efe6 100%)",
  },
  dark: {
    name: "Obsidian Glow",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #09090b 0%, #17152b 50%, #0d0b1a 100%)",
      foreground: "#f8fafc",
      primary: "#818cf8",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #09090b 0%, #312e81 100%)",
  },
  ocean: {
    name: "Midnight Sapphire",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #030d1e 0%, #0a234c 50%, #051631 100%)",
      foreground: "#f0f9ff",
      primary: "#38bdf8",
      radius: "1rem",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #030d1e 0%, #0369a1 100%)",
  },
  forest: {
    name: "Royal Emerald",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #021a12 0%, #063d28 50%, #032216 100%)",
      foreground: "#ecfdf5",
      primary: "#34d399",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #021a12 0%, #047857 100%)",
  },
  berry: {
    name: "Cosmic Nebula",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #0b0518 0%, #200d3d 50%, #120625 100%)",
      foreground: "#fdf4ff",
      primary: "#c084fc",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #1b0736 0%, #701a75 100%)",
  },
  rose: {
    name: "Velvet Ruby",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #1f0409 0%, #440b18 50%, #28060f 100%)",
      foreground: "#fff1f2",
      primary: "#fb7185",
      radius: "1rem",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #1f0409 0%, #9f1239 100%)",
  },
  mint: {
    name: "Matcha Cream",
    category: "organic",
    mode: "light",
    colors: {
      background: "#f4f6f0",
      foreground: "#14261c",
      primary: "#16a34a",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #e2ebd8 100%)",
  },
  neon: {
    name: "Cyber Matrix",
    category: "aura",
    mode: "dark",
    colors: {
      background: "#050508",
      foreground: "#a3e635",
      primary: "#22d3ee",
      radius: "0.5rem",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #050508 0%, #064e3b 100%)",
  },
  lavender: {
    name: "Amethyst Dusk",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #130421 0%, #2e0d49 50%, #1a072d 100%)",
      foreground: "#faf5ff",
      primary: "#e879f9",
      radius: "9999px",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #130421 0%, #7e22ce 100%)",
  },
  midnight: {
    name: "Obsidian Glow",
    category: "aura",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #09090b 0%, #17152b 50%, #0d0b1a 100%)",
      foreground: "#f8fafc",
      primary: "#818cf8",
      radius: "1rem",
    },
    font: "Outfit",
    previewGradient: "linear-gradient(135deg, #09090b 0%, #312e81 100%)",
  },
  peach: {
    name: "Mocha Mousse",
    category: "organic",
    mode: "light",
    colors: {
      background: "#fdfbf7",
      foreground: "#291809",
      primary: "#78350f",
      radius: "9999px",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #fdfbf7 0%, #ebdacf 100%)",
  },
  cyber: {
    name: "Neon Synth",
    category: "vibrant",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #050510 0%, #15092a 50%, #09031a 100%)",
      foreground: "#22d3ee",
      primary: "#f43f5e",
      radius: "0",
    },
    font: "Space Grotesk",
    previewGradient: "linear-gradient(135deg, #050510 0%, #f43f5e 100%)",
  },
  sage: {
    name: "Matcha Cream",
    category: "organic",
    mode: "light",
    colors: {
      background: "#f4f6f0",
      foreground: "#14261c",
      primary: "#16a34a",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #ffffff 0%, #e2ebd8 100%)",
  },
  cherry: {
    name: "Velvet Ruby",
    category: "jewel",
    mode: "dark",
    colors: {
      background: "linear-gradient(145deg, #1f0409 0%, #440b18 50%, #28060f 100%)",
      foreground: "#fff1f2",
      primary: "#fb7185",
      radius: "1rem",
    },
    font: "Playfair",
    previewGradient: "linear-gradient(135deg, #1f0409 0%, #9f1239 100%)",
  },
  sky: {
    name: "Azure Breeze",
    category: "vibrant",
    mode: "light",
    colors: {
      background: "#f0f9ff",
      foreground: "#082f49",
      primary: "#0284c7",
      radius: "1rem",
    },
    font: "Plus Jakarta Sans",
    previewGradient: "linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 100%)",
  },
};

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

type CategoryFilter = "all" | "aura" | "organic" | "jewel" | "vibrant";

interface ThemeSelectorProps {
  currentTheme: Theme | undefined;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  disabled, 
  isOpen: propIsOpen, 
  onOpenChange 
}: ThemeSelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : internalIsOpen;
  const setIsOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalIsOpen(next);
    }
  };

  const currentPresetKey = Object.entries(THEME_PRESETS).find(
    ([key, preset]) => 
      PRIMARY_PRESET_KEYS.includes(key) && 
      preset.colors.background === currentTheme?.colors.background
  )?.[0] || Object.entries(THEME_PRESETS).find(
    ([_, preset]) => preset.colors.background === currentTheme?.colors.background
  )?.[0] || "obsidian";

  const handleSelectTheme = (key: string) => {
    const preset = THEME_PRESETS[key];
    onThemeChange({
      mode: preset.mode,
      colors: preset.colors,
      font: preset.font,
    });
    setIsOpen(false);
  };

  const filteredKeys = PRIMARY_PRESET_KEYS.filter((key) => {
    if (selectedCategory === "all") return true;
    return THEME_PRESETS[key].category === selectedCategory;
  });

  const categories = [
    { id: "all" as const, label: "All" },
    { id: "aura" as const, label: "Aura & Dark" },
    { id: "organic" as const, label: "Organic & Light" },
    { id: "jewel" as const, label: "Jewel" },
    { id: "vibrant" as const, label: "Vibrant" },
  ];

  return (
    <div className="relative lg:static">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-card border border-border rounded-xl hover:border-border-hover transition-colors disabled:opacity-50 shadow-xs cursor-pointer active:scale-[0.98]"
      >
        <Palette className="w-3.5 h-3.5 text-txt-muted" />
        <span className="text-xs font-semibold text-txt-main">
          {THEME_PRESETS[currentPresetKey]?.name || "Theme"}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 lg:top-0 lg:right-[calc(100%+1rem)] lg:left-auto lg:mt-0 w-[calc(100vw-2rem)] max-w-sm sm:max-w-none lg:w-[480px] bg-card border border-border rounded-2xl shadow-elevated z-50 p-4 animate-pop origin-top-left lg:origin-top-right"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand" />
                <div>
                  <h3 className="text-xs font-semibold text-txt-main">Theme Presets</h3>
                  <p className="text-[11px] text-txt-dim">16 curated styles with typography and color harmony</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-txt-muted hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand text-brand-fg shadow-2xs"
                        : "bg-canvas text-txt-muted hover:text-txt-main hover:bg-card-hover"
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredKeys.map((key) => {
                const preset = THEME_PRESETS[key];
                const isSelected = currentPresetKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTheme(key)}
                    className={`relative p-2.5 rounded-xl border transition-all duration-150 text-left group cursor-pointer active:scale-[0.97] flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? "border-brand ring-2 ring-brand/30 shadow-md"
                        : "border-border hover:border-border-hover hover:shadow-xs"
                    }`}
                    style={{ background: preset.previewGradient }}
                    title={preset.name}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md shadow-2xs whitespace-nowrap"
                        style={{
                          backgroundColor: preset.mode === "dark" ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.07)",
                          color: preset.colors.foreground,
                        }}
                      >
                        {preset.font}
                      </span>

                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center shadow-xs shrink-0">
                          <Check className="w-2.5 h-2.5 text-brand-fg" />
                        </div>
                      ) : (
                        <span
                          className="text-[9px] font-mono opacity-50 uppercase"
                          style={{ color: preset.colors.foreground }}
                        >
                          {preset.mode}
                        </span>
                      )}
                    </div>

                    <div 
                      className="w-full py-1.5 px-2 rounded-lg backdrop-blur-md mb-2 shadow-2xs flex items-center justify-between transition-transform duration-150 group-hover:scale-[1.02]"
                      style={{
                        backgroundColor: preset.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.92)",
                        border: `1px solid ${preset.mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)"}`,
                        borderRadius: preset.colors.radius === "9999px" ? "9999px" : preset.colors.radius === "0" ? "2px" : "8px",
                      }}
                    >
                      <span 
                        className="text-[10px] font-semibold truncate leading-none"
                        style={{
                          color: preset.colors.foreground,
                          fontFamily: preset.font === "Serif" ? "Georgia, serif" : preset.font === "Mono" ? "monospace" : preset.font,
                        }}
                      >
                        Sample Link
                      </span>
                      <div 
                        className="w-2 h-2 rounded-full shrink-0 ml-1" 
                        style={{ backgroundColor: preset.colors.primary }} 
                      />
                    </div>

                    <div className="pt-0.5">
                      <span 
                        className="text-xs font-semibold block leading-snug whitespace-nowrap truncate"
                        style={{ color: preset.colors.foreground }}
                      >
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-border shrink-0 shadow-2xs"
                  style={{ background: THEME_PRESETS[currentPresetKey]?.previewGradient }}
                />
                <span className="text-txt-dim truncate">
                  Active: <strong className="text-txt-main font-semibold">{THEME_PRESETS[currentPresetKey]?.name}</strong>
                </span>
              </div>
              <span className="text-[10px] text-txt-dim font-mono shrink-0 ml-2">
                {THEME_PRESETS[currentPresetKey]?.font} • {THEME_PRESETS[currentPresetKey]?.mode}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSelector;
