"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calculator,
  Code,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { PLAN_DATA, WEEKS, PROG_EXAM_DATE, MATH_EXAM_DATE } from "@/lib/plan-data";
import { useUser, useTaskStatuses, useAdaptiveHistory, useMasteries } from "@/hooks/use-storage";

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const SUBJECT_STYLES = {
  math: { variant: "default" as const, label: "Mathe" },
  prog: { variant: "secondary" as const, label: "Prog" },
  sim: { variant: "outline" as const, label: "Simulation" },
};

export default function DashboardPage() {
  const { user } = useUser();
  const { statuses, setTaskStatus } = useTaskStatuses();
  const { history, acceptProposal, rejectProposal } = useAdaptiveHistory();

  const today = todayStr();
  const todayPlan = PLAN_DATA.find((d) => d.date === today);

  const allTasks = PLAN_DATA.flatMap((d) => d.tasks);
  const mathTasks = allTasks.filter((t) => t.subject === "math" || (t.subject === "sim" && t.title.includes("Mathe")));
  const progTasks = allTasks.filter((t) => t.subject === "prog" || (t.subject === "sim" && (t.title.includes("Prog") || t.title.includes("PROG"))));
  const mathDone = mathTasks.filter((t) => statuses[t.id]?.completed).length;
  const progDone = progTasks.filter((t) => statuses[t.id]?.completed).length;
  const mathPercent = mathTasks.length > 0 ? Math.round((mathDone / mathTasks.length) * 100) : 0;
  const progPercent = progTasks.length > 0 ? Math.round((progDone / progTasks.length) * 100) : 0;

  const currentWeek = WEEKS.find((w) => today >= w.start && today <= w.end);
  const pending = history.filter((p) => p.accepted === undefined);

  const progDays = daysUntil(PROG_EXAM_DATE);
  const mathDays = daysUntil(MATH_EXAM_DATE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Hallo {user?.name}!</h1>
        <p className="text-muted-foreground">
          {currentWeek ? `${currentWeek.label} — ${currentWeek.phase}` : "Lernplan"}
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
                {progDays > 0 ? `${progDays} Tage` : progDays === 0 ? "HEUTE!" : "Vorbei"}
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
                {mathDays > 0 ? `${mathDays} Tage` : mathDays === 0 ? "HEUTE!" : "Vorbei"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mathe-Fortschritt</span>
              <span className="font-medium">{mathPercent}%</span>
            </div>
            <Progress value={mathPercent} />
            <p className="text-xs text-muted-foreground">{mathDone} / {mathTasks.length} Aufgaben</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prog-Fortschritt</span>
              <span className="font-medium">{progPercent}%</span>
            </div>
            <Progress value={progPercent} />
            <p className="text-xs text-muted-foreground">{progDone} / {progTasks.length} Aufgaben</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Heute
            </CardTitle>
            <Link href={`/tagesplan/${today}`}>
              <Button variant="ghost" size="sm">
                Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayPlan ? (
            todayPlan.tasks.map((task) => {
              const style = SUBJECT_STYLES[task.subject];
              const isDone = statuses[task.id]?.completed;
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={(checked) =>
                      setTaskStatus(task.id, {
                        completed: !!checked,
                        completedAt: checked ? new Date().toISOString() : undefined,
                        skipped: false,
                      })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={style.variant}>{style.label}</Badge>
                      <span className={`font-medium text-sm ${isDone ? "line-through opacity-50" : ""}`}>
                        {task.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">{task.time}</Badge>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isDone ? "line-through opacity-50" : ""}`}>
                      {task.description}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Aufgaben für heute</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adaptive Notifications */}
      {pending.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Adaptive Vorschläge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((proposal) => (
              <div key={proposal.id} className="p-3 rounded-lg border border-border bg-muted/50 space-y-2">
                <p className="text-sm font-medium">{proposal.triggerDetails}</p>
                <ul className="space-y-1">
                  {proposal.changes.map((change, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{change.description}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => acceptProposal(proposal.id)}>
                    Akzeptieren
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectProposal(proposal.id)}>
                    Ablehnen
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Week Overview */}
      {currentWeek && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {currentWeek.label} — {currentWeek.range}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {PLAN_DATA.filter((d) => d.date >= currentWeek.start && d.date <= currentWeek.end).map((day) => {
                const allDone = day.tasks.length > 0 && day.tasks.every((t) => statuses[t.id]?.completed);
                const someDone = day.tasks.some((t) => statuses[t.id]?.completed);
                const isToday = day.date === today;
                return (
                  <Link key={day.date} href={`/tagesplan/${day.date}`}>
                    <div
                      className={`p-2 rounded-lg text-center text-xs border transition-colors hover:bg-accent/50 ${
                        isToday ? "border-primary ring-1 ring-primary" : "border-border"
                      } ${allDone ? "bg-muted" : someDone ? "bg-accent/50" : ""}`}
                    >
                      <div className="font-medium">{day.day}</div>
                      <div className="text-muted-foreground">
                        {day.date.slice(8)}
                      </div>
                      {allDone && <CheckCircle2 className="h-3 w-3 mx-auto mt-1 text-primary" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
