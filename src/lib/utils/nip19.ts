import { nip19 } from "nostr-tools";

export function isNpub(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  if (!val.startsWith("npub1")) return false;
  if (val.length !== 63) return false;
  
  try {
    const decoded = nip19.decode(val);
    return decoded.type === "npub";
  } catch {
    return false;
  }
}

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

export function hexToNpub(hex: string): string | null {
  try {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      return null;
    }
    return nip19.npubEncode(hex);
  } catch {
    return null;
  }
}

export function isNoteId(val: string): boolean {
  if (!val || typeof val !== "string") return false;
  
  try {
    const decoded = nip19.decode(val);
    return decoded.type === "note" || decoded.type === "nevent";
  } catch {
    return false;
  }
}

export function shortenNpub(npub: string): string {
  if (!isNpub(npub)) return npub;
  return `${npub.slice(0, 12)}...${npub.slice(-4)}`;
}
