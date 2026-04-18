"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CategoryProgress } from "@/lib/progress/aggregate";

const TREND_ICON = {
  improving: <TrendingUp className="h-3.5 w-3.5 text-green-500" />,
  declining: <TrendingDown className="h-3.5 w-3.5 text-destructive" />,
  stable: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

const TREND_LABEL = {
  improving: "steigend",
  declining: "fallend",
  stable: "stabil",
};

export function CategoryProgressList({
  categories,
}: {
  categories: CategoryProgress[];
}) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const pct = Math.round(cat.avgMastery * 100);
        return (
          <Card key={cat.id}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{cat.label}</span>
                  <Badge variant="outline" className="text-xs gap-1">
                    {TREND_ICON[cat.trend]}
                    {TREND_LABEL[cat.trend]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {cat.topicsAtTarget} / {cat.totalTopics} am Ziel
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
              </div>
              <Progress value={pct} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
