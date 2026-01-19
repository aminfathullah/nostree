import * as React from "react";
import { useState } from "react";
import logo from "../../assets/logo.png";
import { useNostrAuth } from "../../hooks/useNostrAuth";
import { Button } from "../ui/Button";
import { Loader2, Key, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * LoginForm - NIP-07 authentication component
 * Handles extension-based login with proper UX feedback
 */
export function LoginForm() {
  const { status, login, hasExtension, error, npub } = useNostrAuth();
  const [redirecting, setRedirecting] = useState(false);

  const handleLogin = async () => {
    const success = await login();
    
    if (success) {
      toast.success("Connected successfully!", {
        description: "Redirecting to editor...",
      });
      setRedirecting(true);
      
      // Redirect to admin page
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } else if (error) {
      toast.error("Connection failed", {
        description: error,
      });
    }
  };

  const isLoading = status === "checking" || status === "requesting" || redirecting;
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">

      
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src={logo} alt="Nostree Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-txt-main mb-2">Nostree</h1>
          <p className="text-txt-muted">Own your links. Own your graph.</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-txt-main mb-6 text-center">
            Connect to Edit
          </h2>

          {/* Success State */}
          {isAuthenticated && !redirecting && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-txt-main font-medium">Connected!</p>
              <p className="text-txt-muted text-sm font-mono truncate max-w-full">
                {npub?.slice(0, 8)}...{npub?.slice(-8)}
              </p>
              <Button onClick={() => window.location.href = "/admin"} className="mt-2">
                Go to Editor
              </Button>
            </div>
          )}

          {/* Redirecting State */}
          {redirecting && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <p className="text-txt-muted">Redirecting to editor...</p>
            </div>
          )}

          {/* Login Button */}
          {!isAuthenticated && !redirecting && (
            <>
              {hasExtension ? (
                <Button
                  onClick={handleLogin}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full"
                  prefixIcon={!isLoading && <Key className="w-5 h-5" />}
                >
                  {status === "requesting" 
                    ? "Waiting for approval..." 
                    : "Connect with Nostr Extension"
                  }
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-txt-main font-medium text-sm">
                        No Nostr extension detected
                      </p>
                      <p className="text-txt-muted text-sm mt-1">
                        Install a browser extension to connect with your Nostr identity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <a
                      href="https://getalby.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-card-hover border border-border hover:border-border-hover transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🐝</span>
                        <div>
                          <p className="text-txt-main font-medium">Alby</p>
                          <p className="text-txt-muted text-xs">Lightning + Nostr</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-txt-dim group-hover:text-txt-muted" />
                    </a>
                    
                    <a
                      href="https://github.com/nicolo-ribaudo/nostr-chrome"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-card-hover border border-border hover:border-border-hover transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔑</span>
                        <div>
                          <p className="text-txt-main font-medium">nos2x</p>
                          <p className="text-txt-muted text-xs">Simple NIP-07</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-txt-dim group-hover:text-txt-muted" />
                    </a>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && status === "error" && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-txt-dim text-xs mt-6">
          Your keys never leave your extension. 
          <a 
            href="https://nostr.how/get-started" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-brand hover:underline ml-1"
          >
            Learn about Nostr
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
