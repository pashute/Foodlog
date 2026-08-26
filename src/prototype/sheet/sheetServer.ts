// Filename: sheetServer.ts
// version 0.2.1

// Minimal local HTTP server serving the mock Foodlog sheet HTML (prototype
// stage only) at http://localhost:3000/Foodlog.mock.html — the target of
// Settings' "Open in Google Sheets" link when sheet.mock.ts is active.
// Run standalone: `npm run mock:sheet-server`.
//
// GET  /Foodlog.mock.html  renders the template with sheetMock's current
//   rows injected into the table body, so it reflects whatever has been
//   saved so far — same rows the real Google Sheet would show.
// POST /log                the browser-side sheet.mock.ts (a separate
//   module instance across the browser<->this-process boundary) calls this
//   on every log() so this process's copy of the mock sheet stays in sync.
//   Best-effort from the caller's side: if this server isn't running, the
//   browser's own in-memory sheet still works, only the served HTML page
//   doesn't reflect it.

import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as sheetMock from '../sheet.mock.ts'
import { mockConstants } from '../../infrastructure/config/config.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HTML_PATH = path.join(__dirname, 'Foodlog.mock.html')
const PORT = Number(new URL(mockConstants.urls.mockMyDrive).port)

let server = null

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function rowsToHtml(sheet) {
  if (!sheet.rows.length) {
    return '<tr><td colspan="7">(no entries yet)</td></tr>'
  }
  return sheet.rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.dow)}</td><td>${escapeHtml(r.time)}</td>` +
        `<td>${escapeHtml(r.carbs)}</td><td>${escapeHtml(r.calories)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(r.meal)}</td></tr>`
    )
    .join('\n')
}

export async function renderHtml() {
  const template = await readFile(HTML_PATH, 'utf8')
  const sheet = sheetMock.existsOrCreate()
  return template.replace(
    /<tbody id="placeholder">[\s\S]*?<\/tbody>/,
    `<tbody id="placeholder">\n${rowsToHtml(sheet)}\n</tbody>`
  )
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

export function start() {
  if (server) return server
  server = http.createServer(async (req, res) => {
    // The browser (localhost:8081) posts here (localhost:3000) — a
    // cross-origin request that needs CORS headers, plus a preflight
    // OPTIONS response since Content-Type: application/json isn't a
    // "simple" request header.
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }
    try {
      if (req.method === 'POST' && req.url === '/log') {
        const mealData = await readBody(req)
        sheetMock.log(mealData)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
        return
      }
      if (req.method === 'POST' && req.url === '/reset') {
        sheetMock.reset()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
        return
      }
      const html = await renderHtml()
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
  console.log(`Mock sheet server running at ${mockConstants.urls.mockMyDrive}`)
}
