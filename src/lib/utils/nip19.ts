import { nip19 } from "nostr-tools";

/**
 * Check if a string is a valid npub (Nostr public key in bech32 format)
 */
export function isNpub(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  if (!val.startsWith("npub1")) return false;
  if (val.length !== 63) return false;
  
  // Verify it can be decoded
  try {
    const decoded = nip19.decode(val);
    return decoded.type === "npub";
  } catch {
    return false;
  }
}

/**
 * Convert npub (bech32) to hex pubkey
 * Returns null if the npub is invalid
 */
export function npubToHex(npub: string): string | null {
  try {
    const decoded = nip19.decode(npub);
    if (decoded.type === "npub") {
      return decoded.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert hex pubkey to npub (bech32)
 * Returns null if the hex is invalid
 */
export function hexToNpub(hex: string): string | null {
  try {
    // Validate hex format (64 character hex string)
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      return null;
    }
    return nip19.npubEncode(hex);
  } catch {
    return null;
  }
}

/**
 * Check if a string is a valid note ID (nevent or note)
 */
export function isNoteId(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  
  try {
    const decoded = nip19.decode(val);
    return decoded.type === "note" || decoded.type === "nevent";
  } catch {
    return false;
  }
}

/**
 * Extract the display identifier from an npub (first 8 chars + ... + last 4 chars)
 */
export function shortenNpub(npub: string): string {
  if (!isNpub(npub)) return npub;
  return `${npub.slice(0, 12)}...${npub.slice(-4)}`;
}
