import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/images/jewellery');

function writeSvg(filename, svgContent) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf8');
}

// 13. Gold Peacock Ring
writeSvg('vd_g007_gold_peacock_ring.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbf2"/><stop offset="100%" stop-color="#f6efe1"/>
    </radialGradient>
    <linearGradient id="goldShiny" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3A8"/><stop offset="30%" stop-color="#DDA92B"/><stop offset="60%" stop-color="#FFF1B0"/><stop offset="100%" stop-color="#946505"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5475"/><stop offset="70%" stop-color="#A80F33"/><stop offset="100%" stop-color="#4F0314"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#52B788"/><stop offset="60%" stop-color="#1B4332"/><stop offset="100%" stop-color="#081C15"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#6B4B0B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 310)">
    <!-- Ring Band -->
    <ellipse cx="0" cy="50" rx="90" ry="80" fill="none" stroke="url(#goldShiny)" stroke-width="26"/>
    <ellipse cx="0" cy="50" rx="90" ry="80" fill="none" stroke="#7A5000" stroke-width="2"/>
    
    <!-- Peacock Crown Face -->
    <g transform="translate(0, -50)">
      <!-- Fan feathers -->
      <path d="M 0 0 C -70 -70 -50 -120 0 -130 C 50 -120 70 -70 0 0 Z" fill="url(#goldShiny)" stroke="#684100" stroke-width="1.5"/>
      <circle cx="-25" cy="-85" r="7" fill="url(#rubyGrad)"/>
      <circle cx="0" cy="-100" r="8" fill="url(#emeraldGrad)"/>
      <circle cx="25" cy="-85" r="7" fill="url(#rubyGrad)"/>
      <circle cx="-15" cy="-55" r="6" fill="url(#emeraldGrad)"/>
      <circle cx="15" cy="-55" r="6" fill="url(#emeraldGrad)"/>
      <!-- Peacock Head & Body -->
      <ellipse cx="0" cy="-25" rx="18" ry="24" fill="url(#rubyGrad)"/>
      <circle cx="0" cy="-45" r="10" fill="url(#goldShiny)"/>
      <!-- Beak -->
      <path d="M 0 -50 L 5 -58 L -5 -58 Z" fill="#FFE599"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 22K ROYAL PEACOCK RING</text>
</svg>
`);

// 14. Gold Handcrafted Chain
writeSvg('vd_g008_gold_gopuram_chain.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffaf0"/><stop offset="100%" stop-color="#f4eedf"/>
    </radialGradient>
    <linearGradient id="goldShiny" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3A8"/><stop offset="30%" stop-color="#DDA92B"/><stop offset="60%" stop-color="#FFF1B0"/><stop offset="100%" stop-color="#946505"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#42300B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)">
    <!-- Triple Layered Handcrafted Gold Chain -->
    <path d="M 170 120 C 170 340, 230 430, 300 430 C 370 430, 430 340, 430 120" fill="none" stroke="url(#goldShiny)" stroke-width="12" stroke-linecap="round"/>
    <path d="M 195 130 C 195 320, 245 390, 300 390 C 355 390, 405 320, 405 130" fill="none" stroke="url(#goldShiny)" stroke-width="8" stroke-linecap="round"/>
    <path d="M 220 140 C 220 300, 260 350, 300 350 C 340 350, 380 300, 380 140" fill="none" stroke="url(#goldShiny)" stroke-width="6" stroke-linecap="round"/>
    
    <!-- Intricate links -->
    ${Array.from({ length: 23 }).map((_, i) => {
      const t = (i + 1) / 25;
      const angle = (t - 0.5) * Math.PI * 0.9;
      const r = 200;
      const cx = 300 + Math.sin(angle) * r;
      const cy = 200 + Math.cos(angle) * r * 1.15;
      return `<circle cx="${cx}" cy="${cy}" r="6" fill="#FFF2A3" stroke="#8A5B02" stroke-width="1.5"/>`;
    }).join('')}
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 22K HANDCRAFTED MOPU CHAIN</text>
</svg>
`);

// 15. Silver Pooja Katori / Bowl
writeSvg('vd_s007_silver_katori_bowl.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1E293B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 290)">
    <!-- Base Foot -->
    <ellipse cx="0" cy="110" rx="75" ry="20" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <!-- Bowl Body -->
    <path d="M -150 0 C -150 110, 150 110, 150 0 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <!-- Rim -->
    <ellipse cx="0" cy="0" rx="150" ry="40" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <ellipse cx="0" cy="0" rx="138" ry="32" fill="#E2E8F0" stroke="#64748B" stroke-width="1"/>
    <!-- Carved Floral Border on Outer Bowl -->
    <path d="M -135 30 Q 0 70 135 30" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="8,6"/>
    <path d="M -115 55 Q 0 95 115 55" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 STERLING SILVER POOJA BOWL</text>
</svg>
`);

// 16. Silver Traditional Glass / Tumbler
writeSvg('vd_s008_silver_glass_tumbler.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#1E293B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 280)">
    <!-- Base -->
    <ellipse cx="0" cy="140" rx="70" ry="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <!-- Tumbler Wall -->
    <path d="M -95 -80 L -70 140 L 70 140 L 95 -80 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <!-- Top Rim -->
    <ellipse cx="0" cy="-80" rx="95" ry="24" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <ellipse cx="0" cy="-80" rx="88" ry="20" fill="#E2E8F0" stroke="#64748B" stroke-width="1"/>
    
    <!-- Engraved Filigree Bands -->
    <ellipse cx="0" cy="-20" rx="86" ry="15" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="6,4"/>
    <ellipse cx="0" cy="40" rx="78" ry="14" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <ellipse cx="0" cy="50" rx="77" ry="14" fill="none" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4,4"/>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 STERLING SILVER TUMBLER</text>
</svg>
`);

// 17. Silver Kamadhenu Cow & Calf
writeSvg('vd_s009_silver_cow_calf_kamadhenu.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1E293B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 280)">
    <!-- Base Plate -->
    <ellipse cx="0" cy="130" rx="170" ry="30" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Kamadhenu Mother Cow -->
    <g transform="translate(-30, 0)">
      <!-- Torso -->
      <ellipse cx="0" cy="30" rx="90" ry="55" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
      <!-- Legs -->
      <rect x="-70" y="60" width="18" height="70" rx="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="-40" y="60" width="16" height="70" rx="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="40" y="60" width="16" height="70" rx="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="65" y="60" width="18" height="70" rx="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <!-- Neck & Head -->
      <path d="M 60 20 L 105 -40 L 80 -65 L 40 -20 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
      <ellipse cx="95" cy="-55" rx="24" ry="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <!-- Horns -->
      <path d="M 85 -70 Q 75 -100 90 -105" fill="none" stroke="#334155" stroke-width="4"/>
      <path d="M 100 -70 Q 115 -100 100 -105" fill="none" stroke="#334155" stroke-width="4"/>
      <!-- Bell necklace on cow -->
      <path d="M 50 0 Q 75 25 100 -20" fill="none" stroke="#CBD5E1" stroke-width="3"/>
      <circle cx="75" cy="22" r="5" fill="#334155"/>
    </g>

    <!-- Calf feeding beside -->
    <g transform="translate(90, 60)">
      <ellipse cx="0" cy="15" rx="35" ry="22" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="-20" y="30" width="10" height="40" rx="3" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <rect x="15" y="30" width="10" height="40" rx="3" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <ellipse cx="-30" cy="-5" rx="14" ry="10" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 SILVER KAMADHENU COW &amp; CALF</text>
</svg>
`);

console.log('All supplemental jewellery artwork generated.');
