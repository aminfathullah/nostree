import * as React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Reorder, AnimatePresence, motion } from "motion/react";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Folder,
  Move,
  CornerDownRight
} from "lucide-react";
import { Button } from "../ui/Button";
import type { Link, LinkItem, LinkGroup } from "../../schemas/nostr";
import { LinkItemIcon, IconPickerDropdown } from "./LinkItemIcon";

interface LinkEditorItemProps {
  link: Link;
  index: number;
  totalCount: number;
  onUpdate: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveToGroup?: (linkId: string, groupId: string | null) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  availableGroups?: LinkGroup[];
}

function LinkEditorItem({ 
  link, 
  index,
  totalCount,
  onUpdate, 
  onDelete, 
  onToggleVisibility,
  onMoveToGroup,
  onMoveUp,
  onMoveDown,
  availableGroups = [],
}: LinkEditorItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [subtitle, setSubtitle] = useState(link.subtitle || "");
  const [url, setUrl] = useState(link.url);
  const [icon, setIcon] = useState<string | undefined>(link.icon);
  const [emoji, setEmoji] = useState(link.emoji || "");

  const handleSave = () => {
    onUpdate({
      ...link,
      title: title.trim() || link.title,
      subtitle: subtitle.trim() || undefined,
      url: url.trim() || link.url,
      icon: icon || undefined,
      emoji: emoji.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(link.title);
    setSubtitle(link.subtitle || "");
    setUrl(link.url);
    setIcon(link.icon);
    setEmoji(link.emoji || "");
    setIsEditing(false);
  };

  return (
    <Reorder.Item
      value={link}
      id={link.id}
      className={`w-full ${isEditing ? 'relative z-30' : 'relative group'}`}
      whileDrag={{ scale: 1.01, boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}
    >
      <motion.div
        layout
        className={`
          bg-card border rounded-2xl transition-colors duration-150 ease-out
          ${isEditing ? 'relative z-30 ring-2 ring-brand/30' : ''}
          ${link.visible ? 'border-border shadow-card hover:border-border-hover' : 'border-border/40 opacity-50'}
        `}
      >
        <div className="flex items-stretch max-w-full">
          <div className="flex flex-col items-center justify-center px-2 sm:px-2.5 bg-canvas/60 border-r border-border/80 rounded-l-2xl">
            <div className="cursor-grab active:cursor-grabbing p-1 text-txt-dim hover:text-txt-main transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-0.5 text-txt-dim hover:text-txt-main disabled:opacity-20 disabled:hover:text-txt-dim transition-colors cursor-pointer active:scale-[0.92]"
                title="Pindah ke atas"
                aria-label="Pindah ke atas"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalCount - 1}
                className="p-0.5 text-txt-dim hover:text-txt-main disabled:opacity-20 disabled:hover:text-txt-dim transition-colors cursor-pointer active:scale-[0.92]"
                title="Pindah ke bawah"
                aria-label="Pindah ke bawah"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0 p-3 sm:p-3.5">
            {isEditing ? (
              <div 
                className="space-y-2.5 animate-fade-in"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
              >
                <div className="flex gap-2 items-center">
                  <IconPickerDropdown
                    selectedIcon={icon}
                    selectedEmoji={emoji}
                    url={url}
                    onSelectIcon={(i) => {
                      setIcon(i);
                      if (i) setEmoji("");
                    }}
                    onSelectEmoji={(em) => {
                      setEmoji(em || "");
                      if (em) setIcon(undefined);
                    }}
                  />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    placeholder="Judul tautan"
                    className="flex-1 h-10 px-3 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-sm font-medium"
                    autoFocus
                  />
                </div>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="Keterangan singkat (opsional)"
                  className="w-full h-9 px-3 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-xs"
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full h-9 px-3 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-xs font-mono"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs h-8">
                    Batal
                  </Button>
                  <Button size="sm" onClick={handleSave} className="text-xs h-8" prefixIcon={<Save className="w-3.5 h-3.5" />}>
                    Simpan
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 rounded-xl p-1 transition-opacity w-full text-left"
                onClick={() => setIsEditing(true)}
              >
                <LinkItemIcon icon={link.icon} emoji={link.emoji} url={link.url} size="md" />
                <div className="w-0 flex-grow overflow-hidden">
                  <p className="font-semibold text-sm text-txt-main truncate tracking-tight">{link.title}</p>
                  {link.subtitle && (
                    <p className="text-xs text-txt-dim truncate mt-0.5">{link.subtitle}</p>
                  )}
                  <p className="text-[11px] text-txt-dim/70 truncate font-mono mt-0.5">{link.url}</p>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 pr-2">
              {onMoveToGroup && availableGroups.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    className="p-2 rounded-xl text-txt-dim hover:text-txt-main hover:bg-canvas transition-colors cursor-pointer active:scale-[0.92]"
                    title="Pindah ke grup"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  {showMoveMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowMoveMenu(false)} />
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 bg-card border border-border rounded-2xl shadow-elevated py-1.5 z-40 min-w-[160px] animate-pop origin-top-right"
                      >
                        <button
                          onClick={() => {
                            onMoveToGroup(link.id, null);
                            setShowMoveMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs hover:bg-card-hover transition-colors text-txt-main flex items-center gap-2 cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-txt-dim" />
                          <span>Level Utama (Root)</span>
                        </button>
                        {availableGroups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => {
                              onMoveToGroup(link.id, group.id);
                              setShowMoveMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-card-hover transition-colors text-txt-main flex items-center gap-2 cursor-pointer"
                          >
                            <Folder className="w-3.5 h-3.5 text-brand" />
                            <span className="truncate">{group.title}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => onToggleVisibility(link.id)}
                className="p-2 rounded-xl text-txt-dim hover:text-txt-main hover:bg-canvas transition-colors cursor-pointer active:scale-[0.92]"
                title={link.visible ? "Sembunyikan tautan" : "Tampilkan tautan"}
              >
                {link.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-2 rounded-xl text-txt-dim hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer active:scale-[0.92]"
                title="Hapus tautan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

interface LinkGroupEditorProps {
  group: LinkGroup;
  onUpdateGroup: (group: LinkGroup) => void;
  onDeleteGroup: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorderLinks: (groupId: string, links: Link[]) => void;
  onMoveToGroup?: (linkId: string, groupId: string | null) => void;
  availableGroups?: LinkGroup[];
}

function LinkGroupEditor({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onToggleCollapse,
  onUpdateLink,
  onDeleteLink,
  onToggleVisibility,
  onReorderLinks,
  onMoveToGroup,
  availableGroups = [],
}: LinkGroupEditorProps) {
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(group.title);
  const [emoji, setEmoji] = useState(group.emoji || "");

  const handleSaveGroup = () => {
    onUpdateGroup({
      ...group,
      title: title.trim() || group.title,
      emoji: emoji.trim() || undefined,
    });
    setIsEditingGroup(false);
  };

  const handleCancelGroup = () => {
    setTitle(group.title);
    setEmoji(group.emoji || "");
    setIsEditingGroup(false);
  };

  const moveLinkInGroup = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= group.links.length) return;
    const reordered = [...group.links];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    onReorderLinks(group.id, reordered);
  };

  const otherGroups = availableGroups.filter(g => g.id !== group.id);

  return (
    <motion.div
      layout
      className={`
        bg-card border rounded-2xl transition-all shadow-card
        ${group.visible ? 'border-border' : 'border-border/40 opacity-50'}
      `}
    >
      <div className="flex items-center justify-between gap-2 p-3 bg-canvas/40 border-b border-border rounded-t-2xl">
        <button
          onClick={() => onToggleCollapse(group.id)}
          className="p-1 rounded-lg text-brand hover:bg-brand/10 transition-colors"
          title={group.collapsed ? "Expand group" : "Collapse group"}
        >
          {group.collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isEditingGroup ? (
          <div className="flex-1 flex gap-2 animate-fade-in">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📁"
              className="w-12 h-8 px-2 text-center text-base bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nama grup"
              className="flex-1 h-8 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main text-xs font-semibold"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleCancelGroup} className="h-8 text-xs">
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" onClick={handleSaveGroup} className="h-8 text-xs">
              <Save className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <div 
              className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
              onClick={() => setIsEditingGroup(true)}
            >
              {group.emoji && <span className="text-base shrink-0">{group.emoji}</span>}
              <span className="font-bold text-sm text-txt-main truncate tracking-tight">{group.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand shrink-0">
                {group.links.length}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleVisibility(group.id)}
                className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-canvas transition-colors"
                title={group.visible ? "Hide group" : "Show group"}
              >
                {group.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (group.links.length > 0) {
                    setConfirmDelete(true);
                  } else {
                    onDeleteGroup(group.id);
                  }
                }}
                className="p-1.5 rounded-lg text-txt-dim hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer active:scale-[0.92]"
                title="Hapus grup"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {!group.collapsed && (
        <div className="p-3 space-y-2 bg-canvas/10">
          {group.links.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={group.links}
              onReorder={(newOrder) => onReorderLinks(group.id, newOrder)}
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {group.links.map((link, idx) => (
                  <LinkEditorItem
                    key={link.id}
                    link={link}
                    index={idx}
                    totalCount={group.links.length}
                    onUpdate={onUpdateLink}
                    onDelete={onDeleteLink}
                    onToggleVisibility={onToggleVisibility}
                    onMoveToGroup={onMoveToGroup}
                    onMoveUp={() => moveLinkInGroup(idx, 'up')}
                    onMoveDown={() => moveLinkInGroup(idx, 'down')}
                    availableGroups={otherGroups}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <div className="text-center py-6 text-txt-dim text-xs border border-dashed border-border rounded-xl">
              <Folder className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
              <p className="font-medium">Empty Group</p>
              <p className="text-[11px] mt-0.5">Add links or use the move action to place links here</p>
            </div>
          )}
        </div>
      )}

      {confirmDelete && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-txt-main truncate">Hapus Grup?</h3>
                  <p className="text-xs text-txt-muted truncate">{group.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-txt-muted leading-relaxed">
                Grup ini berisi <span className="font-semibold text-txt-main">{group.links.length} tautan</span>. Menghapus grup ini juga akan menghapus seluruh tautan di dalamnya.
              </p>
            </div>
            <div className="px-5 py-3.5 bg-canvas/60 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                id="btn-cancel-delete-group"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                id="btn-confirm-delete-group"
                type="button"
                variant="solid"
                size="sm"
                onClick={() => {
                  onDeleteGroup(group.id);
                  setConfirmDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer active:scale-[0.98]"
                prefixIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Hapus Grup
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}

interface AddLinkFormProps {
  onAdd: (link: Omit<Link, "id">) => void;
  onCancel: () => void;
}

function AddLinkForm({ onAdd, onCancel }: AddLinkFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<string | undefined>();
  const [emoji, setEmoji] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    onAdd({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      url: url.trim(),
      icon: icon || undefined,
      emoji: emoji.trim() || undefined,
      visible: true,
      clicks: 0,
    });
    
    setTitle("");
    setSubtitle("");
    setUrl("");
    setIcon(undefined);
    setEmoji("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="bg-card border-2 border-brand/40 rounded-2xl p-4 space-y-3 shadow-elevated relative z-20"
    >
      <div className="flex gap-2 items-center">
        <IconPickerDropdown
          selectedIcon={icon}
          selectedEmoji={emoji}
          url={url}
          onSelectIcon={(i) => {
            setIcon(i);
            if (i) setEmoji("");
          }}
          onSelectEmoji={(em) => {
            setEmoji(em || "");
            if (em) setIcon(undefined);
          }}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul tautan"
          className="flex-1 h-10 px-3.5 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-sm font-medium"
          autoFocus
        />
      </div>
      <input
        type="text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Keterangan singkat (opsional)"
        className="w-full h-9 px-3.5 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-xs"
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full h-10 px-3.5 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-xs font-mono"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim() || !url.trim()} className="text-xs" prefixIcon={<Plus className="w-3.5 h-3.5" />}>
          Tambah Tautan
        </Button>
      </div>
    </motion.form>
  );
}

interface AddGroupFormProps {
  onAdd: (group: Omit<LinkGroup, "id" | "type" | "links">) => void;
  onCancel: () => void;
}

function AddGroupForm({ onAdd, onCancel }: AddGroupFormProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      emoji: emoji.trim() || undefined,
      collapsed: false,
      visible: true,
    });
    
    setTitle("");
    setEmoji("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="bg-card border-2 border-dashed border-brand/40 rounded-2xl p-4 space-y-3 shadow-elevated"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📁"
          className="w-16 h-10 px-2 text-center text-lg bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nama grup"
          className="flex-1 h-10 px-3.5 bg-canvas border border-border rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-txt-main text-sm font-medium"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()} className="text-xs" prefixIcon={<Folder className="w-3.5 h-3.5" />}>
          Buat Grup
        </Button>
      </div>
    </motion.form>
  );
}

interface LinkEditorV2Props {
  links: LinkItem[];
  isSaving: boolean;
  onReorder: (newOrder: LinkItem[]) => void;
  onAdd: (link: Omit<Link, "id">) => void;
  onAddGroup: (group: Omit<LinkGroup, "id" | "type" | "links">) => void;
  onUpdate: (link: Link) => void;
  onUpdateGroup: (group: LinkGroup) => void;
  onDelete: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onMoveToGroup: (linkId: string, groupId: string | null) => void;
  onReorderWithinGroup: (groupId: string, links: Link[]) => void;
}

export function LinkEditorV2({
  links,
  isSaving,
  onReorder,
  onAdd,
  onAddGroup,
  onUpdate,
  onUpdateGroup,
  onDelete,
  onDeleteGroup,
  onToggleVisibility,
  onToggleGroupCollapse,
  onMoveToGroup,
  onReorderWithinGroup,
}: LinkEditorV2Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  const handleAdd = (link: Omit<Link, "id">) => {
    onAdd(link);
    setShowAddForm(false);
  };

  const handleAddGroup = (group: Omit<LinkGroup, "id" | "type" | "links">) => {
    onAddGroup(group);
    setShowAddGroupForm(false);
  };

  const rootLinks: Link[] = [];
  const groups: LinkGroup[] = [];
  
  links.forEach(item => {
    if ('type' in item && item.type === 'group') {
      groups.push(item);
    } else {
      rootLinks.push(item as Link);
    }
  });

  const moveRootLink = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= rootLinks.length) return;
    const reordered = [...rootLinks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    onReorder([...reordered, ...groups]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-bold text-txt-main tracking-tight">Your Links &amp; Groups</h2>
          <p className="text-xs text-txt-dim">Drag cards or use arrow buttons to organize your tree</p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          <AddLinkForm 
            key="link-form"
            onAdd={handleAdd} 
            onCancel={() => setShowAddForm(false)} 
          />
        ) : showAddGroupForm ? (
          <AddGroupForm
            key="group-form"
            onAdd={handleAddGroup}
            onCancel={() => setShowAddGroupForm(false)}
          />
        ) : (
          <motion.div key="buttons" layout className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1 text-xs font-semibold py-2.5 rounded-xl border-dashed hover:border-brand"
              onClick={() => setShowAddForm(true)}
              prefixIcon={<Plus className="w-4 h-4" />}
            >
              Add Link
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs font-semibold py-2.5 rounded-xl border-dashed hover:border-brand"
              onClick={() => setShowAddGroupForm(true)}
              prefixIcon={<Folder className="w-4 h-4" />}
            >
              New Group
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {rootLinks.length > 0 && (
        <Reorder.Group
          axis="y"
          values={rootLinks}
          onReorder={(newOrder) => {
            onReorder([...newOrder, ...groups]);
          }}
          className="space-y-2.5 w-full"
        >
          <AnimatePresence mode="popLayout">
            {rootLinks.map((link, idx) => (
              <LinkEditorItem
                key={link.id}
                link={link}
                index={idx}
                totalCount={rootLinks.length}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
                onMoveToGroup={onMoveToGroup}
                onMoveUp={() => moveRootLink(idx, 'up')}
                onMoveDown={() => moveRootLink(idx, 'down')}
                availableGroups={groups}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {groups.length > 0 && (
        <div className="space-y-3 pt-1">
          {groups.map((group) => (
            <LinkGroupEditor
              key={group.id}
              group={group}
              onUpdateGroup={onUpdateGroup}
              onDeleteGroup={onDeleteGroup}
              onToggleCollapse={onToggleGroupCollapse}
              onUpdateLink={onUpdate}
              onDeleteLink={onDelete}
              onToggleVisibility={onToggleVisibility}
              onReorderLinks={onReorderWithinGroup}
              onMoveToGroup={onMoveToGroup}
              availableGroups={groups}
            />
          ))}
        </div>
      )}

      {links.length === 0 && !showAddForm && !showAddGroupForm && (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-border bg-card/50">
          <p className="text-sm font-semibold text-txt-main">No links yet</p>
          <p className="text-xs text-txt-dim mt-1 max-w-xs mx-auto">
            Click &quot;Add Link&quot; above to add your first destination or social profile.
          </p>
        </div>
      )}
    </div>
  );
}

export default LinkEditorV2;
