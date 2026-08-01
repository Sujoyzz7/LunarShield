import type { FilterParams } from './types'

export type RGB = readonly [number, number, number]

/**
 * Parse `#rgb` / `#rrggbb` / `rgb(...)`-style hex strings.
 * Returns `[r, g, b]` each in 0..255, or null when unparseable.
 */
export function parseHex(input: string): RGB | null {
  const value = input.trim().toLowerCase()
  const m = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (!m) return null
  let hex = m[1]!
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

/** Linearize an 8-bit colour channel (0..255) to the WCAG relative-luminance scale. */
function linearizeChannel(channel: number): number {
  const s = channel / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance of a hex colour, 0..1. */
export function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  return luminanceOfRgb255(rgb)
}

export function luminanceOfRgb255(rgb: RGB): number {
  const [r, g, b] = rgb
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b)
}

/**
 * Kelvin colour temperature -> approximate RGB (Tanner Helland algorithm).
 * http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
 */
export function temperatureToRGB(kelvin: number): RGB {
  const k = Math.min(6500, Math.max(1000, kelvin)) / 100
  let r: number
  let g: number
  let b: number
  if (k <= 66) {
    r = 255
    g = 99.47 * Math.log(k) - 161.12
    b = k <= 19 ? 0 : 138.52 * Math.log(k - 10) - 305.04
  } else {
    r = 329.7 * Math.pow(k - 60, -0.1332)
    g = 288.12 * Math.pow(k - 60, -0.0755)
    b = 255
  }
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)))
  return [clamp(r), clamp(g), clamp(b)]
}

/** 0..1 warmth factor: 0 at 6500K (neutral), 1 at 2000K (candlelight). */
export function warmthOf(kelvin: number): number {
  return Math.min(1, Math.max(0, (6500 - kelvin) / 4500))
}

const fmt = (v: number) => `${Math.round(v * 100) / 100}`

/**
 * Build the CSS `filter` string for the filter strategy.
 * The invert+hue-rotate pair produces the dark inversion; sepia/saturation/
 * hue/brightness/contrast shape the final look.
 */
export function filterStringFromParams(params: FilterParams): string {
  const warm = warmthOf(params.temperature)
  const sepia = params.sepia + warm * 0.35
  const saturate = Math.max(0.7, 1 - warm * 0.25)
  const hueShift = -Math.round(warm * 8)
  return [
    'invert(1)',
    'hue-rotate(180deg)',
    `sepia(${fmt(sepia)})`,
    `saturate(${fmt(saturate)})`,
    `hue-rotate(${hueShift}deg)`,
    `brightness(${fmt(params.brightness)})`,
    `contrast(${fmt(params.contrast)})`,
  ].join(' ')
}

/**
 * Warm-tint overlay settings for the CSS-variables strategy (which cannot use
 * a global filter). Returns the rgba colour and opacity for a ::before layer.
 */
export function warmthOverlay(kelvin: number): { colour: string; opacity: number } {
  const warm = warmthOf(kelvin)
  if (warm <= 0) return { colour: '255, 154, 60', opacity: 0 }
  return { colour: '255, 154, 60', opacity: 0.03 + warm * 0.09 }
}
