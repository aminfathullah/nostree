import { generateSecretKey, getPublicKey } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

export interface NostrKeyPair {
  nsec: string;
  privateKeyHex: string;
  npub: string;
  publicKeyHex: string;
}

export function generateNostrKeys(): NostrKeyPair {
  const privateKeyBytes = generateSecretKey();
  const publicKeyBytes = getPublicKey(privateKeyBytes);
  const privateKeyHex = bytesToHex(privateKeyBytes);
  const publicKeyHex = typeof publicKeyBytes === 'string' ? publicKeyBytes : bytesToHex(publicKeyBytes);
  const nsec = nip19.nsecEncode(privateKeyBytes);
  const npub = nip19.npubEncode(publicKeyHex);
  
  return {
    nsec,
    privateKeyHex,
    npub,
    publicKeyHex,
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
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
