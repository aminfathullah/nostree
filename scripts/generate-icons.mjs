
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_IMAGE = 'src/assets/logo.png';
const PUBLIC_DIR = 'public';

const ICONS = [
  { name: 'favicon.ico', size: 32, format: 'ico' },
  { name: 'favicon-16x16.png', size: 16, format: 'png' },
  { name: 'favicon-32x32.png', size: 32, format: 'png' },
  { name: 'apple-touch-icon.png', size: 180, format: 'png' },
  { name: 'apple-touch-icon-120x120.png', size: 120, format: 'png' },
  { name: 'apple-touch-icon-152x152.png', size: 152, format: 'png' },
  { name: 'apple-touch-icon-76x76.png', size: 76, format: 'png' },
  { name: 'apple-touch-icon-60x60.png', size: 60, format: 'png' },
  { name: 'android-chrome-192x192.png', size: 192, format: 'png' },
  { name: 'android-chrome-512x512.png', size: 512, format: 'png' },
  { name: 'mstile-150x150.png', size: 150, format: 'png' },
];

async function generateIcons() {
  try {
    const imageBuffer = await fs.readFile(SOURCE_IMAGE);
    
    for (const icon of ICONS) {
      console.log(`Generating ${icon.name}...`);
      if (icon.format === 'ico') {
        await sharp(imageBuffer)
          .trim()
          .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFormat('png')
           .toFile(path.join(PUBLIC_DIR, icon.name));
      } else {
        await sharp(imageBuffer)
          .trim()
          .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFile(path.join(PUBLIC_DIR, icon.name));
      }
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
