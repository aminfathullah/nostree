import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_PATH = 'public/og-default.png';
const WIDTH = 1200;
const HEIGHT = 630;

async function generateDefaultOG() {
  const logoPath = 'src/assets/logo.png';
  let logoBase64 = '';
  try {
    const logoBuffer = await fs.readFile(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {}

  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#18181b" />
      </linearGradient>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="60" result="blur" />
      </filter>
    </defs>

    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

    <circle cx="200" cy="150" r="280" fill="url(#glowGrad)" filter="url(#glow)" />
    <circle cx="1000" cy="480" r="320" fill="url(#glowGrad)" filter="url(#glow)" />

    <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="28" fill="none" stroke="#27272a" stroke-width="1.5" stroke-opacity="0.6" />

    <g transform="translate(80, 80)">
      <rect width="210" height="42" rx="21" fill="#18181b" stroke="#3f3f46" stroke-width="1.2" />
      ${logoBase64 ? `<image href="${logoBase64}" x="10" y="8" width="26" height="26" />` : ''}
      <text x="44" y="26" fill="#f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="0.5">nostree.me</text>
      <circle cx="188" cy="21" r="4" fill="#10b981" />
    </g>

    <g transform="translate(80, 200)">
      <text x="0" y="0" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-1">
        Modern Link Organizer
      </text>
      <text x="0" y="64" fill="url(#brandGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-1">
        &amp; Digital Hub
      </text>
      <text x="0" y="130" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">
        One clean, lightning-fast page for all your essential links,
      </text>
      <text x="0" y="162" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">
        documents, and verified digital identity on Nostr.
      </text>

      <g transform="translate(0, 210)">
        <rect width="130" height="34" rx="17" fill="#27272a" />
        <text x="18" y="22" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">⚡ Lightning Tips</text>

        <rect x="142" width="130" height="34" rx="17" fill="#27272a" />
        <text x="160" y="22" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">🔐 Censorship Free</text>

        <rect x="284" width="110" height="34" rx="17" fill="#27272a" />
        <text x="302" y="22" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">✨ 16+ Themes</text>
      </g>
    </g>

    <g transform="translate(760, 90)" filter="url(#shadow)">
      <rect width="360" height="450" rx="36" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
      
      <circle cx="180" cy="80" r="42" fill="#27272a" stroke="#6366f1" stroke-width="3" />
      <circle cx="180" cy="74" r="16" fill="#a1a1aa" />
      <path d="M 156 104 C 156 94 168 88 180 88 C 192 88 204 94 204 104 Z" fill="#a1a1aa" />

      <text x="180" y="150" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">Creator Profile</text>
      <text x="180" y="172" text-anchor="middle" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500">nostree.me/hub</text>

      <g transform="translate(36, 196)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#6366f1" stroke-width="1.5" />
        <circle cx="28" cy="24" r="12" fill="#6366f1" fill-opacity="0.2" />
        <text x="28" y="28" text-anchor="middle" fill="#818cf8" font-size="12">★</text>
        <text x="52" y="29" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">Featured Portfolio &amp; Projects</text>
      </g>

      <g transform="translate(36, 256)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <circle cx="28" cy="24" r="12" fill="#3f3f46" />
        <text x="28" y="28" text-anchor="middle" fill="#a1a1aa" font-size="12">📄</text>
        <text x="52" y="29" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">Important Documents &amp; Notes</text>
      </g>

      <g transform="translate(36, 316)">
        <rect width="288" height="48" rx="14" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <circle cx="28" cy="24" r="12" fill="#3f3f46" />
        <text x="28" y="28" text-anchor="middle" fill="#a1a1aa" font-size="12">💬</text>
        <text x="52" y="29" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">Contact &amp; Virtual Discussion</text>
      </g>

      <g transform="translate(36, 376)">
        <rect width="288" height="44" rx="14" fill="#6366f1" />
        <text x="144" y="27" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">⚡ Send Bitcoin Tip</text>
      </g>

      <g transform="translate(260, 220)" filter="url(#shadow)">
        <path d="M 0 0 L 18 18 L 10 18 L 14 28 L 8 30 L 4 20 L -4 24 Z" fill="#ffffff" stroke="#18181b" stroke-width="2" />
      </g>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(OUTPUT_PATH);

  const stats = await fs.stat(OUTPUT_PATH);
  console.log(`Generated ${OUTPUT_PATH} (${Math.round(stats.size / 1024)} KB)`);
}

generateDefaultOG();
