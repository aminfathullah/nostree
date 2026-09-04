import { useState, useRef } from "react";
import { Upload, Link, X, Camera } from "lucide-react";
import { toast } from "sonner";

interface AvatarEditorProps {
  currentPicture: string | undefined;
  fallbackPicture: string | undefined;
  onPictureChange: (pictureUrl: string | undefined) => void;
  disabled?: boolean;
}

export function AvatarEditor({ currentPicture, fallbackPicture, onPictureChange, disabled }: AvatarEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPicture = currentPicture || fallbackPicture || "https://api.dicebear.com/7.x/shapes/svg?seed=default";

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      onPictureChange(imageUrl.trim());
      setImageUrl("");
      setIsOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onPictureChange(dataUrl);
        setIsUploading(false);
        setIsOpen(false);
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

  const handleRemove = () => {
    onPictureChange(undefined);
    setImageUrl("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        title="Change profile picture"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden border border-border">
          <img 
            src={displayPicture} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <Camera className="w-3 h-3 text-txt-muted" />
        <span className="text-sm font-medium text-txt-main">Avatar</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-4 animate-pop origin-top-left"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-txt-main">Profile Picture</h4>
              {currentPicture && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
                <img 
                  src={displayPicture} 
                  alt="Current avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-txt-muted mb-1.5 flex items-center gap-1">
                <Link className="w-3 h-3" />
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-2 text-sm bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleImageUrlSubmit}
                  disabled={!imageUrl.trim()}
                  className="px-3 py-2 bg-brand text-brand-fg text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-txt-dim">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-3 border-2 border-dashed border-border rounded-lg hover:border-brand hover:bg-brand/5 transition-all text-center cursor-pointer"
            >
              {isUploading ? (
                <span className="text-sm text-txt-muted">Uploading...</span>
              ) : (
                <>
                  <Upload className="w-5 h-5 mx-auto text-txt-muted mb-1" />
                  <span className="text-xs text-txt-muted block">Upload (max 2MB)</span>
                </>
              )}
            </button>

            <p className="text-xs text-txt-dim text-center mt-3">
              Square images work best
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AvatarEditor;
