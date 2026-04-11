"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SIMULATIONS } from "@/lib/plan-data";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { useSimResults } from "@/hooks/use-storage";

export default function SimDetailPage({ params }: { params: Promise<{ simId: string }> }) {
  const { simId } = use(params);
  const { results, addSimResult } = useSimResults();

  const sim = SIMULATIONS.find((s) => s.id === simId);
  const existingResult = results.find((r) => r.simulationId === simId);

  const [percent, setPercent] = useState(existingResult?.actualPercent?.toString() ?? "");
  const [notes, setNotes] = useState(existingResult?.notes ?? "");
  const [topicScores, setTopicScores] = useState<Record<string, { points: string; maxPoints: string }>>(
    existingResult?.topicBreakdown
      ? Object.fromEntries(
          Object.entries(existingResult.topicBreakdown).map(([k, v]) => [k, { points: v.points.toString(), maxPoints: v.maxPoints.toString() }])
        )
      : {}
  );

  if (!sim) {
    return <div className="text-center py-12 text-muted-foreground">Simulation nicht gefunden</div>;
  }

  const topics = sim.subject === "math" ? MATH_TOPICS : PROG_TOPICS;

  function handleSave() {
    const actual = parseFloat(percent) || 0;
    const breakdown: Record<string, { points: number; maxPoints: number }> = {};
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const [topicId, scores] of Object.entries(topicScores)) {
      const pts = parseFloat(scores.points) || 0;
      const max = parseFloat(scores.maxPoints) || 1;
      breakdown[topicId] = { points: pts, maxPoints: max };
      const pct = pts / max;
      if (pct < 0.5) weakTopics.push(topicId);
      else if (pct >= 0.8) strongTopics.push(topicId);
    }

    addSimResult({
      simulationId: simId,
      actualPercent: actual,
      completedAt: new Date().toISOString(),
      topicBreakdown: breakdown,
      weakTopics,
      strongTopics,
      notes: notes || undefined,
    });
    // Stay on page — results section appears automatically
  }

  // Compute per-topic results for display
  const topicResults = existingResult
    ? Object.entries(existingResult.topicBreakdown)
        .filter(([, bd]) => bd.maxPoints > 0)
        .map(([topicId, bd]) => ({
          topicId,
          name: topics[topicId]?.name ?? topicId,
          pct: Math.round((bd.points / bd.maxPoints) * 100),
          points: bd.points,
          maxPoints: bd.maxPoints,
        }))
        .sort((a, b) => a.pct - b.pct)
    : [];

  const gap = existingResult ? sim.targetPercent - existingResult.actualPercent : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/simulationen">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{sim.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{sim.date}</Badge>
            <Badge variant="secondary">
              {sim.subject === "math" ? "Mathematik" : "Programmieren"}
            </Badge>
            <Badge variant="outline">Ziel: {sim.targetPercent}%</Badge>
          </div>
        </div>
      </div>

      {/* Results breakdown — shown when result exists */}
      {existingResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {gap <= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : gap > 15 ? <TrendingDown className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4 text-orange-400" />}
                Auswertung
              </CardTitle>
              <Badge variant={gap <= 0 ? "default" : "destructive"}>
                {gap <= 0 ? `+${Math.abs(gap)}% über Ziel` : `${gap}% unter Ziel`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamtergebnis</span>
                <span className="font-semibold">{existingResult.actualPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${gap <= 0 ? "bg-primary" : gap > 15 ? "bg-destructive" : "bg-orange-400"}`}
                  style={{ width: `${existingResult.actualPercent}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/40"
                  style={{ left: `${sim.targetPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Zielmarke bei {sim.targetPercent}%</p>
            </div>

            {/* Per-topic breakdown */}
            {topicResults.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Themen-Analyse (schlechteste zuerst)</p>
                  {topicResults.map((t) => (
                    <div key={t.topicId} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate max-w-[60%]">{t.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t.points}/{t.maxPoints} Pkt</span>
                          <span className={`text-xs font-semibold ${t.pct >= 80 ? "text-primary" : t.pct >= 50 ? "text-orange-500" : "text-destructive"}`}>
                            {t.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.pct >= 80 ? "bg-primary" : t.pct >= 50 ? "bg-orange-400" : "bg-destructive"}`}
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weak / Strong summary */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {existingResult.weakTopics.map((id) => (
                    <Badge key={id} variant="destructive" className="text-xs">
                      Schwach: {topics[id]?.name ?? id}
                    </Badge>
                  ))}
                  {existingResult.strongTopics.map((id) => (
                    <Badge key={id} variant="default" className="text-xs">
                      Stark: {topics[id]?.name ?? id}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {existingResult.notes && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{existingResult.notes}</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gesamtergebnis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="shrink-0">Ergebnis:</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-24"
              placeholder="0"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Topic Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aufschlüsselung nach Thema</CardTitle>
          <p className="text-xs text-muted-foreground">Optional: Punkte pro Thema für genauere Analyse</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(topics).map(([topicId, topic]) => (
            <div key={topicId} className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono w-10 justify-center shrink-0">{topicId}</Badge>
              <span className="text-sm flex-1 min-w-0 truncate">{topic.name}</span>
              <Input
                type="number"
                min={0}
                placeholder="Pkt"
                value={topicScores[topicId]?.points ?? ""}
                onChange={(e) =>
                  setTopicScores((prev) => ({
                    ...prev,
                    [topicId]: { points: e.target.value, maxPoints: prev[topicId]?.maxPoints ?? "4" },
                  }))
                }
                className="w-16"
              />
              <span className="text-xs text-muted-foreground">/</span>
              <Input
                type="number"
                min={1}
                placeholder="Max"
                value={topicScores[topicId]?.maxPoints ?? ""}
                onChange={(e) =>
                  setTopicScores((prev) => ({
                    ...prev,
                    [topicId]: { points: prev[topicId]?.points ?? "0", maxPoints: e.target.value },
                  }))
                }
                className="w-16"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nachanalyse</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Welche Fehler wiederholen sich? Was war sicher, was nicht?"
            rows={4}
          />
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} size="lg">
        {existingResult ? "Ergebnis aktualisieren" : "Ergebnis speichern"}
      </Button>
    </div>
  );
}
