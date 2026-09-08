import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC32 table calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(width, height, pixelFn) {
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // Color type 6: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // Raw scanlines with 0 filter byte
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', deflated);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Draw crisp ventilation / turbine icon
function generateVentIcon(width, height, isMaskable) {
  return createPNG(width, height, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Background: Gradient from Slate-900 (#0f172a) to Blue-950 (#172554)
    const t = (y / h);
    let bgR = Math.round(15 + t * 8);
    let bgG = Math.round(23 + t * 14);
    let bgB = Math.round(42 + t * 42);

    const outerRadius = isMaskable ? w * 0.48 : w * 0.44;
    const safeScale = isMaskable ? 0.72 : 0.88;

    // Outer background circle if not maskable
    if (!isMaskable && dist > outerRadius) {
      return [0, 0, 0, 0]; // Transparent outside
    }

    // Outer blue rim
    const rimOuter = outerRadius * safeScale;
    const rimInner = rimOuter * 0.88;

    if (dist <= rimOuter && dist >= rimInner) {
      // Glow rim: #3b82f6
      return [59, 130, 246, 255];
    }

    // Fan / Turbine Blades
    const bladeRadius = rimInner * 0.95;
    const hubRadius = rimInner * 0.28;

    if (dist <= hubRadius) {
      // Center turbine hub: bright cyan / white core
      if (dist <= hubRadius * 0.4) {
        return [255, 255, 255, 255];
      }
      return [37, 99, 235, 255]; // Blue-600
    }

    if (dist < bladeRadius && dist > hubRadius) {
      // Calculate angle
      let angle = Math.atan2(dy, dx) + Math.PI; // 0 to 2*PI
      // 5 curved fan blades
      const blades = 5;
      const bladeSector = (2 * Math.PI) / blades;
      const swirl = (dist / bladeRadius) * 0.8;
      const swirledAngle = (angle + swirl) % bladeSector;

      if (swirledAngle < bladeSector * 0.52) {
        // Blade surface gradient
        const bladeLight = Math.round(180 + (dist / bladeRadius) * 75);
        return [37, 130, bladeLight, 255];
      }
    }

    // Airflow circles / sound wave arcs
    if (dist > rimOuter && dist < outerRadius) {
      const ringDist = Math.abs(dist - (rimOuter + outerRadius) / 2);
      if (ringDist < 2) {
        return [96, 165, 250, 160];
      }
    }

    return [bgR, bgG, bgB, 255];
  });
}

// Generate Screenshot for PWABuilder preview
function generateScreenshot(width, height) {
  return createPNG(width, height, (x, y, w, h) => {
    // Elegant UI screenshot mockup
    const headerH = Math.round(h * 0.08);
    if (y < headerH) {
      return [15, 23, 42, 255]; // Header dark
    }
    // Main card
    const cardMarginX = Math.round(w * 0.06);
    const cardMarginY = Math.round(h * 0.12);
    if (x > cardMarginX && x < w - cardMarginX && y > cardMarginY && y < cardMarginY + Math.round(h * 0.35)) {
      return [30, 41, 59, 255]; // Card dark slate
    }
    // Background light gray
    return [248, 250, 252, 255];
  });
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateVentIcon(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateVentIcon(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateVentIcon(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateVentIcon(180, 180, false));

// Also generate screenshots for PWABuilder 100/100 store score
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), generateScreenshot(1280, 720));
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), generateScreenshot(640, 1136));

// Generate icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
    <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)" />
  <circle cx="256" cy="256" r="200" fill="none" stroke="#3b82f6" stroke-width="12" stroke-dasharray="24 12" />
  <g transform="translate(256, 256)">
    <path d="M 0,-160 C 40,-160 80,-80 30,-20 C -20,20 -40,-40 0,-160 Z" fill="url(#blade)" />
    <path d="M 0,-160 C 40,-160 80,-80 30,-20 C -20,20 -40,-40 0,-160 Z" fill="url(#blade)" transform="rotate(72)" />
    <path d="M 0,-160 C 40,-160 80,-80 30,-20 C -20,20 -40,-40 0,-160 Z" fill="url(#blade)" transform="rotate(144)" />
    <path d="M 0,-160 C 40,-160 80,-80 30,-20 C -20,20 -40,-40 0,-160 Z" fill="url(#blade)" transform="rotate(216)" />
    <path d="M 0,-160 C 40,-160 80,-80 30,-20 C -20,20 -40,-40 0,-160 Z" fill="url(#blade)" transform="rotate(288)" />
    <circle cx="0" cy="0" r="42" fill="#1d4ed8" stroke="#ffffff" stroke-width="8" />
    <circle cx="0" cy="0" r="14" fill="#ffffff" />
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('All PWA icons & screenshots generated successfully.');
