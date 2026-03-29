"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ClipboardCheck,
  Sparkles,
  SkipForward,
  XCircle,
} from "lucide-react";
import { PLAN_DATA, WEEKS } from "@/lib/plan-data";
import { useTaskStatuses, useCompletions } from "@/hooks/use-storage";
import { AssessmentDialog } from "@/components/self-assessment/assessment-dialog";
import { Exercise } from "@/lib/types";

const SUBJECT_STYLES = {
  math: { variant: "default" as const, label: "Mathe" },
  prog: { variant: "secondary" as const, label: "Prog" },
  sim: { variant: "outline" as const, label: "Simulation" },
};

const TYPE_LABELS: Record<string, string> = {
  diagnose: "Diagnose",
  neustoff: "Neuer Stoff",
  wiederholung: "Wiederholung",
  simulation: "Simulation",
  lueckenschluss: "Lückenschluss",
  theorie: "Theorie",
  praxis: "Praxis",
  exam: "Prüfung",
};

export default function TagesplanDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { statuses, setTaskStatus, skipTask, skipDay } = useTaskStatuses();
  const { completions } = useCompletions();
  const [assessExercise, setAssessExercise] = useState<{ exercise: Exercise; taskId: string } | null>(null);
  const [showSkipDayDialog, setShowSkipDayDialog] = useState(false);

  const dayPlan = PLAN_DATA.find((d) => d.date === date);
  const dayIndex = PLAN_DATA.findIndex((d) => d.date === date);
  const prevDate = dayIndex > 0 ? PLAN_DATA[dayIndex - 1].date : null;
  const nextDate = dayIndex < PLAN_DATA.length - 1 ? PLAN_DATA[dayIndex + 1].date : null;

  const week = WEEKS.find((w) => date >= w.start && date <= w.end);

  const dateObj = new Date(date + "T00:00:00");
  const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const formatted = `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}. ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const hasRemainingTasks = dayPlan?.tasks.some(
    (t) => !statuses[t.id]?.completed && !statuses[t.id]?.skipped
  );

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{formatted}</h1>
          {week && (
            <p className="text-sm text-muted-foreground">
              {week.label} · {week.phase}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {prevDate ? (
            <Link href={`/tagesplan/${prevDate}`}>
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            </Link>
          ) : (
            <Button variant="outline" size="icon" disabled><ChevronLeft className="h-4 w-4" /></Button>
          )}
          {nextDate ? (
            <Link href={`/tagesplan/${nextDate}`}>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </Link>
          ) : (
            <Button variant="outline" size="icon" disabled><ChevronRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>

      {/* Day type + skip-day button */}
      {dayPlan && (
        <div className="flex items-center justify-between">
          <Badge variant={dayPlan.type === "stark" ? "default" : dayPlan.type === "exam" ? "destructive" : "secondary"}>
            {dayPlan.type === "stark" ? "Starker Tag" : dayPlan.type === "leicht" ? "Leichter Tag" : "Prüfungstag"}
          </Badge>
          {hasRemainingTasks && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowSkipDayDialog(true)}
            >
              <XCircle className="h-4 w-4" />
              Tag war zu viel
            </Button>
          )}
        </div>
      )}

      {/* Tasks */}
      {dayPlan ? (
        <div className="space-y-4">
          {dayPlan.tasks.map((task) => {
            const style = SUBJECT_STYLES[task.subject];
            const isDone = statuses[task.id]?.completed;
            const isSkipped = statuses[task.id]?.skipped;
            return (
              <Card key={task.id} className={`border-l-4 ${isSkipped ? "opacity-50" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Checkbox
                        checked={isDone}
                        disabled={isSkipped}
                        onCheckedChange={(checked) =>
                          setTaskStatus(task.id, {
                            completed: !!checked,
                            completedAt: checked ? new Date().toISOString() : undefined,
                            skipped: false,
                          })
                        }
                      />
                      <Badge variant={style.variant}>{style.label}</Badge>
                      <CardTitle className={`text-base ${isDone || isSkipped ? "line-through opacity-50" : ""}`}>
                        {task.title}
                      </CardTitle>
                      {isSkipped && <Badge variant="outline" className="text-xs">Übersprungen</Badge>}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap items-center">
                      <Badge variant="secondary">{task.time}</Badge>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[task.type] || task.type}</Badge>
                      {task.isAdaptive && (
                        <Badge variant="outline">
                          <Sparkles className="h-3 w-3 mr-1" /> Adaptiv
                        </Badge>
                      )}
                      {!isDone && !isSkipped && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          title="Aufgabe überspringen"
                          onClick={() => skipTask(task, date)}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      )}
                      {isSkipped && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          title="Überspringen rückgängig"
                          onClick={() => setTaskStatus(task.id, { completed: false, skipped: false })}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!isSkipped && (
                  <CardContent className="space-y-4">
                    <p className={`text-sm text-muted-foreground ${isDone ? "line-through opacity-50" : ""}`}>
                      {task.description}
                    </p>

                    {/* Resources */}
                    {task.resources.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ressourcen</p>
                        <div className="flex flex-wrap gap-2">
                          {task.resources.map((res, i) => (
                            res.url ? (
                              <a key={i} href={res.url} target="_blank" rel="noopener noreferrer">
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent gap-1">
                                  {res.type === "book" ? <BookOpen className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                                  {res.label}
                                </Badge>
                              </a>
                            ) : (
                              <Badge key={i} variant="outline" className="gap-1">
                                <BookOpen className="h-3 w-3" />
                                {res.label}
                              </Badge>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    {task.exercises.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aufgaben</p>
                          {task.exercises.map((ex) => {
                            const completion = completions.find((c) => c.exerciseId === ex.id);
                            return (
                              <button
                                key={ex.id}
                                onClick={() => setAssessExercise({ exercise: ex, taskId: task.id })}
                                className="w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <ClipboardCheck className={`h-4 w-4 ${completion ? "text-primary" : "text-muted-foreground"}`} />
                                  <span className="text-sm">{ex.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {completion ? (
                                    <Badge variant="secondary">
                                      {Math.round(completion.percentScore * 100)}%
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Bewerten</Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">/ {ex.maxPoints} P</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg mb-2">Kein Lerntag</p>
            <p className="text-sm">Für dieses Datum sind keine Aufgaben geplant.</p>
          </CardContent>
        </Card>
      )}

      {/* Assessment Dialog */}
      {assessExercise && (
        <AssessmentDialog
          exercise={assessExercise.exercise}
          taskId={assessExercise.taskId}
          open={!!assessExercise}
          onClose={() => setAssessExercise(null)}
        />
      )}

      {/* Skip Day Dialog */}
      <Dialog open={showSkipDayDialog} onOpenChange={setShowSkipDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag überspringen?</DialogTitle>
            <DialogDescription>
              Alle noch offenen Aufgaben werden als übersprungen markiert. Der adaptive Lernplan schlägt dir vor, sie nachzuholen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowSkipDayDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (dayPlan) skipDay(dayPlan.tasks, date);
                setShowSkipDayDialog(false);
              }}
            >
              Ja, Tag überspringen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
