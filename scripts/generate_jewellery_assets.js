import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../public/images/jewellery');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to write SVG
function writeSvg(filename, svgContent) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf8');
  console.log(`Generated: ${filename}`);
}

// 1. Gold Lakshmi Haram
writeSvg('vd_g001_gold_lakshmi_haram.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff9ed" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f5efe0" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2A3"/>
      <stop offset="25%" stop-color="#E5B842"/>
      <stop offset="50%" stop-color="#FCE183"/>
      <stop offset="75%" stop-color="#BA8B1E"/>
      <stop offset="100%" stop-color="#916508"/>
    </linearGradient>
    <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFEBB0"/>
      <stop offset="35%" stop-color="#D9A426"/>
      <stop offset="70%" stop-color="#FFF0BA"/>
      <stop offset="100%" stop-color="#8C5C00"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4D6D"/>
      <stop offset="50%" stop-color="#C9184A"/>
      <stop offset="100%" stop-color="#590D22"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#52B788"/>
      <stop offset="50%" stop-color="#1B4332"/>
      <stop offset="100%" stop-color="#081C15"/>
    </linearGradient>
    <radialGradient id="pearlGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#F4F1EA"/>
      <stop offset="100%" stop-color="#D6CFC4"/>
    </radialGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#8a6d2b" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect width="600" height="600" fill="url(#bgGlow)"/>
  
  <g filter="url(#dropShadow)">
    <!-- Main Arch of the Haram -->
    <path d="M 170 120 C 170 300, 200 380, 300 420 C 400 380, 430 300, 430 120" fill="none" stroke="url(#goldGrad1)" stroke-width="18" stroke-linecap="round"/>
    <path d="M 185 130 C 185 285, 215 365, 300 400 C 385 365, 415 285, 415 130" fill="none" stroke="url(#goldGrad2)" stroke-width="8" stroke-linecap="round"/>
    
    <!-- Kasu / Coins along the haram -->
    ${Array.from({ length: 19 }).map((_, i) => {
      const t = (i + 1) / 21;
      const angle = (t - 0.5) * Math.PI * 0.95;
      const r = 210;
      const cx = 300 + Math.sin(angle) * r;
      const cy = 200 + Math.cos(angle) * r * 1.15;
      return `
        <g transform="translate(${cx}, ${cy}) rotate(${angle * 55})">
          <circle cx="0" cy="0" r="14" fill="url(#goldGrad1)" stroke="#8C5C00" stroke-width="1"/>
          <circle cx="0" cy="0" r="11" fill="none" stroke="#FFF0BA" stroke-width="1"/>
          <!-- Lakshmi motif inside coin -->
          <circle cx="0" cy="-3" r="3.5" fill="#FFE599"/>
          <path d="M -5 6 Q 0 0 5 6 Z" fill="#FFE599"/>
          <circle cx="0" cy="18" r="3.5" fill="url(#pearlGrad)" stroke="#B38F4D" stroke-width="0.5"/>
          <circle cx="0" cy="-8" r="2.5" fill="url(#rubyGrad)"/>
        </g>
      `;
    }).join('')}

    <!-- Centerpiece Goddess Lakshmi Pendant -->
    <g transform="translate(300, 440)">
      <!-- Gopuram / Temple arch pendant -->
      <path d="M 0 -35 L 35 -10 L 40 30 L 0 55 L -40 30 L -35 -10 Z" fill="url(#goldGrad1)" stroke="#6E4400" stroke-width="2"/>
      <path d="M 0 -28 L 28 -8 L 32 25 L 0 46 L -32 25 L -28 -8 Z" fill="url(#goldGrad2)"/>
      
      <!-- Goddess Lakshmi Figure -->
      <circle cx="0" cy="0" r="12" fill="#FFE599"/>
      <path d="M -16 18 Q 0 4 16 18 L 12 32 L -12 32 Z" fill="#FFCC00" stroke="#8C5C00" stroke-width="1"/>
      <circle cx="0" cy="-12" r="5" fill="#FFE599"/>
      <path d="M -8 -15 Q 0 -22 8 -15 Z" fill="url(#goldGrad1)"/> <!-- Crown -->
      
      <!-- Gemstone accents -->
      <circle cx="0" cy="-28" r="4.5" fill="url(#rubyGrad)"/>
      <circle cx="-28" cy="-5" r="4" fill="url(#emeraldGrad)"/>
      <circle cx="28" cy="-5" r="4" fill="url(#emeraldGrad)"/>
      <circle cx="-32" cy="22" r="3.5" fill="url(#rubyGrad)"/>
      <circle cx="32" cy="22" r="3.5" fill="url(#rubyGrad)"/>

      <!-- Hanging pearls -->
      <circle cx="-20" cy="45" r="5.5" fill="url(#pearlGrad)" stroke="#C5A869" stroke-width="0.7"/>
      <circle cx="0" cy="65" r="7" fill="url(#pearlGrad)" stroke="#C5A869" stroke-width="0.7"/>
      <circle cx="20" cy="45" r="5.5" fill="url(#pearlGrad)" stroke="#C5A869" stroke-width="0.7"/>
    </g>

    <!-- Top back dori / rope ties -->
    <path d="M 170 120 Q 210 50 300 45 Q 390 50 430 120" fill="none" stroke="#D4AF37" stroke-width="6" stroke-dasharray="6,4"/>
  </g>
  
  <text x="300" y="570" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • PRODDATUR • 22K 916</text>
</svg>
`);

// 2. Gold Antique Choker
writeSvg('vd_g002_gold_antique_choker.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffaf0"/><stop offset="100%" stop-color="#f4eedf"/>
    </radialGradient>
    <linearGradient id="goldAntique" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE48A"/><stop offset="40%" stop-color="#CFA02E"/><stop offset="70%" stop-color="#E8C360"/><stop offset="100%" stop-color="#805500"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5C7A"/><stop offset="60%" stop-color="#B8143C"/><stop offset="100%" stop-color="#54091A"/>
    </linearGradient>
    <radialGradient id="pearlGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="70%" stop-color="#ECE7DD"/><stop offset="100%" stop-color="#BDB5A4"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#543D0F" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)">
    <!-- Collar curves -->
    <path d="M 160 250 C 160 380, 440 380, 440 250" fill="none" stroke="url(#goldAntique)" stroke-width="24" stroke-linecap="round"/>
    <path d="M 175 235 C 175 350, 425 350, 425 235" fill="none" stroke="#805500" stroke-width="3"/>
    
    <!-- Peacock and Floral filigree panels -->
    ${Array.from({ length: 11 }).map((_, i) => {
      const t = (i + 1) / 13;
      const angle = (t - 0.5) * Math.PI * 0.75;
      const r = 170;
      const cx = 300 + Math.sin(angle) * r;
      const cy = 200 + Math.cos(angle) * r;
      return `
        <g transform="translate(${cx}, ${cy}) rotate(${angle * 45})">
          <rect x="-12" y="-20" width="24" height="40" rx="6" fill="url(#goldAntique)" stroke="#6A4600" stroke-width="1.5"/>
          <circle cx="0" cy="-5" r="5" fill="url(#rubyGrad)"/>
          <circle cx="0" cy="8" r="3" fill="#FFEAA7"/>
          <circle cx="0" cy="28" r="4.5" fill="url(#pearlGrad)"/>
        </g>
      `;
    }).join('')}

    <!-- Center Medallion -->
    <g transform="translate(300, 380)">
      <circle cx="0" cy="0" r="28" fill="url(#goldAntique)" stroke="#6A4600" stroke-width="2"/>
      <circle cx="0" cy="0" r="20" fill="#805500"/>
      <circle cx="0" cy="0" r="14" fill="url(#rubyGrad)"/>
      <circle cx="0" cy="0" r="5" fill="#FFEAA7"/>
      <!-- Jhumka drops from center -->
      <path d="M -16 35 C -16 55 16 55 16 35 Z" fill="url(#goldAntique)" stroke="#6A4600" stroke-width="1.5"/>
      <circle cx="0" cy="65" r="7" fill="url(#pearlGrad)"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • ROYAL ANTIQUE CHOKER</text>
</svg>
`);

// 3. 22K Gold Bangles Pair
writeSvg('vd_g003_22k_gold_bangles.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbf2"/><stop offset="100%" stop-color="#f6efe1"/>
    </radialGradient>
    <linearGradient id="goldShiny" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3A8"/><stop offset="30%" stop-color="#DDA92B"/><stop offset="60%" stop-color="#FFF1B0"/><stop offset="100%" stop-color="#946505"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#6B4B0B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)">
    <!-- Bangle 1 (Back/Left) -->
    <g transform="translate(260, 270) rotate(-22)">
      <ellipse cx="0" cy="0" rx="130" ry="110" fill="none" stroke="url(#goldShiny)" stroke-width="32"/>
      <ellipse cx="0" cy="0" rx="130" ry="110" fill="none" stroke="#7A5000" stroke-width="1.5" stroke-dasharray="8,6"/>
      ${Array.from({ length: 24 }).map((_, i) => {
        const rad = (i / 24) * 2 * Math.PI;
        const x = Math.cos(rad) * 130;
        const y = Math.sin(rad) * 110;
        return `<circle cx="${x}" cy="${y}" r="3.5" fill="#FFE599"/>`;
      }).join('')}
    </g>
    <!-- Bangle 2 (Front/Right) -->
    <g transform="translate(340, 330) rotate(-18)">
      <ellipse cx="0" cy="0" rx="130" ry="110" fill="none" stroke="url(#goldShiny)" stroke-width="34"/>
      <ellipse cx="0" cy="0" rx="130" ry="110" fill="none" stroke="#684100" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="142" ry="122" fill="none" stroke="#FFF7CC" stroke-width="2"/>
      <!-- Embossed Lakshmi / Floral Nakshi dots -->
      ${Array.from({ length: 24 }).map((_, i) => {
        const rad = (i / 24) * 2 * Math.PI;
        const x = Math.cos(rad) * 130;
        const y = Math.sin(rad) * 110;
        return `
          <circle cx="${x}" cy="${y}" r="4" fill="#FFE599" stroke="#946505" stroke-width="0.8"/>
          <circle cx="${x * 0.92}" cy="${y * 0.92}" r="2" fill="#B32438"/>
        `;
      }).join('')}
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 22K NAKSHI KADAS (PAIR)</text>
</svg>
`);

// 4. Gold Heritage Jhumkas
writeSvg('vd_g004_gold_jhumkas.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffcf5"/><stop offset="100%" stop-color="#f5eee0"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2A3"/><stop offset="35%" stop-color="#DBA82E"/><stop offset="70%" stop-color="#FFF0BA"/><stop offset="100%" stop-color="#8A5B02"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5475"/><stop offset="70%" stop-color="#A80F33"/><stop offset="100%" stop-color="#4F0314"/>
    </linearGradient>
    <radialGradient id="pearlGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="70%" stop-color="#EDE7DC"/><stop offset="100%" stop-color="#BFB7A5"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#6B4B0B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  
  <g filter="url(#shadow)">
    <!-- Left Jhumka -->
    <g transform="translate(200, 180)">
      <!-- Top Stud (Peacock / floral motif) -->
      <circle cx="0" cy="0" r="26" fill="url(#goldGrad)" stroke="#7A5000" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="16" fill="url(#rubyGrad)"/>
      <circle cx="0" cy="0" r="5" fill="#FFEAA7"/>
      <!-- Connecting link -->
      <rect x="-3" y="26" width="6" height="20" fill="url(#goldGrad)"/>
      <!-- Bell / Dome -->
      <path d="M -45 110 C -45 50 45 50 45 110 Z" fill="url(#goldGrad)" stroke="#7A5000" stroke-width="2"/>
      <ellipse cx="0" cy="110" rx="45" ry="12" fill="#7A5000"/>
      <!-- Dome filigree lines -->
      <path d="M 0 50 L 0 110 M -22 62 L -28 110 M 22 62 L 28 110" stroke="#FFF2A3" stroke-width="2"/>
      <!-- Hanging pearls from bottom rim -->
      ${Array.from({ length: 9 }).map((_, i) => {
        const x = -36 + i * 9;
        return `<circle cx="${x}" cy="126" r="4.5" fill="url(#pearlGrad)"/>`;
      }).join('')}
      <!-- Center hanging bead -->
      <circle cx="0" cy="142" r="7" fill="url(#rubyGrad)"/>
    </g>

    <!-- Right Jhumka -->
    <g transform="translate(400, 180)">
      <!-- Top Stud -->
      <circle cx="0" cy="0" r="26" fill="url(#goldGrad)" stroke="#7A5000" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="16" fill="url(#rubyGrad)"/>
      <circle cx="0" cy="0" r="5" fill="#FFEAA7"/>
      <!-- Connecting link -->
      <rect x="-3" y="26" width="6" height="20" fill="url(#goldGrad)"/>
      <!-- Bell / Dome -->
      <path d="M -45 110 C -45 50 45 50 45 110 Z" fill="url(#goldGrad)" stroke="#7A5000" stroke-width="2"/>
      <ellipse cx="0" cy="110" rx="45" ry="12" fill="#7A5000"/>
      <path d="M 0 50 L 0 110 M -22 62 L -28 110 M 22 62 L 28 110" stroke="#FFF2A3" stroke-width="2"/>
      <!-- Hanging pearls -->
      ${Array.from({ length: 9 }).map((_, i) => {
        const x = -36 + i * 9;
        return `<circle cx="${x}" cy="126" r="4.5" fill="url(#pearlGrad)"/>`;
      }).join('')}
      <circle cx="0" cy="142" r="7" fill="url(#rubyGrad)"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • TRADITIONAL 22K JHUMKAS</text>
</svg>
`);

// 5. Mangalsutra Chain
writeSvg('vd_g005_mangalsutra_chain.svg', `
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
    <!-- Black beads and gold beads chain -->
    <path d="M 140 100 C 140 340, 200 420, 300 420 C 400 420, 460 340, 460 100" fill="none" stroke="#222" stroke-width="4"/>
    <path d="M 155 100 C 155 330, 210 405, 300 405 C 390 405, 445 330, 445 100" fill="none" stroke="#DDA92B" stroke-width="3"/>
    
    <!-- Beads alternating -->
    ${Array.from({ length: 35 }).map((_, i) => {
      const t = (i + 1) / 37;
      const angle = (t - 0.5) * Math.PI * 0.9;
      const r = 210;
      const cx = 300 + Math.sin(angle) * r;
      const cy = 180 + Math.cos(angle) * r * 1.15;
      const isGold = i % 3 === 0;
      return `<circle cx="${cx}" cy="${cy}" r="${isGold ? 4.5 : 3.5}" fill="${isGold ? 'url(#goldShiny)' : '#1A1A1A'}" stroke="${isGold ? '#8A5B02' : '#333'}" stroke-width="0.5"/>`;
    }).join('')}

    <!-- Double Cup / Thali / Vati Centerpiece (South Indian Telugu Tradition) -->
    <g transform="translate(300, 410)">
      <!-- Left Vati / Bottu -->
      <g transform="translate(-25, 20)">
        <ellipse cx="0" cy="0" rx="18" ry="22" fill="url(#goldShiny)" stroke="#7A5000" stroke-width="1.5"/>
        <ellipse cx="0" cy="0" rx="12" ry="15" fill="none" stroke="#FFF7CC" stroke-width="1"/>
        <circle cx="0" cy="0" r="4" fill="#C9184A"/>
        <circle cx="0" cy="30" r="5" fill="url(#goldShiny)"/>
      </g>
      <!-- Right Vati / Bottu -->
      <g transform="translate(25, 20)">
        <ellipse cx="0" cy="0" rx="18" ry="22" fill="url(#goldShiny)" stroke="#7A5000" stroke-width="1.5"/>
        <ellipse cx="0" cy="0" rx="12" ry="15" fill="none" stroke="#FFF7CC" stroke-width="1"/>
        <circle cx="0" cy="0" r="4" fill="#C9184A"/>
        <circle cx="0" cy="30" r="5" fill="url(#goldShiny)"/>
      </g>
      <!-- Center Red Coral / Gold Bead Link -->
      <circle cx="0" cy="15" r="7" fill="url(#goldShiny)" stroke="#8A5B02" stroke-width="1"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • SACRED 22K MANGALSUTRA</text>
</svg>
`);

// 6. 24K Gold Coin 999 Purity
writeSvg('vd_g006_24k_gold_coin_laxmi.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff9e8"/><stop offset="100%" stop-color="#f5edd6"/>
    </radialGradient>
    <radialGradient id="coinGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFBEB"/><stop offset="25%" stop-color="#FACC15"/><stop offset="55%" stop-color="#CA8A04"/><stop offset="85%" stop-color="#854D0E"/><stop offset="100%" stop-color="#583101"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#713F12" flood-opacity="0.3"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 280)">
    <!-- Outer coin with serrated edges -->
    <circle cx="0" cy="0" r="160" fill="url(#coinGrad)"/>
    <circle cx="0" cy="0" r="150" fill="none" stroke="#FEF08A" stroke-width="3"/>
    <circle cx="0" cy="0" r="142" fill="none" stroke="#713F12" stroke-width="1.5" stroke-dasharray="4,4"/>
    
    <!-- Inner Coin Field -->
    <circle cx="0" cy="0" r="135" fill="#EAB308" stroke="#A16207" stroke-width="2"/>
    
    <!-- Embossed Goddess Lakshmi & Lotus -->
    <!-- Lotus Base -->
    <path d="M -45 55 Q 0 35 45 55 Q 0 85 -45 55 Z" fill="#CA8A04" stroke="#713F12" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="45" fill="#FACC15" stroke="#854D0E" stroke-width="1.5"/>
    <!-- Head & Crown -->
    <circle cx="0" cy="-22" r="14" fill="#FEF08A"/>
    <path d="M -12 -30 L 0 -48 L 12 -30 Z" fill="#CA8A04"/>
    <!-- 4 Hands holding lotus & showering coins -->
    <circle cx="-32" cy="-8" r="8" fill="#FDE047"/>
    <circle cx="32" cy="-8" r="8" fill="#FDE047"/>
    <circle cx="-28" cy="20" r="6" fill="#FDE047"/>
    <circle cx="28" cy="20" r="6" fill="#FDE047"/>
    
    <!-- Text on Coin -->
    <text x="0" y="-105" font-family="'Cormorant Garamond', Georgia, serif" font-size="18" font-weight="bold" fill="#713F12" letter-spacing="3" text-anchor="middle">VADDI JEWELLERY</text>
    <text x="0" y="115" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#713F12" letter-spacing="2" text-anchor="middle">24K • 999.9 PURE GOLD • 10g</text>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#9A9483" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • CERTIFIED 24K 999 GOLD COIN</text>
</svg>
`);

// 7. 92.5 Sterling Silver Ganesha Idol
writeSvg('vd_s001_silver_ganesha_idol.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="30%" stop-color="#E2E8F0"/><stop offset="55%" stop-color="#CBD5E1"/><stop offset="80%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="silverShine" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#1E293B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  
  <g filter="url(#shadow)" transform="translate(300, 270)">
    <!-- Intricate Silver Peedam / Pedestal base -->
    <path d="M -120 160 L 120 160 L 140 190 L -140 190 Z" fill="url(#silverGrad)" stroke="#475569" stroke-width="2"/>
    <path d="M -100 135 L 100 135 L 120 160 L -120 160 Z" fill="url(#silverShine)" stroke="#334155" stroke-width="1.5"/>
    <rect x="-135" y="185" width="270" height="15" rx="3" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Halo / Prabhavali Arch -->
    <path d="M -110 130 C -110 -110 110 -110 110 130" fill="none" stroke="url(#silverGrad)" stroke-width="16"/>
    <path d="M -105 130 C -105 -100 105 -100 105 130" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <circle cx="0" cy="-115" r="10" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
    
    <!-- Lord Ganesha Figure in 92.5 Silver -->
    <!-- Belly & Dhoti -->
    <ellipse cx="0" cy="70" rx="65" ry="50" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <!-- Folded legs -->
    <path d="M -80 115 C -40 135 40 135 80 115 C 60 90 -60 90 -80 115 Z" fill="url(#silverShine)" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Chest & Angavastram -->
    <ellipse cx="0" cy="20" rx="45" ry="32" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <!-- Sacred thread (Janeu) -->
    <path d="M -25 0 Q 0 45 25 65" fill="none" stroke="#F1F5F9" stroke-width="2"/>
    
    <!-- Ears -->
    <ellipse cx="-48" cy="-35" rx="28" ry="36" fill="url(#silverShine)" stroke="#334155" stroke-width="1.5"/>
    <ellipse cx="48" cy="-35" rx="28" ry="36" fill="url(#silverShine)" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Head & Face -->
    <ellipse cx="0" cy="-35" rx="38" ry="40" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Trunk (Right-turned/Left-turned classic) -->
    <path d="M -8 -30 Q -15 15 10 30 Q 30 35 30 18 Q 15 15 8 -30 Z" fill="url(#silverShine)" stroke="#334155" stroke-width="1.5"/>
    <!-- Modak in hand -->
    <circle cx="-55" cy="40" r="11" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
    
    <!-- Crown (Mukut) -->
    <path d="M -26 -65 L 0 -110 L 26 -65 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <line x1="-20" y1="-78" x2="20" y2="-78" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="-14" y1="-92" x2="14" y2="-92" stroke="#FFFFFF" stroke-width="2"/>
    
    <!-- Mouse (Mushika) at feet -->
    <ellipse cx="75" cy="150" rx="14" ry="9" fill="url(#silverShine)" stroke="#334155" stroke-width="1"/>
    <!-- Modak plate -->
    <ellipse cx="-75" cy="150" rx="16" ry="7" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 STERLING SILVER GANESHA IDOL</text>
</svg>
`);

// 8. 92.5 Sterling Silver Lakshmi Idol
writeSvg('vd_s002_silver_lakshmi_idol.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="30%" stop-color="#E2E8F0"/><stop offset="60%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#1E293B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 270)">
    <!-- Lotus Pedestal -->
    <path d="M -110 160 Q 0 120 110 160 L 130 190 L -130 190 Z" fill="url(#silverGrad)" stroke="#475569" stroke-width="2"/>
    <ellipse cx="0" cy="140" rx="90" ry="25" fill="#E2E8F0" stroke="#334155" stroke-width="1.5"/>
    <!-- Lotus Petals -->
    ${Array.from({ length: 9 }).map((_, i) => {
      const x = -80 + i * 20;
      return `<path d="M ${x} 140 Q ${x + 10} 105 ${x + 20} 140 Z" fill="url(#silverGrad)" stroke="#475569" stroke-width="1"/>`;
    }).join('')}

    <!-- Prabhavali (Silver Arch) -->
    <path d="M -100 120 C -100 -120 100 -120 100 120" fill="none" stroke="url(#silverGrad)" stroke-width="14"/>
    <circle cx="0" cy="-125" r="9" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>

    <!-- Goddess Lakshmi Figure -->
    <ellipse cx="0" cy="80" rx="45" ry="50" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <ellipse cx="0" cy="20" rx="35" ry="30" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <circle cx="0" cy="-30" r="22" fill="#E2E8F0" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Grand Silver Mukut (Crown) -->
    <path d="M -22 -50 L 0 -105 L 22 -50 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- 4 Arms with lotuses & blessing posture -->
    <circle cx="-55" cy="-10" r="14" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
    <circle cx="55" cy="-10" r="14" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
    <!-- Showering coins from palm -->
    <circle cx="-35" cy="50" r="5" fill="#CBD5E1"/>
    <circle cx="-35" cy="65" r="5" fill="#CBD5E1"/>
    <circle cx="-35" cy="80" r="5" fill="#CBD5E1"/>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 STERLING SILVER MAHALAKSHMI IDOL</text>
</svg>
`);

// 9. Silver Pooja Thali Set
writeSvg('vd_s003_silver_pooja_thali_set.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <radialGradient id="silverPlate" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="65%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1E293B" flood-opacity="0.25"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  
  <g filter="url(#shadow)" transform="translate(300, 290)">
    <!-- Grand Royal Pooja Thali / Plate -->
    <ellipse cx="0" cy="0" rx="220" ry="165" fill="url(#silverPlate)" stroke="#475569" stroke-width="3"/>
    <ellipse cx="0" cy="0" rx="195" ry="145" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <ellipse cx="0" cy="0" rx="185" ry="135" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="6,6"/>
    <ellipse cx="0" cy="0" rx="160" ry="115" fill="#E2E8F0" stroke="#64748B" stroke-width="1"/>
    
    <!-- Center Gayatri / Om / Swastik engraving in Thali -->
    <circle cx="0" cy="0" r="30" fill="none" stroke="#64748B" stroke-width="1.5"/>
    <path d="M -12 -12 L 0 -12 L 0 12 L 12 12 M -12 0 L 12 0 M 0 -12 L 12 -12 M -12 12 L 0 12" stroke="#64748B" stroke-width="2"/>
    
    <!-- Items arranged in the Thali -->
    <!-- 1. Silver Kalash in top center -->
    <g transform="translate(0, -65)">
      <ellipse cx="0" cy="15" rx="22" ry="10" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <ellipse cx="0" cy="-5" rx="20" ry="16" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <circle cx="0" cy="-22" r="10" fill="#CBD5E1" stroke="#334155" stroke-width="1"/>
    </g>
    
    <!-- 2. Silver Diya / Deepam (Left) -->
    <g transform="translate(-100, -10)">
      <ellipse cx="0" cy="5" rx="22" ry="12" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <path d="M -15 0 Q 0 -15 15 0 Z" fill="url(#silverGrad)"/>
      <path d="M 0 -12 Q 5 -25 0 -32 Q -5 -25 0 -12 Z" fill="#F59E0B"/> <!-- Flame -->
    </g>
    
    <!-- 3. Silver Diya (Right) -->
    <g transform="translate(100, -10)">
      <ellipse cx="0" cy="5" rx="22" ry="12" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <path d="M -15 0 Q 0 -15 15 0 Z" fill="url(#silverGrad)"/>
      <path d="M 0 -12 Q 5 -25 0 -32 Q -5 -25 0 -12 Z" fill="#F59E0B"/>
    </g>
    
    <!-- 4. Silver Chandan/Kumkum Katori (Bottom Left) -->
    <g transform="translate(-65, 55)">
      <circle cx="0" cy="0" r="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <circle cx="0" cy="0" r="12" fill="#BE123C"/> <!-- Kumkum -->
    </g>
    
    <!-- 5. Silver Akshat Katori (Bottom Right) -->
    <g transform="translate(65, 55)">
      <circle cx="0" cy="0" r="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <circle cx="0" cy="0" r="12" fill="#FEF08A"/> <!-- Turmeric / Akshat -->
    </g>
    
    <!-- 6. Silver Bell / Ghanti (Bottom Center) -->
    <g transform="translate(0, 70)">
      <ellipse cx="0" cy="8" rx="14" ry="6" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <path d="M -12 8 L -4 -16 L 4 -16 L 12 8 Z" fill="url(#silverGrad)"/>
      <rect x="-2" y="-28" width="4" height="12" fill="url(#silverGrad)"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • STERLING SILVER ROYAL POOJA THALI SET</text>
</svg>
`);

// 10. Silver Kalash with Coconut
writeSvg('vd_s004_silver_kalash_nariyal.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#1E293B" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)" transform="translate(300, 290)">
    <!-- Base -->
    <ellipse cx="0" cy="140" rx="70" ry="20" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Pot Body -->
    <path d="M -85 40 C -95 120 95 120 85 40 C 70 -10 -70 -10 -85 40 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <ellipse cx="0" cy="25" rx="80" ry="25" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <ellipse cx="0" cy="55" rx="82" ry="22" fill="none" stroke="#64748B" stroke-width="1.5" stroke-dasharray="6,4"/>
    
    <!-- Neck & Rim -->
    <ellipse cx="0" cy="-25" rx="55" ry="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <ellipse cx="0" cy="-35" rx="60" ry="18" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Mango Leaves (Silver carved) -->
    <path d="M -50 -35 L -85 -95 L -35 -50 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <path d="M 50 -35 L 85 -95 L 35 -50 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <path d="M -25 -40 L -45 -120 L 0 -55 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <path d="M 25 -40 L 45 -120 L 0 -55 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    <path d="M 0 -45 L 0 -135 L 15 -60 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Silver Coconut (Nariyal) on Top -->
    <ellipse cx="0" cy="-70" rx="30" ry="38" fill="url(#silverGrad)" stroke="#334155" stroke-width="2"/>
    <circle cx="0" cy="-75" r="4" fill="#64748B"/>
    <circle cx="-10" cy="-68" r="3.5" fill="#64748B"/>
    <circle cx="10" cy="-68" r="3.5" fill="#64748B"/>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 SILVER KALASH &amp; NARIYAL</text>
</svg>
`);

// 11. Handcrafted Silver Payal / Anklets
writeSvg('vd_s005_silver_payal_anklets.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#E2E8F0"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1E293B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  <g filter="url(#shadow)">
    <!-- Anklet 1 (Top Wave) -->
    <g transform="translate(0, 190)">
      <path d="M 120 40 Q 300 120 480 40" fill="none" stroke="url(#silverGrad)" stroke-width="18" stroke-linecap="round"/>
      <path d="M 120 40 Q 300 120 480 40" fill="none" stroke="#334155" stroke-width="2"/>
      <!-- Ghungroo / Silver bells along bottom -->
      ${Array.from({ length: 25 }).map((_, i) => {
        const t = i / 24;
        const x = 135 + t * 330;
        const y = 40 + Math.sin(t * Math.PI) * 72 + 16;
        return `
          <circle cx="${x}" cy="${y}" r="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="0.8"/>
          <line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y}" stroke="#334155" stroke-width="1"/>
        `;
      }).join('')}
    </g>

    <!-- Anklet 2 (Bottom Wave) -->
    <g transform="translate(0, 310)">
      <path d="M 120 40 Q 300 120 480 40" fill="none" stroke="url(#silverGrad)" stroke-width="18" stroke-linecap="round"/>
      <path d="M 120 40 Q 300 120 480 40" fill="none" stroke="#334155" stroke-width="2"/>
      ${Array.from({ length: 25 }).map((_, i) => {
        const t = i / 24;
        const x = 135 + t * 330;
        const y = 40 + Math.sin(t * Math.PI) * 72 + 16;
        return `
          <circle cx="${x}" cy="${y}" r="5" fill="url(#silverGrad)" stroke="#334155" stroke-width="0.8"/>
          <line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y}" stroke="#334155" stroke-width="1"/>
        `;
      }).join('')}
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • TRADITIONAL STERLING SILVER PAYAL (PAIR)</text>
</svg>
`);

// 12. Kamakshi Diya Pair
writeSvg('vd_s006_silver_kamakshi_diya.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#F1F5F9"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#1E293B" flood-opacity="0.2"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  
  <g filter="url(#shadow)">
    <!-- Diya 1 (Left) -->
    <g transform="translate(200, 280)">
      <!-- Pedestal base -->
      <ellipse cx="0" cy="120" rx="55" ry="16" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="-10" y="40" width="20" height="80" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      
      <!-- Oil basin -->
      <ellipse cx="0" cy="40" rx="50" ry="16" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Kamakshi Goddess Idol on Diya Back -->
      <path d="M -28 35 L -35 -40 Q 0 -65 35 -40 L 28 35 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <circle cx="0" cy="-15" r="14" fill="#E2E8F0"/>
      <!-- Holy Flame -->
      <path d="M -8 38 Q 0 10 8 38 Z" fill="#F59E0B"/>
      <circle cx="0" cy="22" r="6" fill="#FBBF24"/>
    </g>

    <!-- Diya 2 (Right) -->
    <g transform="translate(400, 280)">
      <ellipse cx="0" cy="120" rx="55" ry="16" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <rect x="-10" y="40" width="20" height="80" fill="url(#silverGrad)" stroke="#334155" stroke-width="1"/>
      <ellipse cx="0" cy="40" rx="50" ry="16" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <path d="M -28 35 L -35 -40 Q 0 -65 35 -40 L 28 35 Z" fill="url(#silverGrad)" stroke="#334155" stroke-width="1.5"/>
      <circle cx="0" cy="-15" r="14" fill="#E2E8F0"/>
      <path d="M -8 38 Q 0 10 8 38 Z" fill="#F59E0B"/>
      <circle cx="0" cy="22" r="6" fill="#FBBF24"/>
    </g>
  </g>
  <text x="300" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="4" text-anchor="middle">VADDI JEWELLERY • 92.5 SILVER KAMAKSHI DEEPAM PAIR</text>
</svg>
`);

console.log('All local jewellery artwork generated successfully.');
