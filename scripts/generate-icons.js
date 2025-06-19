const fs = require('fs');
const path = require('path');

// Simple SVG icon for PeakPlay
const baseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
  <circle cx="256" cy="180" r="60" fill="white" opacity="0.9"/>
  <rect x="196" y="240" width="120" height="40" rx="20" fill="white" opacity="0.9"/>
  <polygon points="256,300 216,380 296,380" fill="white" opacity="0.9"/>
  <text x="256" y="450" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">PP</text>
</svg>
`.trim();

// Icon sizes to generate
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create base SVG file
const iconDir = path.join(__dirname, '..', 'public', 'icons');
const baseIconPath = path.join(iconDir, 'icon-base.svg');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

fs.writeFileSync(baseIconPath, baseSvg);

console.log('Base SVG icon created at:', baseIconPath);

// Generate PNG versions for each size
iconSizes.forEach(size => {
  const sizedSvg = baseSvg.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconDir, fileName);
  fs.writeFileSync(filePath, sizedSvg);
  console.log(`Created ${fileName}`);
});

// Create apple touch icons
const appleTouchSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
appleTouchSizes.forEach(size => {
  const sizedSvg = baseSvg.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const fileName = `apple-touch-icon-${size}x${size}.svg`;
  const filePath = path.join(iconDir, fileName);
  fs.writeFileSync(filePath, sizedSvg);
  console.log(`Created ${fileName}`);
});

// Create favicon
const faviconSvg = baseSvg.replace('width="512" height="512"', 'width="32" height="32"');
fs.writeFileSync(path.join(iconDir, 'favicon.svg'), faviconSvg);

console.log('Icon generation complete!');
console.log('Note: For production, convert SVG files to PNG using an image conversion tool.'); 