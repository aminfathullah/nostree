import NDK, { 
  type NDKEvent, 
  type NDKFilter, 
  type NDKSigner,
  NDKEvent as NDKEventClass,
} from "@nostr-dev-kit/ndk";

const DEFAULT_RELAYS = [
  "wss://nos.lol",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://offchain.pub",
];

const WRITE_RELAYS = [
  "wss://nos.lol",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://offchain.pub",
];

let ndkInstance: NDK | null = null;
let connectionPromise: Promise<void> | null = null;

export function getNDK(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: DEFAULT_RELAYS,
    });
  }
  return ndkInstance;
}

export function setNDKSigner(signer: NDKSigner | undefined): void {
  const ndk = getNDK();
  ndk.signer = signer;
}

export async function connectNDK(): Promise<void> {
  const ndk = getNDK();
  if (!connectionPromise) {
    connectionPromise = Promise.race([
      ndk.connect(1000),
      new Promise<void>(r => setTimeout(r, 600))
    ]);
  }
  await connectionPromise;
}

export async function fetchEventsWithTimeout(
  filter: NDKFilter,
  timeoutMs: number = 2000,
  debounceMs: number = 120
): Promise<Set<NDKEvent>> {
  const ndk = getNDK();

  if (!connectionPromise) {
    connectionPromise = Promise.race([
      ndk.connect(1000),
      new Promise<void>(r => setTimeout(r, 600))
    ]);
  }

  await connectionPromise;

  return new Promise((resolve) => {
    const events = new Set<NDKEvent>();
    let resolved = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let eoseCount = 0;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        if (debounceTimer) clearTimeout(debounceTimer);
        clearTimeout(hardTimer);
        try {
          subscription.stop();
        } catch {}
        resolve(events);
      }
    };

    const hardTimer = setTimeout(cleanup, timeoutMs);

    const subscription = ndk.subscribe(filter, { closeOnEose: false });

    subscription.on("event", (event: NDKEvent) => {
      events.add(event);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(cleanup, debounceMs);
    });

    subscription.on("eose", () => {
      eoseCount++;
      if (events.size > 0 || eoseCount >= 2) {
        cleanup();
      }
    });
  });
}

export interface PublishResult {
  success: boolean;
  relaysAccepted: number;
  relaysTotal: number;
}

export async function publishEvent(event: NDKEvent): Promise<PublishResult> {
  const ndk = getNDK();
  
  if (!ndk.signer) {
    throw new Error("No signer set. User must be authenticated.");
  }
  
  if (ndk.pool.connectedRelays().length === 0) {
    await connectNDK();
  }
  
  try {
    const relays = await event.publish();
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

export { NDK, NDKEventClass };
export type { NDKEvent, NDKFilter, NDKSigner };
