import { useState, useRef } from "react";
import type { Link, NostreeData } from "../../schemas/nostr";
import { BadgeCheck, ExternalLink, Camera, ImagePlus, Pencil, Upload, X } from "lucide-react";

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
  // Edit callbacks (optional - if not provided, inline editing is disabled)
  onAvatarChange?: (picture: string | undefined) => void;
  onHeaderChange?: (headerImage: string | undefined) => void;
  onTitleChange?: (title: string) => void;
  disabled?: boolean;
}

// Inline Image Editor Popup
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
      alert(`Image must be less than ${maxSize}MB`);
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
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-txt-main">{title}</span>
          {currentImage && (
            <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
              <X className="w-3 h-3" />Remove
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL"
            className="flex-1 px-2 py-1.5 text-xs bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
          />
          <button
            onClick={() => { onSubmit(imageUrl); setImageUrl(""); onClose(); }}
            disabled={!imageUrl.trim()}
            className="px-2 py-1.5 bg-brand text-brand-fg text-xs font-medium rounded-lg disabled:opacity-50"
          >
            Set
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-2 border border-dashed border-border rounded-lg hover:border-brand text-center"
        >
          <Upload className="w-4 h-4 mx-auto text-txt-muted" />
          <span className="text-xs text-txt-muted">{isUploading ? "Uploading..." : `Upload (max ${maxSize}MB)`}</span>
        </button>
      </div>
    </>
  );
}

/**
 * Live mobile preview with inline editing
 */
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

  // Tree title takes precedence over profile name
  const displayName = (data && 'treeMeta' in data && data.treeMeta?.title) || data?.profile?.name || profile?.name || "Your Name";
  const displayBio = data?.profile?.bio || profile?.about || "";
  const showVerification = data?.profile?.show_verification ?? true;
  const visibleLinks = links.filter(l => l.visible);
  const socials = data?.socials || [];
  const theme = data?.theme;

  // Apply theme if present
  const bgValue = theme?.colors.background || "#ffffff";
  const isBackgroundImage = bgValue.startsWith("url(");
  const bgColor = isBackgroundImage ? "#1a1a1a" : bgValue;
  const bgImage = isBackgroundImage ? bgValue : undefined;
  const fgColor = theme?.colors.foreground || "#1f2937";
  const primaryColor = theme?.colors.primary || "#5E47B8";
  const borderRadius = theme?.colors.radius || "1rem";
  const font = theme?.font || "Inter";
  const textColor = isBackgroundImage ? "#ffffff" : fgColor;
  
  const fontFamily = font === "Serif" ? "Georgia, serif" : font === "Mono" ? "monospace" : `${font}, system-ui, sans-serif`;

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
    <div className="sticky top-6">
      <h3 className="text-sm font-medium text-txt-muted mb-3 text-center">
        Preview
      </h3>
      
      {/* Phone Frame */}
      <div 
        className="w-[375px] h-[700px] border-8 border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden mx-auto bg-cover bg-center"
        style={{ backgroundColor: bgColor, backgroundImage: bgImage, fontFamily, color: textColor }}
      >
        {/* Content */}
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="px-6 py-10">
            {/* Header Image - Only shown if set */}
            {headerImage && (
              <div className="relative group mb-6 -mx-2">
                <div className="w-full h-32 rounded-xl overflow-hidden">
                  <img src={headerImage} alt="Header" className="w-full h-full object-cover" />
                </div>
                {onHeaderChange && !disabled && (
                  <button
                    onClick={() => setEditingHeader(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  >
                    <div className="flex items-center gap-1 text-white text-xs font-medium">
                      <ImagePlus className="w-4 h-4" />
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
            
            {/* Add Header Button - Small floating button when no header */}
            {!headerImage && onHeaderChange && !disabled && (
              <div className="relative mb-2">
                <button
                  onClick={() => setEditingHeader(true)}
                  className="flex items-center gap-1 text-xs text-txt-muted hover:text-txt-main transition-colors mx-auto opacity-60 hover:opacity-100"
                >
                  <ImagePlus className="w-3 h-3" />
                  <span>Add header</span>
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
            
            {/* Profile Header */}
            <header className="flex flex-col items-center text-center mb-8">
              {/* Avatar - Editable */}
              <div className="relative mb-4 group">
                <div 
                  className="w-20 h-20 rounded-full overflow-hidden"
                  style={{ backgroundColor: bgColor, boxShadow: `0 0 0 4px ${bgColor}` }}
                >
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                {showVerification && profile?.nip05 && (
                  <div className="absolute -bottom-1 -right-1 bg-brand text-brand-fg p-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                  </div>
                )}
                
                {onAvatarChange && !disabled && (
                  <button
                    onClick={() => setEditingAvatar(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  >
                    <Camera className="w-5 h-5 text-white" />
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

              {/* Name - Editable */}
              <div className="relative group">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                    className="text-xl font-bold mb-1 text-center bg-transparent border-b-2 border-brand outline-none w-48"
                    style={{ color: textColor }}
                  />
                ) : (
                  <h1 className="text-xl font-bold mb-1" style={{ color: textColor }}>
                    {displayName}
                    {onTitleChange && !disabled && (
                      <button
                        onClick={startEditTitle}
                        className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-white/10"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </h1>
                )}
              </div>

              {/* NIP-05 */}
              {showVerification && profile?.nip05 && (
                <p className="text-xs mb-2 flex items-center gap-1" style={{ color: primaryColor }}>
                  <span>✓</span>
                  <span>{profile.nip05.startsWith("_@") ? profile.nip05.slice(2) : profile.nip05}</span>
                </p>
              )}

              {/* Bio */}
              {displayBio && (
                <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: textColor, opacity: 0.7 }}>{displayBio}</p>
              )}
            </header>

            {/* Links */}
            <div className="space-y-3 mb-8">
              {visibleLinks.length === 0 && (
                <div className="p-4 text-center text-txt-muted text-sm border border-dashed border-border/50 rounded-xl">
                  No links yet. Add one!
                </div>
              )}
              {visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 text-center font-medium transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: isBackgroundImage ? "rgba(255,255,255,0.15)" : `${fgColor}10`,
                    color: textColor,
                    borderRadius: borderRadius,
                    border: `1px solid ${isBackgroundImage ? "rgba(255,255,255,0.2)" : `${fgColor}20`}`,
                    backdropFilter: isBackgroundImage ? "blur(10px)" : undefined,
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {link.emoji && <span>{link.emoji}</span>}
                    <span>{link.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </span>
                </a>
              ))}
            </div>

            {/* Social Icons */}
            {socials.length > 0 && (
              <div className="flex justify-center gap-4 pt-4 border-t border-border/20">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-colors"
                    style={{ backgroundColor: `${textColor}10`, color: textColor }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
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
