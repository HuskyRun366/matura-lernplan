"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, BookOpen, CheckCircle2, FlaskConical } from "lucide-react";
import { MATH_TOPICS } from "@/lib/topics-data";
import { PLAN_DATA } from "@/lib/plan-data";
import { useMasteries, useCompletions } from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";
import { MATHE_THEORIE } from "@/lib/mathe-theorie-data";

export default function MathTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const { masteries } = useMasteries();
  const { completions } = useCompletions();

  const topic = MATH_TOPICS[topicId];
  if (!topic) {
    return <div className="text-center py-12 text-muted-foreground">Thema nicht gefunden</div>;
  }

  const mastery = masteries[topicId];
  const topicCompletions = completions.filter((c) => c.topicId === topicId);
  const theorie = MATHE_THEORIE[topicId];

  const relatedExercises = PLAN_DATA.flatMap((day) =>
    day.tasks.flatMap((task) =>
      task.exercises
        .filter((ex) => ex.topicId === topicId)
        .map((ex) => ({ ...ex, date: day.date, taskTitle: task.title }))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-mono">{topic.id}</Badge>
          <Badge variant="secondary">
            {topic.category === "teil-a" ? "Teil A" : "Teil B"}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{topic.name}</h1>
      </div>

      {/* Mastery */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Mastery</span>
            <span className="text-sm text-muted-foreground">
              Ziel: {Math.round(topic.targetMastery * 100)}% · Minimum: {Math.round(topic.minMastery * 100)}%
            </span>
          </div>
          <MasteryBar value={mastery?.currentScore ?? 0} />
          {mastery && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{mastery.exerciseCount} Aufgaben</span>
              <span>Selbsteinschätzung: {mastery.selfAssessmentAvg.toFixed(1)}/5</span>
              <span>Trend: {mastery.trend === "improving" ? "steigend" : mastery.trend === "declining" ? "fallend" : "stabil"}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ressourcen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topic.resources.map((res, i) => (
            <div key={i}>
              {res.url ? (
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{res.label}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{res.label}</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Formeln & Beispiele */}
      {theorie && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Formeln &amp; Beispiele
          </h2>
          {theorie.sections.map((section, i) => (
            <Card key={i} className="border-l-4 border-l-primary/40">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">{section.heading}</h3>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-muted/50 rounded p-3 text-foreground">
                  {section.body}
                </pre>
                {section.example && (
                  <>
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">Beispiel</p>
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-primary/5 border border-primary/20 rounded p-3 text-foreground">
                      {section.example}
                    </pre>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exercises */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alle Aufgaben ({relatedExercises.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {relatedExercises.length > 0 ? (
            relatedExercises.map((ex) => {
              const completion = topicCompletions.find((c) => c.exerciseId === ex.id);
              return (
                <Link key={ex.id} href={`/tagesplan/${ex.date}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {completion ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm">{ex.label}</p>
                        <p className="text-xs text-muted-foreground">{ex.date} — {ex.taskTitle}</p>
                      </div>
                    </div>
                    {completion && (
                      <Badge variant="secondary">{Math.round(completion.percentScore * 100)}%</Badge>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Aufgaben für dieses Thema</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
