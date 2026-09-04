import { useState, useRef } from "react";
import type { Theme, Radius, Font } from "../../schemas/nostr";
import { Sliders, RotateCcw, Type, Paintbrush, Sparkles, Image, Upload, Link, X } from "lucide-react";
import { toast } from "sonner";
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

const FONT_OPTIONS: { value: Font; label: string; sample: string }[] = [
  { value: "Inter", label: "Inter", sample: "Clean & Modern" },
  { value: "Roboto", label: "Roboto", sample: "Friendly & Open" },
  { value: "Serif", label: "Serif", sample: "Classic & Elegant" },
  { value: "Mono", label: "Mono", sample: "Technical & Code" },
];

export function CustomThemeEditor({ currentTheme, onThemeChange, disabled }: CustomThemeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "background" | "style" | "effects">("colors");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const bgValue = currentTheme?.colors.background || "#ffffff";
  const isBackgroundImage = bgValue.startsWith("url(");
  const bgColor = isBackgroundImage ? "#ffffff" : bgValue;
  const bgImage = isBackgroundImage ? bgValue : "";
  const fgColor = currentTheme?.colors.foreground || "#1f2937";
  const primaryColor = currentTheme?.colors.primary || "#5E47B8";
  const radius = currentTheme?.colors.radius || "1rem";
  const font = currentTheme?.font || "Inter";

  const updateTheme = (updates: Partial<Theme["colors"]> & { font?: Font }) => {
    onThemeChange({
      mode: "custom",
      colors: {
        background: updates.background ?? bgValue,
        foreground: updates.foreground ?? fgColor,
        primary: updates.primary ?? primaryColor,
        radius: updates.radius ?? radius,
      },
      font: updates.font ?? font,
    });
  };

  const handleReset = () => {
    const defaultTheme = THEME_PRESETS.light;
    onThemeChange({
      mode: defaultTheme.mode,
      colors: defaultTheme.colors,
      font: defaultTheme.font,
    });
    setImageUrl("");
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      updateTheme({ background: `url(${imageUrl.trim()})` });
    }
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateTheme({ background: `url(${dataUrl})` });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const clearBackgroundImage = () => {
    updateTheme({ background: "#ffffff" });
    setImageUrl("");
  };

  const tabs = [
    { id: "colors" as const, label: "Colors", icon: Paintbrush },
    { id: "background" as const, label: "Background", icon: Image },
    { id: "style" as const, label: "Style", icon: Type },
    { id: "effects" as const, label: "Effects", icon: Sparkles },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl hover:border-border-hover transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        title="Customize appearance"
      >
        <Sliders className="w-3.5 h-3.5 text-txt-muted" />
        <span className="text-xs font-medium text-txt-main">Customize</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden max-h-[80vh] overflow-y-auto origin-top-right animate-pop"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card/95 backdrop-blur-md z-10">
              <h4 className="text-xs font-semibold text-txt-main uppercase tracking-wider">Customize Appearance</h4>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-txt-muted hover:text-txt-main transition-colors active:scale-95 cursor-pointer"
                title="Reset to default"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="flex border-b border-border sticky top-10 bg-card z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "text-brand border-b-2 border-brand bg-brand/5"
                      : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === "colors" && (
                <div className="space-y-4">
                  {!isBackgroundImage && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-txt-muted w-20">Background</label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => updateTheme({ background: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => {
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              updateTheme({ background: e.target.value });
                            }
                          }}
                          className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-txt-muted w-20">Text</label>
                    <div className="flex-1 flex items-center gap-2">
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
                        className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-txt-muted w-20">Accent</label>
                    <div className="flex-1 flex items-center gap-2">
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
                        className="flex-1 px-2 py-1 text-xs font-mono bg-canvas border border-border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "background" && (
                <div className="space-y-4">
                  {isBackgroundImage && (
                    <div className="relative">
                      <div 
                        className="w-full h-24 rounded-xl bg-cover bg-center border border-border"
                        style={{ backgroundImage: bgImage }}
                      />
                      <button
                        onClick={clearBackgroundImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer active:scale-95"
                        title="Remove background image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-txt-dim mt-1 text-center">Current background image</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-txt-muted mb-2 flex items-center gap-1">
                      <Link className="w-3.5 h-3.5" />
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 text-xs bg-canvas border border-border rounded-xl focus:border-brand focus:outline-none"
                      />
                      <button
                        onClick={handleImageUrlSubmit}
                        disabled={!imageUrl.trim()}
                        className="px-3 py-2 bg-brand text-brand-fg text-xs font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-txt-dim">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div>
                    <label className="text-xs text-txt-muted mb-2 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-brand hover:bg-brand/5 transition-all text-center cursor-pointer active:scale-[0.98]"
                    >
                      {isUploading ? (
                        <span className="text-xs text-txt-muted">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mx-auto text-txt-muted mb-2" />
                          <span className="text-xs text-txt-muted block font-medium">Click to upload image</span>
                          <span className="text-[11px] text-txt-dim block mt-1">Max 5MB • JPG, PNG, GIF, WebP</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isBackgroundImage && (
                    <p className="text-xs text-txt-dim text-center">
                      To use a solid color instead, remove the image above
                    </p>
                  )}
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-txt-muted block mb-2 font-medium">Font Family</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FONT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateTheme({ font: opt.value })}
                          className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                            font === opt.value
                              ? "border-brand bg-brand/5 ring-1 ring-brand"
                              : "border-border hover:border-border-hover"
                          }`}
                        >
                          <span 
                            className="text-xs font-medium text-txt-main block"
                            style={{ fontFamily: opt.value === "Serif" ? "Georgia, serif" : opt.value === "Mono" ? "monospace" : opt.value }}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-txt-dim">{opt.sample}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-txt-muted block mb-2 font-medium">Corner Style</label>
                    <div className="grid grid-cols-4 gap-2">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateTheme({ radius: opt.value })}
                          className={`p-2 text-center rounded-xl border transition-all active:scale-[0.98] cursor-pointer ${
                            radius === opt.value
                              ? "border-brand bg-brand/5 ring-1 ring-brand"
                              : "border-border hover:border-border-hover"
                          }`}
                        >
                          <div 
                            className="w-8 h-6 mx-auto bg-brand/30 mb-1"
                            style={{ borderRadius: opt.value }}
                          />
                          <span className="text-[11px] text-txt-muted">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "effects" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-txt-muted block mb-2 font-medium">Quick Accent Colors</label>
                    <div className="flex gap-2 flex-wrap">
                      {["#5E47B8", "#22c55e", "#ef4444", "#f97316", "#0ea5e9", "#ec4899", "#8b5cf6", "#14b8a6"].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateTheme({ primary: color })}
                          className={`w-7 h-7 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            primaryColor === color ? "border-txt-main ring-2 ring-brand/30" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl border border-border bg-canvas/50">
                <p className="text-[11px] text-txt-dim mb-2 text-center uppercase tracking-wider font-semibold">Live Preview</p>
                <div 
                  className="p-3 rounded-xl transition-all bg-cover bg-center"
                  style={{ 
                    backgroundColor: isBackgroundImage ? "#ffffff" : bgColor,
                    backgroundImage: isBackgroundImage ? bgImage : undefined,
                    fontFamily: font === "Serif" ? "Georgia, serif" : font === "Mono" ? "monospace" : font,
                  }}
                >
                  <div 
                    className="text-xs font-medium text-center mb-2"
                    style={{ color: fgColor }}
                  >
                    Sample Text
                  </div>
                  <div 
                    className="px-3 py-1.5 text-xs text-center transition-all"
                    style={{ 
                      backgroundColor: primaryColor, 
                      color: isBackgroundImage ? "#ffffff" : bgColor,
                      borderRadius: radius,
                    }}
                  >
                    Button
                  </div>
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
