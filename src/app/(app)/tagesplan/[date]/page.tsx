"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ClipboardCheck,
  Sparkles,
  EyeOff,
  Eye,
} from "lucide-react";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { UserTask, TaskSubject, Exercise } from "@/lib/types";
import {
  useUserTasks,
  useCompletions,
  useAutoSuggestions,
  usePlanConfig,
} from "@/hooks/use-storage";
import { AddTaskDialog } from "@/components/tagesplan/add-task-dialog";
import { SuggestionList } from "@/components/tagesplan/suggestion-list";
import { AssessmentDialog } from "@/components/self-assessment/assessment-dialog";
import { daysUntil } from "@/lib/suggestions/generator";

const SUBJECT_STYLES: Record<
  TaskSubject,
  { variant: "default" | "secondary" | "outline"; label: string }
> = {
  math: { variant: "default", label: "Mathe" },
  prog: { variant: "secondary", label: "Prog" },
  sim: { variant: "outline", label: "Simulation" },
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

function shiftDate(date: string, days: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function topicName(id: string): string {
  return MATH_TOPICS[id]?.name ?? PROG_TOPICS[id]?.name ?? id;
}

export default function TagesplanDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { config } = usePlanConfig();
  const { tasksForDate, toggleComplete, deleteTask } = useUserTasks();
  const { completions, refresh: refreshCompletions } = useCompletions();
  const {
    suggestions,
    ready: sugReady,
  } = useAutoSuggestions(date);

  const [addOpen, setAddOpen] = useState(false);
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const [assessExercise, setAssessExercise] = useState<
    { exercise: Exercise; taskId: string; taskType?: UserTask["type"] } | null
  >(null);

  const tasks = tasksForDate(date);
  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);

  const dateObj = new Date(date + "T00:00:00");
  const dayNames = [
    "Sonntag", "Montag", "Dienstag", "Mittwoch",
    "Donnerstag", "Freitag", "Samstag",
  ];
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  const formatted = `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}. ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0);
  const doneMinutes = tasks
    .filter((t) => t.completed)
    .reduce((s, t) => s + t.durationMinutes, 0);

  const progDays = config ? daysUntil(config.progExamDate, date) : null;
  const mathDays = config ? daysUntil(config.mathExamDate, date) : null;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{formatted}</h1>
          {config && (
            <p className="text-sm text-muted-foreground">
              {progDays !== null && progDays >= 0 && `${progDays} Tage bis Prog`}
              {progDays !== null && progDays >= 0 && mathDays !== null && mathDays >= 0 && " · "}
              {mathDays !== null && mathDays >= 0 && `${mathDays} Tage bis Mathe`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/tagesplan/${prevDate}`}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/tagesplan/${nextDate}`}>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Tages-Summary */}
      {tasks.length > 0 && (
        <Card>
          <CardContent className="py-4 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">
                {completedCount} / {tasks.length}
              </span>{" "}
              Aufgaben erledigt
            </div>
            <div className="text-muted-foreground">
              {doneMinutes} / {totalMinutes} Min
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deine Aufgaben */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Deine Aufgaben
          </h2>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Eigene Aufgabe
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Noch keine Aufgaben für diesen Tag. Füge eine eigene hinzu — oder
              übernimm einen Vorschlag unten.
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
            const style = SUBJECT_STYLES[task.subject];
            return (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          toggleComplete(task.id, !!checked)
                        }
                      />
                      <Badge variant={style.variant}>{style.label}</Badge>
                      <CardTitle
                        className={`text-base ${
                          task.completed ? "line-through opacity-50" : ""
                        }`}
                      >
                        {task.title}
                      </CardTitle>
                      {task.source === "suggestion" && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Sparkles className="h-3 w-3" /> Vorschlag
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <Badge variant="secondary">{task.durationMinutes} Min</Badge>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[task.type] ?? task.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                        title="Aufgabe löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  {task.topicIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.topicIds.map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {id} {topicName(id).length > 20
                            ? topicName(id).slice(0, 20) + "…"
                            : topicName(id)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {task.exercises.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Aufgaben
                        </p>
                        {task.exercises.map((ex) => {
                          const completion = completions.find(
                            (c) => c.exerciseId === ex.id
                          );
                          return (
                            <button
                              key={ex.id}
                              onClick={() =>
                                setAssessExercise({
                                  exercise: ex,
                                  taskId: task.id,
                                  taskType: task.type,
                                })
                              }
                              className="w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <ClipboardCheck
                                  className={`h-4 w-4 ${
                                    completion ? "text-primary" : "text-muted-foreground"
                                  }`}
                                />
                                <span className="text-sm">{ex.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {completion ? (
                                  <Badge variant="secondary">
                                    {Math.round(completion.percentScore * 100)}%
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Bewerten
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  / {ex.maxPoints} P
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Vorschläge */}
      {sugReady && config?.suggestionsEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Vorschläge
              <span className="font-normal normal-case text-xs text-muted-foreground">
                (optional)
              </span>
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHideSuggestions((v) => !v)}
              className="gap-1 text-xs"
            >
              {hideSuggestions ? (
                <>
                  <Eye className="h-3.5 w-3.5" /> Einblenden
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Ausblenden
                </>
              )}
            </Button>
          </div>
          {!hideSuggestions && (
            <SuggestionList date={date} suggestions={suggestions} />
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddTaskDialog
        date={date}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      {assessExercise && (
        <AssessmentDialog
          exercise={assessExercise.exercise}
          taskId={assessExercise.taskId}
          taskType={assessExercise.taskType}
          open={!!assessExercise}
          onClose={() => {
            setAssessExercise(null);
            refreshCompletions();
          }}
        />
      )}
    </div>
  );
}
