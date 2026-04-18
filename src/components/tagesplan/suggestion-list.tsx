"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { TaskSuggestion, UserTask } from "@/lib/types";
import { useUserTasks, useSuggestions } from "@/hooks/use-storage";

interface Props {
  date: string;
  suggestions: TaskSuggestion[];
}

const PRIORITY_STYLES: Record<
  TaskSuggestion["priority"],
  { variant: "default" | "secondary" | "outline"; label: string }
> = {
  hoch: { variant: "default", label: "Hoch" },
  mittel: { variant: "secondary", label: "Mittel" },
  niedrig: { variant: "outline", label: "Niedrig" },
};

const SUBJECT_LABELS: Record<TaskSuggestion["subject"], string> = {
  math: "Mathe",
  prog: "Prog",
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

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function SuggestionList({ date, suggestions }: Props) {
  const { addTask } = useUserTasks();
  const { dismissSuggestion, markAccepted } = useSuggestions();

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Keine Vorschläge gerade. Gut gemacht! 👌
        </CardContent>
      </Card>
    );
  }

  function accept(s: TaskSuggestion) {
    const task: UserTask = {
      id: uuid(),
      date,
      title: s.title,
      description: s.description,
      subject: s.subject,
      topicIds: s.topicIds,
      durationMinutes: s.durationMinutes,
      type: s.type,
      source: "suggestion",
      suggestionId: s.id,
      createdAt: new Date().toISOString(),
      completed: false,
      exercises: [],
      resources: [],
    };
    addTask(task);
    markAccepted(s.id);
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s) => {
        const pri = PRIORITY_STYLES[s.priority];
        return (
          <Card key={s.id} className="border-l-4 border-l-primary/40">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-medium text-sm">{s.title}</h3>
                  <Badge variant={pri.variant} className="text-xs">
                    {pri.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {SUBJECT_LABELS[s.subject]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[s.type] ?? s.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {s.durationMinutes} Min
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => accept(s)}
                    className="gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Übernehmen
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissSuggestion(s.id)}
                    title="Verwerfen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pl-6">{s.reason}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
