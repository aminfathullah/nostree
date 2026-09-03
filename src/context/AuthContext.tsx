import * as React from "react";
import { createContext, useContext } from "react";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { useNostrAuth, type AuthStatus, type AuthMethod } from "../hooks/useNostrAuth";

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
