import * as React from "react";
import { useState, useEffect } from "react";
import { Reorder, AnimatePresence, motion } from "motion/react";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";
import type { Link } from "../../schemas/nostr";

interface LinkEditorItemProps {
  link: Link;
  onUpdate: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

/**
 * Single draggable link item in the editor
 */
function LinkEditorItem({ 
  link, 
  onUpdate, 
  onDelete, 
  onToggleVisibility 
}: LinkEditorItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [emoji, setEmoji] = useState(link.emoji || "");

  const handleSave = () => {
    onUpdate({
      ...link,
      title,
      url,
      emoji: emoji || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(link.title);
    setUrl(link.url);
    setEmoji(link.emoji || "");
    setIsEditing(false);
  };

  return (
    <Reorder.Item
      value={link}
      id={link.id}
      className="relative group w-full"
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
    >
      <motion.div
        layout
        className={`
          bg-card border rounded-xl overflow-hidden transition-colors
          ${link.visible ? 'border-border' : 'border-border/50 opacity-60'}
        `}
      >
        <div className="flex items-stretch max-w-full">
          {/* Drag Handle */}
          <div className="flex items-center px-3 cursor-grab active:cursor-grabbing bg-card-hover border-r border-border">
            <GripVertical className="w-5 h-5 text-txt-dim" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden p-3">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="🔗"
                    className="w-12 h-10 px-2 text-center text-xl bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Link title"
                    className="flex-1 h-10 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main"
                  />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-card-hover rounded-lg p-1 -m-1 transition-colors w-full"
                onClick={() => setIsEditing(true)}
              >
                {link.emoji && (
                  <span className="text-xl flex-shrink-0">{link.emoji}</span>
                )}
                <div className="w-0 flex-grow overflow-hidden">
                  <p className="font-medium text-txt-main truncate">{link.title}</p>
                  <p className="text-sm text-txt-dim truncate">{link.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-txt-dim flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleVisibility(link.id)}
                className="p-2 rounded-lg hover:bg-card-hover transition-colors"
                title={link.visible ? "Hide link" : "Show link"}
              >
                {link.visible ? (
                  <Eye className="w-4 h-4 text-txt-muted" />
                ) : (
                  <EyeOff className="w-4 h-4 text-txt-dim" />
                )}
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group/delete"
                title="Delete link"
              >
                <Trash2 className="w-4 h-4 text-txt-muted group-hover/delete:text-red-400" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

interface AddLinkFormProps {
  onAdd: (link: Omit<Link, "id">) => void;
  onCancel: () => void;
}

/**
 * Form for adding a new link
 */
function AddLinkForm({ onAdd, onCancel }: AddLinkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    onAdd({
      title: title.trim(),
      url: url.trim(),
      emoji: emoji || undefined,
      visible: true,
      clicks: 0,
    });
    
    setTitle("");
    setUrl("");
    setEmoji("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border border-brand/50 rounded-xl p-4 space-y-3"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🔗"
          className="w-12 h-10 px-2 text-center text-xl bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Link title"
          className="flex-1 h-10 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main"
          autoFocus
        />
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="w-full h-10 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim() || !url.trim()}>
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>
    </motion.form>
  );
}

interface LinkEditorProps {
  links: Link[];
  isSaving: boolean;
  onReorder: (newOrder: Link[]) => void;
  onAdd: (link: Omit<Link, "id">) => void;
  onUpdate: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

/**
 * Main link editor component with drag-and-drop reordering
 */
export function LinkEditor({
  links,
  isSaving,
  onReorder,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: LinkEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (link: Omit<Link, "id">) => {
    onAdd(link);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-txt-main">Your Links</h2>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-brand">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Links List */}
      <Reorder.Group
        axis="y"
        values={links}
        onReorder={onReorder}
        className="space-y-2 w-full overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          {links.map((link) => (
            <LinkEditorItem
              key={link.id}
              link={link}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Empty State */}
      {links.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-txt-muted">
          <p>No links yet. Add your first link!</p>
        </div>
      )}

      {/* Add Link Form/Button */}
      <AnimatePresence mode="wait">
        {showAddForm ? (
          <AddLinkForm 
            key="form"
            onAdd={handleAdd} 
            onCancel={() => setShowAddForm(false)} 
          />
        ) : (
          <motion.div key="button" layout>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Link
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LinkEditor;
