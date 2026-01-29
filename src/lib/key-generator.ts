import { generateSecretKey, getPublicKey } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

/**
 * Generated Nostr key pair
 */
export interface NostrKeyPair {
  /** Private key in nsec format (bech32) */
  nsec: string;
  /** Private key in hex format */
  privateKeyHex: string;
  /** Public key in npub format (bech32) */
  npub: string;
  /** Public key in hex format */
  publicKeyHex: string;
}

/**
 * Generate a new Nostr key pair
 * Uses cryptographically secure random number generation
 */
export function generateNostrKeys(): NostrKeyPair {
  // Generate random private key (32 bytes)
  const privateKeyBytes = generateSecretKey();
  
  // Get public key from private key
  const publicKeyBytes = getPublicKey(privateKeyBytes);
  
  // Convert to hex
  const privateKeyHex = bytesToHex(privateKeyBytes);
  const publicKeyHex = typeof publicKeyBytes === 'string' ? publicKeyBytes : bytesToHex(publicKeyBytes);
  
  // Encode to bech32 (nsec/npub)
  const nsec = nip19.nsecEncode(privateKeyBytes);
  const npub = nip19.npubEncode(publicKeyHex);
  
  return {
    nsec,
    privateKeyHex,
    npub,
    publicKeyHex,
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}
