import NDK, { 
  type NDKEvent, 
  type NDKFilter, 
  type NDKSigner,
  NDKEvent as NDKEventClass,
  NDKRelaySet,
} from "@nostr-dev-kit/ndk";
import defaultRelaysConfig from "./relays.json";

export interface RelayConfig {
  updatedAt: string;
  readRelays: string[];
  fastestWriteRelay: string;
  asyncWriteRelays: string[];
}

const relaysConfig: RelayConfig = defaultRelaysConfig;

let ndkInstance: NDK | null = null;
let connectionPromise: Promise<void> | null = null;

export function getNDK(): NDK {
  if (!ndkInstance) {
    const activeRelays = Array.from(new Set([
      ...relaysConfig.readRelays,
      relaysConfig.fastestWriteRelay,
      ...relaysConfig.asyncWriteRelays,
    ]));

    ndkInstance = new NDK({
      explicitRelayUrls: activeRelays,
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
    connectionPromise = ndk.connect(1000);
  }
  await connectionPromise;
}

export async function fetchEventsWithTimeout(
  filter: NDKFilter,
  timeoutMs: number = 1200,
  debounceMs: number = 60
): Promise<Set<NDKEvent>> {
  const ndk = getNDK();

  if (!connectionPromise) {
    connectionPromise = ndk.connect(1000);
  }

  const relayPool = ndk.pool.relays;
  const targetRelays = relaysConfig.readRelays
    .map(url => {
      const normalized = url.endsWith('/') ? url : url + '/';
      const unnormalized = url.endsWith('/') ? url.slice(0, -1) : url;
      return relayPool.get(url) || relayPool.get(normalized) || relayPool.get(unnormalized);
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  if (targetRelays.length === 0 && ndk.pool.connectedRelays().length === 0) {
    await Promise.race([
      connectionPromise,
      new Promise<void>(r => setTimeout(r, 120))
    ]);
  }

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

    const relaySet = NDKRelaySet.fromRelayUrls(relaysConfig.readRelays, ndk);

    const subscription = ndk.subscribe(filter, { 
      closeOnEose: false,
      relaySet,
    });

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

  const primaryRelayUrl = relaysConfig.fastestWriteRelay;
  const secondaryRelayUrls = relaysConfig.asyncWriteRelays.filter(url => url !== primaryRelayUrl);
  const totalWriteCount = 1 + secondaryRelayUrls.length;

  let syncAccepted = false;

  try {
    const primaryRelaySet = NDKRelaySet.fromRelayUrls([primaryRelayUrl], ndk);
    await Promise.race([
      event.publish(primaryRelaySet),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Primary write timeout")), 1500))
    ]);
    syncAccepted = true;
  } catch {}

  if (!syncAccepted) {
    try {
      const fallbackUrl = secondaryRelayUrls[0];
      if (fallbackUrl) {
        const fallbackRelaySet = NDKRelaySet.fromRelayUrls([fallbackUrl], ndk);
        await Promise.race([
          event.publish(fallbackRelaySet),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Fallback write timeout")), 1500))
        ]);
        syncAccepted = true;
      }
    } catch {}
  }

  if (!syncAccepted) {
    try {
      const relays = await event.publish();
      syncAccepted = relays.size > 0;
    } catch {}
  }

  (async () => {
    try {
      if (secondaryRelayUrls.length > 0) {
        const secondaryRelaySet = NDKRelaySet.fromRelayUrls(secondaryRelayUrls, ndk);
        await event.publish(secondaryRelaySet);
      }
    } catch {}
  })();

  return {
    success: syncAccepted,
    relaysAccepted: syncAccepted ? 1 : 0,
    relaysTotal: totalWriteCount,
  };
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

export { NDK, NDKEventClass, NDKRelaySet };
export type { NDKEvent, NDKFilter, NDKSigner };
