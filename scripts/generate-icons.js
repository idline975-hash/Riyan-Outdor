import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create Brand SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Mountain range -->
  <!-- Left Mountain -->
  <polygon points="120,400 240,220 340,400" fill="#1D4ED8" opacity="0.6" />
  
  <!-- Main Peak -->
  <polygon points="140,400 256,160 410,400" fill="#0F172A" />
  
  <!-- Snow cap main peak -->
  <polygon points="256,160 215,225 240,240 256,225 272,240 297,225" fill="url(#snowGrad)" />

  <!-- Foreground Tent Symbol -->
  <polygon points="200,400 280,290 360,400" fill="url(#goldGrad)" />
  <polygon points="280,290 280,400 360,400" fill="#D97706" opacity="0.4" />
  <polygon points="260,400 280,330 300,400" fill="#78350F" />

  <!-- Modern Sun / Compass Accent -->
  <circle cx="380" cy="140" r="32" fill="#FDE047" />

  <!-- Text / Badge -->
  <text x="256" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">CAMPGEAR POS</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// Function to generate raw PNG file without external dependencies
function createPNG(width, height, isMaskable = false) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  // Background colors: Blue gradient with mountain + gold tent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Coordinate normalized (0 to 1)
      const nx = x / width;
      const ny = y / height;

      // Gradient background
      let r = Math.round(30 + nx * 10 - ny * 15);
      let g = Math.round(58 + nx * 40 + ny * 60);
      let b = Math.round(180 + nx * 50);
      let a = 255;

      // Mountain triangle in center (apex: 0.5, 0.35, base: 0.2 to 0.8 at y=0.75)
      const peakY = 0.35;
      const baseY = 0.75;
      if (ny >= peakY && ny <= baseY) {
        const halfWidthAtY = ((ny - peakY) / (baseY - peakY)) * 0.32;
        if (Math.abs(nx - 0.5) <= halfWidthAtY) {
          // Inside mountain
          if (ny <= peakY + 0.12) {
            // Snowcap (white)
            r = 255; g = 255; b = 255;
          } else {
            // Dark slate mountain
            r = 15; g = 23; b = 42;
          }
        }
      }

      // Tent triangle at foreground (apex: 0.55, 0.58, base: 0.4 to 0.7 at y=0.76)
      const tentPeakY = 0.56;
      const tentBaseY = 0.76;
      if (ny >= tentPeakY && ny <= tentBaseY) {
        const halfTent = ((ny - tentPeakY) / (tentBaseY - tentPeakY)) * 0.15;
        if (Math.abs(nx - 0.55) <= halfTent) {
          // Gold / Amber tent
          r = 245; g = 158; b = 11;
        }
      }

      // Sun circle at (0.75, 0.28, radius: 0.08)
      const dx = nx - 0.75;
      const dy = ny - 0.28;
      if (dx * dx + dy * dy <= 0.08 * 0.08) {
        r = 253; g = 224; b = 71;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Construct PNG chunks
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // Compression
  ihdr.writeUInt8(0, 11); // Filter
  ihdr.writeUInt8(0, 12); // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT: uncompressed scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter None
    buffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // CRC32 calculation
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64));

console.log('PWA icons generated successfully in public/');
