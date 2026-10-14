const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOG() {
  const width = 1200;
  const height = 630;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradients -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050a14"/>
        <stop offset="45%" stop-color="#0a1224"/>
        <stop offset="100%" stop-color="#080e1c"/>
      </linearGradient>

      <!-- Radial Glow Orbs -->
      <radialGradient id="orbTop" cx="80%" cy="15%" r="50%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.38"/>
        <stop offset="60%" stop-color="#1d4ed8" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#0a1224" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="orbBottom" cx="20%" cy="85%" r="50%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.32"/>
        <stop offset="60%" stop-color="#0369a1" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#050a14" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="centerGlow" cx="50%" cy="40%" r="40%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#0a1224" stop-opacity="0"/>
      </radialGradient>

      <!-- Logo Squircle Gradient -->
      <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1d4ed8"/>
        <stop offset="50%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>

      <!-- Page Gradients -->
      <linearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="85%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="pageRight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="15%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>

      <!-- Bookmark Ribbon Gradient -->
      <linearGradient id="ribbon" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>

      <!-- Filters for Glow & Shadows -->
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#2563eb" flood-opacity="0.45"/>
      </filter>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- 1. Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="url(#orbTop)"/>
    <rect width="${width}" height="${height}" fill="url(#orbBottom)"/>
    <rect width="${width}" height="${height}" fill="url(#centerGlow)"/>

    <!-- Subtle Outer Border Frame -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="none" stroke="#38bdf8" stroke-opacity="0.12" stroke-width="1.5"/>

    <!-- Decorative Top Accent Line -->
    <rect x="420" y="20" width="360" height="2.5" rx="1" fill="#38bdf8" fill-opacity="0.8"/>

    <!-- 2. Header Kicker Pill -->
    <g transform="translate(600, 72)">
      <rect x="-180" y="-17" width="360" height="34" rx="17" fill="#1e293b" fill-opacity="0.75" stroke="#334155" stroke-width="1"/>
      <circle cx="-152" cy="0" r="4.5" fill="#38bdf8"/>
      <text x="-136" y="4.5" fill="#93c5fd" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="700" letter-spacing="2">BIBLIOTHÈQUE TECH &amp; CODE</text>
    </g>

    <!-- 3. Central Brand Logo Icon -->
    <g transform="translate(600, 195)" filter="url(#logoGlow)">
      <!-- Squircle Base -->
      <rect x="-65" y="-65" width="130" height="130" rx="32" fill="url(#logoBg)"/>
      <rect x="-64.25" y="-64.25" width="128.5" height="128.5" rx="31.25" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Inner Book Icon scaled (viewBox 0 0 64 64 scaled up by 1.7) -->
      <g transform="scale(1.7) translate(-32, -32)">
        <!-- Book Depth / Underlay -->
        <path d="M 13 44 C 19 43 25 45 32 47.5 C 39 45 45 43 51 44 L 51 46.5 C 45 45.5 39 47.5 32 50 C 25 47.5 19 45.5 13 46.5 Z" fill="#0f172a" opacity="0.45"/>
        <path d="M 13 43 C 19 42 25 44 32 46.5 C 39 44 45 42 51 43 L 51 45 C 45 44 39 46 32 48.5 C 25 46 19 44 13 45 Z" fill="#94a3b8" opacity="0.5"/>

        <!-- Left Page -->
        <path d="M 32 25 C 26 23 19 21 13 22 L 13 42 C 19 41 26 43 32 45.5 Z" fill="url(#pageLeft)"/>
        <path d="M 25 29.5 L 19 33.5 L 25 37.5" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 18 40.5 H 26" stroke="#93c5fd" stroke-width="1.8" stroke-linecap="round"/>

        <!-- Right Page -->
        <path d="M 32 25 C 38 23 45 21 51 22 L 51 42 C 45 41 38 43 32 45.5 Z" fill="url(#pageRight)"/>
        <path d="M 39 29.5 L 45 33.5 L 39 37.5" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 38 40.5 H 46" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>

        <!-- Bookmark Ribbon -->
        <path d="M 30.5 16.5 H 33.5 V 33 L 32 31.5 L 30.5 33 Z" fill="url(#ribbon)"/>
        <circle cx="32" cy="15.5" r="2.2" fill="#fbbf24"/>
        <circle cx="32" cy="15.5" r="1" fill="#ffffff"/>
      </g>
    </g>

    <!-- 4. Main Titles & Typography -->
    <!-- App Name -->
    <text x="600" y="325" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="54" font-weight="900" letter-spacing="-1.5">DOCS SHOW</text>

    <!-- Value Proposition -->
    <text x="600" y="375" text-anchor="middle" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="-0.3">La bibliothèque des livres tech &amp; de programmation</text>

    <!-- Tagline description -->
    <text x="600" y="415" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16.5" font-weight="450" letter-spacing="0">Lisez chapitre par chapitre, testez les codes sources et validez vos compétences en direct</text>

    <!-- 5. Feature Badges (Interactive Pills) -->
    <g transform="translate(600, 480)">
      <!-- Pill 1: Lecture interactive -->
      <g transform="translate(-370, 0)">
        <rect x="0" y="-18" width="168" height="36" rx="18" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="84" y="5" text-anchor="middle" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">📖 Lecture Web</text>
      </g>

      <!-- Pill 2: Découpage par chapitre -->
      <g transform="translate(-186, 0)">
        <rect x="0" y="-18" width="176" height="36" rx="18" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="88" y="5" text-anchor="middle" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">⚡ Progression Pas à Pas</text>
      </g>

      <!-- Pill 3: Quiz interactifs -->
      <g transform="translate(6, 0)">
        <rect x="0" y="-18" width="172" height="36" rx="18" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="86" y="5" text-anchor="middle" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">🎯 Quiz de Validation</text>
      </g>

      <!-- Pill 4: Conversion PDF -->
      <g transform="translate(194, 0)">
        <rect x="0" y="-18" width="176" height="36" rx="18" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="88" y="5" text-anchor="middle" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">📄 Import PDF Instantané</text>
      </g>
    </g>

    <!-- 6. Bottom Separator Line -->
    <line x1="60" y1="545" x2="1140" y2="545" stroke="#1e293b" stroke-width="1.2"/>

    <!-- 7. Footer Status & Live URL -->
    <!-- Left: Live URL -->
    <g transform="translate(60, 582)">
      <!-- Live Green Dot with pulse ring -->
      <circle cx="8" cy="-5" r="7" fill="#22c55e" fill-opacity="0.25"/>
      <circle cx="8" cy="-5" r="4" fill="#22c55e"/>
      <text x="24" y="0" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="0.2">https://docsshow.vercel.app</text>
    </g>

    <!-- Right: Call to Action -->
    <g transform="translate(1140, 582)">
      <text x="0" y="0" text-anchor="end" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="600" letter-spacing="-0.1">Accéder gratuitement à la bibliothèque →</text>
    </g>
  </svg>
  `;

  const buffer = Buffer.from(svg);
  const pngBuffer = await sharp(buffer)
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();

  const root = path.resolve(__dirname, '..');
  const targetFiles = [
    path.join(root, 'public/opengraph-image.png'),
    path.join(root, 'src/app/opengraph-image.png'),
    path.join(root, 'src/app/twitter-image.png')
  ];

  for (const file of targetFiles) {
    fs.writeFileSync(file, pngBuffer);
    console.log('Saved:', file, 'size:', pngBuffer.length);
  }
}

generateOG().catch(console.error);

