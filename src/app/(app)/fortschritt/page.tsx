"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Timer,
  ListChecks,
  CalendarDays,
} from "lucide-react";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { SIMULATIONS } from "@/lib/plan-data";
import {
  useMasteries,
  useSimResults,
  useCompletions,
  useUserTasks,
} from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";
import {
  aggregateByCategory,
  aggregateByDate,
} from "@/lib/progress/aggregate";
import { CategoryProgressList } from "@/components/dashboard/category-progress";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === "improving")
    return <TrendingUp className="h-3 w-3 text-primary" />;
  if (trend === "declining")
    return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

function monthLabel(date: string): string {
  const d = new Date(date + "T00:00:00");
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

export default function FortschrittPage() {
  const { masteries } = useMasteries();
  const { results } = useSimResults();
  const { completions } = useCompletions();
  const { allTasks } = useUserTasks();

  const categories = useMemo(
    () => aggregateByCategory(masteries),
    [masteries]
  );
  const byDate = useMemo(
    () => aggregateByDate(allTasks, completions),
    [allTasks, completions]
  );

  const datesSorted = useMemo(
    () => Object.keys(byDate).sort(),
    [byDate]
  );

  const mathTopicData = Object.entries(MATH_TOPICS).map(([id, topic]) => ({
    name: id,
    mastery: Math.round((masteries[id]?.currentScore ?? 0) * 100),
    target: Math.round(topic.targetMastery * 100),
  }));

  const progTopicData = Object.entries(PROG_TOPICS).map(([id, topic]) => ({
    name: id,
    mastery: Math.round((masteries[id]?.currentScore ?? 0) * 100),
    target: Math.round(topic.targetMastery * 100),
  }));

  const mathSimData = SIMULATIONS.filter((s) => s.subject === "math").map(
    (sim) => {
      const result = results.find((r) => r.simulationId === sim.id);
      return {
        name: sim.name,
        target: sim.targetPercent,
        actual: result?.actualPercent ?? null,
      };
    }
  );

  const timePerTopic = completions.reduce<Record<string, number>>((acc, c) => {
    if (c.timeSpentMinutes) acc[c.topicId] = (acc[c.topicId] ?? 0) + c.timeSpentMinutes;
    return acc;
  }, {});
  const totalTimeMinutes = Object.values(timePerTopic).reduce((s, v) => s + v, 0);
  const timeData = Object.entries(timePerTopic)
    .map(([topicId, minutes]) => ({
      topicId,
      name: (MATH_TOPICS[topicId] ?? PROG_TOPICS[topicId])?.name ?? topicId,
      minutes,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  };

  const COLOR_MUTED = "oklch(0.556 0 0)";
  const COLOR_PRIMARY = "oklch(0.87 0 0)";
  const tickStyle = { fill: COLOR_MUTED };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fortschritt</h1>
        <p className="text-muted-foreground text-sm">
          Mastery, Bereiche und deine Lerntage im Überblick.
        </p>
      </div>

      <Tabs defaultValue="gesamt">
        <TabsList>
          <TabsTrigger value="gesamt" className="gap-1">
            <ListChecks className="h-4 w-4" /> Gesamt
          </TabsTrigger>
          <TabsTrigger value="bereiche" className="gap-1">
            <TrendingUp className="h-4 w-4" /> Bereiche
          </TabsTrigger>
          <TabsTrigger value="tage" className="gap-1">
            <CalendarDays className="h-4 w-4" /> Tage
          </TabsTrigger>
        </TabsList>

        {/* ── Gesamt ── */}
        <TabsContent value="gesamt" className="space-y-6 mt-4">
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLOR_MUTED}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ ...tickStyle, fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ ...tickStyle, fontSize: 12 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke={COLOR_MUTED}
                      strokeDasharray="5 5"
                      name="Ziel"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke={COLOR_PRIMARY}
                      strokeWidth={2}
                      name="Ergebnis"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mathe — Mastery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mathTopicData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="font-mono w-8 justify-center shrink-0 text-xs"
                  >
                    {d.name}
                  </Badge>
                  <div className="flex-1">
                    <MasteryBar value={d.mastery / 100} />
                  </div>
                  <TrendIcon trend={masteries[d.name]?.trend} />
                  <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                    {d.mastery}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Programmieren — Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progTopicData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">
                    {PROG_TOPICS[d.name]?.name}
                  </span>
                  <div className="flex-1">
                    <MasteryBar value={d.mastery / 100} />
                  </div>
                  <TrendIcon trend={masteries[d.name]?.trend} />
                  <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                    {d.mastery}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {totalTimeMinutes > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Zeit nach Thema
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Gesamt erfasst: {Math.floor(totalTimeMinutes / 60)} Std{" "}
                  {totalTimeMinutes % 60} Min
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {timeData.map((d) => (
                  <div key={d.topicId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">
                      {d.name}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.round(
                            (d.minutes / timeData[0].minutes) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums w-14 text-right">
                      {d.minutes} Min
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Bereiche ── */}
        <TabsContent value="bereiche" className="space-y-4 mt-4">
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              Aggregierte Mastery über alle Themen eines Bereichs. „Am Ziel" =
              Themen über individueller Zielmarke.
            </CardContent>
          </Card>
          <CategoryProgressList categories={categories} />
        </TabsContent>

        {/* ── Tage ── */}
        <TabsContent value="tage" className="space-y-4 mt-4">
          {datesSorted.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Noch keine Lerntage erfasst.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {datesSorted
                .slice()
                .reverse()
                .slice(0, 30)
                .map((d) => {
                  const entry = byDate[d];
                  return (
                    <Link key={d} href={`/tagesplan/${d}`}>
                      <Card className="hover:bg-accent/50 transition-colors">
                        <CardContent className="py-3 flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {monthLabel(d)}
                            </span>
                            <span className="text-muted-foreground">
                              {entry.completedTasks} / {entry.totalTasks}{" "}
                              Aufgaben
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{entry.completedMinutes} Min</span>
                            <span>{entry.completions} Bewert.</span>
                            <span>
                              {entry.topicIds.length} Themen
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
