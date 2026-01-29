import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { useNostrAuth, type AuthStatus, type AuthMethod } from "../hooks/useNostrAuth";

/**
 * Auth context value shape
 */
interface AuthContextValue {
  /** Current authentication status */
  status: AuthStatus;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is loading */
  isLoading: boolean;
  /** User's public key (hex) */
  pubkey: string | null;
  /** User's npub (bech32) */
  npub: string | null;
  /** NDK User object */
  user: NDKUser | null;
  /** Error message */
  error: string | null;
  /** Whether extension is available */
  hasExtension: boolean;
  /** Current authentication method */
  authMethod: AuthMethod | null;
  /** Extension login function */
  login: () => Promise<boolean>;
  /** Local key login function */
  loginWithKey: (privateKey: string, password: string) => Promise<boolean>;
  /** Logout function */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth context provider - wrap admin pages with this
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useNostrAuth();
  
  const isAuthenticated = auth.status === "authenticated";
  const isLoading = auth.status === "checking" || auth.status === "requesting";

  const value: AuthContextValue = {
    ...auth,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context
 * @throws if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

export default AuthProvider;
