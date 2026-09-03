import NDK, { 
  type NDKEvent, 
  type NDKFilter, 
  type NDKSigner,
  NDKEvent as NDKEventClass,
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
    connectionPromise = Promise.race([
      ndk.connect(1000),
      new Promise<void>(r => setTimeout(r, 600))
    ]);
  }
  await connectionPromise;
}

export async function fetchEventsWithTimeout(
  filter: NDKFilter,
  timeoutMs: number = 1800,
  debounceMs: number = 100
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

    const relayPool = ndk.pool.relays;
    const targetRelays = relaysConfig.readRelays
      .map(url => relayPool.get(url))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    const subscription = ndk.subscribe(filter, { 
      closeOnEose: false,
      relaySet: targetRelays.length > 0 ? new Set(targetRelays) as any : undefined,
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
    const primaryRelay = ndk.pool.getRelayById(primaryRelayUrl);
    if (primaryRelay) {
      await Promise.race([
        event.publish(new Set([primaryRelay]) as any),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Primary write timeout")), 1500))
      ]);
      syncAccepted = true;
    }
  } catch {}

  if (!syncAccepted) {
    try {
      const fallbackUrl = secondaryRelayUrls[0];
      const fallbackRelay = fallbackUrl ? ndk.pool.getRelayById(fallbackUrl) : null;
      if (fallbackRelay) {
        await Promise.race([
          event.publish(new Set([fallbackRelay]) as any),
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
      const asyncRelays = secondaryRelayUrls
        .map(url => ndk.pool.getRelayById(url))
        .filter((r): r is NonNullable<typeof r> => Boolean(r));

      if (asyncRelays.length > 0) {
        await event.publish(new Set(asyncRelays) as any);
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

export { NDK, NDKEventClass };
export type { NDKEvent, NDKFilter, NDKSigner };
