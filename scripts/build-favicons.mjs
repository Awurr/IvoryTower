// Builds the site icons in public/ from src/assets/art/Favicon.png (32x32 pixel art).
// Run with `npm run favicons` after editing the art.
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE = 'src/assets/art/Favicon.png';
const BACKGROUND = '#0a0a0c'; // --bg-mid in global.css

const art = sharp(SOURCE);
const { width, height } = await art.metadata();
if (width !== 32 || height !== 32) throw new Error(`${SOURCE} must be 32x32 (got ${width}x${height})`);

// Tab icon: the art itself, untouched
const png = await art.clone().png().toBuffer();
await writeFile('public/favicon.png', png);

// favicon.ico for browsers/tools that request it directly. An .ico can hold a
// PNG as-is: a 6-byte header plus one 16-byte directory entry, then the image.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await writeFile('public/favicon.ico', Buffer.concat([header, png]));

// Home-screen icon: iOS fills transparency with black, so use the site background.
// 5x nearest-neighbor keeps pixels crisp (160px), centered on a 180px canvas.
const scaled = await art.clone().resize(160, 160, { kernel: 'nearest' }).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: BACKGROUND } })
	.composite([{ input: scaled, left: 10, top: 10 }])
	.png()
	.toFile('public/apple-touch-icon.png');

console.log('Wrote public/favicon.png, public/favicon.ico, public/apple-touch-icon.png');
