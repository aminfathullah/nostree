import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATE_RELAYS = [
  "wss://nos.lol",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://offchain.pub",
  "wss://relay.snort.social",
  "wss://nostr.mom",
  "wss://eden.nostr.land",
  "wss://nostr.oxtr.dev",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.wirednet.jp"
];

const BENCHMARK_TIMEOUT_MS = 2500;

function benchmarkRelay(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    let connectTime = 0;

    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      resolve({ url, ok: false, error: "timeout", latency: Infinity });
    }, BENCHMARK_TIMEOUT_MS);

    let ws;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      clearTimeout(timer);
      return resolve({ url, ok: false, error: err.message, latency: Infinity });
    }

    ws.onopen = () => {
      connectTime = Date.now() - start;
      try {
        ws.send(JSON.stringify(["REQ", "probe", { kinds: [1], limit: 1 }]));
      } catch {
        clearTimeout(timer);
        try { ws.close(); } catch {}
        resolve({ url, ok: true, connectTime, readLatency: connectTime, latency: connectTime });
      }
    };

    ws.onmessage = () => {
      const readLatency = Date.now() - start;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve({ url, ok: true, connectTime, readLatency, latency: readLatency });
    };

    ws.onerror = (err) => {
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve({ url, ok: false, error: err?.message || "connection error", latency: Infinity });
    };
  });
}

async function run() {
  console.log(`\nBenchmarking ${CANDIDATE_RELAYS.length} candidate Nostr relays...\n`);
  
  const results = await Promise.all(CANDIDATE_RELAYS.map(benchmarkRelay));
  const healthy = results.filter(r => r.ok).sort((a, b) => a.latency - b.latency);

  if (healthy.length === 0) {
    console.error("No healthy relays detected. Keeping existing configuration.");
    process.exit(1);
  }

  const readRelays = healthy.slice(0, 3).map(r => r.url);
  const fastestWriteRelay = healthy[0].url;
  const asyncWriteRelays = healthy.slice(1, 5).map(r => r.url);

  console.log("----------------------------------------------------------------------------------");
  console.log(
    "Rank".padEnd(6) + 
    "Relay URL".padEnd(35) + 
    "Connect (ms)".padEnd(15) + 
    "Read RTT (ms)".padEnd(16) + 
    "Role"
  );
  console.log("----------------------------------------------------------------------------------");

  healthy.forEach((r, idx) => {
    let role = "Standby";
    if (r.url === fastestWriteRelay) {
      role = "Read + Sync Write";
    } else if (readRelays.includes(r.url)) {
      role = "Read + Async Write";
    } else if (asyncWriteRelays.includes(r.url)) {
      role = "Async Write";
    }

    console.log(
      `#${idx + 1}`.padEnd(6) +
      r.url.padEnd(35) +
      `${r.connectTime}ms`.padEnd(15) +
      `${r.readLatency}ms`.padEnd(16) +
      role
    );
  });

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.log("\nUnreachable/Slow relays:");
    failed.forEach(r => console.log(`  x ${r.url} (${r.error})`));
  }

  const config = {
    updatedAt: new Date().toISOString(),
    readRelays,
    fastestWriteRelay,
    asyncWriteRelays,
  };

  const targetPath = path.resolve(__dirname, "../src/lib/relays.json");
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

  console.log(`\nRelay configuration written to: ${targetPath}`);
  console.log(`  Read Relays: ${readRelays.join(", ")}`);
  console.log(`  Fastest Write Relay: ${fastestWriteRelay}`);
  console.log(`  Async Write Relays: ${asyncWriteRelays.join(", ")}\n`);
}

run().catch(err => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
