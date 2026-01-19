
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_IMAGE = 'src/assets/logo.png';

async function trimSourceLogo() {
  try {
    console.log(`Reading ${SOURCE_IMAGE}...`);
    const buffer = await fs.readFile(SOURCE_IMAGE);
    
    console.log('Trimming whitespace...');
    const trimmedBuffer = await sharp(buffer)
      .trim()
      .toBuffer();
    
    console.log(`Overwriting ${SOURCE_IMAGE}...`);
    await fs.writeFile(SOURCE_IMAGE, trimmedBuffer);
    
    console.log('Source logo trimmed successfully!');
  } catch (error) {
    console.error('Error trimming logo:', error);
  }
}

trimSourceLogo();
