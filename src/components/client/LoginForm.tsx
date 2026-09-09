import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useI18n } from "../../i18n/context";
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
  const { t } = useI18n();

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
      toast.success(t("auth.connected"));
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
      toast.success(t("auth.localProfileCreated"));
      navigate("/admin", { replace: true });
    } else if (authError) {
      setLocalError(authError);
    }
  };

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim()) {
      setLocalError(t("auth.enterSecretKey"));
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);
    const ok = await loginWithKey(customKey);
    setIsSubmitting(false);

    if (ok) {
      toast.success(t("auth.profileLoaded"));
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
            <h2 className="text-xl font-semibold text-txt-main">{t("auth.loadingWorkspace")}</h2>
            <p className="text-xs text-txt-muted mt-1">{t("auth.preparingWorkspace")}</p>
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-canvas">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src={logo} alt="Nostree Logo" className="w-16 h-16 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-txt-main tracking-tight">{t("auth.title")}</h1>
          <p className="text-txt-muted text-xs mt-1">
            {t("auth.subtitle")}
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
              {t("auth.useExtension")}
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
            {t("auth.createLocalProfile")}
          </Button>

          {isAuthenticated && (
            <Button
              onClick={() => navigate("/admin", { replace: true })}
              variant="ghost"
              size="md"
              className="w-full text-xs text-txt-muted"
            >
              {t("auth.returnToEditor")}
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
              className="w-full flex items-center justify-center gap-1 text-xs text-txt-dim hover:text-txt-muted transition-colors py-1 cursor-pointer"
            >
              <span>{t("auth.importWithKey")}</span>
              {showKeyInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showKeyInput && (
              <form onSubmit={handleKeyLogin} className="mt-3 space-y-2 pt-2">
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder={t("auth.keyPlaceholder")}
                  className="w-full px-3 py-2 text-xs bg-canvas border border-border rounded-lg text-txt-main placeholder:text-txt-dim focus:outline-none focus:border-brand font-mono"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  isLoading={isLoading}
                >
                  {t("auth.loadProfile")}
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
