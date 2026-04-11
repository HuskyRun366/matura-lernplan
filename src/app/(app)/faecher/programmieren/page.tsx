"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, FileText, Wrench, Network, Cpu, GitBranch, FileCode2, Zap } from "lucide-react";
import { PROG_TOPICS } from "@/lib/topics-data";
import { useMasteries } from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";
import { THEORIE_PAGES } from "@/lib/theorie-data";
import { UEBUNGEN } from "@/lib/uebungen-data";
import { cn } from "@/lib/utils";

const TOPIC_CARD_THEMES: Record<string, { border: string; badge: string; icon: React.ElementType; dot: string }> = {
  NETZWERK: { border: "border-blue-200 dark:border-blue-800/60 hover:border-blue-300", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300", icon: Network, dot: "bg-blue-500" },
  MULTITHREADING: { border: "border-purple-200 dark:border-purple-800/60 hover:border-purple-300", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300", icon: Cpu, dot: "bg-purple-500" },
  GRAPHENTHEORIE: { border: "border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", icon: GitBranch, dot: "bg-emerald-500" },
  GRAMMATIK: { border: "border-amber-200 dark:border-amber-800/60 hover:border-amber-300", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: FileCode2, dot: "bg-amber-500" },
  ALGORITHMEN: { border: "border-rose-200 dark:border-rose-800/60 hover:border-rose-300", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", icon: Zap, dot: "bg-rose-500" },
};

function getCardTheme(topicIds: string[]) {
  for (const id of topicIds) {
    if (TOPIC_CARD_THEMES[id]) return TOPIC_CARD_THEMES[id];
  }
  return { border: "hover:border-muted-foreground/30", badge: "bg-muted text-muted-foreground", icon: FileText, dot: "bg-muted-foreground" };
}

const PRIO_SECTIONS: Record<number, string> = {
  1: "Muss sitzen",
  2: "Sollte sitzen",
  3: "Verstehen + coden",
  4: "Verstehen + erklären",
};

export default function ProgrammierenPage() {
  const { masteries } = useMasteries();

  const byPriority = [1, 2, 3, 4].map((p) => ({
    priority: p,
    section: PRIO_SECTIONS[p],
    topics: Object.values(PROG_TOPICS).filter((t) => t.priority === p),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Programmieren</h1>
        <p className="text-muted-foreground">HTL-Prüfung: 4. Mai 2026</p>
      </div>

      {byPriority.map((group, gi) => (
        <div key={group.priority}>
          {gi > 0 && <Separator className="mb-6" />}
          <h2 className="text-lg font-semibold mb-3">
            {group.section}
            <Badge variant="outline" className="ml-2">Prio {group.priority}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.topics.map((topic) => {
              const m = masteries[topic.id];
              return (
                <Link key={topic.id} href={`/faecher/programmieren/${topic.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{topic.name}</span>
                        <div className="flex gap-1">
                          {topic.project && (
                            <Badge variant="outline" className="text-xs">{topic.project}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">{topic.category}</Badge>
                        </div>
                      </div>
                      <MasteryBar value={m?.currentScore ?? 0} />
                      {topic.bookChapters.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          Kap. {topic.bookChapters.join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <Separator />

      {/* Theorie-Seiten */}
      <div>
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Theorie-Seiten
        </h2>
        <p className="text-sm text-muted-foreground mb-3">Lernunterlagen aus den Schulunterlagen</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(THEORIE_PAGES).map((page) => {
            const ct = getCardTheme(page.topicIds);
            const Icon = ct.icon;
            return (
              <Link key={page.slug} href={`/faecher/programmieren/theorie/${page.slug}`}>
                <Card className={cn("hover:bg-accent/30 transition-all cursor-pointer h-full border", ct.border)}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className={cn("mt-0.5 h-4 w-4 shrink-0 rounded-sm flex items-center justify-center", ct.dot, "text-white")}>
                        <Icon className="h-2.5 w-2.5" />
                      </div>
                      <span className="font-medium text-sm leading-snug">{page.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {page.topicIds.map((id) => (
                        <span key={id} className={cn("text-xs px-2 py-0.5 rounded-full font-medium", ct.badge)}>
                          {id}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {page.sections.length} Abschnitte
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Übungen */}
      <div>
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Übungen
        </h2>
        <p className="text-sm text-muted-foreground mb-3">Praktische Programmieraufgaben aus dem Unterricht</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(UEBUNGEN).map((uebung) => (
            <Link key={uebung.slug} href={`/faecher/programmieren/uebungen/${uebung.slug}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 space-y-2">
                  <span className="font-medium text-sm">{uebung.title}</span>
                  <p className="text-xs text-muted-foreground">{uebung.subtitle}</p>
                  <div className="flex flex-wrap gap-1">
                    {uebung.topicIds.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
