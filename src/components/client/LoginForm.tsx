import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSwitchMode = searchParams.get("switch") === "true";

  const { 
    status, 
    login, 
    createBrowserAccount, 
    loginWithKey, 
    hasExtension, 
    error: authError,
    isAuthenticated 
  } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isSwitchMode) {
      navigate("/admin", { replace: true });
      return;
    }

    if (!isSwitchMode && status === "idle") {
      login().then((ok) => {
        if (ok) {
          navigate("/admin", { replace: true });
        }
      });
    }
  }, [isAuthenticated, isSwitchMode, status, login, navigate]);

  const handleExtensionLogin = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    const ok = await login();
    setIsSubmitting(false);

    if (ok) {
      toast.success("Connected!");
      navigate("/admin", { replace: true });
    } else if (authError) {
      setLocalError(authError);
    }
  };

  const handleNewBrowserAccount = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    const ok = await createBrowserAccount();
    setIsSubmitting(false);

    if (ok) {
      toast.success("New local profile created");
      navigate("/admin", { replace: true });
    } else if (authError) {
      setLocalError(authError);
    }
  };

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim()) {
      setLocalError("Please enter your secret key");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);
    const ok = await loginWithKey(customKey);
    setIsSubmitting(false);

    if (ok) {
      toast.success("Profile loaded!");
      setCustomKey("");
      navigate("/admin", { replace: true });
    } else if (authError) {
      setLocalError(authError);
    }
  };

  if (!isSwitchMode && (status === "checking" || status === "requesting" || isAuthenticated)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-canvas">
        <div className="text-center space-y-4">
          <img src={logo} alt="Nostree Logo" className="w-16 h-16 object-contain mx-auto drop-shadow-md animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold text-txt-main">Opening your link tree...</h2>
            <p className="text-xs text-txt-muted mt-1">Preparing your workspace</p>
          </div>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        </div>
      </div>
    );
  }

  const isLoading = isSubmitting || status === "requesting";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-canvas">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src={logo} alt="Nostree Logo" className="w-16 h-16 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-txt-main tracking-tight">Switch Profile</h1>
          <p className="text-txt-muted text-xs mt-1">
            Manage or change your link organizer profile
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-elevated space-y-4">
          {hasExtension ? (
            <Button
              onClick={handleExtensionLogin}
              isLoading={isLoading}
              size="lg"
              className="w-full"
              prefixIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Use Browser Extension
            </Button>
          ) : null}

          <Button
            onClick={handleNewBrowserAccount}
            isLoading={isLoading}
            variant={hasExtension ? "outline" : "solid"}
            size="lg"
            className="w-full"
            prefixIcon={<Sparkles className="w-4 h-4" />}
          >
            Create Fresh Local Profile
          </Button>

          {isAuthenticated && (
            <Button
              onClick={() => navigate("/admin", { replace: true })}
              variant="ghost"
              size="md"
              className="w-full text-xs text-txt-muted"
            >
              Return to Current Editor
            </Button>
          )}

          {localError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
              {localError}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="w-full flex items-center justify-center gap-1 text-xs text-txt-dim hover:text-txt-muted transition-colors py-1"
            >
              <span>Import with secret key</span>
              {showKeyInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showKeyInput && (
              <form onSubmit={handleKeyLogin} className="mt-3 space-y-2 pt-2">
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="nsec1... or hex key"
                  className="w-full px-3 py-2 text-xs bg-canvas border border-border rounded-lg text-txt-main placeholder:text-txt-dim focus:outline-none focus:border-brand font-mono"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  isLoading={isLoading}
                >
                  Load Profile
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
