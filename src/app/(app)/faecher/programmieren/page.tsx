"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";
import { PROG_TOPICS } from "@/lib/topics-data";
import { useMasteries } from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";

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
    </div>
  );
}
