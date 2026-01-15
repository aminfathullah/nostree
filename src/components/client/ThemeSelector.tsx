import { useState } from "react";
import type { Theme, Radius } from "../../schemas/nostr";
import { Check, Palette } from "lucide-react";

/**
 * Predefined theme presets for Nostree trees
 */
export const THEME_PRESETS: Record<string, Theme & { name: string; preview: string }> = {
  light: {
    name: "Light",
    preview: "bg-white text-gray-900",
    mode: "light",
    colors: {
      background: "#ffffff",
      foreground: "#1f2937",
      primary: "#5E47B8",
      radius: "1rem",
    },
    font: "Inter",
  },
  dark: {
    name: "Dark",
    preview: "bg-zinc-900 text-white",
    mode: "dark",
    colors: {
      background: "#18181b",
      foreground: "#f4f4f5",
      primary: "#8b5cf6",
      radius: "1rem",
    },
    font: "Inter",
  },
  ocean: {
    name: "Ocean",
    preview: "bg-blue-950 text-cyan-100",
    mode: "dark",
    colors: {
      background: "#0c1929",
      foreground: "#cffafe",
      primary: "#22d3ee",
      radius: "1rem",
    },
    font: "Inter",
  },
  sunset: {
    name: "Sunset",
    preview: "bg-orange-50 text-orange-900",
    mode: "light",
    colors: {
      background: "#fff7ed",
      foreground: "#7c2d12",
      primary: "#f97316",
      radius: "1rem",
    },
    font: "Inter",
  },
  forest: {
    name: "Forest",
    preview: "bg-green-950 text-green-100",
    mode: "dark",
    colors: {
      background: "#052e16",
      foreground: "#dcfce7",
      primary: "#22c55e",
      radius: "1rem",
    },
    font: "Inter",
  },
  berry: {
    name: "Berry",
    preview: "bg-purple-950 text-purple-100",
    mode: "dark",
    colors: {
      background: "#1e1b4b",
      foreground: "#f3e8ff",
      primary: "#a855f7",
      radius: "1rem",
    },
    font: "Inter",
  },
  rose: {
    name: "Rose",
    preview: "bg-rose-50 text-rose-900",
    mode: "light",
    colors: {
      background: "#fff1f2",
      foreground: "#881337",
      primary: "#f43f5e",
      radius: "1rem",
    },
    font: "Inter",
  },
  mint: {
    name: "Mint",
    preview: "bg-teal-50 text-teal-900",
    mode: "light",
    colors: {
      background: "#f0fdfa",
      foreground: "#134e4a",
      primary: "#14b8a6",
      radius: "1rem",
    },
    font: "Inter",
  },
};

interface ThemeSelectorProps {
  currentTheme: Theme | undefined;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

/**
 * Theme selector component with predefined theme presets
 */
export function ThemeSelector({ currentTheme, onThemeChange, disabled }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find current theme preset key
  const currentPresetKey = Object.entries(THEME_PRESETS).find(
    ([_, preset]) => preset.colors.background === currentTheme?.colors.background
  )?.[0] || "light";

  const handleSelectTheme = (key: string) => {
    const preset = THEME_PRESETS[key];
    onThemeChange({
      mode: preset.mode,
      colors: preset.colors,
      font: preset.font,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors disabled:opacity-50"
      >
        <Palette className="w-4 h-4 text-txt-muted" />
        <span className="text-sm font-medium text-txt-main">
          {THEME_PRESETS[currentPresetKey]?.name || "Theme"}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-4">
            <h4 className="text-sm font-medium text-txt-main mb-3">Choose Theme</h4>
            
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleSelectTheme(key)}
                  className={`relative aspect-square rounded-lg border-2 transition-all overflow-hidden group ${
                    currentPresetKey === key
                      ? "border-brand ring-2 ring-brand/20"
                      : "border-border hover:border-border-hover"
                  }`}
                  title={preset.name}
                >
                  {/* Color preview */}
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: preset.colors.background }}
                  >
                    <div 
                      className="absolute inset-x-2 top-2 h-1 rounded-full"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="absolute inset-x-2 top-5 bottom-2 rounded flex flex-col gap-1 justify-center"
                    >
                      <div 
                        className="h-1.5 rounded-full mx-1"
                        style={{ backgroundColor: preset.colors.foreground, opacity: 0.3 }}
                      />
                      <div 
                        className="h-1.5 rounded-full mx-1"
                        style={{ backgroundColor: preset.colors.foreground, opacity: 0.2 }}
                      />
                    </div>
                  </div>
                  
                  {/* Check mark for selected */}
                  {currentPresetKey === key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand/20">
                      <Check className="w-4 h-4 text-brand" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-txt-dim mt-3 text-center">
              {THEME_PRESETS[currentPresetKey]?.name} theme selected
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSelector;
