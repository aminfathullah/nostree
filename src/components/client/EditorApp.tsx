import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useLinkTree } from "../../hooks/useLinkTree";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { LinkEditorV2 } from "./LinkEditorV2";
import { MobilePreview } from "./MobilePreview";
import { TreeSelector } from "./TreeSelector";
import { ThemeSelector } from "./ThemeSelector";
import { CustomThemeEditor } from "./CustomThemeEditor";
import { EmptyState } from "./EmptyState";
import { Button } from "../ui/Button";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { KeyboardShortcutsHelp, KeyboardShortcutsButton } from "../ui/KeyboardShortcutsHelp";
import { ThemeToggle } from "../ui/ThemeToggle";
import { 
  Loader2, 
  LogOut, 
  User, 
  ChevronDown, 
  RefreshCw, 
  Key, 
  Laptop, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff, 
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { fetchEventsWithTimeout } from "../../lib/ndk";
import { toast } from "sonner";

interface UserProfile {
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
}

function LinkTreeEditor({ 
  pubkey, 
  slug, 
  profile,
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-sm text-txt-muted">Loading your tree...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-6">
        <LinkEditorV2
          links={linkTree.links}
          isSaving={linkTree.isSaving}
          onReorder={linkTree.reorderLinks}
          onAdd={linkTree.addLink}
          onAddGroup={linkTree.addGroup}
          onUpdate={linkTree.updateLink}
          onUpdateGroup={linkTree.updateGroup}
          onDelete={linkTree.deleteLink}
          onDeleteGroup={linkTree.deleteGroup}
          onToggleVisibility={linkTree.toggleVisibility}
          onToggleGroupCollapse={linkTree.toggleGroupCollapse}
          onMoveToGroup={linkTree.moveToGroup}
          onReorderWithinGroup={linkTree.reorderWithinGroup}
        />
      </div>

      <div className="hidden lg:block space-y-4">
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
          links={linkTree.links as any}
          onAvatarChange={(picture) => linkTree.updateProfile({ picture })}
          onHeaderChange={(headerImage) => linkTree.updateProfile({ headerImage })}
          onTitleChange={(title) => linkTree.updateTreeMeta({ title })}
          disabled={linkTree.isSaving}
        />
      </div>
    </div>
  );
}

function KeyBackupModal({
  isOpen,
  onClose,
  privateKey,
  npub,
}: {
  isOpen: boolean;
  onClose: () => void;
  privateKey: string | null;
  npub: string | null;
}) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !privateKey) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      toast.success("Secret key copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy key");
    }
  };

  const handleDownload = () => {
    const payload = {
      description: "Nostree account secret key backup",
      warning: "Keep this secret and never share it. Anyone with this key can edit your profile.",
      npub,
      nsec: privateKey,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nostree-backup-${npub?.slice(0, 10) || "key"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup file saved");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-txt-main">Secret Backup Key</h3>
              <p className="text-xs text-txt-muted">Use this to sign in from any other browser or device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-txt-main space-y-1">
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              Keep this key private
            </p>
            <p className="text-txt-muted leading-relaxed">
              Anyone with this key can manage your links. Save it somewhere safe so you never lose access if you clear your browser history.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-txt-muted">Your Secret Key (nsec)</label>
              <button
                onClick={() => setShowKey(!showKey)}
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKey ? "Hide" : "Reveal"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={privateKey}
                className="w-full px-3.5 py-2.5 text-xs bg-canvas border border-border rounded-xl font-mono text-txt-main select-all focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              onClick={handleCopy}
              variant="solid"
              size="md"
              className="flex-1 text-xs"
              prefixIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? "Copied to Clipboard" : "Copy Key"}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="md"
              className="flex-1 text-xs"
              prefixIcon={<Download className="w-4 h-4" />}
            >
              Download Backup
            </Button>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-txt-dim">
            <span>Want automatic sync across devices?</span>
            <a
              href="https://getalby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
            >
              <span>Install Alby</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="px-6 py-4 bg-card-hover border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function EditorContent() {
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    pubkey, 
    npub, 
    logout, 
    authMethod, 
    getLocalKey, 
    hasExtension, 
    login 
  } = useAuth();

  const [profile, setProfile] = useState<UserProfile>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [openTreeSelector, setOpenTreeSelector] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [dismissedLocalWarning, setDismissedLocalWarning] = useState(() => {
    return localStorage.getItem("nostree-dismissed-local-warning") === "true";
  });

  useKeyboardShortcuts({
    "mod+/": () => setShowKeyboardHelp(true),
    "escape": () => {
      setShowKeyboardHelp(false);
      setShowBackupModal(false);
    },
  }, isAuthenticated && !authLoading);

  useEffect(() => {
    if (!pubkey || !isAuthenticated) return;

    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const events = await fetchEventsWithTimeout({
          kinds: [0],
          authors: [pubkey!],
        }, 8000);

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

  if (authLoading) {
    return <LoadingOverlay message="Connecting..." showProgress />;
  }

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

  const localPrivateKey = getLocalKey();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Nostree Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-bold text-txt-main">Nostree Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <TreeSelector
               pubkey={pubkey || ""}
               currentSlug={slug}
               onSlugChange={(newSlug) => setSlug(newSlug)}
               onTreeCreated={() => {}}
               forceOpen={openTreeSelector}
               onOpenChange={setOpenTreeSelector}
             />

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-border-hover transition-colors"
              >
                {profile.picture ? (
                  <img 
                    src={profile.picture} 
                    alt="" 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-txt-muted" />
                )}
                <span className="text-xs text-txt-muted font-mono">
                  {npub?.slice(0, 8)}...
                </span>
                {authMethod === "local" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Saved in browser only" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Extension connected" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-txt-dim" />
              </button>

              {showAccountMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAccountMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3 mb-2">
                        {profile.picture ? (
                          <img 
                            src={profile.picture} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-card-hover flex items-center justify-center">
                            <User className="w-5 h-5 text-txt-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-txt-main truncate text-sm">
                            {profile.name || "Anonymous"}
                          </p>
                          <p className="text-[11px] text-txt-dim font-mono truncate">
                            {npub}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        {authMethod === "local" ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                            <Laptop className="w-3 h-3" />
                            <span>This Browser Only</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Extension Synced</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {authMethod === "local" && (
                        <button
                          onClick={() => {
                            setShowAccountMenu(false);
                            setShowBackupModal(true);
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs font-medium"
                        >
                          <Key className="w-4 h-4 text-brand" />
                          <span>Backup Secret Key</span>
                        </button>
                      )}

                      {authMethod === "local" && hasExtension && (
                        <button
                          onClick={async () => {
                            setShowAccountMenu(false);
                            const ok = await login();
                            if (ok) toast.success("Switched to extension session!");
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Switch to Alby Extension</span>
                        </button>
                      )}

                      <Link
                        to="/login?switch=true"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors text-txt-main w-full text-left text-xs"
                        onClick={() => {
                          logout();
                          setShowAccountMenu(false);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 text-txt-muted" />
                        <span>Switch Account</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setShowAccountMenu(false);
                          window.location.href = "/";
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors text-red-500 w-full text-left text-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <KeyboardShortcutsButton onClick={() => setShowKeyboardHelp(true)} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      <AnimatePresence>
        {showBackupModal && (
          <KeyBackupModal
            isOpen={showBackupModal}
            onClose={() => setShowBackupModal(false)}
            privateKey={localPrivateKey}
            npub={npub}
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {authMethod === "local" && !dismissedLocalWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-txt-main">
                    This account is saved only in this browser
                  </p>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Not Synced
                  </span>
                </div>
                <p className="text-xs text-txt-muted mt-0.5 leading-relaxed">
                  To edit your tree from another computer or phone, back up your secret key or connect a Nostr extension like Alby.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {hasExtension && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const ok = await login();
                    if (ok) toast.success("Connected with extension!");
                  }}
                  className="text-xs"
                >
                  Connect Alby
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowBackupModal(true)}
                prefixIcon={<Key className="w-3.5 h-3.5" />}
                className="text-xs font-semibold"
              >
                Backup Key
              </Button>
              <button
                onClick={() => {
                  setDismissedLocalWarning(true);
                  localStorage.setItem("nostree-dismissed-local-warning", "true");
                }}
                className="p-1.5 rounded-lg text-txt-dim hover:text-txt-main hover:bg-card/50 transition-colors ml-auto sm:ml-0"
                title="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : slug ? (
          <LinkTreeEditor 
            key={slug} 
            pubkey={pubkey || ""} 
            slug={slug} 
            profile={profile}
          />
        ) : (
          <EmptyState onCreateTree={() => setOpenTreeSelector(true)} />
        )}
      </main>
    </div>
  );
}

export function EditorApp() {
  return <EditorContent />;
}

export default EditorApp;
