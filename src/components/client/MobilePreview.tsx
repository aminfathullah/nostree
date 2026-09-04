import { useState, useRef } from "react";
import type { Link, NostreeData } from "../../schemas/nostr";
import { BadgeCheck, ExternalLink, Camera, ImagePlus, Pencil, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { LinkItemIcon } from "./LinkItemIcon";

interface MobilePreviewProps {
  profile: {
    name?: string;
    picture?: string;
    nip05?: string;
    lud16?: string;
    about?: string;
  };
  data: NostreeData | null;
  links: Link[];
  onAvatarChange?: (picture: string | undefined) => void;
  onHeaderChange?: (headerImage: string | undefined) => void;
  onTitleChange?: (title: string) => void;
  disabled?: boolean;
}

function ImageEditorPopup({
  isOpen,
  onClose,
  onSubmit,
  onRemove,
  currentImage,
  title,
  maxSize = 2,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  onRemove: () => void;
  currentImage?: string;
  title: string;
  maxSize?: number;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSize}MB`);
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      onSubmit(event.target?.result as string);
      setIsUploading(false);
      onClose();
    };
    reader.onerror = () => setIsUploading(false);
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-2xl shadow-elevated z-50 p-4 animate-pop"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-txt-main">{title}</span>
          {currentImage && (
            <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
              <X className="w-3 h-3" />Remove
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-2.5">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL"
            className="flex-1 px-3 py-1.5 text-xs bg-canvas border border-border rounded-xl focus:border-brand focus:outline-none"
          />
          <button
            onClick={() => { onSubmit(imageUrl); setImageUrl(""); onClose(); }}
            disabled={!imageUrl.trim()}
            className="px-3 py-1.5 bg-brand text-brand-fg text-xs font-semibold rounded-xl disabled:opacity-50 active:scale-95 transition-all"
          >
            Set
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-2.5 border border-dashed border-border rounded-xl hover:border-brand hover:bg-card-hover text-center transition-colors"
        >
          <Upload className="w-4 h-4 mx-auto text-txt-muted mb-1" />
          <span className="text-xs text-txt-muted font-medium">{isUploading ? "Uploading..." : `Upload file (max ${maxSize}MB)`}</span>
        </button>
      </div>
    </>
  );
}

export function MobilePreview({ 
  profile, 
  data, 
  links,
  onAvatarChange,
  onHeaderChange,
  onTitleChange,
  disabled,
}: MobilePreviewProps) {
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const displayName = (data && 'treeMeta' in data && data.treeMeta?.title) || data?.profile?.name || profile?.name || "Your Name";
  const displayBio = data?.profile?.bio || profile?.about || "";
  const showVerification = data?.profile?.show_verification ?? true;
  const visibleLinks = links.filter(l => l.visible);
  const socials = data?.socials || [];
  const theme = data?.theme;

  const bgValue = theme?.colors.background || "#f8fafc";
  const isBackgroundImage = bgValue.startsWith("url(");
  const bgColor = isBackgroundImage ? "#09090b" : bgValue;
  const bgImage = isBackgroundImage ? bgValue : undefined;
  const fgColor = theme?.colors.foreground || "#0f172a";
  const primaryColor = theme?.colors.primary || "#6366f1";
  const borderRadius = theme?.colors.radius || "1rem";
  const font = theme?.font || "Plus Jakarta Sans";
  const textColor = isBackgroundImage ? "#ffffff" : fgColor;
  
  const fontFamily = font === "Serif" ? "Georgia, serif" : font === "Mono" ? "Space Grotesk, monospace" : `${font}, system-ui, sans-serif`;

  const avatarSrc = data?.profile?.picture || profile?.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}`;
  const headerImage = data?.profile?.headerImage;

  const startEditTitle = () => {
    setTitleInput(displayName);
    setEditingTitle(true);
  };

  const saveTitle = () => {
    if (titleInput.trim() && onTitleChange) {
      onTitleChange(titleInput.trim());
    }
    setEditingTitle(false);
  };

  return (
    <div className="sticky top-20">
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-txt-dim">Live Preview</span>
        <span className="text-[11px] font-medium text-brand">Real-time</span>
      </div>
      
      <div className="relative mx-auto w-[340px] h-[670px] bg-[#121215] rounded-[2.75rem] p-3 shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#121215] rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-12 h-1 bg-zinc-800 rounded-full" />
        </div>

        <div 
          className="relative w-full h-full rounded-[2.25rem] overflow-hidden bg-cover bg-center flex flex-col"
          style={{ backgroundColor: bgColor, backgroundImage: bgImage, fontFamily, color: textColor }}
        >
          <div className="h-7 w-full flex items-center justify-between px-6 pt-1 text-[10px] font-semibold opacity-70 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 border border-current rounded-xs" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4" style={{ scrollbarWidth: 'none' }}>
            {headerImage && (
              <div className="relative group -mx-2 mb-4">
                <div className="w-full h-28 rounded-xl overflow-hidden shadow-xs">
                  <img src={headerImage} alt="Header" className="w-full h-full object-cover" />
                </div>
                {onHeaderChange && !disabled && (
                  <button
                    onClick={() => setEditingHeader(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  >
                    <div className="flex items-center gap-1 text-white text-xs font-semibold">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </div>
                  </button>
                )}
                {editingHeader && (
                  <ImageEditorPopup
                    isOpen={editingHeader}
                    onClose={() => setEditingHeader(false)}
                    onSubmit={(url) => onHeaderChange?.(url)}
                    onRemove={() => { onHeaderChange?.(undefined); setEditingHeader(false); }}
                    currentImage={headerImage}
                    title="Header Image"
                    maxSize={5}
                  />
                )}
              </div>
            )}
            
            {!headerImage && onHeaderChange && !disabled && (
              <div className="relative text-center mb-1">
                <button
                  onClick={() => setEditingHeader(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: textColor }}
                >
                  <ImagePlus className="w-3 h-3" />
                  <span>Add header cover</span>
                </button>
                {editingHeader && (
                  <ImageEditorPopup
                    isOpen={editingHeader}
                    onClose={() => setEditingHeader(false)}
                    onSubmit={(url) => onHeaderChange?.(url)}
                    onRemove={() => { onHeaderChange?.(undefined); setEditingHeader(false); }}
                    currentImage={headerImage}
                    title="Header Image"
                    maxSize={5}
                  />
                )}
              </div>
            )}
            
            <header className="flex flex-col items-center text-center">
              <div className="relative mb-3 group">
                <div 
                  className="w-16 h-16 rounded-full overflow-hidden shadow-elevated"
                  style={{ backgroundColor: bgColor, border: `2px solid ${primaryColor}40` }}
                >
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                {showVerification && profile?.nip05 && (
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full shadow-xs"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    <BadgeCheck className="w-3 h-3" />
                  </div>
                )}
                
                {onAvatarChange && !disabled && (
                  <button
                    onClick={() => setEditingAvatar(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
                {editingAvatar && (
                  <ImageEditorPopup
                    isOpen={editingAvatar}
                    onClose={() => setEditingAvatar(false)}
                    onSubmit={(url) => onAvatarChange?.(url)}
                    onRemove={() => { onAvatarChange?.(undefined); setEditingAvatar(false); }}
                    currentImage={data?.profile?.picture}
                    title="Profile Picture"
                    maxSize={2}
                  />
                )}
              </div>

              <div className="relative group">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                    className="text-base font-bold text-center bg-transparent border-b-2 border-brand outline-none w-44"
                    style={{ color: textColor }}
                  />
                ) : (
                  <h1 className="text-base font-bold tracking-tight inline-flex items-center gap-1.5" style={{ color: textColor }}>
                    <span>{displayName}</span>
                    {onTitleChange && !disabled && (
                      <button
                        onClick={startEditTitle}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-black/10"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </h1>
                )}
              </div>

              {showVerification && profile?.nip05 && (
                <p className="text-[10px] mt-0.5 font-medium flex items-center gap-1" style={{ color: primaryColor }}>
                  <span>✓</span>
                  <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
                </p>
              )}

              {displayBio && (
                <p className="text-xs leading-relaxed max-w-[240px] mt-1.5 opacity-75" style={{ color: textColor }}>
                  {displayBio}
                </p>
              )}
            </header>

            <div className="space-y-2.5 pt-1">
              {visibleLinks.length === 0 && (
                <div className="p-4 text-center text-xs opacity-60 border border-dashed rounded-xl">
                  No links yet. Add one in the editor!
                </div>
              )}
              {visibleLinks.map((link) => (
                <div
                  key={link.id}
                  className="w-full px-3 py-2.5 font-semibold text-xs transition-all flex items-center justify-between shadow-xs text-left"
                  style={{
                    backgroundColor: isBackgroundImage ? "rgba(255,255,255,0.12)" : `${fgColor}0a`,
                    color: textColor,
                    borderRadius: borderRadius,
                    border: `1px solid ${isBackgroundImage ? "rgba(255,255,255,0.18)" : `${fgColor}14`}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                    <LinkItemIcon icon={link.icon} emoji={link.emoji} url={link.url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="truncate block">{link.title}</span>
                      {link.subtitle && (
                        <span className="text-[10px] opacity-70 truncate block font-normal leading-tight mt-0.5">
                          {link.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 opacity-40 shrink-0 ml-1.5" />
                </div>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="flex justify-center gap-2 pt-3 flex-wrap">
                {socials.map((_social, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
                    style={{ 
                      backgroundColor: isBackgroundImage ? "rgba(255,255,255,0.12)" : `${fgColor}0a`,
                      border: `1px solid ${isBackgroundImage ? "rgba(255,255,255,0.18)" : `${fgColor}14`}`,
                      color: textColor 
                    }}
                  >
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobilePreview;
