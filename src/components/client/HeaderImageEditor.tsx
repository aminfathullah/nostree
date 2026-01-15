import { useState, useRef } from "react";
import { Image, Upload, Link, X, ImagePlus } from "lucide-react";

interface HeaderImageEditorProps {
  currentImage: string | undefined;
  onImageChange: (imageUrl: string | undefined) => void;
  disabled?: boolean;
}

/**
 * Editor for header/banner image displayed above the profile
 */
export function HeaderImageEditor({ currentImage, onImageChange, disabled }: HeaderImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageChange(imageUrl.trim());
      setImageUrl("");
      setIsOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onImageChange(dataUrl);
        setIsUploading(false);
        setIsOpen(false);
      };
      reader.onerror = () => {
        alert("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onImageChange(undefined);
    setImageUrl("");
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-border-hover transition-colors disabled:opacity-50"
        title="Add header image"
      >
        <ImagePlus className="w-4 h-4 text-txt-muted" />
        <span className="text-sm font-medium text-txt-main">
          {currentImage ? "Header" : "Add Header"}
        </span>
        {currentImage && (
          <span className="w-2 h-2 rounded-full bg-green-500" title="Header image set" />
        )}
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
              <h4 className="text-sm font-medium text-txt-main flex items-center gap-2">
                <Image className="w-4 h-4" />
                Header Image
              </h4>
              {currentImage && (
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            {/* Current Image Preview */}
            {currentImage && (
              <div className="mb-4">
                <img 
                  src={currentImage} 
                  alt="Header preview" 
                  className="w-full h-24 object-cover rounded-lg border border-border"
                />
              </div>
            )}

            {/* Image URL Input */}
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
                  placeholder="https://example.com/banner.jpg"
                  className="flex-1 px-3 py-2 text-sm bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
                />
                <button
                  onClick={handleImageUrlSubmit}
                  disabled={!imageUrl.trim()}
                  className="px-3 py-2 bg-brand text-brand-fg text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-txt-dim">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* File Upload */}
            <div>
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
                className="w-full p-3 border-2 border-dashed border-border rounded-lg hover:border-brand hover:bg-brand/5 transition-all text-center"
              >
                {isUploading ? (
                  <span className="text-sm text-txt-muted">Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mx-auto text-txt-muted mb-1" />
                    <span className="text-xs text-txt-muted block">Upload image (max 5MB)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-txt-dim text-center mt-3">
              Recommended: 1200×400px or similar wide format
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default HeaderImageEditor;
