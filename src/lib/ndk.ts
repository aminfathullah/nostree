import NDK, { 
  type NDKEvent, 
  type NDKFilter, 
  type NDKSigner,
  NDKEvent as NDKEventClass,
} from "@nostr-dev-kit/ndk";

// Default relays for bootstrapping
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://purplepag.es",
];

// Write relays (subset that accept writes)
const WRITE_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

// Singleton NDK instance for client-side use
let ndkInstance: NDK | null = null;

/**
 * Get or create the NDK singleton instance
 */
export function getNDK(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: DEFAULT_RELAYS,
    });
  }
  return ndkInstance;
}

/**
 * Set the signer for the NDK instance (for authenticated operations)
 */
export function setNDKSigner(signer: NDKSigner | undefined): void {
  const ndk = getNDK();
  ndk.signer = signer;
}

/**
 * Connect to relays
 */
export async function connectNDK(): Promise<void> {
  const ndk = getNDK();
  await ndk.connect();
}

/**
 * Fetch events with a timeout
 */
let connectionPromise: Promise<void> | null = null;

export async function fetchEventsWithTimeout(
  filter: NDKFilter,
  timeoutMs: number = 8000
): Promise<Set<NDKEvent>> {
  const ndk = getNDK();
  
  // Connect once, cache the promise
  if (!connectionPromise) {
    connectionPromise = Promise.race([
      ndk.connect(),
      new Promise<void>(r => setTimeout(r, 2000))
    ]).then(() => {
      // Small delay for WebSockets to fully establish
      return new Promise<void>(r => setTimeout(r, 300));
    });
  }
  
  await connectionPromise;
  
  return new Promise((resolve) => {
    const events = new Set<NDKEvent>();
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(events);
      }
    }, timeoutMs);
    
    const subscription = ndk.subscribe(filter, { closeOnEose: true });
    
    subscription.on("event", (event: NDKEvent) => {
      events.add(event);
    });
    
    subscription.on("eose", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(events);
      }
    });
  });
}

/**
 * Publish event result
 */
export interface PublishResult {
  success: boolean;
  relaysAccepted: number;
  relaysTotal: number;
}

/**
 * Publish an event to relays
 * Requires a signer to be set on the NDK instance
 */
export async function publishEvent(event: NDKEvent): Promise<PublishResult> {
  const ndk = getNDK();
  
  if (!ndk.signer) {
    throw new Error("No signer set. User must be authenticated.");
  }
  
  // Connect if needed
  if (ndk.pool.connectedRelays().length === 0) {
    await ndk.connect();
    await new Promise(r => setTimeout(r, 500));
  }
  
  try {
    // Publish and wait for confirmations
    const relays = await event.publish();
    
    // Count successful publishes (using write quorum)
    const accepted = relays.size;
    const total = WRITE_RELAYS.length;
    const quorum = Math.ceil(total / 2);
    
    return {
      success: accepted >= quorum || accepted > 0,
      relaysAccepted: accepted,
      relaysTotal: total,
    };
  } catch (err) {
    console.error("Failed to publish event:", err);
    return {
      success: false,
      relaysAccepted: 0,
      relaysTotal: WRITE_RELAYS.length,
    };
  }
}

/**
 * Create a Kind 30078 event for Nostree data
 */
export function createNostreeEvent(content: object, pubkey: string, dTag: string = "nostree-data-v1"): NDKEvent {
  const ndk = getNDK();
  
  const event = new NDKEventClass(ndk);
  event.kind = 30078;
  event.content = JSON.stringify(content);
  event.tags = [
    ["d", dTag],
    ["p", pubkey],
  ];
  
  return event;
}

// Export types
export { NDK, NDKEventClass };
export type { NDKEvent, NDKFilter, NDKSigner };
