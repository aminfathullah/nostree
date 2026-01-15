import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import { useLinkTree } from "../../hooks/useLinkTree";
import { LinkEditor } from "./LinkEditor";
import { MobilePreview } from "./MobilePreview";
import { TreeSelector } from "./TreeSelector";
import { ThemeSelector } from "./ThemeSelector";
import { CustomThemeEditor } from "./CustomThemeEditor";
import { Button } from "../ui/Button";
import { Toaster } from "sonner";
import { Loader2, LogOut, User } from "lucide-react";
import { fetchEventsWithTimeout } from "../../lib/ndk";

interface UserProfile {
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
}

/**
 * Main editor app wrapped in auth context
 */
export function EditorApp() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: "bg-card border border-border text-txt-main",
        }}
      />
      <EditorContent />
    </AuthProvider>
  );
}

/**
 * Link tree editor that remounts when slug changes
 * This ensures useLinkTree hook gets fresh state for each tree
 */
function LinkTreeEditor({ 
  pubkey, 
  slug, 
  profile 
}: { 
  pubkey: string; 
  slug: string; 
  profile: UserProfile;
}) {
  const linkTree = useLinkTree({ 
    pubkey,
    slug,
    initialData: undefined,
  });

  if (linkTree.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
      {/* Left: Editor */}
      <div className="space-y-6">
        <LinkEditor
          links={linkTree.links}
          isSaving={linkTree.isSaving}
          onReorder={linkTree.reorderLinks}
          onAdd={linkTree.addLink}
          onUpdate={linkTree.updateLink}
          onDelete={linkTree.deleteLink}
          onToggleVisibility={linkTree.toggleVisibility}
        />
      </div>

      {/* Right: Preview + Theme */}
      <div className="hidden lg:block space-y-4">
        {/* Theme Controls Only - Other edits are inline on preview */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ThemeSelector
            currentTheme={linkTree.data?.theme}
            onThemeChange={linkTree.updateTheme}
            disabled={linkTree.isSaving}
          />
          <CustomThemeEditor
            currentTheme={linkTree.data?.theme}
            onThemeChange={linkTree.updateTheme}
            disabled={linkTree.isSaving}
          />
        </div>
        
        <MobilePreview
          profile={profile}
          data={linkTree.data}
          links={linkTree.links}
          onAvatarChange={(picture) => linkTree.updateProfile({ picture })}
          onHeaderChange={(headerImage) => linkTree.updateProfile({ headerImage })}
          onTitleChange={(title) => linkTree.updateTreeMeta({ title })}
          disabled={linkTree.isSaving}
        />
      </div>
    </div>
  );
}

/**
 * Editor content - protected by auth
 */
function EditorContent() {
  const { isAuthenticated, isLoading: authLoading, pubkey, npub, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  // Fetch profile on auth
  useEffect(() => {
    if (!pubkey || !isAuthenticated) return;

    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const events = await fetchEventsWithTimeout({
          kinds: [0],
          authors: [pubkey!],
        }, 10000);

        if (events.size > 0) {
          const sorted = Array.from(events).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0)
          );
          const latest = sorted[0];
          if (latest?.content) {
            const data = JSON.parse(latest.content);
            setProfile({
              name: data.name || data.display_name,
              picture: data.picture || data.image,
              about: data.about,
              nip05: data.nip05,
              lud16: data.lud16,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [pubkey, isAuthenticated]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-txt-muted">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌲</span>
            <h1 className="text-lg font-bold text-txt-main">Nostree Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <TreeSelector
               pubkey={pubkey || ""}
               currentSlug={slug}
               onSlugChange={(newSlug) => {
                 setSlug(newSlug);
               }}
               onTreeCreated={() => {
                 // Tree created, will be saved on first link add
               }}
             />

            {/* User info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
              {profile.picture ? (
                <img 
                  src={profile.picture} 
                  alt="" 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-txt-muted" />
              )}
              <span className="text-sm text-txt-muted font-mono">
                {npub?.slice(0, 8)}...
              </span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Pane */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : slug ? (
          // KEY prop forces remount when slug changes, giving fresh useLinkTree state
          <LinkTreeEditor 
            key={slug} 
            pubkey={pubkey || ""} 
            slug={slug} 
            profile={profile}
          />
        ) : (
          // No trees - show empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🌲</div>
            <h2 className="text-xl font-semibold text-txt-main mb-2">No Trees Yet</h2>
            <p className="text-txt-muted mb-6 max-w-md">
              Create your first link tree to get started. Pick a unique slug that will be your public URL.
            </p>
            <p className="text-sm text-txt-dim">
              Click "No Tree Selected" above to create your first tree.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default EditorApp;
