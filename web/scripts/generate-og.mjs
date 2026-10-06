// Generates public/og-image.png (1200x630, brand colours, drawn EXPA wordmark) with no external fonts or dependencies.
// Usage: node scripts/generate-og.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const W = 1200
const H = 630
const BG = [15, 107, 92]
const CREAM = [247, 245, 242]
const ACCENT = [217, 98, 43]
const px = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) px.set(BG, i * 3)

function mix(x, y, c, a) {
  if (a <= 0 || x < 0 || y < 0 || x >= W || y >= H) return
  const o = (y * W + x) * 3
  for (let k = 0; k < 3; k++) px[o + k] = Math.round(px[o + k] * (1 - a) + c[k] * a)
}
const segDist = (x, y, [x1, y1, x2, y2]) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}
/** Anti-aliased stroke of round-capped segments. */
function stroke(segs, w, color) {
  const xs = segs.flatMap(s => [s[0], s[2]])
  const ys = segs.flatMap(s => [s[1], s[3]])
  for (let y = Math.floor(Math.min(...ys) - w); y <= Math.ceil(Math.max(...ys) + w); y++) {
    for (let x = Math.floor(Math.min(...xs) - w); x <= Math.ceil(Math.max(...xs) + w); x++) {
      const d = Math.min(...segs.map(s => segDist(x + 0.5, y + 0.5, s)))
      mix(x, y, color, Math.max(0, Math.min(1, w / 2 - d + 0.5)))
    }
  }
}
function roundRect(x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const cx = Math.max(x0 + r, Math.min(x0 + w - r, x + 0.5))
      const cy = Math.max(y0 + r, Math.min(y0 + h - r, y + 0.5))
      mix(x, y, color, Math.max(0, Math.min(1, r - Math.hypot(x + 0.5 - cx, y + 0.5 - cy) + 0.5)))
    }
  }
}

// Mark (same geometry as favicon.svg, scaled 120/32)
roundRect(80, 80, 120, 120, 28, CREAM)
stroke([[112, 118, 168, 118]], 12, BG)
stroke([[112, 140, 152, 140]], 12, BG)
stroke([[112, 162, 168, 162]], 12, BG)

// Wordmark E X P A, 150 px tall, 40 px stroke
const top = 300
const bot = 450
const mid = 375
const sw = 40
const letters = [
  { x: 80, segs: [[100, top, 100, bot], [100, top, 210, top], [100, mid, 190, mid], [100, bot, 210, bot]] },
  { x: 290, segs: [[300, top, 410, bot], [410, top, 300, bot]] },
  { x: 500, segs: [[520, top, 520, bot], [520, top, 600, top], [600, top, 620, top + 20], [620, top + 20, 620, mid - 20], [620, mid - 20, 600, mid], [600, mid, 520, mid]] },
  { x: 700, segs: [[710, bot, 770, top], [770, top, 830, bot], [730, bot - 40, 810, bot - 40]] },
]
for (const l of letters) stroke(l.segs, sw, CREAM)
stroke([[100, 520, 360, 520]], 14, ACCENT)

// PNG encode (8-bit RGB, filter 0)
const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(body))
  return Buffer.concat([len, body, c])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
writeFileSync(new URL('../public/og-image.png', import.meta.url), Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]))
console.log('wrote public/og-image.png')
