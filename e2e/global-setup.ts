import { existsSync } from 'node:fs'
import { join } from 'node:path'

export default function globalSetup(): void {
  const dist = join(process.cwd(), 'dist')
  if (!existsSync(join(dist, 'manifest.json'))) {
    throw new Error(
      'Extension build not found in dist/. Run `pnpm build` (or `pnpm dev` once) before running e2e tests.',
    )
  }
}
