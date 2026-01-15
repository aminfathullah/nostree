import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface TreeTitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  disabled?: boolean;
}

/**
 * Inline editable title for the tree preview
 */
export function TreeTitleEditor({ title, onTitleChange, disabled }: TreeTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 text-txt-main w-48"
          maxLength={32}
        />
        <button
          onClick={handleSave}
          className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
          title="Save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-txt-main hover:bg-card rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
      title="Click to edit title"
    >
      <span className="font-medium">{title || "Set tree title..."}</span>
      <Pencil className="w-3.5 h-3.5 text-txt-dim opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export default TreeTitleEditor;
