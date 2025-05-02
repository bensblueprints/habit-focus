const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
  console.log('Created icons directory');
}

// Function to create a simple SVG icon
function createSvgIcon(size, filename) {
  const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" rx="8" fill="#8B5CF6" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-weight="bold" font-size="${size * 0.7}">HF</text>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created ${filename}`);
}

// Create icons of different sizes
createSvgIcon(16, 'icon16.svg');
createSvgIcon(48, 'icon48.svg');
createSvgIcon(128, 'icon128.svg');

console.log('Icons created successfully. Convert SVG to PNG before packaging the extension.'); 