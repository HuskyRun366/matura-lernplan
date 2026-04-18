import {
  UserPlanConfig,
  UserTask,
  TaskSuggestion,
  TopicMastery,
  ExerciseCompletion,
  SuggestionReasonKind,
  Subject,
  TaskType,
} from "../types";
import { MATH_TOPICS, PROG_TOPICS } from "../topics-data";
import { SIMULATIONS } from "../plan-data";

// ═══════════════════════════════════════════════════════════════════
// Suggestion Generator — macht der App vorgeschlagene Aufgaben pro Tag
// verfügbar. Der Nutzer kann sie „Übernehmen" (→ UserTask) oder
// verwerfen. Keine erzwungene Aktion, rein optional.
// ═══════════════════════════════════════════════════════════════════

function uuid(): string {
  return (
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
  );
}

function topicSubject(topicId: string): Subject | null {
  if (MATH_TOPICS[topicId]) return "math";
  if (PROG_TOPICS[topicId]) return "prog";
  return null;
}

function topicName(topicId: string): string {
  return (MATH_TOPICS[topicId]?.name ?? PROG_TOPICS[topicId]?.name ?? topicId);
}

function topicPriorityRank(topicId: string): number {
  const m = MATH_TOPICS[topicId];
  if (m) return m.priority === "hoch" ? 0 : m.priority === "mittel" ? 1 : 2;
  const p = PROG_TOPICS[topicId];
  if (p) return p.priority - 1; // 1..4 → 0..3
  return 3;
}

interface GenerateInput {
  date: string;                                     // ISO
  today: string;                                    // ISO
  config: UserPlanConfig;
  masteries: Record<string, TopicMastery>;
  completions: ExerciseCompletion[];
  existingTasksForDate: UserTask[];
}

export function generateSuggestionsForDate(
  input: GenerateInput
): TaskSuggestion[] {
  const { date, today, config, masteries, completions, existingTasksForDate } = input;
  if (!config.suggestionsEnabled) return [];

  const suggestions: TaskSuggestion[] = [];
  const usedTopicIds = new Set(
    existingTasksForDate.flatMap((t) => t.topicIds)
  );

  const progDays = daysBetween(today, config.progExamDate);
  const mathDays = daysBetween(today, config.mathExamDate);
  const examCloseMath = mathDays >= 0 && mathDays <= 14;
  const examCloseProg = progDays >= 0 && progDays <= 14;

  const push = (args: {
    topicIds: string[];
    subject: Subject;
    durationMinutes: number;
    type: TaskType;
    priority: "hoch" | "mittel" | "niedrig";
    reasonKind: SuggestionReasonKind;
    reason: string;
    title?: string;
    description?: string;
  }) => {
    const primary = args.topicIds[0];
    const name = topicName(primary);
    suggestions.push({
      id: uuid(),
      date,
      title: args.title ?? `${primary} — ${name}`,
      description: args.description ?? args.reason,
      subject: args.subject,
      topicIds: args.topicIds,
      durationMinutes: args.durationMinutes,
      type: args.type,
      priority: args.priority,
      reasonKind: args.reasonKind,
      reason: args.reason,
      createdAt: new Date().toISOString(),
      dismissed: false,
      accepted: false,
    });
  };

  // ── 1. Noch nicht begonnene Themen (aus allen Topics) ──
  //    Falls für ein Topic noch keine Completion existiert, schlage eine
  //    Diagnose vor. Limitiert auf die 3 höchsten Prioritäten, die auf
  //    diesem Datum noch nicht gewählt wurden.
  const allTopicIds = [
    ...Object.keys(MATH_TOPICS),
    ...Object.keys(PROG_TOPICS),
  ];
  const studiedTopicIds = new Set(completions.map((c) => c.topicId));
  const untouched = allTopicIds
    .filter((id) => !studiedTopicIds.has(id) && !usedTopicIds.has(id))
    .sort((a, b) => topicPriorityRank(a) - topicPriorityRank(b))
    .slice(0, 3);

  for (const id of untouched) {
    const subject = topicSubject(id);
    if (!subject) continue;
    push({
      topicIds: [id],
      subject,
      durationMinutes: 30,
      type: "diagnose",
      priority: topicPriorityRank(id) === 0 ? "hoch" : "mittel",
      reasonKind: "not_started",
      reason: `Für ${topicName(id)} gibt es noch keine Bewertungen. Eine kurze Einstiegs-Übung zeigt dir dein aktuelles Niveau.`,
      title: `Diagnose: ${topicName(id)}`,
      description: `Starte mit einer kurzen Einstiegs-Übung zu ${topicName(id)}, um dein aktuelles Niveau einzuschätzen.`,
    });
  }

  // ── 2. Unter Min-Niveau ──
  for (const [topicId, m] of Object.entries(masteries)) {
    if (usedTopicIds.has(topicId)) continue;
    const mt = MATH_TOPICS[topicId];
    const pt = PROG_TOPICS[topicId];
    const minMastery = mt?.minMastery ?? pt?.minMastery ?? 0.6;
    if (m.currentScore >= minMastery) continue;
    const subject = topicSubject(topicId);
    if (!subject) continue;
    if (examCloseMath && subject === "prog" && !examCloseProg) continue;
    push({
      topicIds: [topicId],
      subject,
      durationMinutes: 45,
      type: "lueckenschluss",
      priority: "hoch",
      reasonKind: "below_min",
      reason: `Aktuelle Mastery ${Math.round(m.currentScore * 100)}% liegt unter Minimum ${Math.round(
        minMastery * 100
      )}%.`,
      title: `Lückenschluss: ${topicName(topicId)}`,
    });
  }

  // ── 3. Trend fallend ──
  for (const [topicId, m] of Object.entries(masteries)) {
    if (usedTopicIds.has(topicId)) continue;
    if (suggestions.some((s) => s.topicIds.includes(topicId))) continue;
    if (m.trend !== "declining") continue;
    const subject = topicSubject(topicId);
    if (!subject) continue;
    push({
      topicIds: [topicId],
      subject,
      durationMinutes: 30,
      type: "wiederholung",
      priority: "mittel",
      reasonKind: "trend_declining",
      reason: `Fallender Trend (${(m.trendDelta * 100).toFixed(1)}% gegenüber der Vorwoche).`,
      title: `Wiederholung: ${topicName(topicId)}`,
    });
  }

  // ── 4. SM-2 Review fällig ──
  for (const [topicId, m] of Object.entries(masteries)) {
    if (usedTopicIds.has(topicId)) continue;
    if (suggestions.some((s) => s.topicIds.includes(topicId))) continue;
    const dueDelta = daysBetween(date, m.sm2NextReview);
    if (dueDelta > 0) continue; // nicht heute fällig
    const subject = topicSubject(topicId);
    if (!subject) continue;
    push({
      topicIds: [topicId],
      subject,
      durationMinutes: 25,
      type: "wiederholung",
      priority: dueDelta < -3 ? "hoch" : "mittel",
      reasonKind: "sm2_review_due",
      reason:
        dueDelta < 0
          ? `SM-2 Review überfällig seit ${Math.abs(dueDelta)} Tag(en).`
          : `SM-2 Review heute fällig (Intervall ${m.sm2Interval}T).`,
      title: `Review: ${topicName(topicId)}`,
    });
  }

  // ── 5. Simulation-Vorschlag ──
  //   Wenn auf diesem Datum eine Simulation laut SIMULATIONS liegt, oder
  //   jeden Samstag in den letzten 14 Tagen vor der Mathe-Prüfung.
  const simOnDate = SIMULATIONS.find((s) => s.date === date);
  const weekday = new Date(date + "T00:00:00").getDay(); // 0=So, 6=Sa
  const isSaturdayBeforeMath = weekday === 6 && mathDays >= 0 && mathDays <= 21;
  if ((simOnDate || isSaturdayBeforeMath) && !suggestions.some((s) => s.type === "simulation")) {
    const subject: Subject = simOnDate?.subject ?? "math";
    const topicIds =
      subject === "math"
        ? Object.keys(MATH_TOPICS).slice(0, 5)
        : Object.keys(PROG_TOPICS).slice(0, 3);
    push({
      topicIds,
      subject,
      durationMinutes: 150,
      type: "simulation",
      priority: "hoch",
      reasonKind: "simulation_due",
      reason: simOnDate
        ? `Geplante Simulation: ${simOnDate.name} (Ziel ${simOnDate.targetPercent}%).`
        : `Samstag in der Prüfungsvorbereitung — gute Gelegenheit für eine Proberechnung.`,
      title: simOnDate ? simOnDate.name : "Übungs-Simulation (Mathe)",
      description: simOnDate
        ? `${simOnDate.name}: 2,5h rechnen, 0,5h Nachanalyse. Jede Aufgabe bewerten.`
        : "Nimm dir 2–3 Stunden für eine zusammenhängende Übungs-Simulation und bewerte die Aufgaben ehrlich.",
    });
  }

  // ── 6. Sortierung & Kappung ──
  const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return suggestions.slice(0, 6);
}

// ── Prüfungsfenster-Helfer für UI ──
export function daysUntil(target: string, from: string = new Date().toISOString().split("T")[0]): number {
  return daysBetween(from, target);
}
