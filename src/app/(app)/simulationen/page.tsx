"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2 } from "lucide-react";
import { SIMULATIONS } from "@/lib/plan-data";
import { useSimResults } from "@/hooks/use-storage";

export default function SimulationenPage() {
  const { results } = useSimResults();

  const mathSims = SIMULATIONS.filter((s) => s.subject === "math");
  const progSims = SIMULATIONS.filter((s) => s.subject === "prog");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Simulationen</h1>
        <p className="text-muted-foreground">Prüfungssimulationen mit Zielwerten</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Mathematik</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mathSims.map((sim) => {
            const result = results.find((r) => r.simulationId === sim.id);
            const passed = result && result.actualPercent >= sim.targetPercent;
            return (
              <Link key={sim.id} href={`/simulationen/${sim.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{sim.name}</span>
                      {result ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Target className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{sim.date}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Ziel: {sim.targetPercent}%</Badge>
                      {result && (
                        <Badge variant={passed ? "default" : "destructive"}>
                          Ergebnis: {result.actualPercent}%
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Programmieren</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {progSims.map((sim) => {
            const result = results.find((r) => r.simulationId === sim.id);
            const passed = result && result.actualPercent >= sim.targetPercent;
            return (
              <Link key={sim.id} href={`/simulationen/${sim.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{sim.name}</span>
                      {result ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Target className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{sim.date}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Ziel: {sim.targetPercent}%</Badge>
                      {result && (
                        <Badge variant={passed ? "default" : "destructive"}>
                          Ergebnis: {result.actualPercent}%
                        </Badge>
                      )}
                    </div>
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
