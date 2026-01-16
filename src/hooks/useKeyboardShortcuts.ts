import { useEffect, useCallback } from "react";

type ShortcutHandler = () => void;

interface Shortcuts {
  [key: string]: ShortcutHandler;
}

/**
 * Hook for managing keyboard shortcuts
 * Keys are formatted as "mod+key" where mod = Ctrl on Windows/Linux, Cmd on Mac
 * 
 * Example:
 * useKeyboardShortcuts({
 *   "mod+s": () => save(),
 *   "mod+n": () => addNew(),
 *   "escape": () => cancel(),
 * });
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== "Escape") return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      
      // Build the key combination string
      let combo = "";
      if (modKey) combo += "mod+";
      if (event.shiftKey) combo += "shift+";
      if (event.altKey) combo += "alt+";
      combo += event.key.toLowerCase();

      // Check if we have a handler for this combo
      const handler = shortcuts[combo];
      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Returns platform-specific modifier key display
 */
export function getModifierKey(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  return isMac ? "⌘" : "Ctrl";
}

/**
 * Format a shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const mod = getModifierKey();
  return shortcut
    .replace("mod+", `${mod}+`)
    .replace("shift+", "⇧+")
    .replace("alt+", "⌥+")
    .split("+")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}

export default useKeyboardShortcuts;
