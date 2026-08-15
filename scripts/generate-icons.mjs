/**
 * LunarShield icon generator.
 *
 * Renders the brand mark (rounded gradient tile + crescent moon) to PNG using
 * only Node built-ins (zlib) — no binary assets or canvas libraries required.
 * Generates the extension icons (16/32/48/128) and the store promo tile.
 *
 * Run: pnpm icons
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICON_DIR = join(ROOT, 'public', 'icons')

/* ------------------------------------------------------------------ */
/* Minimal PNG encoder                                                 */
/* ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/** Hex (#rrggbb) -> [r,g,b] in 0..1 */
function hex(h) {
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ]
}

/** Distance from point to rounded-rect boundary (<=0 inside). */
function roundedRectSdf(x, y, cx, cy, hw, hh, r) {
  const dx = Math.abs(x - cx) - (hw - r)
  const dy = Math.abs(y - cy) - (hh - r)
  const ax = Math.max(dx, 0)
  const ay = Math.max(dy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - r
}

/**
 * Sample colour + alpha at logical coordinates (in [0,size]) for the icon.
 * Returns [r, g, b, a] each in 0..1.
 */
function sampleIcon(x, y, size) {
  const s = size
  const tile = [hex('#4f46e5'), hex('#1e1b4b')] // indigo-600 -> indigo-950
  const moon = hex('#f8fafc')
  const star = hex('#c7d2fe')

  const cx = s / 2
  const cy = s / 2
  const radius = s * 0.22

  // Outside the rounded tile -> fully transparent.
  if (roundedRectSdf(x, y, cx, cy, s / 2, s / 2, radius) > 0) return [0, 0, 0, 0]

  // Diagonal background gradient.
  const t = clamp01((x / s + y / s) / 2)
  let r = lerp(tile[0][0], tile[1][0], t)
  let g = lerp(tile[0][1], tile[1][1], t)
  let b = lerp(tile[0][2], tile[1][2], t)

  // Crescent moon: big circle minus an offset cut-out circle.
  const moonCx = s * 0.6
  const moonCy = s * 0.38
  const moonR = s * 0.3
  const cutCx = s * 0.475
  const cutCy = s * 0.31
  const cutR = s * 0.275
  const dMoon = Math.hypot(x - moonCx, y - moonCy)
  const dCut = Math.hypot(x - cutCx, y - cutCy)
  if (dMoon < moonR && dCut > cutR) {
    r = moon[0]
    g = moon[1]
    b = moon[2]
  } else if (dMoon < moonR + s * 0.09 && dMoon >= moonR) {
    // Soft glow ring around the moon.
    const glow = (1 - (dMoon - moonR) / (s * 0.09)) * 0.28
    r = lerp(r, moon[0], glow)
    g = lerp(g, moon[1], glow)
    b = lerp(b, moon[2], glow)
  }

  // Small star.
  if (Math.hypot(x - s * 0.4, y - s * 0.62) < s * 0.028) {
    r = star[0]
    g = star[1]
    b = star[2]
  }

  return [r, g, b, 1]
}

/** Render an icon at `size` px with 4x supersampling. */
function renderIcon(size) {
  const SS = 4
  const S = size * SS
  const big = Buffer.alloc(S * S * 4)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const [r, g, b, a] = sampleIcon(x / SS, y / SS, size)
      const i = (y * S + x) * 4
      big[i] = Math.round(r * 255)
      big[i + 1] = Math.round(g * 255)
      big[i + 2] = Math.round(b * 255)
      big[i + 3] = Math.round(a * 255)
    }
  }
  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * S + (x * SS + sx)) * 4
          r += big[i]
          g += big[i + 1]
          b += big[i + 2]
          a += big[i + 3]
        }
      }
      const n = SS * SS
      const o = (y * size + x) * 4
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
      out[o + 3] = Math.round(a / n)
    }
  }
  return encodePng(size, size, out)
}

/* ------------------------------------------------------------------ */
/* Promo tile (440x280)                                                */
/* ------------------------------------------------------------------ */

function samplePromo(x, y, w, h) {
  const s = Math.min(w, h)
  const tile = [hex('#312e81'), hex('#0f0b2e')]
  const moon = hex('#f8fafc')
  const star = hex('#c7d2fe')

  const t = clamp01((x / w) * 0.7 + (y / h) * 0.4)
  let r = lerp(tile[0][0], tile[1][0], t)
  let g = lerp(tile[0][1], tile[1][1], t)
  let b = lerp(tile[0][2], tile[1][2], t)

  // Large crescent, right side.
  const moonCx = w * 0.68
  const moonCy = h * 0.44
  const moonR = s * 0.34
  const cutCx = w * 0.6
  const cutCy = h * 0.4
  const cutR = s * 0.31
  const dMoon = Math.hypot(x - moonCx, y - moonCy)
  const dCut = Math.hypot(x - cutCx, y - cutCy)
  if (dMoon < moonR && dCut > cutR) {
    r = moon[0]
    g = moon[1]
    b = moon[2]
  } else if (dMoon < moonR + s * 0.08 && dMoon >= moonR) {
    const glow = (1 - (dMoon - moonR) / (s * 0.08)) * 0.25
    r = lerp(r, moon[0], glow)
    g = lerp(g, moon[1], glow)
    b = lerp(b, moon[2], glow)
  }

  // Stars.
  for (const [sx, sy, sr] of [
    [0.16, 0.28, 0.016],
    [0.3, 0.18, 0.011],
    [0.24, 0.62, 0.012],
    [0.44, 0.3, 0.01],
  ]) {
    if (Math.hypot(x - w * sx, y - h * sy) < s * sr) {
      r = star[0]
      g = star[1]
      b = star[2]
    }
  }

  return [r, g, b, 1]
}

function renderPromo(width, height) {
  const SS = 3
  const W = width * SS
  const H = height * SS
  const big = Buffer.alloc(W * H * 4)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = samplePromo(x / SS, y / SS, width, height)
      const i = (y * W + x) * 4
      big[i] = Math.round(r * 255)
      big[i + 1] = Math.round(g * 255)
      big[i + 2] = Math.round(b * 255)
      big[i + 3] = Math.round(a * 255)
    }
  }
  const out = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * W + (x * SS + sx)) * 4
          r += big[i]
          g += big[i + 1]
          b += big[i + 2]
          a += big[i + 3]
        }
      }
      const n = SS * SS
      const o = (y * width + x) * 4
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
      out[o + 3] = Math.round(a / n)
    }
  }
  return encodePng(width, height, out)
}

/* ------------------------------------------------------------------ */

mkdirSync(ICON_DIR, { recursive: true })

const icons = [16, 32, 48, 128]
for (const size of icons) {
  const file = join(ICON_DIR, `icon-${size}.png`)
  writeFileSync(file, renderIcon(size))
  console.log(`✔ ${file}`)
}

const promo = join(ROOT, 'public', 'small-promo-440x280.png')
writeFileSync(promo, renderPromo(440, 280))
console.log(`✔ ${promo}`)

console.log('Icons generated.')
