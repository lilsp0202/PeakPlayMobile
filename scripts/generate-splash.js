const fs = require('fs');
const path = require('path');

// Splash screen template
const createSplashSvg = (width, height) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  
  <!-- Logo container -->
  <g transform="translate(${width/2}, ${height/2 - 50})">
    <!-- Main logo circle -->
    <circle cx="0" cy="-30" r="40" fill="white" opacity="0.95"/>
    <!-- Icon shape -->
    <rect x="-30" y="10" width="60" height="25" rx="12" fill="white" opacity="0.95"/>
    <!-- Triangle -->
    <polygon points="0,35 -20,75 20,75" fill="white" opacity="0.95"/>
  </g>
  
  <!-- App name -->
  <text x="${width/2}" y="${height/2 + 80}" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">PeakPlay</text>
  <text x="${width/2}" y="${height/2 + 110}" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white" opacity="0.8">Sports Training Platform</text>
  
  <!-- Loading animation -->
  <g transform="translate(${width/2}, ${height/2 + 150})">
    <circle cx="-20" cy="0" r="4" fill="white" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" begin="0s"/>
    </circle>
    <circle cx="0" cy="0" r="4" fill="white" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
    </circle>
    <circle cx="20" cy="0" r="4" fill="white" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
    </circle>
  </g>
</svg>
`.trim();

// Common mobile device sizes for splash screens
const splashSizes = [
  // iPhone sizes
  { name: 'iphone-5', width: 320, height: 568 },
  { name: 'iphone-6', width: 375, height: 667 },
  { name: 'iphone-6-plus', width: 414, height: 736 },
  { name: 'iphone-x', width: 375, height: 812 },
  { name: 'iphone-xr', width: 414, height: 896 },
  { name: 'iphone-12', width: 390, height: 844 },
  
  // iPad sizes
  { name: 'ipad', width: 768, height: 1024 },
  { name: 'ipad-pro-9', width: 834, height: 1112 },
  { name: 'ipad-pro-11', width: 834, height: 1194 },
  { name: 'ipad-pro-12', width: 1024, height: 1366 },
  
  // Android common sizes
  { name: 'android-small', width: 360, height: 640 },
  { name: 'android-medium', width: 412, height: 732 },
  { name: 'android-large', width: 360, height: 780 },
  
  // Generic sizes for manifest
  { name: 'screenshot-narrow', width: 540, height: 720 },
  { name: 'screenshot-wide', width: 1024, height: 593 }
];

const splashDir = path.join(__dirname, '..', 'public', 'splash');

if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

console.log('Generating splash screens...');

splashSizes.forEach(({ name, width, height }) => {
  const splashSvg = createSplashSvg(width, height);
  const fileName = `${name}.svg`;
  const filePath = path.join(splashDir, fileName);
  fs.writeFileSync(filePath, splashSvg);
  console.log(`Created ${fileName} (${width}x${height})`);
});

// Create PNG versions for the manifest screenshots
const manifestScreenshots = ['screenshot-narrow', 'screenshot-wide'];
manifestScreenshots.forEach(name => {
  const svgPath = path.join(splashDir, `${name}.svg`);
  const pngPath = path.join(splashDir, `${name}.png`);
  fs.copyFileSync(svgPath, pngPath);
  console.log(`Created ${name}.png`);
});

console.log('Splash screen generation complete!');
console.log('Note: For production, convert SVG files to PNG using an image conversion tool.'); 