"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { MATH_TOPICS } from "@/lib/topics-data";
import { useMasteries } from "@/hooks/use-storage";
import { MasteryBar } from "@/components/subjects/mastery-bar";

const PRIORITY_LABELS = {
  basis: "Basis",
  mittel: "Mittel",
  hoch: "Hoch",
};

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === "improving") return <TrendingUp className="h-3 w-3 text-primary" />;
  if (trend === "declining") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function MathematikPage() {
  const { masteries } = useMasteries();

  const teilA = Object.values(MATH_TOPICS).filter((t) => t.category === "teil-a");
  const teilB = Object.values(MATH_TOPICS).filter((t) => t.category === "teil-b");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mathematik</h1>
        <p className="text-muted-foreground">HTL-Matura: 11. Mai 2026</p>
      </div>

      {/* Resources */}
      <div className="flex flex-wrap gap-2">
        <a href="https://aufgabenpool.at" target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent gap-1">
            <ExternalLink className="h-3 w-3" /> aufgabenpool.at
          </Badge>
        </a>
        <a href="https://mathago.at" target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent gap-1">
            <ExternalLink className="h-3 w-3" /> mathago.at
          </Badge>
        </a>
        <a href="https://competenz4u.at" target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent gap-1">
            <ExternalLink className="h-3 w-3" /> competenz4u.at
          </Badge>
        </a>
      </div>

      {/* Teil A */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Teil A — Grundkompetenzen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teilA.map((topic) => {
            const m = masteries[topic.id];
            return (
              <Link key={topic.id} href={`/faecher/mathematik/${topic.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">{topic.id}</Badge>
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={m?.trend} />
                        <Badge variant="secondary">{PRIORITY_LABELS[topic.priority]}</Badge>
                      </div>
                    </div>
                    <MasteryBar value={m?.currentScore ?? 0} />
                    {m ? (
                      <p className="text-xs text-muted-foreground">{m.exerciseCount} Aufgaben bearbeitet</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Noch nicht begonnen</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Teil B */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Teil B — HTL-spezifisch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teilB.map((topic) => {
            const m = masteries[topic.id];
            return (
              <Link key={topic.id} href={`/faecher/mathematik/${topic.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">{topic.id}</Badge>
                        <span className="font-medium text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={m?.trend} />
                        <Badge variant="secondary">{PRIORITY_LABELS[topic.priority]}</Badge>
                      </div>
                    </div>
                    <MasteryBar value={m?.currentScore ?? 0} />
                    {m ? (
                      <p className="text-xs text-muted-foreground">{m.exerciseCount} Aufgaben bearbeitet</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Noch nicht begonnen</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
