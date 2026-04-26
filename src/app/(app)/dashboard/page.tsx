"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Code,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  useUser,
  usePlanConfig,
  useMasteries,
  useCompletions,
  useUserTasks,
} from "@/hooks/use-storage";
import {
  aggregateByCategory,
  aggregateByDate,
  calculateOverallProgress,
} from "@/lib/progress/aggregate";
import { CategoryProgressList } from "@/components/dashboard/category-progress";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function shiftDate(date: string, days: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function DashboardPage() {
  const { user } = useUser();
  const { config } = usePlanConfig();
  const { masteries } = useMasteries();
  const { completions } = useCompletions();
  const { tasksForDate, allTasks } = useUserTasks();

  const today = todayStr();
  const todayTasks = tasksForDate(today);

  const categories = useMemo(() => aggregateByCategory(masteries), [masteries]);
  const overall = useMemo(
    () => calculateOverallProgress(masteries),
    [masteries]
  );
  const byDate = useMemo(
    () => aggregateByDate(allTasks, completions),
    [allTasks, completions]
  );

  const last7: Array<{ date: string; minutes: number; label: string }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = shiftDate(today, -i);
    const entry = byDate[d];
    const dd = new Date(d + "T00:00:00");
    const labels = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    last7.push({
      date: d,
      minutes: entry?.completedMinutes ?? 0,
      label: labels[dd.getDay()],
    });
  }

  const maxMinutes = Math.max(
    60,
    ...last7.map((d) => d.minutes)
  );

  const todayDone = todayTasks.filter((t) => t.completed).length;
  const todayMinutes = todayTasks.reduce(
    (s, t) => s + t.durationMinutes,
    0
  );
  const todayDoneMinutes = todayTasks
    .filter((t) => t.completed)
    .reduce((s, t) => s + t.durationMinutes, 0);

  const progDays = config ? daysUntil(config.progExamDate) : null;
  const mathDays = config ? daysUntil(config.mathExamDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hallo {user?.name ?? "du"}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Dein selbst gesteuerter Lernplan zur Matura 2026.
        </p>
      </div>

      {/* Countdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Code className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Programmieren</p>
              <p className="text-2xl font-bold">
                {progDays === null
                  ? "—"
                  : progDays > 0
                  ? `${progDays} Tage`
                  : progDays === 0
                  ? "HEUTE!"
                  : "Vorbei"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Calculator className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mathematik</p>
              <p className="text-2xl font-bold">
                {mathDays === null
                  ? "—"
                  : mathDays > 0
                  ? `${mathDays} Tage`
                  : mathDays === 0
                  ? "HEUTE!"
                  : "Vorbei"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heute */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Heute
            </CardTitle>
            <Link href={`/tagesplan/${today}`}>
              <Button variant="ghost" size="sm">
                Zum Tagesplan <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Noch keine Aufgaben für heute. Plane deinen Tag im{" "}
              <Link
                href={`/tagesplan/${today}`}
                className="underline hover:text-foreground"
              >
                Tagesplan
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aufgaben</span>
                <span className="font-medium">
                  {todayDone} / {todayTasks.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zeit</span>
                <span className="font-medium">
                  {todayDoneMinutes} / {todayMinutes} Min
                </span>
              </div>
              <Progress
                value={
                  todayTasks.length > 0
                    ? (todayDone / todayTasks.length) * 100
                    : 0
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gesamtfortschritt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Gesamtfortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Mathe (gewichtete Ø-Mastery)
              </span>
              <span className="font-medium">
                {Math.round(overall.math * 100)}%
              </span>
            </div>
            <Progress value={overall.math * 100} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Prog (gewichtete Ø-Mastery)
              </span>
              <span className="font-medium">
                {Math.round(overall.prog * 100)}%
              </span>
            </div>
            <Progress value={overall.prog * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Bereiche */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Bereiche
          </h2>
          <Link href="/fortschritt">
            <Button variant="ghost" size="sm" className="gap-1">
              Drill-down <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CategoryProgressList categories={categories} />
      </div>

      {/* Letzte 7 Tage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Letzte 7 Tage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {last7.map((d) => {
              const h = Math.max(
                4,
                Math.round((d.minutes / maxMinutes) * 110)
              );
              return (
                <Link
                  key={d.date}
                  href={`/tagesplan/${d.date}`}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="text-xs text-muted-foreground">
                    {d.minutes > 0 ? `${d.minutes}m` : ""}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-primary/70 group-hover:bg-primary transition-colors"
                    style={{ height: `${h}px` }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {d.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
