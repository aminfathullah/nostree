import { Resvg, initWasm } from "@resvg/resvg-wasm";
import wasm from "@resvg/resvg-wasm/index_bg.wasm";

let wasmReady = false;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(str: string, maxLen: number): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

export async function onRequest(context: any): Promise<Response> {
  const url = new URL(context.request.url);
  const rawTitle = url.searchParams.get("title") || "Nostree Hub";
  const rawSlug = url.searchParams.get("slug") || "hub";
  const rawBio = url.searchParams.get("bio") || "Explore links, resources, and contact information.";
  const rawAvatar = url.searchParams.get("avatar") || "";
  const rawLinksCount = parseInt(url.searchParams.get("links") || "0", 10);

  const title = escapeXml(truncate(rawTitle, 48));
  const slug = escapeXml(truncate(rawSlug, 28));
  const bio = escapeXml(truncate(rawBio, 90));
  const linksCount = isNaN(rawLinksCount) ? 0 : rawLinksCount;
  const initial = (title[0] || "N").toUpperCase();

  let avatarBase64 = "";
  if (rawAvatar && rawAvatar.startsWith("http")) {
    try {
      const imgRes = await fetch(rawAvatar, { signal: AbortSignal.timeout(1800) });
      if (imgRes.ok) {
        const mime = imgRes.headers.get("content-type") || "image/jpeg";
        const buf = await imgRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        avatarBase64 = `data:${mime};base64,${base64}`;
      }
    } catch {}
  }

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#18181b" />
      </linearGradient>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#000000" flood-opacity="0.65"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="70" result="blur" />
      </filter>
      <clipPath id="avatarClip">
        <circle cx="180" cy="80" r="42" />
      </clipPath>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)" />

    <circle cx="180" cy="140" r="260" fill="url(#glowGrad)" filter="url(#glow)" />
    <circle cx="1020" cy="480" r="300" fill="url(#glowGrad)" filter="url(#glow)" />

    <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#27272a" stroke-width="1.5" stroke-opacity="0.6" />

    <g transform="translate(80, 80)">
      <rect width="260" height="42" rx="21" fill="#18181b" stroke="#3f3f46" stroke-width="1.2" />
      <circle cx="20" cy="21" r="5" fill="#10b981" />
      <text x="36" y="26" fill="#f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="0.4">nostree.me/${slug}</text>
    </g>

    <g transform="translate(80, 190)">
      <text x="0" y="30" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-1">
        ${title}
      </text>
      
      <text x="0" y="95" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">
        ${bio}
      </text>

      <g transform="translate(0, 170)">
        <rect width="150" height="36" rx="18" fill="#1e1e24" stroke="#3f3f46" stroke-width="1" />
        <text x="18" y="23" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">⚡ Nostr Verified</text>

        ${linksCount > 0 ? `
          <rect x="162" width="120" height="36" rx="18" fill="#1e1e24" stroke="#3f3f46" stroke-width="1" />
          <text x="180" y="23" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">🔗 ${linksCount} Links</text>
        ` : `
          <rect x="162" width="130" height="36" rx="18" fill="#1e1e24" stroke="#3f3f46" stroke-width="1" />
          <text x="180" y="23" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">🌐 Digital Hub</text>
        `}

        <rect x="${linksCount > 0 ? 294 : 304}" width="120" height="36" rx="18" fill="#1e1e24" stroke="#3f3f46" stroke-width="1" />
        <text x="${linksCount > 0 ? 312 : 322}" y="23" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">✨ Fast &amp; Open</text>
      </g>
    </g>

    <g transform="translate(760, 90)" filter="url(#shadow)">
      <rect width="360" height="450" rx="36" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
      
      ${avatarBase64 ? `
        <image href="${avatarBase64}" x="138" y="38" width="84" height="84" clip-path="url(#avatarClip)" />
        <circle cx="180" cy="80" r="42" fill="none" stroke="#6366f1" stroke-width="3" />
      ` : `
        <circle cx="180" cy="80" r="42" fill="#27272a" stroke="#6366f1" stroke-width="3" />
        <text x="180" y="90" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800">${initial}</text>
      `}

      <text x="180" y="150" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700">${title}</text>
      <text x="180" y="172" text-anchor="middle" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">nostree.me/${slug}</text>

      <g transform="translate(36, 196)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#6366f1" stroke-width="1.5" />
        <circle cx="28" cy="24" r="12" fill="#6366f1" fill-opacity="0.2" />
        <text x="28" y="28" text-anchor="middle" fill="#818cf8" font-size="12">★</text>
        <text x="52" y="29" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">Featured Links &amp; Projects</text>
      </g>

      <g transform="translate(36, 256)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <circle cx="28" cy="24" r="12" fill="#3f3f46" />
        <text x="28" y="28" text-anchor="middle" fill="#a1a1aa" font-size="12">📄</text>
        <text x="52" y="29" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">Documents &amp; Reference</text>
      </g>

      <g transform="translate(36, 316)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <circle cx="28" cy="24" r="12" fill="#3f3f46" />
        <text x="28" y="28" text-anchor="middle" fill="#a1a1aa" font-size="12">💬</text>
        <text x="52" y="29" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">Discussion &amp; Contact</text>
      </g>

      <g transform="translate(36, 376)">
        <rect width="288" height="44" rx="14" fill="#6366f1" />
        <text x="144" y="27" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">⚡ Send Lightning Tip</text>
      </g>

      <g transform="translate(260, 220)" filter="url(#shadow)">
        <path d="M 0 0 L 18 18 L 10 18 L 14 28 L 8 30 L 4 20 L -4 24 Z" fill="#ffffff" stroke="#18181b" stroke-width="2" />
      </g>
    </g>
  </svg>
  `;

  if (!wasmReady) {
    await initWasm(wasm);
    wasmReady = true;
  }

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  return new Response(pngBuffer as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
