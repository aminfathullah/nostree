import * as React from "react";
import { useState } from "react";
import logo from "../../assets/logo.png";
import { useNostrAuth } from "../../hooks/useNostrAuth";
import { Button } from "../ui/Button";
import { Loader2, Key, ExternalLink, AlertCircle, CheckCircle2, Eye, EyeOff, Shield, Lock, Sparkles, Copy, Check, Download, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { generateNostrKeys, copyToClipboard } from "../../lib/key-generator";
import type { NostrKeyPair } from "../../lib/key-generator";

/**
 * LoginForm - Dual authentication component
 * Supports both NIP-07 extension and local private key login
 */
export function LoginForm() {
  const { status, login, loginWithKey, hasExtension, error, npub } = useNostrAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [loginMode, setLoginMode] = useState<"extension" | "local">("extension");
  
  // Local key login state
  const [privateKey, setPrivateKey] = useState("");
  const [password, setPassword] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Key generation state
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<NostrKeyPair | null>(null);
  const [copiedNsec, setCopiedNsec] = useState(false);
  const [copiedNpub, setCopiedNpub] = useState(false);
  const [savedBackup, setSavedBackup] = useState(false);

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

  const handleLocalKeyLogin = async () => {
    if (!privateKey || !password) {
      toast.error("Missing information", {
        description: "Please enter both your private key and password",
      });
      return;
    }

    const success = await loginWithKey(privateKey, password);
    
    if (success) {
      toast.success("Logged in successfully!", {
        description: "Redirecting to editor...",
      });
      setRedirecting(true);
      setPrivateKey(""); // Clear from state
      setPassword("");
      
      // Redirect to admin page
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } else if (error) {
      toast.error("Login failed", {
        description: error,
      });
    }
  };

  const handleGenerateKeys = () => {
    const keys = generateNostrKeys();
    setGeneratedKeys(keys);
    setShowGenerator(true);
    setCopiedNsec(false);
    setCopiedNpub(false);
    setSavedBackup(false);
  };

  const handleCopyNsec = async () => {
    if (generatedKeys) {
      const success = await copyToClipboard(generatedKeys.nsec);
      if (success) {
        setCopiedNsec(true);
        toast.success("Private key copied!", {
          description: "Keep it safe and never share it",
        });
        setTimeout(() => setCopiedNsec(false), 3000);
      } else {
        toast.error("Failed to copy");
      }
    }
  };

  const handleCopyNpub = async () => {
    if (generatedKeys) {
      const success = await copyToClipboard(generatedKeys.npub);
      if (success) {
        setCopiedNpub(true);
        toast.success("Public key copied!");
        setTimeout(() => setCopiedNpub(false), 3000);
      } else {
        toast.error("Failed to copy");
      }
    }
  };

  const handleDownloadBackup = () => {
    if (!generatedKeys) return;
    
    const backupData = {
      warning: "KEEP THIS FILE SAFE AND PRIVATE!",
      privateKey: generatedKeys.nsec,
      publicKey: generatedKeys.npub,
      createdAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nostree-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSavedBackup(true);
    toast.success("Backup saved!", {
      description: "Store it in a safe place",
    });
  };

  const handleUseGeneratedKey = () => {
    if (generatedKeys) {
      setPrivateKey(generatedKeys.nsec);
      setShowGenerator(false);
      toast.info("Key filled in", {
        description: "Now set a password to encrypt it",
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
          <p className="text-txt-muted">Switch to a different account</p>
          <p className="text-txt-dim text-sm mt-2">
            Or create a new one below
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-txt-main mb-2 text-center">
            Get Started
          </h2>
          <p className="text-txt-muted text-sm text-center mb-6">
            Choose how you want to login
          </p>

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
              {/* Login Mode Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-card-hover rounded-lg">
                <button
                  onClick={() => setLoginMode("extension")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMode === "extension"
                      ? "bg-brand text-white shadow-sm"
                      : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Extension</span>
                    <span className="sm:hidden">Ext</span>
                  </div>
                </button>
                <button
                  onClick={() => setLoginMode("local")}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    loginMode === "local"
                      ? "bg-brand text-white shadow-sm"
                      : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" />
                    <span className="hidden sm:inline">Quick Start</span>
                    <span className="sm:hidden">Quick</span>
                  </div>
                </button>
              </div>

              {/* Extension Login */}
              {loginMode === "extension" && (
                <>
                  {hasExtension ? (
                    <>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-txt-main font-medium text-sm">
                            ✓ Extension detected
                          </p>
                          <p className="text-txt-muted text-sm mt-1">
                            Click below to connect securely
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogin}
                        isLoading={isLoading}
                        size="lg"
                        className="w-full"
                        prefixIcon={!isLoading && <Key className="w-5 h-5" />}
                      >
                        {status === "requesting" 
                          ? "Check your extension..." 
                          : "Connect Securely"
                        }
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-txt-main font-medium text-sm">
                            Install a Nostr Extension (Recommended)
                          </p>
                          <p className="text-txt-muted text-sm mt-1">
                            Most secure way to manage your Nostr identity. Free and takes 1 minute!
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
                              <p className="text-txt-muted text-xs">Recommended • Easiest setup</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-txt-dim group-hover:text-txt-muted" />
                        </a>
                        
                        <a
                          href="https://github.com/fiatjaf/nos2x"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-card-hover border border-border hover:border-border-hover transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🔑</span>
                            <div>
                              <p className="text-txt-main font-medium">nos2x</p>
                              <p className="text-txt-muted text-xs">Simple & lightweight</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-txt-dim group-hover:text-txt-muted" />
                        </a>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => setLoginMode("local")}
                          className="text-sm text-brand hover:underline"
                        >
                          Skip for now - Use Quick Start instead →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Local Key Login */}
              {loginMode === "local" && (
                <div className="space-y-4">
                  {/* Beginner-friendly explanation */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-txt-main font-medium text-sm">
                        New to Nostr? No problem!
                      </p>
                      <p className="text-txt-muted text-sm mt-1">
                        You can create a new account in seconds, or use an existing one.
                      </p>
                    </div>
                  </div>

                  {/* Generate New Key Button - Prominent */}
                  {!showGenerator && (
                    <Button
                      onClick={handleGenerateKeys}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      prefixIcon={<Sparkles className="w-5 h-5" />}
                    >
                      Create New Account (Recommended)
                    </Button>
                  )}

                  {/* Key Generator Modal */}
                  {showGenerator && generatedKeys && (
                    <div className="space-y-4 p-4 bg-card-hover rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-txt-main flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Your New Account
                        </h3>
                        <button
                          onClick={() => setShowGenerator(false)}
                          className="text-txt-dim hover:text-txt-main"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Critical Warning */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-medium text-sm">
                            ⚠️ Save your private key NOW!
                          </p>
                          <p className="text-txt-muted text-xs mt-1">
                            If you lose it, you lose access forever. No recovery possible.
                          </p>
                        </div>
                      </div>

                      {/* Private Key */}
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-2">
                          🔐 Private Key (Keep Secret!)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={generatedKeys.nsec}
                            readOnly
                            className="w-full px-3 py-2 pr-10 bg-card border border-border rounded-lg text-txt-main font-mono text-xs"
                          />
                          <button
                            onClick={handleCopyNsec}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-card-hover rounded"
                            title="Copy private key"
                          >
                            {copiedNsec ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-txt-dim" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-txt-dim mt-1">
                          This is like your password - never share it with anyone!
                        </p>
                      </div>

                      {/* Public Key */}
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-2">
                          👤 Public Key (Your Username)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={generatedKeys.npub}
                            readOnly
                            className="w-full px-3 py-2 pr-10 bg-card border border-border rounded-lg text-txt-main font-mono text-xs"
                          />
                          <button
                            onClick={handleCopyNpub}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-card-hover rounded"
                            title="Copy public key"
                          >
                            {copiedNpub ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-txt-dim" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-txt-dim mt-1">
                          This is your identity - safe to share with others
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          onClick={handleDownloadBackup}
                          size="sm"
                          className="w-full"
                          prefixIcon={savedBackup ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        >
                          {savedBackup ? "Backup Saved ✓" : "Download Backup File"}
                        </Button>
                        
                        <Button
                          onClick={handleUseGeneratedKey}
                          size="lg"
                          className="w-full"
                          disabled={!savedBackup && !copiedNsec}
                        >
                          Continue with This Account →
                        </Button>
                        
                        {!savedBackup && !copiedNsec && (
                          <p className="text-xs text-center text-orange-400">
                            ⚠️ Please save your key first
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {!showGenerator && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-card text-txt-dim">or use existing key</span>
                      </div>
                    </div>
                  )}

                  {/* Existing Key Login */}
                  {!showGenerator && (
                    <>
                      {/* Private Key Input */}
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-2 flex items-center gap-2">
                          🔐 Your Private Key
                          <button
                            className="text-txt-dim hover:text-txt-main"
                            title="This is your nsec key that starts with 'nsec1...'"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </label>
                        <div className="relative">
                          <input
                            type={showKey ? "text" : "password"}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="nsec1... or hex"
                            className="w-full px-4 py-2.5 pr-10 bg-card-hover border border-border rounded-lg focus:outline-none focus:border-brand text-txt-main placeholder:text-txt-dim"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim hover:text-txt-main"
                          >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-txt-dim mt-1">
                          Your secret key that starts with "nsec1..."
                        </p>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-2 flex items-center gap-2">
                          🔒 Create a Password
                          <button
                            className="text-txt-dim hover:text-txt-main"
                            title="This password encrypts your key in browser storage"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-4 py-2.5 pr-10 bg-card-hover border border-border rounded-lg focus:outline-none focus:border-brand text-txt-main placeholder:text-txt-dim"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim hover:text-txt-main"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-txt-dim mt-1">
                          This protects your key in this browser (minimum 6 characters)
                        </p>
                      </div>

                      <Button
                        onClick={handleLocalKeyLogin}
                        isLoading={isLoading}
                        size="lg"
                        className="w-full"
                        prefixIcon={!isLoading && <Lock className="w-5 h-5" />}
                      >
                        Login Securely
                      </Button>
                    </>
                  )}
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
        <div className="text-center text-txt-dim text-xs mt-6 space-y-2">
          {loginMode === "extension" ? (
            <p>
              🔒 Most secure: Your keys stay in your extension.{" "}
              <a 
                href="https://nostr.how/get-started" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand hover:underline"
              >
                Learn more
              </a>
            </p>
          ) : (
            <p>
              🔐 Your key is encrypted and saved in this browser only.{" "}
              <button
                onClick={() => setLoginMode("extension")}
                className="text-brand hover:underline"
              >
                Switch to extension for better security
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
