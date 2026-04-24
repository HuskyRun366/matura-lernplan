/**
 * Einmal-Script: Fetcht HTL-Matura-Aufgaben (Angewandte Mathematik, Teil A + B)
 * von matura.gv.at und lädt die PDFs in Vercel Blob hoch.
 *
 * Ausführen:
 *   node --env-file=env.local scripts/sync-matura-pdfs.mjs
 *
 * Voraussetzung: BLOB_READ_WRITE_TOKEN in env.local gesetzt.
 * System: macOS/Linux mit installiertem `unzip`-Befehl.
 */

import { put, list } from "@vercel/blob"
import { execSync } from "node:child_process"
import { writeFileSync, readdirSync, mkdtempSync, rmSync, statSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, extname } from "node:path"

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
if (!TOKEN) {
  console.error("❌  BLOB_READ_WRITE_TOKEN nicht gesetzt. Starte mit:")
  console.error("    node --env-file=env.local scripts/sync-matura-pdfs.mjs")
  process.exit(1)
}

const BASE = "https://www.matura.gv.at"
const HEADERS = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }

// Schuljahre (neueste zuerst) — je ein separater Seiten-Fetch wegen Paginierung
const YEARS = [
  "2024/25", "2023/24", "2022/23", "2021/22", "2020/21",
  "2019/20", "2018/19", "2017/18", "2016/17", "2015/16", "2014/15",
]

function buildFilterUrl(year) {
  const base =
    `${BASE}/downloads?` +
    `tx_solr%5Bfilter%5D%5B0%5D=subject%3A%2FAngewandte+Mathematik%2F&` +
    `tx_solr%5Bfilter%5D%5B1%5D=documentType%3A%2FFr%C3%BChere+Pr%C3%BCfungsaufgaben%2FKlausuren%2F&` +
    `tx_solr%5Bfilter%5D%5B2%5D=schoolType%3ABHS`
  return year
    ? base + `&tx_solr%5Bfilter%5D%5B3%5D=year%3A${encodeURIComponent(year)}`
    : base
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) { console.warn(`  ⚠️  HTTP ${res.status} für ${url}`); return null }
  return res.text()
}

/**
 * Parst HTML und gibt alle HTL-1/HTL-2-Einträge zurück.
 * Strategie:
 *  1. Erstelle Map collectionId → vollständiger Download-URL (inkl. cHash aus HTML)
 *  2. Erstelle Map collectionId → Titel-Info (Jahr, Termin, Teil)
 *     via data-target="#collapse_<id>" + Text in der Collapse-Button-Section
 */
function parseCollections(html) {
  // 1. Alle Download-URLs mit cHash extrahieren (key = collectionId)
  const downloadUrls = new Map()
  for (const m of html.matchAll(
    /href="(\/downloads\/download\?[^"]*collection%5D=(\d+)[^"]*cHash=[^"]*)"/g
  )) {
    const href = m[1].replace(/&amp;/g, "&")
    const id = m[2]
    if (!downloadUrls.has(id)) downloadUrls.set(id, BASE + href)
  }

  // 2. Button-Blöcke: data-target="#collapse_<id>" → Titeltext
  const results = []
  for (const m of html.matchAll(
    /data-target="#collapse_(\d+)"([\s\S]{1,800}?)<\/button>/g
  )) {
    const id = m[1]
    const block = m[2]

    // Nur HTL 1 und HTL 2 (nicht HAK, HUM, HLFS, BRP, slowen. Übers., …)
    const titleMatch = block.match(
      /((Sommer|Herbst|Winter)termin\s+(\d{4}\/\d{2})[\s\S]*?–\s*HTL\s+([12]))\s*(?:<|$)/i
    )
    if (!titleMatch) continue

    // Übersetzungs-Versionen ausschließen
    if (/slowenisch|übersetzung|blindheit|sehbehinderung/i.test(block)) continue

    const term    = titleMatch[2]   // Sommer | Herbst | Winter
    const sj      = titleMatch[3]   // z.B. "2023/24"
    const part    = titleMatch[4]   // "1" oder "2"
    const title   = titleMatch[1].replace(/\s+/g, " ").trim()
    const dlUrl   = downloadUrls.get(id)
    if (!dlUrl) continue

    results.push({ collectionId: id, title, sj, term, part, dlUrl })
  }
  return results
}

function schuljahrSlug(sj) { return sj.replace("/", "-") }
function termSlug(term) {
  return { sommer: "S", herbst: "H", winter: "W" }[term.toLowerCase()] ?? term[0].toUpperCase()
}

async function downloadZip(dlUrl) {
  const res = await fetch(dlUrl, {
    headers: { ...HEADERS, Referer: "https://www.matura.gv.at/downloads" },
  })
  if (!res.ok) { console.warn(`  ⚠️  ZIP-Download: HTTP ${res.status}`); return null }
  const ct = res.headers.get("content-type") ?? ""
  if (!ct.includes("zip") && !ct.includes("octet")) {
    console.warn(`  ⚠️  Unerwarteter Content-Type: ${ct}`)
    return null
  }
  return res.arrayBuffer()
}

function extractZip(zipBuffer, outDir) {
  const zipPath = join(outDir, "collection.zip")
  writeFileSync(zipPath, Buffer.from(zipBuffer))
  execSync(`unzip -q -o "${zipPath}" -d "${outDir}/extracted"`)
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) { walk(full); continue }
      files.push({ path: full, filename: entry })
    }
  }
  walk(`${outDir}/extracted`)
  return files
}

function safeFilename(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function mimeFor(ext) {
  return { ".pdf": "application/pdf", ".zip": "application/zip" }[ext.toLowerCase()]
    ?? "application/octet-stream"
}

async function uploadIfNew(blobName, filePath) {
  const { blobs } = await list({ prefix: blobName, token: TOKEN })
  if (blobs.some((b) => b.pathname === blobName)) {
    console.log(`    ⏭️  ${blobName} bereits vorhanden`)
    return blobs.find((b) => b.pathname === blobName).url
  }
  const content = await readFile(filePath)
  const blob = await put(blobName, content, {
    access: "public",
    token: TOKEN,
    contentType: mimeFor(extname(filePath)),
  })
  console.log(`    ✅  ${blob.url}`)
  return blob.url
}

async function main() {
  console.log("🎓  Matura-PDF-Sync gestartet\n")

  // 1. Alle Collections sammeln (jedes Schuljahr separat, dann Hauptseite als Fallback)
  const allCollections = new Map() // collectionId → entry

  for (const year of YEARS) {
    const html = await fetchHtml(buildFilterUrl(year))
    if (!html) continue
    for (const c of parseCollections(html)) {
      if (!allCollections.has(c.collectionId)) {
        allCollections.set(c.collectionId, c)
        console.log(`  ✓  ${c.term}termin ${c.sj} – HTL ${c.part} [${c.collectionId}]`)
      }
    }
  }
  // Hauptseite (kein Jahres-Filter) für evtl. fehlende Einträge
  const mainHtml = await fetchHtml(buildFilterUrl(null))
  if (mainHtml) {
    for (const c of parseCollections(mainHtml)) {
      if (!allCollections.has(c.collectionId)) {
        allCollections.set(c.collectionId, c)
        console.log(`  ✓  ${c.term}termin ${c.sj} – HTL ${c.part} [${c.collectionId}] (main)`)
      }
    }
  }

  console.log(`\n  → ${allCollections.size} Collection(s) gefunden.\n`)
  if (allCollections.size === 0) {
    console.log("⚠️  Keine Einträge gefunden. Seite hat sich evtl. geändert.")
    process.exit(0)
  }

  // 2. ZIPs laden, entpacken, PDFs hochladen
  const uploaded = []
  const tmpRoot = mkdtempSync(join(tmpdir(), "matura-sync-"))

  try {
    for (const [id, col] of allCollections) {
      const label = `${col.term}termin ${col.sj} – HTL ${col.part}`
      console.log(`📦  ${label}`)

      const zipBuf = await downloadZip(col.dlUrl)
      if (!zipBuf) { console.log("    ⏭️  übersprungen\n"); continue }

      const colDir = join(tmpRoot, `col_${id}`)
      execSync(`mkdir -p "${colDir}"`)

      let files
      try {
        files = extractZip(zipBuf, colDir)
      } catch (e) {
        console.warn(`    ⚠️  ZIP-Entpacken fehlgeschlagen: ${e.message}`)
        continue
      }

      console.log(`    📂  ${files.length} Datei(en)`)
      for (const { path: fp, filename } of files) {
        const sj  = schuljahrSlug(col.sj)          // "2023-24"
        const t   = termSlug(col.term)              // "S"|"H"|"W"
        const p   = col.part                        // "1"|"2"
        const fn  = safeFilename(filename)          // "aufgaben.pdf"
        const blobName = `matura/${sj}-${t}-htl-${p}-${fn}`
        const url = await uploadIfNew(blobName, fp)
        if (url) uploaded.push({ label, blobName, url })
      }
      console.log()
    }
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true })
  }

  console.log(`\n✅  Fertig! ${uploaded.length} Datei(en) hochgeladen:`)
  for (const { label, blobName } of uploaded) {
    console.log(`   [${label}]  ${blobName}`)
  }
}

main().catch((err) => {
  console.error("❌  Fehler:", err)
  process.exit(1)
})
