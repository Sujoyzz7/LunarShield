/* global console */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const PORT = 4173

const server = createServer(async (req, res) => {
  const path = req.url === '/' ? '/light-page.html' : req.url
  try {
    const body = await readFile(join(FIXTURES, path))
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})

server.listen(PORT, () => {
  console.log(`[fixture-server] listening on http://localhost:${PORT}`)
})
