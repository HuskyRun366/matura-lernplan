"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-1
  className?: string;
}

export function MasteryBar({ value, className }: Props) {
  const percent = Math.round(value * 100);

  return (
    <div className={cn("space-y-1", className)}>
      <Progress value={percent} />
      <p className="text-xs text-muted-foreground text-right">{percent}%</p>
    </div>
  );
}
