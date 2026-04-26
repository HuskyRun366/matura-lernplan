import { connection } from "next/server";
import { ExternalLink, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getHtl2MaturaExamples,
  type MaturaExample,
  type MaturaPartLinks,
} from "@/lib/matura-examples";

function PdfButton({
  href,
  label,
  muted = false,
}: {
  href?: string;
  label: string;
  muted?: boolean;
}) {
  if (!href) {
    return (
      <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 text-sm text-muted-foreground">
        {label} fehlt
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors ${
        muted
          ? "border-border bg-background hover:bg-muted"
          : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
      }`}
    >
      <FileText className="h-4 w-4" />
      {label}
    </a>
  );
}

function PartRow({ label, links }: { label: string; links: MaturaPartLinks }) {
  return (
    <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(9rem,1fr)_auto] sm:items-center">
      <div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PdfButton href={links.aufgaben?.url} label="Aufgaben" />
        <PdfButton href={links.loesungen?.url} label="Lösungen" muted />
      </div>
    </div>
  );
}

export default async function MaturaBeispielePage() {
  await connection();

  let examples: MaturaExample[] = [];
  let loadError = "";

  try {
    examples = await getHtl2MaturaExamples();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unbekannter Fehler";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matura-Beispiele</h1>
          <p className="text-muted-foreground">
            Angewandte Mathematik, BHS, HTL 2, alle vorhandenen Termine.
          </p>
        </div>
        <a
          href="https://www.matura.gv.at/downloads"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-fit items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          matura.gv.at
        </a>
      </div>

      {loadError ? (
        <Card>
          <CardContent className="py-8 text-sm text-destructive">
            Matura-Beispiele konnten nicht geladen werden: {loadError}
          </CardContent>
        </Card>
      ) : examples.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Keine HTL-2-Matura-PDFs im Blob gefunden.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {examples.map((example) => (
            <Card key={`${example.yearKey}-${example.termCode}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>
                    {example.termLabel} {example.yearLabel}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    HTL 2
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(example.teilA.aufgaben || example.teilA.loesungen) && (
                  <PartRow label="Teil A" links={example.teilA} />
                )}
                {(example.teilB.aufgaben || example.teilB.loesungen) && (
                  <PartRow label="Teil B" links={example.teilB} />
                )}
                {(example.full.aufgaben || example.full.loesungen) && (
                  <>
                    {(example.teilA.aufgaben ||
                      example.teilA.loesungen ||
                      example.teilB.aufgaben ||
                      example.teilB.loesungen) && <Separator />}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        Gesamtes Aufgabenheft
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <PdfButton
                          href={example.full.aufgaben?.url}
                          label="Aufgabenheft"
                          muted
                        />
                        <PdfButton
                          href={example.full.loesungen?.url}
                          label="Korrekturheft"
                          muted
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
