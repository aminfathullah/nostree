import { useState, useCallback, useEffect, useRef } from "react";
import { NDKNip07Signer, NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { getNDK } from "../lib/ndk";
import { NDKPrivateKeySigner } from "../lib/local-signer";
import { encryptData, decryptData, isValidPrivateKey } from "../lib/crypto";
import { generateNostrKeys } from "../lib/key-generator";

export type AuthStatus = 
  | "idle"
  | "checking"
  | "requesting"
  | "authenticated"
  | "error";

export type AuthMethod = "extension" | "local";

export interface UseNostrAuthReturn {
  status: AuthStatus;
  pubkey: string | null;
  npub: string | null;
  user: NDKUser | null;
  error: string | null;
  hasExtension: boolean;
  authMethod: AuthMethod | null;
  login: () => Promise<boolean>;
  createBrowserAccount: () => Promise<boolean>;
  loginWithKey: (privateKey: string, password?: string) => Promise<boolean>;
  getLocalKey: () => string | null;
  switchToLocalAccount: () => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = "nostree-auth-pubkey";
const STORAGE_METHOD_KEY = "nostree-auth-method";
const STORAGE_ENCRYPTED_KEY = "nostree-auth-encrypted";
const STORAGE_SKIP_AUTO_LOGIN = "nostree-skip-auto-login";
const DEFAULT_KEY_PASSPHRASE = "nostree-auto-generated-v1";
const TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export function useNostrAuth(): UseNostrAuthReturn {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [npub, setNpub] = useState<string | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);

  const isMountedRef = useRef(true);
  const activePrivateKeyRef = useRef<string | null>(null);


  const setupExtensionSession = useCallback(async (pubkeyHex: string): Promise<boolean> => {
    try {
      const ndk = getNDK();
      const signer = new NDKNip07Signer();
      ndk.signer = signer;

      const ndkUser = await withTimeout(
        signer.user(),
        TIMEOUT_MS,
        "Signer timeout"
      );

      if (!isMountedRef.current) return false;

      setPubkey(pubkeyHex);
      setNpub(ndkUser.npub);
      setUser(ndkUser);
      setStatus("authenticated");
      setAuthMethod("extension");
      setError(null);
      localStorage.setItem(STORAGE_KEY, pubkeyHex);
      localStorage.setItem(STORAGE_METHOD_KEY, "extension");
      localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN);
      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to initialize extension");
      }
      return false;
    }
  }, []);

  const setupLocalKeySession = useCallback(async (privateKey: string): Promise<boolean> => {
    try {
      const normalizedKey = privateKey.trim();
      const ndk = getNDK();
      const signer = new NDKPrivateKeySigner(normalizedKey);
      ndk.signer = signer;

      const ndkUser = await signer.user();
      if (!isMountedRef.current) return false;

      const encryptedKey = await encryptData(normalizedKey, DEFAULT_KEY_PASSPHRASE);

      activePrivateKeyRef.current = normalizedKey;
      setPubkey(ndkUser.pubkey);
      setNpub(ndkUser.npub);
      setUser(ndkUser);
      setStatus("authenticated");
      setAuthMethod("local");
      setError(null);

      localStorage.setItem(STORAGE_KEY, ndkUser.pubkey);
      localStorage.setItem(STORAGE_METHOD_KEY, "local");
      localStorage.setItem(STORAGE_ENCRYPTED_KEY, encryptedKey);
      localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN);
      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to setup local key");
      }
      return false;
    }
  }, []);

  const restoreLocalSession = useCallback(async (): Promise<boolean> => {
    try {
      const encryptedKey = localStorage.getItem(STORAGE_ENCRYPTED_KEY);
      if (!encryptedKey) return false;

      let privateKey: string | null = null;
      try {
        privateKey = await decryptData(encryptedKey, DEFAULT_KEY_PASSPHRASE);
      } catch {
        if (isValidPrivateKey(encryptedKey)) {
          privateKey = encryptedKey;
        }
      }

      if (!privateKey || !isValidPrivateKey(privateKey)) {
        return false;
      }

      return await setupLocalKeySession(privateKey);
    } catch {
      return false;
    }
  }, [setupLocalKeySession]);

  const autoUseLocalAccount = useCallback(async (): Promise<boolean> => {
    const existing = await restoreLocalSession();
    if (existing) return true;

    try {
      const keys = generateNostrKeys();
      return await setupLocalKeySession(keys.nsec);
    } catch {
      return false;
    }
  }, [restoreLocalSession, setupLocalKeySession]);

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === "undefined") {
      setStatus("idle");
      return;
    }

    const checkExtension = () => {
      if (isMountedRef.current) {
        setHasExtension(Boolean(window.nostr));
      }
    };
    checkExtension();

    const skipAutoLogin = localStorage.getItem(STORAGE_SKIP_AUTO_LOGIN) === "true";
    if (skipAutoLogin) {
      setStatus("idle");
      return;
    }

    const runAutoAuth = async () => {
      setStatus("checking");

      const storedMethod = localStorage.getItem(STORAGE_METHOD_KEY) as AuthMethod | null;
      const storedPubkey = localStorage.getItem(STORAGE_KEY);

      if (storedMethod === "extension" && storedPubkey) {
        if (!window.nostr) {
          await new Promise(r => setTimeout(r, 300));
        }
        if (window.nostr) {
          try {
            const currentPubkey = await withTimeout(
              window.nostr.getPublicKey(),
              TIMEOUT_MS,
              "Extension timeout"
            );
            if (currentPubkey === storedPubkey) {
              const ok = await setupExtensionSession(currentPubkey);
              if (ok) return;
            }
          } catch {
          }
        }
      }

      if (storedMethod === "local" || localStorage.getItem(STORAGE_ENCRYPTED_KEY)) {
        const ok = await restoreLocalSession();
        if (ok) return;
      }

      let hasExt = Boolean(window.nostr);
      if (!hasExt) {
        await new Promise(r => setTimeout(r, 250));
        hasExt = Boolean(window.nostr);
      }
      if (isMountedRef.current) {
        setHasExtension(hasExt);
      }

      if (hasExt && window.nostr) {
        try {
          const pubkey = await withTimeout(
            window.nostr.getPublicKey(),
            TIMEOUT_MS,
            "Extension timeout"
          );
          if (pubkey) {
            const ok = await setupExtensionSession(pubkey);
            if (ok) return;
          }
        } catch {
        }
      }

      if (isMountedRef.current) {
        if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname.startsWith("/admin"))) {
          await autoUseLocalAccount();
        } else {
          setStatus("idle");
        }
      }
    };

    runAutoAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, [restoreLocalSession, setupExtensionSession, autoUseLocalAccount]);

  const login = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStatus("requesting");
    localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN);

    if (!window.nostr) {
      return await autoUseLocalAccount();
    }

    try {
      const pubkeyHex = await withTimeout(
        window.nostr.getPublicKey(),
        TIMEOUT_MS * 2,
        "Extension request timed out"
      );

      if (!pubkeyHex) {
        return await autoUseLocalAccount();
      }

      const ok = await setupExtensionSession(pubkeyHex);
      if (ok) return true;
      return await autoUseLocalAccount();
    } catch {
      return await autoUseLocalAccount();
    }
  }, [autoUseLocalAccount, setupExtensionSession]);

  const createBrowserAccount = useCallback(async (): Promise<boolean> => {
    setError(null);
    setStatus("checking");
    localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN);
    try {
      const keys = generateNostrKeys();
      return await setupLocalKeySession(keys.nsec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create browser account");
      setStatus("idle");
      return false;
    }
  }, [setupLocalKeySession]);

  const loginWithKey = useCallback(async (privateKey: string): Promise<boolean> => {
    setError(null);
    const trimmed = privateKey.trim();

    if (!trimmed) {
      setError("Please enter a private key");
      return false;
    }

    if (!isValidPrivateKey(trimmed)) {
      setError("Invalid private key. Must be an nsec1... or 64-character hex key.");
      return false;
    }

    setStatus("checking");
    localStorage.removeItem(STORAGE_SKIP_AUTO_LOGIN);
    return await setupLocalKeySession(trimmed);
  }, [setupLocalKeySession]);

  const getLocalKey = useCallback((): string | null => {
    if (authMethod !== "local" || !activePrivateKeyRef.current) {
      return null;
    }
    const raw = activePrivateKeyRef.current;
    if (raw.startsWith("nsec1")) {
      return raw;
    }
    try {
      const hexBytes = Uint8Array.from(raw.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      return nip19.nsecEncode(hexBytes);
    } catch {
      return raw;
    }
  }, [authMethod]);

  const switchToLocalAccount = useCallback(async (): Promise<boolean> => {
    const success = await restoreLocalSession();
    if (success) {
      return true;
    }
    return await autoUseLocalAccount();
  }, [restoreLocalSession, autoUseLocalAccount]);

  const logout = useCallback(() => {
    switchToLocalAccount();
  }, [switchToLocalAccount]);

  return {
    status,
    pubkey,
    npub,
    user,
    error,
    hasExtension,
    authMethod,
    login,
    createBrowserAccount,
    loginWithKey,
    getLocalKey,
    switchToLocalAccount,
    logout,
  };
}

export default useNostrAuth;
