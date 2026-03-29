"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { SIMULATIONS, PLAN_DATA } from "@/lib/plan-data";
import { useMasteries, useSimResults, useTaskStatuses, useAdaptiveHistory } from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

export default function FortschrittPage() {
  const { masteries } = useMasteries();
  const { results } = useSimResults();
  const { statuses } = useTaskStatuses();
  const { history } = useAdaptiveHistory();

  const mathTopicData = Object.entries(MATH_TOPICS).map(([id, topic]) => ({
    name: id,
    mastery: Math.round((masteries[id]?.currentScore ?? 0) * 100),
    target: Math.round(topic.targetMastery * 100),
    min: Math.round(topic.minMastery * 100),
  }));

  const progTopicData = Object.entries(PROG_TOPICS).map(([id, topic]) => ({
    name: id,
    mastery: Math.round((masteries[id]?.currentScore ?? 0) * 100),
    target: Math.round(topic.targetMastery * 100),
    min: Math.round(topic.minMastery * 100),
  }));

  const mathSimData = SIMULATIONS.filter((s) => s.subject === "math").map((sim) => {
    const result = results.find((r) => r.simulationId === sim.id);
    return {
      name: sim.name,
      target: sim.targetPercent,
      actual: result?.actualPercent ?? null,
    };
  });

  const weekStats = [1, 2, 3, 4, 5, 6].map((w) => {
    const weekDays = PLAN_DATA.filter((d) => d.week === w);
    const total = weekDays.flatMap((d) => d.tasks).length;
    const done = weekDays.flatMap((d) => d.tasks).filter((t) => statuses[t.id]?.completed).length;
    return { name: `W${w}`, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  };

  // oklch-Werte direkt – CSS Custom Properties funktionieren nicht in SVG-Attributen
  const COLOR_MUTED = "oklch(0.556 0 0)";
  const COLOR_PRIMARY = "oklch(0.87 0 0)";

  const tickStyle = { fill: COLOR_MUTED };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Fortschritt</h1>
        <p className="text-muted-foreground">Übersicht über deinen Lernfortschritt</p>
      </div>

      {/* Weekly completion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aufgaben pro Woche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_MUTED} opacity={0.3} />
                <XAxis dataKey="name" tick={{ ...tickStyle, fontSize: 12 }} />
                <YAxis tick={{ ...tickStyle, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" fill={COLOR_MUTED} name="Gesamt" radius={[4, 4, 0, 0]} />
                <Bar dataKey="done" fill={COLOR_PRIMARY} name="Erledigt" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Simulation results chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Mathe-Simulationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mathSimData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_MUTED} opacity={0.3} />
                <XAxis dataKey="name" tick={{ ...tickStyle, fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ ...tickStyle, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="target" stroke={COLOR_MUTED} strokeDasharray="5 5" name="Ziel" dot={false} />
                <Line type="monotone" dataKey="actual" stroke={COLOR_PRIMARY} strokeWidth={2} name="Ergebnis" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Mastery Overview — Math */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mathe — Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mathTopicData.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono w-8 justify-center shrink-0 text-xs">{d.name}</Badge>
              <div className="flex-1">
                <MasteryBar value={d.mastery / 100} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mastery Overview — Prog */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Programmieren — Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {progTopicData.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{PROG_TOPICS[d.name]?.name}</span>
              <div className="flex-1">
                <MasteryBar value={d.mastery / 100} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Adaptive History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Adaptive Änderungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.slice().reverse().slice(0, 10).map((h) => (
              <div key={h.id} className="border-l-2 border-border pl-3 py-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{h.triggerDetails}</p>
                  <Badge variant={h.accepted === true ? "default" : h.accepted === false ? "destructive" : "secondary"} className="text-xs">
                    {h.accepted === true ? "Akzeptiert" : h.accepted === false ? "Abgelehnt" : "Offen"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.timestamp).toLocaleDateString("de-DE")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
