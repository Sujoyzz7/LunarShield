/**
 * Minimal logger. Debug output is compiled out entirely in production
 * builds (CRXJS/Vite statically replace `import.meta.env.DEV`).
 */
const PREFIX = '[lunarshield]'

export const logger = {
  debug(...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.debug(PREFIX, ...args)
    }
  },
  info(...args: unknown[]) {
    if (import.meta.env.DEV) {
      console.info(PREFIX, ...args)
    }
  },
  warn(...args: unknown[]) {
    console.warn(PREFIX, ...args)
  },
  error(...args: unknown[]) {
    console.error(PREFIX, ...args)
  },
}
