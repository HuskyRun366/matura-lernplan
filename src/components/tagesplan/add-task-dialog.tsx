"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MATH_TOPICS, PROG_TOPICS } from "@/lib/topics-data";
import { UEBUNGEN } from "@/lib/uebungen-data";
import { SIMULATIONS } from "@/lib/plan-data";
import { useUserTasks } from "@/hooks/use-storage";
import { TaskSubject, TaskType, UserTask } from "@/lib/types";

interface Props {
  date: string;
  open: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS: Array<{ value: TaskType; label: string }> = [
  { value: "neustoff", label: "Neuer Stoff" },
  { value: "wiederholung", label: "Wiederholung" },
  { value: "praxis", label: "Praxis" },
  { value: "theorie", label: "Theorie" },
  { value: "diagnose", label: "Diagnose" },
  { value: "lueckenschluss", label: "Lückenschluss" },
  { value: "simulation", label: "Simulation" },
];

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type PresetKind = "uebung" | "sim";
interface Preset {
  key: string;
  label: string;
  kind: PresetKind;
}

const PRESETS: Preset[] = [
  ...Object.values(UEBUNGEN).map<Preset>((u) => ({
    key: `uebung:${u.slug}`,
    label: `Übung — ${u.title}`,
    kind: "uebung",
  })),
  ...SIMULATIONS.map<Preset>((s) => ({
    key: `sim:${s.id}`,
    label: `Simulation — ${s.name} (${s.subject === "math" ? "Mathe" : "Prog"})`,
    kind: "sim",
  })),
];

export function AddTaskDialog({ date, open, onClose }: Props) {
  const { addTask } = useUserTasks();
  const [preset, setPreset] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState<TaskSubject>("math");
  const [duration, setDuration] = useState(45);
  const [type, setType] = useState<TaskType>("neustoff");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  function applyPreset(value: string) {
    setPreset(value);
    if (!value) return;
    const [kind, key] = value.split(":");
    if (kind === "uebung") {
      const u = UEBUNGEN[key];
      if (!u) return;
      setTitle(u.title);
      setDescription(u.description);
      setSubject("prog");
      setType("praxis");
      setDuration(90);
      setSelectedTopics(u.topicIds);
    } else if (kind === "sim") {
      const s = SIMULATIONS.find((x) => x.id === key);
      if (!s) return;
      setTitle(s.name);
      setDescription(
        `Prüfungssimulation (${s.subject === "math" ? "Mathe" : "Prog"}) — Ziel ${s.targetPercent}%.`
      );
      setSubject("sim");
      setType("simulation");
      setDuration(150);
      setSelectedTopics([]);
    }
  }

  const availableTopics =
    subject === "math"
      ? Object.values(MATH_TOPICS)
      : subject === "prog"
      ? Object.values(PROG_TOPICS)
      : [...Object.values(MATH_TOPICS), ...Object.values(PROG_TOPICS)];

  function reset() {
    setPreset("");
    setTitle("");
    setDescription("");
    setSubject("math");
    setDuration(45);
    setType("neustoff");
    setSelectedTopics([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || duration <= 0) return;

    const task: UserTask = {
      id: uuid(),
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      subject,
      topicIds: selectedTopics,
      durationMinutes: duration,
      type,
      source: "user",
      createdAt: new Date().toISOString(),
      completed: false,
      exercises: [],
      resources: [],
    };
    addTask(task);
    reset();
    onClose();
  }

  function toggleTopic(id: string) {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Eigene Aufgabe hinzufügen</DialogTitle>
          <DialogDescription>
            Lege selbst fest, was du heute machen willst. Die App schlägt dazu
            ergänzend passende Aufgaben vor, du kannst aber auch alles selbst
            eintragen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-preset">Vordefiniert (optional)</Label>
            <select
              id="t-preset"
              value={preset}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">— Eigene Aufgabe erstellen —</option>
              <optgroup label="Programmier-Übungen">
                {PRESETS.filter((p) => p.kind === "uebung").map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Simulationen">
                {PRESETS.filter((p) => p.kind === "sim").map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-muted-foreground">
              Wähle eine vordefinierte Übung oder Simulation — Felder unten
              werden automatisch befüllt und können noch angepasst werden.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-title">Titel</Label>
            <Input
              id="t-title"
              placeholder="z.B. Vektoren — 3 Aufgaben aus Teil B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Beschreibung (optional)</Label>
            <Textarea
              id="t-desc"
              placeholder="Was genau willst du machen?"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="t-subject">Fach</Label>
              <select
                id="t-subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value as TaskSubject);
                  setSelectedTopics([]);
                }}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="math">Mathematik</option>
                <option value="prog">Programmieren</option>
                <option value="sim">Simulation</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-type">Art</Label>
              <select
                id="t-type"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-duration">Geplante Dauer: {duration} Minuten</Label>
            <input
              id="t-duration"
              type="range"
              min={15}
              max={240}
              step={15}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Themen (optional)</Label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-md border border-input">
              {availableTopics.map((t) => (
                <Badge
                  key={t.id}
                  variant={selectedTopics.includes(t.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTopic(t.id)}
                >
                  {t.id} {t.name.length > 22 ? t.name.slice(0, 22) + "…" : t.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Hinzufügen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
