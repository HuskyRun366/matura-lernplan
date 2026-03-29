"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SIMULATIONS } from "@/lib/plan-data";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { useSimResults } from "@/hooks/use-storage";

export default function SimDetailPage({ params }: { params: Promise<{ simId: string }> }) {
  const { simId } = use(params);
  const router = useRouter();
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

    const proposal = addSimResult({
      simulationId: simId,
      actualPercent: actual,
      completedAt: new Date().toISOString(),
      topicBreakdown: breakdown,
      weakTopics,
      strongTopics,
      notes: notes || undefined,
    });

    router.push("/simulationen");
  }

  return (
    <div className="space-y-6">
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

      {/* Overall Score */}
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
          <p className="text-xs text-muted-foreground">Optional: Punkte pro Thema eingeben für genauere Analyse</p>
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
