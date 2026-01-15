import { useState, useCallback, useEffect } from "react";
import NDK, { NDKNip07Signer, NDKUser } from "@nostr-dev-kit/ndk";
import { getNDK } from "../lib/ndk";

/**
 * Authentication states for NIP-07 flow
 */
export type AuthStatus = 
  | "idle"       // Initial state
  | "checking"   // Checking for window.nostr
  | "requesting" // Waiting for user approval in extension
  | "authenticated" // Successfully authenticated
  | "error";     // Error occurred

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
  /** Initiate login flow */
  login: () => Promise<boolean>;
  /** Logout and clear session */
  logout: () => void;
}

const STORAGE_KEY = "nostree-auth-pubkey";

/**
 * Custom hook for NIP-07 browser extension authentication
 * Uses NDKNip07Signer for signing capabilities
 */
export function useNostrAuth(): UseNostrAuthReturn {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);

  // Check for extension and restore session on mount
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      setStatus("idle");
      return;
    }

    // Check for window.nostr
    const checkExtension = () => {
      setHasExtension(!!window.nostr);
    };

    // Initial check
    checkExtension();

    // Also check after a delay (some extensions inject later)
    setTimeout(checkExtension, 500);

    // Restore session from localStorage
    const storedPubkey = localStorage.getItem(STORAGE_KEY);
    if (storedPubkey) {
      // We have a stored session, wait for extension to load then verify
      // If extension doesn't load quickly, we might be stuck in checking
      // So we'll poll for a bit
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.nostr) {
          clearInterval(checkInterval);
          restoreSession(storedPubkey);
        } else if (attempts > 10) { // 1 second timeout
          clearInterval(checkInterval);
          setStatus("idle"); // Give up
        }
      }, 100);
    } else {
      setStatus("idle");
    }
  }, []);

  // Restore existing session
  const restoreSession = async (storedPubkey: string) => {
    try {
      setStatus("checking");
      
      if (!window.nostr) {
        setStatus("idle");
        return;
      }

      // Verify with extension (silent check)
      const currentPubkey = await window.nostr.getPublicKey();
      
      if (currentPubkey === storedPubkey) {
        await setupSession(currentPubkey);
      } else {
        // Stored pubkey doesn't match, clear it
        localStorage.removeItem(STORAGE_KEY);
        setStatus("idle");
      }
    } catch {
      // Silent fail on restore
      localStorage.removeItem(STORAGE_KEY);
      setStatus("idle");
    }
  };

  // Setup session with authenticated pubkey
  const setupSession = async (pubkeyHex: string) => {
    const ndk = getNDK();
    const signer = new NDKNip07Signer();
    ndk.signer = signer;

    const ndkUser = await signer.user();
    
    setPubkey(pubkeyHex);
    setNpub(ndkUser.npub);
    setUser(ndkUser);
    setStatus("authenticated");
    localStorage.setItem(STORAGE_KEY, pubkeyHex);
  };

  // Login function
  const login = useCallback(async (): Promise<boolean> => {
    setError(null);

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

      await setupSession(pubkeyHex);
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

  // Logout function
  const logout = useCallback(() => {
    const ndk = getNDK();
    ndk.signer = undefined;
    
    setPubkey(null);
    setNpub(null);
    setUser(null);
    setStatus("idle");
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    status,
    pubkey,
    npub,
    user,
    error,
    hasExtension,
    login,
    logout,
  };
}

export default useNostrAuth;
