// Type declarations for NIP-07 browser extension (Nostr)

/**
 * Unsigned Nostr event structure before signing
 */
export interface UnsignedEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey?: string;
}

/**
 * Signed Nostr event with id and signature
 */
export interface SignedEvent extends UnsignedEvent {
  id: string;
  pubkey: string;
  sig: string;
}

/**
 * NIP-07 Browser Extension Interface
 * Injected by extensions like Alby, nos2x, etc.
 */
export interface NostrExtension {
  /** Get the user's public key (hex format) */
  getPublicKey(): Promise<string>;
  
  /** Sign an event with the user's private key */
  signEvent(event: UnsignedEvent): Promise<SignedEvent>;
  
  /** Get configured relays (optional) */
  getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
  
  /** Encrypt a message for a recipient (NIP-04) */
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}

declare global {
  interface Window {
    nostr?: NostrExtension;
  }
}

export {};
