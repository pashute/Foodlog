// Filename: sheetServer.js
// version 0.1.2

// Minimal local HTTP server serving the mock Foodlog sheet HTML (prototype
// stage only) at http://localhost:3000/Foodlog.mock.html — the target of
// Settings' "Open in Google Sheets" link when sheet.mock.js is active.
// Run standalone: `npm run mock:sheet-server`.

import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HTML_PATH = path.join(__dirname, 'Foodlog.mock.html')
const PORT = 3000

let server = null

export function start() {
  if (server) return server
  server = http.createServer(async (req, res) => {
    try {
      const html = await readFile(HTML_PATH, 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
    }
  })
  server.listen(PORT)
  return server
}

export function stop() {
  server?.close()
  server = null
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start()
  console.log(`Mock sheet server running at http://localhost:${PORT}/Foodlog.mock.html`)
}
