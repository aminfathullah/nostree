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

export async function connectNDK(timeoutMs: number = 2500): Promise<void> {
  const ndk = getNDK();
  if (ndk.pool.connectedRelays().length > 0) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve();
        }
      };

      const timer = setTimeout(finish, timeoutMs);

      ndk.pool.on("relay:connect", () => {
        if (ndk.pool.connectedRelays().length > 0) {
          finish();
        }
      });

      ndk.connect(timeoutMs).catch(() => {}).finally(finish);
    });
  }

  await connectionPromise;
}

if (typeof window !== "undefined") {
  setTimeout(() => {
    connectNDK().catch(() => {});
  }, 0);
}

export function subscribeLatestEvent(
  filter: NDKFilter,
  onEvent: (event: NDKEvent) => void,
  onComplete?: () => void,
  timeoutMs: number = 2500
): () => void {
  const ndk = getNDK();
  let stopped = false;
  let latestEvent: NDKEvent | null = null;
  let eoseCount = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const relaySet = NDKRelaySet.fromRelayUrls(relaysConfig.readRelays, ndk);
  const subscription = ndk.subscribe(filter, { 
    closeOnEose: false,
    relaySet,
  });

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    clearTimeout(hardTimer);
    try {
      subscription.stop();
    } catch {}
    onComplete?.();
  };

  const hardTimer = setTimeout(stop, timeoutMs);

  subscription.on("event", (event: NDKEvent) => {
    if (stopped) return;
    const evTime = event.created_at || 0;
    const curTime = latestEvent?.created_at || 0;
    if (!latestEvent || evTime >= curTime) {
      latestEvent = event;
      onEvent(event);
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (eoseCount > 0) {
        stop();
      }
    }, 150);
  });

  subscription.on("eose", () => {
    if (stopped) return;
    eoseCount++;
    const connectedCount = Math.max(1, ndk.pool.connectedRelays().length);
    if (eoseCount >= connectedCount || (latestEvent && eoseCount >= 1)) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(stop, 80);
    }
  });

  return stop;
}

export async function fetchEventsWithTimeout(
  filter: NDKFilter,
  timeoutMs: number = 2500,
  earlyDebounceMs: number = 150
): Promise<Set<NDKEvent>> {
  const ndk = getNDK();

  if (ndk.pool.connectedRelays().length === 0) {
    await Promise.race([
      connectNDK(1500),
      new Promise<void>(r => setTimeout(r, 800))
    ]);
  }

  return new Promise((resolve) => {
    const events = new Set<NDKEvent>();
    let resolved = false;
    let eoseCount = 0;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
      if (resolved) return;
      events.add(event);
      if (earlyDebounceMs > 0 && eoseCount > 0) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(cleanup, earlyDebounceMs);
      }
    });

    subscription.on("eose", () => {
      if (resolved) return;
      eoseCount++;
      const connectedCount = Math.max(1, ndk.pool.connectedRelays().length);
      if (eoseCount >= connectedCount) {
        cleanup();
      } else if (events.size > 0 && earlyDebounceMs > 0) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(cleanup, earlyDebounceMs);
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
    await connectNDK(1500);
  }

  const primaryRelayUrl = relaysConfig.fastestWriteRelay;
  const secondaryRelayUrls = relaysConfig.asyncWriteRelays.filter(url => url !== primaryRelayUrl);
  const writeUrls = Array.from(new Set([primaryRelayUrl, ...secondaryRelayUrls]));
  const totalWriteCount = writeUrls.length;

  let confirmed = false;
  let acceptedCount = 0;

  const writePromises = writeUrls.map(async (url) => {
    try {
      const singleSet = NDKRelaySet.fromRelayUrls([url], ndk);
      const res = await Promise.race([
        event.publish(singleSet),
        new Promise<Set<any>>((_, reject) => setTimeout(() => reject(new Error("Write timeout")), 2000))
      ]);
      if (res && res.size > 0) {
        acceptedCount++;
        confirmed = true;
        return true;
      }
    } catch {}
    return false;
  });

  const anySuccess = new Promise<boolean>((resolve) => {
    let pending = writePromises.length;
    if (pending === 0) {
      resolve(false);
      return;
    }
    writePromises.forEach((p) => {
      p.then((ok) => {
        if (ok) resolve(true);
        else if (--pending === 0) resolve(false);
      }).catch(() => {
        if (--pending === 0) resolve(false);
      });
    });
  });

  await Promise.race([
    anySuccess,
    new Promise<void>(r => setTimeout(r, 1200))
  ]);

  if (!confirmed) {
    try {
      const fallback = await event.publish();
      confirmed = fallback.size > 0;
      acceptedCount = fallback.size;
    } catch {}
  }

  Promise.allSettled(writePromises).catch(() => {});

  return {
    success: confirmed,
    relaysAccepted: Math.max(acceptedCount, confirmed ? 1 : 0),
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

export function createDeletionEvent(pubkey: string, dTag: string): NDKEvent {
  const ndk = getNDK();
  const event = new NDKEventClass(ndk);
  event.kind = 5;
  event.content = "Deleted Nostree slug";
  event.tags = [
    ["a", `30078:${pubkey}:${dTag}`],
    ["p", pubkey],
  ];
  return event;
}

export { NDK, NDKEventClass, NDKRelaySet };
export type { NDKEvent, NDKFilter, NDKSigner };
