"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Exercise,
  SelfRating,
  Confidence,
  SELF_RATING_LABELS,
  CONFIDENCE_LABELS,
  ExerciseCompletion,
} from "@/lib/types";
import { useCompletions } from "@/hooks/use-storage";
import { AlertTriangle } from "lucide-react";

interface Props {
  exercise: Exercise;
  taskId: string;
  open: boolean;
  onClose: () => void;
}

export function AssessmentDialog({ exercise, taskId, open, onClose }: Props) {
  const { completions, addCompletion } = useCompletions();
  const existing = completions.find((c) => c.exerciseId === exercise.id);

  const [points, setPoints] = useState(existing?.pointsAchieved?.toString() ?? "");
  const [selfRating, setSelfRating] = useState<SelfRating>(existing?.selfAssessment ?? 3);
  const [confidence, setConfidence] = useState<Confidence>(existing?.confidence ?? "teilweise");
  const [timeSpent, setTimeSpent] = useState(existing?.timeSpentMinutes?.toString() ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [proposal, setProposal] = useState<string | null>(null);

  function handleSubmit() {
    const achieved = parseFloat(points) || 0;
    const percent = exercise.maxPoints > 0 ? achieved / exercise.maxPoints : 0;

    const completion: ExerciseCompletion = {
      id: existing?.id ?? `comp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      exerciseId: exercise.id,
      taskId,
      topicId: exercise.topicId,
      subject: exercise.subject,
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      pointsAchieved: achieved,
      pointsMax: exercise.maxPoints,
      percentScore: Math.min(1, Math.max(0, percent)),
      selfAssessment: selfRating,
      confidence,
      timeSpentMinutes: timeSpent ? parseInt(timeSpent) : undefined,
      notes: notes || undefined,
    };

    const adaptiveResult = addCompletion(completion);
    if (adaptiveResult) {
      setProposal(adaptiveResult.changes.map((c) => c.description).join("\n"));
    } else {
      onClose();
    }
  }

  if (proposal) {
    return (
      <Dialog open={open} onOpenChange={() => { setProposal(null); onClose(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Adaptiver Hinweis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground whitespace-pre-line">{proposal}</p>
            <p className="text-xs text-muted-foreground">
              Du findest alle Vorschläge im Dashboard unter &quot;Adaptive Vorschläge&quot;.
            </p>
            <Button className="w-full" onClick={() => { setProposal(null); onClose(); }}>
              Verstanden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{exercise.label}</DialogTitle>
          <p className="text-sm text-muted-foreground">Thema: {exercise.topicId} &middot; Max: {exercise.maxPoints} Punkte</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Points */}
          <div className="space-y-2">
            <Label>Erreichte Punkte</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={exercise.maxPoints}
                step={0.5}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-24"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">/ {exercise.maxPoints}</span>
            </div>
          </div>

          {/* Self Assessment */}
          <div className="space-y-2">
            <Label>Selbsteinschätzung</Label>
            <RadioGroup
              value={selfRating.toString()}
              onValueChange={(v) => setSelfRating(parseInt(v) as SelfRating)}
              className="space-y-1"
            >
              {([1, 2, 3, 4, 5] as SelfRating[]).map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r.toString()} id={`rating-${r}`} />
                  <Label htmlFor={`rating-${r}`} className="text-sm font-normal cursor-pointer">
                    {r} — {SELF_RATING_LABELS[r]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <Label>Wie sicher warst du?</Label>
            <div className="flex flex-wrap gap-2">
              {(["sicher", "teilweise", "unsicher", "geraten"] as Confidence[]).map((c) => (
                <Badge
                  key={c}
                  variant={confidence === c ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setConfidence(c)}
                >
                  {CONFIDENCE_LABELS[c]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Zeitaufwand (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-24"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">Minuten</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notizen (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Ankreuzfragen geraten bei A5..."
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button className="w-full" onClick={handleSubmit}>
            {existing ? "Bewertung aktualisieren" : "Bewertung speichern"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
