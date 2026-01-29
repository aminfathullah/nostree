import * as React from "react";
import { useState } from "react";
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
  ChevronDown,
  ChevronRight,
  Folder,
  Move,
} from "lucide-react";
import { Button } from "../ui/Button";
import type { Link, LinkItem, LinkGroup } from "../../schemas/nostr";

interface LinkEditorItemProps {
  link: Link;
  onUpdate: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveToGroup?: (linkId: string, groupId: string | null) => void;
  availableGroups?: LinkGroup[];
}

/**
 * Single draggable link item in the editor
 */
function LinkEditorItem({ 
  link, 
  onUpdate, 
  onDelete, 
  onToggleVisibility,
  onMoveToGroup,
  availableGroups = [],
}: LinkEditorItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
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
              {onMoveToGroup && availableGroups.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    className="p-2 rounded-lg hover:bg-card-hover transition-colors"
                    title="Move to group"
                  >
                    <Move className="w-4 h-4 text-txt-muted" />
                  </button>
                  {showMoveMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                      <button
                        onClick={() => {
                          onMoveToGroup(link.id, null);
                          setShowMoveMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-card-hover transition-colors text-txt-main"
                      >
                        📌 Root level
                      </button>
                      {availableGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            onMoveToGroup(link.id, group.id);
                            setShowMoveMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-card-hover transition-colors text-txt-main"
                        >
                          {group.emoji || '📁'} {group.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

/**
 * Group editor component with collapsible link list
 */
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
  const [title, setTitle] = useState(group.title);
  const [emoji, setEmoji] = useState(group.emoji || "");

  const handleSaveGroup = () => {
    onUpdateGroup({
      ...group,
      title,
      emoji: emoji || undefined,
    });
    setIsEditingGroup(false);
  };

  const handleCancelGroup = () => {
    setTitle(group.title);
    setEmoji(group.emoji || "");
    setIsEditingGroup(false);
  };

  // Filter out current group from available groups
  const otherGroups = availableGroups.filter(g => g.id !== group.id);

  return (
    <motion.div
      layout
      className={`
        bg-card border-2 rounded-2xl overflow-hidden transition-all shadow-sm
        ${group.visible ? 'border-brand/30 border-l-4 border-l-brand' : 'border-border/50 opacity-60 border-l-4 border-l-border'}
      `}
    >
      {/* Group Header */}
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-brand/5 to-transparent border-b border-border/50">
        <button
          onClick={() => onToggleCollapse(group.id)}
          className="p-1.5 hover:bg-brand/10 rounded-lg transition-colors"
          title={group.collapsed ? "Expand group" : "Collapse group"}
        >
          {group.collapsed ? (
            <ChevronRight className="w-4 h-4 text-brand" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand" />
          )}
        </button>

        {isEditingGroup ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📁"
              className="w-12 h-8 px-2 text-center text-lg bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Group name"
              className="flex-1 h-8 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main text-sm"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleCancelGroup}>
              <X className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={handleSaveGroup}>
              <Save className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <>
            <div 
              className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsEditingGroup(true)}
            >
              <span className="text-lg">{group.emoji || (group.collapsed ? '📁' : '📂')}</span>
              <span className="font-medium text-txt-main">{group.title}</span>
              <span className="text-xs text-txt-dim">({group.links.length})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleVisibility(group.id)}
                className="p-1.5 rounded-lg hover:bg-card transition-colors"
                title={group.visible ? "Hide group" : "Show group"}
              >
                {group.visible ? (
                  <Eye className="w-4 h-4 text-txt-muted" />
                ) : (
                  <EyeOff className="w-4 h-4 text-txt-dim" />
                )}
              </button>
              <button
                onClick={() => onDeleteGroup(group.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors group/delete"
                title="Delete group (moves links to root)"
              >
                <Trash2 className="w-4 h-4 text-txt-muted group-hover/delete:text-red-400" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Group Links */}
      {!group.collapsed && (
        <div className="p-3 pt-2 border-l-4 border-l-brand/20 ml-2">
          {group.links.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={group.links}
              onReorder={(newOrder) => onReorderLinks(group.id, newOrder)}
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {group.links.map((link) => (
                  <LinkEditorItem
                    key={link.id}
                    link={link}
                    onUpdate={onUpdateLink}
                    onDelete={onDeleteLink}
                    onToggleVisibility={onToggleVisibility}
                    onMoveToGroup={onMoveToGroup}
                    availableGroups={otherGroups}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <div className="text-center py-6 text-txt-dim text-sm border-2 border-dashed border-border rounded-lg">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Empty group</p>
              <p className="text-xs mt-1">Drag links here or use the move menu</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
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

interface AddGroupFormProps {
  onAdd: (group: Omit<LinkGroup, "id" | "type" | "links">) => void;
  onCancel: () => void;
}

/**
 * Form for adding a new group
 */
function AddGroupForm({ onAdd, onCancel }: AddGroupFormProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      emoji: emoji || undefined,
      collapsed: false,
      visible: true,
    });
    
    setTitle("");
    setEmoji("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-card-hover border-2 border-dashed border-brand/50 rounded-xl p-4 space-y-3"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📁"
          className="w-12 h-10 px-2 text-center text-xl bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Group name"
          className="flex-1 h-10 px-3 bg-canvas border border-border rounded-lg focus:border-brand focus:outline-none text-txt-main"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          <Folder className="w-4 h-4 mr-1" />
          Create Group
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

/**
 * Enhanced link editor with group support
 */
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

  // Separate root-level links from groups
  const rootLinks: Link[] = [];
  const groups: LinkGroup[] = [];
  
  links.forEach(item => {
    if ('type' in item && item.type === 'group') {
      groups.push(item);
    } else {
      rootLinks.push(item as Link);
    }
  });

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

      {/* Root Level Links */}
      {rootLinks.length > 0 && (
        <Reorder.Group
          axis="y"
          values={rootLinks}
          onReorder={(newOrder) => {
            // Reconstruct full links array maintaining groups
            const newLinks = [...newOrder, ...groups];
            onReorder(newLinks);
          }}
          className="space-y-2 w-full overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            {rootLinks.map((link) => (
              <LinkEditorItem
                key={link.id}
                link={link}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
                onMoveToGroup={onMoveToGroup}
                availableGroups={groups}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <div className="space-y-3">
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

      {/* Empty State */}
      {links.length === 0 && !showAddForm && !showAddGroupForm && (
        <div className="text-center py-8 text-txt-muted">
          <p>No links yet. Add your first link or create a group!</p>
        </div>
      )}

      {/* Add Forms */}
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
          <motion.div key="buttons" layout className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddGroupForm(true)}
            >
              <Folder className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LinkEditorV2;
