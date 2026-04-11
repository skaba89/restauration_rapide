// ============================================
// Restaurant OS - Icon Generator Script
// Run: node scripts/generate-icons.js
// ============================================

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for icons
const generateIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#ea580c"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  
  <!-- Plate -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.55}" rx="${size * 0.35}" ry="${size * 0.25}" fill="#ffffff" opacity="0.95"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.55}" rx="${size * 0.28}" ry="${size * 0.2}" fill="#fef3c7"/>
  
  <!-- Food -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.52}" rx="${size * 0.18}" ry="${size * 0.12}" fill="#fbbf24"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.5}" rx="${size * 0.12}" ry="${size * 0.08}" fill="#f59e0b"/>
  
  <!-- Steam -->
  <g stroke="#ffffff" stroke-width="${size * 0.015}" fill="none" opacity="0.8">
    <path d="M${size * 0.38} ${size * 0.35} Q${size * 0.42} ${size * 0.28} ${size * 0.38} ${size * 0.2}"/>
    <path d="M${size * 0.5} ${size * 0.32} Q${size * 0.54} ${size * 0.25} ${size * 0.5} ${size * 0.18}"/>
    <path d="M${size * 0.62} ${size * 0.35} Q${size * 0.66} ${size * 0.28} ${size * 0.62} ${size * 0.2}"/>
  </g>
</svg>`;

// Badge icon (smaller, simpler)
const generateBadgeSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="#f97316"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.25}" fill="#ffffff"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.18}" fill="#fef3c7"/>
  <circle cx="${size * 0.5}" cy="${size * 0.85}" r="${size * 0.08}" fill="#ffffff"/>
</svg>`;

// Generate icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate main icons
sizes.forEach(size => {
  const svg = generateIconSVG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Generated: icon-${size}x${size}.svg`);
});

// Generate badge icon
const badgeSvg = generateBadgeSVG(72);
fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSvg);
console.log('Generated: badge-72x72.svg');

// Generate apple-touch-icon
const appleIcon = generateIconSVG(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleIcon);
console.log('Generated: apple-touch-icon.svg');

// Generate favicon
const favicon = generateIconSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), favicon);
console.log('Generated: favicon.svg');

console.log('\n✅ All icons generated successfully!');
console.log('Note: For production, convert SVGs to PNGs using a tool like sharp or imagemagick.');
