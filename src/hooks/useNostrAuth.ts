import { useState, useCallback, useEffect, useRef } from "react";
import { NDKNip07Signer, NDKUser } from "@nostr-dev-kit/ndk";
import { getNDK } from "../lib/ndk";
import { NDKPrivateKeySigner } from "../lib/local-signer";
import { encryptData, decryptData, isValidPrivateKey } from "../lib/crypto";
import { generateNostrKeys } from "../lib/key-generator";

/**
 * Authentication states for NIP-07 flow
 */
export type AuthStatus = 
  | "idle"       // Initial state
  | "checking"   // Checking for window.nostr
  | "requesting" // Waiting for user approval in extension
  | "authenticated" // Successfully authenticated
  | "error";     // Error occurred

export type AuthMethod = "extension" | "local";

interface UseNostrAuthReturn {
  /** Current authentication status */
  status: AuthStatus;
  /** User's public key (hex format) */
  pubkey: string | null;
  /** User's npub (bech32 format) */
  npub: string | null;
  /** NDK User object */
  user: NDKUser | null;
  /** Error message if status is "error" */
  error: string | null;
  /** Whether extension is available */
  hasExtension: boolean;
  /** Current authentication method */
  authMethod: AuthMethod | null;
  /** Initiate extension login flow */
  login: () => Promise<boolean>;
  /** Initiate local key login flow */
  loginWithKey: (privateKey: string, password: string) => Promise<boolean>;
  /** Logout and clear session */
  logout: () => void;
}

const STORAGE_KEY = "nostree-auth-pubkey";
const STORAGE_METHOD_KEY = "nostree-auth-method";
const STORAGE_ENCRYPTED_KEY = "nostree-auth-encrypted";
const STORAGE_SKIP_AUTO_LOGIN = "nostree-skip-auto-login";
const AUTO_GENERATED_PASSWORD = "nostree-auto-generated-v1"; // Fixed password for auto-generated accounts
const ASYNC_TIMEOUT_MS = 5000; // 5 second timeout for async operations

/**
 * Helper to add timeout to promises
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/**
 * Custom hook for Nostr authentication
 * Supports both NIP-07 extensions and local private keys
 */
export function useNostrAuth(): UseNostrAuthReturn {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const passwordRef = useRef<string | null>(null); // Keep password in memory during session

  // Check for extension and restore session on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only run in browser
    if (typeof window === "undefined") {
      setStatus("idle");
      return;
    }

    // Check for window.nostr
    const checkExtension = () => {
      if (isMountedRef.current) {
        setHasExtension(!!window.nostr);
      }
    };

    // Initial check
    checkExtension();

    // Also check after a delay (some extensions inject later)
    const extensionTimeout = setTimeout(checkExtension, 500);

    // Restore session from localStorage
    const storedPubkey = localStorage.getItem(STORAGE_KEY);
    const storedMethod = localStorage.getItem(STORAGE_METHOD_KEY) as AuthMethod | null;
    
    if (storedPubkey && storedMethod) {
      if (storedMethod === "extension") {
        // Extension-based auth - wait for extension to load then verify
        let attempts = 0;
        const checkInterval = setInterval(() => {
          if (!isMountedRef.current) {
            clearInterval(checkInterval);
            return;
          }
          attempts++;
          if (window.nostr) {
            clearInterval(checkInterval);
            restoreExtensionSession(storedPubkey).catch(() => {
              if (isMountedRef.current) setStatus("idle");
            });
          } else if (attempts > 10) { // 1 second timeout
            clearInterval(checkInterval);
            if (isMountedRef.current) setStatus("idle");
          }
        }, 100);
        
        return () => {
          isMountedRef.current = false;
          clearInterval(checkInterval);
          clearTimeout(extensionTimeout);
        };
      } else if (storedMethod === "local") {
        // Local key auth - restore automatically with stored encrypted key
        restoreLocalSession().catch(() => {
          if (isMountedRef.current) setStatus("idle");
        });
        return () => {
          isMountedRef.current = false;
          clearTimeout(extensionTimeout);
        };
      }
    } else {
      // No stored session - try auto-login
      attemptAutoLogin().catch(() => {
        if (isMountedRef.current) setStatus("idle");
      });
      return () => {
        isMountedRef.current = false;
        clearTimeout(extensionTimeout);
      };
    }
  }, []);

  // Restore existing extension session
  const restoreExtensionSession = async (storedPubkey: string) => {
    try {
      if (isMountedRef.current) setStatus("checking");
      
      if (!window.nostr) {
        if (isMountedRef.current) setStatus("idle");
        return;
      }

      // Verify with extension (silent check) - with timeout
      const currentPubkey = await withTimeout(
        window.nostr.getPublicKey(),
        ASYNC_TIMEOUT_MS,
        "Extension timeout"
      );
      
      if (!isMountedRef.current) return;
      
      if (currentPubkey === storedPubkey) {
        await setupExtensionSession(currentPubkey);
      } else {
        // Stored pubkey doesn't match, clear it
        clearAuthStorage();
        if (isMountedRef.current) setStatus("idle");
      }
    } catch {
      // Silent fail on restore
      clearAuthStorage();
      if (isMountedRef.current) setStatus("idle");
    }
  };

  // Restore local key session automatically
  const restoreLocalSession = async () => {
    try {
      if (isMountedRef.current) setStatus("checking");
      
      const encryptedKey = localStorage.getItem(STORAGE_ENCRYPTED_KEY);
      if (!encryptedKey) {
        if (isMountedRef.current) setStatus("idle");
        return;
      }

      // Decrypt with auto-generated password
      const privateKey = await decryptData(encryptedKey, AUTO_GENERATED_PASSWORD);
      
      const ndk = getNDK();
      const signer = new NDKPrivateKeySigner(privateKey);
      ndk.signer = signer;

      const ndkUser = await signer.user();
      
      if (!isMountedRef.current) return;
      
      setPubkey(ndkUser.pubkey);
      setNpub(ndkUser.npub);
      setUser(ndkUser);
      setStatus("authenticated");
      setAuthMethod("local");
      passwordRef.current = AUTO_GENERATED_PASSWORD;
    } catch (err) {
      console.warn("Failed to restore local session:", err);
      clearAuthStorage();
      if (isMountedRef.current) setStatus("idle");
    }
  };

  // Attempt automatic login
  const attemptAutoLogin = async () => {
    // Check if user explicitly logged out or is switching accounts
    const skipAutoLogin = localStorage.getItem(STORAGE_SKIP_AUTO_LOGIN) === 'true';
    
    if (!isMountedRef.current || skipAutoLogin) {
      // User explicitly logged out or is switching accounts
      setStatus("idle");
      return;
    }
    
    setStatus("checking");

    // Priority 1: Wait for extension (give it time to inject)
    let extensionChecks = 0;
    const maxChecks = 20; // 2 seconds total (100ms * 20)
    
    while (extensionChecks < maxChecks && !window.nostr && isMountedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
      extensionChecks++;
    }

    // Try extension if available
    if (window.nostr && isMountedRef.current) {
      try {
        const pubkeyHex = await withTimeout(
          window.nostr.getPublicKey(),
          ASYNC_TIMEOUT_MS,
          "Extension timeout"
        );
        
        if (pubkeyHex && isMountedRef.current) {
          await setupExtensionSession(pubkeyHex);
          return;
        }
      } catch {
        // Extension failed, continue to auto-generation
      }
    }

    // Priority 2: Auto-generate new account (only if no extension)
    if (isMountedRef.current && !window.nostr) {
      await autoGenerateAndLogin();
    } else if (isMountedRef.current) {
      // Extension exists but failed - set to idle so user can manually login
      setStatus("idle");
    }
  };

  // Auto-generate a new account and login
  const autoGenerateAndLogin = async () => {
    try {
      setStatus("checking");
      
      const keys = generateNostrKeys();
      await setupLocalKeySession(keys.nsec, AUTO_GENERATED_PASSWORD);
      
      console.log("🎉 Auto-generated new Nostr account:", keys.npub);
    } catch (err) {
      console.error("Failed to auto-generate account:", err);
      setStatus("error");
      setError("Failed to create account automatically");
    }
  };

  // Setup extension session with authenticated pubkey
  const setupExtensionSession = async (pubkeyHex: string) => {
    try {
      const ndk = getNDK();
      const signer = new NDKNip07Signer();
      ndk.signer = signer;

      // Add timeout to signer.user() to prevent infinite hang
      const ndkUser = await withTimeout(
        signer.user(),
        ASYNC_TIMEOUT_MS,
        "Signer timeout"
      );
      
      if (!isMountedRef.current) return;
      
      setPubkey(pubkeyHex);
      setNpub(ndkUser.npub);
      setUser(ndkUser);
      setStatus("authenticated");
      setAuthMethod("extension");
      localStorage.setItem(STORAGE_KEY, pubkeyHex);
      localStorage.setItem(STORAGE_METHOD_KEY, "extension");
    } catch (err) {
      // If setupSession fails, fall back to idle
      console.warn("Session setup failed:", err);
      if (isMountedRef.current) setStatus("idle");
    }
  };

  // Setup local key session
  const setupLocalKeySession = async (privateKey: string, password: string) => {
    try {
      const ndk = getNDK();
      const signer = new NDKPrivateKeySigner(privateKey);
      ndk.signer = signer;

      const ndkUser = await signer.user();
      
      if (!isMountedRef.current) return;

      // Encrypt and store the private key
      const encryptedKey = await encryptData(privateKey, password);
      
      setPubkey(ndkUser.pubkey);
      setNpub(ndkUser.npub);
      setUser(ndkUser);
      setStatus("authenticated");
      setAuthMethod("local");
      passwordRef.current = password; // Keep in memory for session
      
      localStorage.setItem(STORAGE_KEY, ndkUser.pubkey);
      localStorage.setItem(STORAGE_METHOD_KEY, "local");
      localStorage.setItem(STORAGE_ENCRYPTED_KEY, encryptedKey);
    } catch (err) {
      console.error("Local key session setup failed:", err);
      throw err;
    }
  };

  // Clear all auth storage
  const clearAuthStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_METHOD_KEY);
    localStorage.removeItem(STORAGE_ENCRYPTED_KEY);
    passwordRef.current = null;
  };

  // Extension login function
  const login = useCallback(async (): Promise<boolean> => {
    setError(null);
    localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN); // User is manually logging in

    // Check for extension
    setStatus("checking");
    
    if (!window.nostr) {
      setError("No Nostr extension found. Please install Alby or nos2x.");
      setStatus("error");
      return false;
    }

    try {
      setStatus("requesting");
      
      // Request public key (triggers extension popup)
      const pubkeyHex = await window.nostr.getPublicKey();
      
      if (!pubkeyHex) {
        setError("Failed to get public key from extension");
        setStatus("error");
        return false;
      }

      await setupExtensionSession(pubkeyHex);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      
      // Handle user rejection
      if (message.toLowerCase().includes("denied") || 
          message.toLowerCase().includes("rejected") ||
          message.toLowerCase().includes("cancelled")) {
        setError("Login cancelled by user");
      } else {
        setError(message);
      }
      
      setStatus("error");
      return false;
    }
  }, []);

  // Local key login function
  const loginWithKey = useCallback(async (privateKey: string, password: string): Promise<boolean> => {
    setError(null);
    setStatus("checking");
    localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN); // User is manually logging in

    try {
      // Validate password
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        setStatus("error");
        return false;
      }

      // Validate private key format
      if (!isValidPrivateKey(privateKey)) {
        setError("Invalid private key format. Use nsec1... or 64-char hex");
        setStatus("error");
        return false;
      }

      await setupLocalKeySession(privateKey, password);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login with key failed";
      setError(message);
      setStatus("error");
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    const ndk = getNDK();
    ndk.signer = undefined;
    
    setPubkey(null);
    setNpub(null);
    setUser(null);
    setStatus("idle");
    setError(null);
    setAuthMethod(null);
    clearAuthStorage();
    
    // Prevent auto-login after explicit logout
    localStorage.setItem(STORAGE_SKIP_AUTO_LOGIN, 'true');
  }, []);

  return {
    status,
    pubkey,
    npub,
    user,
    error,
    hasExtension,
    authMethod,
    login,
    loginWithKey,
    logout,
  };
}

export default useNostrAuth;
