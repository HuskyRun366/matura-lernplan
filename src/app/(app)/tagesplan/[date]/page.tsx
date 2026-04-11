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
  RotateCcw,
  Zap,
  Coffee,
} from "lucide-react";
import { PLAN_DATA, WEEKS } from "@/lib/plan-data";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { PlanTask } from "@/lib/types";
import { useTaskStatuses, useCompletions, useAdaptiveTasks, useAdaptiveOverrides } from "@/hooks/use-storage";

function isLowPriorityTask(task: PlanTask): boolean {
  if (task.topicIds.length === 0) return false;
  return task.topicIds.every((id) => {
    const mt = MATH_TOPICS[id];
    if (mt) return mt.priority === "basis" || mt.priority === "mittel";
    const pt = PROG_TOPICS[id];
    if (pt) return pt.priority >= 3;
    return false;
  });
}
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
  const { completions, refresh: refreshCompletions } = useCompletions();
  const { tasks: adaptiveTasks, completeTask: completeAdaptiveTask, uncompleteTask: uncompleteAdaptiveTask } = useAdaptiveTasks();
  const { overrides } = useAdaptiveOverrides();
  const dayAdaptiveTasks = adaptiveTasks.filter((t) => t.date === date);
  const [assessExercise, setAssessExercise] = useState<{ exercise: Exercise; taskId: string } | null>(null);
  const [showSkipDayDialog, setShowSkipDayDialog] = useState(false);

  const dayPlan = PLAN_DATA.find((d) => d.date === date);
  const dayIndex = PLAN_DATA.findIndex((d) => d.date === date);
  const prevDate = dayIndex > 0 ? PLAN_DATA[dayIndex - 1].date : null;
  const nextDate = dayIndex < PLAN_DATA.length - 1 ? PLAN_DATA[dayIndex + 1].date : null;

  // Collect carried-over tasks from past days (not completed, marked carriedOver)
  const carriedOverTasks = PLAN_DATA
    .filter((d) => d.date < date)
    .flatMap((d) =>
      d.tasks
        .filter((t) => statuses[t.id]?.carriedOver && !statuses[t.id]?.completed)
        .map((t) => ({ ...t, originalDate: d.date, originalDay: d.day }))
    );

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

      {/* Notfall-Modus Banner */}
      {overrides.notfallMode && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive bg-destructive/10">
          <Zap className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            Notfall-Modus aktiv — Fokus nur auf Kernthemen (Priorität &quot;hoch&quot;). Optionale Aufgaben überspringen.
          </p>
        </div>
      )}

      {/* Freier Halbtag Banner */}
      {overrides.freeDays.includes(date) && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/50 bg-green-500/10">
          <Coffee className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            Freier Halbtag — gut gemacht! Der adaptive Lernplan hat dir diesen Tag freigestellt. Aufgaben sind optional.
          </p>
        </div>
      )}

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

      {/* Carried-over tasks from missed days */}
      {carriedOverTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-yellow-500" />
            <h2 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">
              Nachzuholen ({carriedOverTasks.length})
            </h2>
            <p className="text-xs text-muted-foreground">— von vergangenen Tagen</p>
          </div>
          {carriedOverTasks.map((task) => {
            const style = SUBJECT_STYLES[task.subject];
            const isDone = statuses[task.id]?.completed;
            const originalDateObj = new Date(task.originalDate + "T00:00:00");
            const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
            const originalLabel = `${task.originalDay} ${originalDateObj.getDate()}. ${monthNames[originalDateObj.getMonth()]}`;
            return (
              <Card key={task.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Checkbox
                        checked={!!isDone}
                        onCheckedChange={(checked) =>
                          setTaskStatus(task.id, {
                            completed: !!checked,
                            completedAt: checked ? new Date().toISOString() : undefined,
                            skipped: false,
                            carriedOver: !checked,
                          })
                        }
                      />
                      <Badge variant={style.variant}>{style.label}</Badge>
                      <CardTitle className={`text-base ${isDone ? "line-through opacity-50" : ""}`}>
                        {task.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400">
                        von {originalLabel}
                      </Badge>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <Badge variant="secondary">{task.time}</Badge>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[task.type] || task.type}</Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        title="Doch überspringen"
                        onClick={() => setTaskStatus(task.id, { completed: false, skipped: true, carriedOver: false })}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {!isDone && (
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    {task.resources.length > 0 && (
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
                    )}
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
                                  {ex.url && (
                                    ex.url.startsWith("/") ? (
                                      <Link
                                        href={ex.url}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                      >
                                        <BookOpen className="h-3 w-3" />
                                      </Link>
                                    ) : (
                                      <a
                                        href={ex.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {completion ? (
                                    <Badge variant="secondary">{Math.round(completion.percentScore * 100)}%</Badge>
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
          <Separator />
        </div>
      )}

      {/* Tasks */}
      {dayPlan ? (
        <div className="space-y-4">
          {dayPlan.tasks.map((task) => {
            const style = SUBJECT_STYLES[task.subject];
            const isDone = statuses[task.id]?.completed;
            const isSkipped = statuses[task.id]?.skipped;
            const isOptional = overrides.notfallMode && isLowPriorityTask(task);
            return (
              <Card key={task.id} className={`border-l-4 ${isSkipped ? "opacity-50" : ""} ${isOptional ? "opacity-60" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Checkbox
                        checked={!!isDone}
                        disabled={!!isSkipped}
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
                      {isOptional && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">Optional</Badge>
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
                                  {ex.url && (
                                    ex.url.startsWith("/") ? (
                                      <Link
                                        href={ex.url}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                      >
                                        <BookOpen className="h-3 w-3" />
                                      </Link>
                                    ) : (
                                      <a
                                        href={ex.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )
                                  )}
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

      {/* Adaptive tasks for this day */}
      {dayAdaptiveTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-primary">Adaptiv hinzugefügt ({dayAdaptiveTasks.length})</h2>
            <p className="text-xs text-muted-foreground">— vom Lernalgorithmus empfohlen</p>
          </div>
          {dayAdaptiveTasks.map((t) => (
            <Card key={t.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Checkbox
                      checked={!!t.completed}
                      onCheckedChange={(checked) => checked ? completeAdaptiveTask(t.id) : uncompleteAdaptiveTask(t.id)}
                    />
                    <Badge variant={t.subject === "math" ? "default" : "secondary"}>
                      {t.subject === "math" ? "Mathe" : "Prog"}
                    </Badge>
                    <CardTitle className={`text-base ${t.completed ? "line-through opacity-50" : ""}`}>
                      {t.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">
                    <Badge variant="secondary">{t.durationMinutes} Min</Badge>
                    <Badge variant="outline" className="text-xs">{t.type === "wiederholung" ? "Wiederholung" : "Lückenschluss"}</Badge>
                  </div>
                </div>
              </CardHeader>
              {!t.completed && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  {t.proposalTrigger && (
                    <p className="text-xs text-muted-foreground/60 mt-1 italic">Auslöser: {t.proposalTrigger}</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
          <Separator />
        </div>
      )}

      {/* Assessment Dialog */}
      {assessExercise && (
        <AssessmentDialog
          exercise={assessExercise.exercise}
          taskId={assessExercise.taskId}
          open={!!assessExercise}
          onClose={() => { setAssessExercise(null); refreshCompletions(); }}
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
