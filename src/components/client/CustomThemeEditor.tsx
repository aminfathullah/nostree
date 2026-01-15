import { useState } from "react";
import type { Theme, Radius } from "../../schemas/nostr";
import { Sliders, RotateCcw } from "lucide-react";
import { THEME_PRESETS } from "./ThemeSelector";

interface CustomThemeEditorProps {
  currentTheme: Theme | undefined;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

const RADIUS_OPTIONS: { value: Radius; label: string }[] = [
  { value: "0", label: "Square" },
  { value: "0.5rem", label: "Rounded" },
  { value: "1rem", label: "More Rounded" },
  { value: "9999px", label: "Pill" },
];

/**
 * Custom theme editor with color pickers and radius selector
 */
export function CustomThemeEditor({ currentTheme, onThemeChange, disabled }: CustomThemeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current values with defaults
  const bgColor = currentTheme?.colors.background || "#ffffff";
  const fgColor = currentTheme?.colors.foreground || "#1f2937";
  const primaryColor = currentTheme?.colors.primary || "#5E47B8";
  const radius = currentTheme?.colors.radius || "1rem";

  const handleColorChange = (colorKey: "background" | "foreground" | "primary", value: string) => {
    onThemeChange({
      mode: "custom",
      colors: {
        background: colorKey === "background" ? value : bgColor,
        foreground: colorKey === "foreground" ? value : fgColor,
        primary: colorKey === "primary" ? value : primaryColor,
        radius: radius,
      },
      font: currentTheme?.font || "Inter",
    });
  };

  const handleRadiusChange = (newRadius: Radius) => {
    onThemeChange({
      mode: "custom",
      colors: {
        background: bgColor,
        foreground: fgColor,
        primary: primaryColor,
        radius: newRadius,
      },
      font: currentTheme?.font || "Inter",
    });
  };

  const handleReset = () => {
    const defaultTheme = THEME_PRESETS.light;
    onThemeChange({
      mode: defaultTheme.mode,
      colors: defaultTheme.colors,
      font: defaultTheme.font,
    });
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors disabled:opacity-50"
        title="Customize theme colors"
      >
        <Sliders className="w-4 h-4 text-txt-muted" />
        <span className="text-sm font-medium text-txt-main">Customize</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-txt-main">Custom Theme</h4>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-txt-muted hover:text-txt-main transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            
            {/* Color Pickers */}
            <div className="space-y-4">
              {/* Background Color */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-txt-muted w-24">Background</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleColorChange("background", e.target.value);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Foreground Color */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-txt-muted w-24">Text</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => handleColorChange("foreground", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleColorChange("foreground", e.target.value);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded"
                    placeholder="#1f2937"
                  />
                </div>
              </div>

              {/* Primary/Accent Color */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-txt-muted w-24">Accent</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleColorChange("primary", e.target.value);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded"
                    placeholder="#5E47B8"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-txt-muted w-24">Corners</label>
                <select
                  value={radius}
                  onChange={(e) => handleRadiusChange(e.target.value as Radius)}
                  className="flex-1 px-3 py-1.5 text-sm bg-canvas border border-border rounded-lg"
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Preview Mini */}
            <div className="mt-4 p-3 rounded-lg border border-border">
              <p className="text-xs text-txt-dim mb-2 text-center">Preview</p>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: bgColor }}
              >
                <div 
                  className="text-sm font-medium text-center mb-2"
                  style={{ color: fgColor }}
                >
                  Sample Text
                </div>
                <div 
                  className="px-3 py-1.5 text-xs text-center"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: bgColor,
                    borderRadius: radius,
                  }}
                >
                  Button
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomThemeEditor;
