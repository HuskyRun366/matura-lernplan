export const dynamic = "force-dynamic"

import { list } from "@vercel/blob"
import { FileDown, BookMarked, FileText } from "lucide-react"

// Blob-Namensformat: matura/{sj}-{T}-htl-{p}-{dateiname}.pdf
// Beispiel: matura/2024-25-W-htl-2-kl25_pt3_htl_amt_ab_h2_au.pdf
//   sj   = "2024-25"   (Schuljahr)
//   T    = "W"|"H"|"S" (Wintertermin|Herbsttermin|Sommertermin)
//   p    = "1"|"2"     (HTL 1 = Teil A, HTL 2 = Teil B)
//   Dateiname endet auf _au = Aufgaben, _lo = Lösungen

const TERM_LABEL: Record<string, string> = {
  W: "Wintertermin",
  H: "Herbsttermin",
  S: "Sommertermin",
}

interface PdfEntry {
  url: string
  sj: string       // "2024-25"
  term: string     // "W"|"H"|"S"
  part: string     // "1"|"2"
  kind: "au" | "lo" | "other"
}

function parseBlobs(blobs: { pathname: string; url: string }[]): PdfEntry[] {
  const entries: PdfEntry[] = []
  for (const b of blobs) {
    // matura/2024-25-W-htl-2-kl25_pt3_htl_amt_ab_h2_au.pdf
    const m = b.pathname.match(/^matura\/(\d{4}-\d{2})-([WHSwhsl])-htl-([12])-(.+)$/)
    if (!m) continue
    const [, sj, term, part, filename] = m
    const kind: PdfEntry["kind"] = filename.includes("_au")
      ? "au"
      : filename.includes("_lo")
      ? "lo"
      : "other"
    entries.push({ url: b.url, sj, term: term.toUpperCase(), part, kind })
  }
  return entries
}

type TermGroup = { au?: string; lo?: string; others: string[] }
type PartGroup = { "1": TermGroup; "2": TermGroup }
type YearMap   = Map<string, Map<string, PartGroup>> // sj → term → parts

function groupEntries(entries: PdfEntry[]): YearMap {
  const map: YearMap = new Map()
  for (const e of entries) {
    if (!map.has(e.sj)) map.set(e.sj, new Map())
    const termMap = map.get(e.sj)!
    if (!termMap.has(e.term)) {
      termMap.set(e.term, {
        "1": { others: [] },
        "2": { others: [] },
      })
    }
    const part = termMap.get(e.term)![e.part as "1" | "2"]
    if (!part) continue
    if (e.kind === "au") part.au = e.url
    else if (e.kind === "lo") part.lo = e.url
    else part.others.push(e.url)
  }
  return map
}

function LinkBtn({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <FileDown className="size-3.5 shrink-0" />
      {label}
    </a>
  )
}

function GhostBtn({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-dashed">
      {label}
    </span>
  )
}

export default async function MaturaBeiispielePage() {
  const { blobs } = await list({ prefix: "matura/" })
  const entries = parseBlobs(blobs)
  const grouped = groupEntries(entries)

  // Jahre absteigend sortieren
  const years = [...grouped.keys()].sort((a, b) => b.localeCompare(a))
  const termOrder = ["W", "H", "S"]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <BookMarked className="size-6" />
        <h1 className="text-2xl font-semibold">Matura-Beispiele</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Frühere HTL-Klausuren — Angewandte Mathematik (BHS).
        <br />
        <span className="font-medium">HTL&nbsp;1</span> = Teil&nbsp;A &nbsp;·&nbsp;
        <span className="font-medium">HTL&nbsp;2</span> = Teil&nbsp;B &nbsp;·&nbsp;
        <span className="font-medium">AU</span> = Aufgaben &nbsp;·&nbsp;
        <span className="font-medium">LÖ</span> = Lösungen
      </p>

      {years.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
          <p className="font-medium mb-1">Noch keine PDFs gespeichert</p>
          <p>Führe das Sync-Script aus:</p>
          <code className="mt-2 block text-xs bg-muted rounded px-2 py-1 font-mono">
            node --env-file=env.local scripts/sync-matura-pdfs.mjs
          </code>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {years.map((sj) => {
            const termMap = grouped.get(sj)!
            const sortedTerms = termOrder.filter((t) => termMap.has(t))
            return (
              <div key={sj} className="rounded-lg border overflow-hidden">
                {/* Schuljahr-Header */}
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Schuljahr {sj.replace("-", "/")}</span>
                </div>

                {/* Termine */}
                <div className="divide-y">
                  {sortedTerms.map((term) => {
                    const parts = termMap.get(term)!
                    return (
                      <div key={term} className="px-4 py-3 flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {TERM_LABEL[term] ?? term}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* HTL 1 */}
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">HTL 1 (Teil A)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {parts["1"].au ? (
                                <LinkBtn href={parts["1"].au} label="Aufgaben" />
                              ) : (
                                <GhostBtn label="Aufgaben –" />
                              )}
                              {parts["1"].lo ? (
                                <LinkBtn href={parts["1"].lo} label="Lösungen" />
                              ) : (
                                <GhostBtn label="Lösungen –" />
                              )}
                            </div>
                          </div>
                          {/* HTL 2 */}
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">HTL 2 (Teil B)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {parts["2"].au ? (
                                <LinkBtn href={parts["2"].au} label="Aufgaben" />
                              ) : (
                                <GhostBtn label="Aufgaben –" />
                              )}
                              {parts["2"].lo ? (
                                <LinkBtn href={parts["2"].lo} label="Lösungen" />
                              ) : (
                                <GhostBtn label="Lösungen –" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
