import {
  AdaptiveChange,
  AdaptiveProposal,
  AdaptiveTask,
  ExerciseCompletion,
  PlanTask,
  SimulationResult,
  Subject,
} from "../types";
import { MATH_TOPICS, PROG_TOPICS, getTopicById } from "../topics-data";
import { calculateAllMasteries } from "./mastery";
import { SIMULATIONS, PLAN_DATA } from "../plan-data";

// Review tasks that count as SM-2 coverage in the plan
const SM2_COVERING_TYPES = new Set(["wiederholung", "lueckenschluss", "simulation", "praxis"]);

// Warn if SM-2 review is due within this many days and not covered in the plan
const SM2_LOOKAHEAD_DAYS = 7;

function uuid(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Signed: positive = future, negative = past
function signedDays(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
}

// ── Trigger A: After exercise completion ──
export function checkAfterExercise(
  completions: ExerciseCompletion[],
  latestCompletion: ExerciseCompletion
): AdaptiveProposal | null {
  const masteries = calculateAllMasteries(completions);
  const topicId = latestCompletion.topicId;
  const topic = getTopicById(topicId);
  if (!topic) return null;

  const mastery = masteries[topicId];
  if (!mastery) return null;

  const changes: AdaptiveChange[] = [];

  // Check if below minimum
  if (mastery.currentScore < topic.minMastery) {
    changes.push({
      type: "add_exercise",
      topicId,
      description: `${topic.name}: Mastery bei ${Math.round(mastery.currentScore * 100)}% (Minimum: ${Math.round(topic.minMastery * 100)}%). Zusätzliche Übungen empfohlen.`,
      reason: `Mastery unter Schwellenwert (${Math.round(mastery.currentScore * 100)}% < ${Math.round(topic.minMastery * 100)}%)`,
    });
  }

  // Check if declining
  if (mastery.trend === "declining" && mastery.currentScore < topic.targetMastery) {
    changes.push({
      type: "add_review_session",
      topicId,
      description: `${topic.name}: Trend fallend. Review-Session empfohlen.`,
      reason: "Fallender Trend bei Mastery-Score",
    });
  }

  // Check if well above target
  if (mastery.currentScore > topic.targetMastery + 0.10) {
    changes.push({
      type: "decrease_time",
      topicId,
      description: `${topic.name}: Mastery bei ${Math.round(mastery.currentScore * 100)}% (Ziel: ${Math.round(topic.targetMastery * 100)}%). Aufgaben können als optional markiert werden.`,
      reason: "Mastery deutlich über Ziel",
    });
  }

  if (changes.length === 0) return null;

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "exercise_completion",
    triggerDetails: `Aufgabe in ${topic.name} abgeschlossen (${Math.round(latestCompletion.percentScore * 100)}%)`,
    changes,
  };
}

// ── Trigger B: After simulation ──
export function checkAfterSimulation(
  completions: ExerciseCompletion[],
  simResult: SimulationResult
): AdaptiveProposal | null {
  const sim = SIMULATIONS.find((s) => s.id === simResult.simulationId);
  if (!sim) return null;

  const changes: AdaptiveChange[] = [];
  const gap = sim.targetPercent - simResult.actualPercent;

  // Overall gap analysis
  if (gap > 25) {
    changes.push({
      type: "activate_notfall",
      description: `Simulation ${sim.name}: ${simResult.actualPercent}% (Ziel: ${sim.targetPercent}%). Notfall-Modus empfohlen — niedrigprioritäre Themen streichen.`,
      reason: `Simulation >25% unter Ziel (${Math.round(gap)}% Gap)`,
    });
  } else if (gap > 15) {
    changes.push({
      type: "intensify_week",
      description: `Simulation ${sim.name}: ${simResult.actualPercent}% (Ziel: ${sim.targetPercent}%). +30 Min/Tag nächste Woche empfohlen.`,
      reason: `Simulation >15% unter Ziel (${Math.round(gap)}% Gap)`,
    });
  } else if (gap < -10) {
    changes.push({
      type: "grant_free_day",
      description: `Simulation ${sim.name}: ${simResult.actualPercent}% (Ziel: ${sim.targetPercent}%). Freier Halbtag verdient!`,
      reason: "Simulation >10% über Ziel",
    });
  }

  // Per-topic analysis
  const allTopics = sim.subject === "math" ? MATH_TOPICS : PROG_TOPICS;
  for (const [topicId, breakdown] of Object.entries(
    simResult.topicBreakdown
  )) {
    const topic = allTopics[topicId];
    if (!topic) continue;
    const topicPercent =
      breakdown.maxPoints > 0 ? breakdown.points / breakdown.maxPoints : 0;
    const topicGap = topic.targetMastery - topicPercent;

    if (topicGap > 0.2) {
      changes.push({
        type: "add_exercise",
        topicId,
        description: `${topic.name}: ${Math.round(topicPercent * 100)}% in Simulation (Ziel: ${Math.round(topic.targetMastery * 100)}%). Intensive Nacharbeit nötig.`,
        reason: `Großer Gap in Simulation (${Math.round(topicGap * 100)}%)`,
      });
    } else if (topicGap > 0.1) {
      changes.push({
        type: "add_review_session",
        topicId,
        description: `${topic.name}: Leicht unter Ziel in Simulation. Review empfohlen.`,
        reason: "Moderater Gap in Simulation",
      });
    }
  }

  if (changes.length === 0) return null;

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "simulation_result",
    triggerDetails: `${sim.name}: ${simResult.actualPercent}% (Ziel: ${sim.targetPercent}%)`,
    changes,
  };
}

// ── Trigger D: Auto-detected missed day ("Tag war zu viel") ──
export function checkMissedDay(
  tasks: PlanTask[],
  date: string,
  completions: ExerciseCompletion[]
): AdaptiveProposal | null {
  if (tasks.length === 0) return null;

  const masteries = calculateAllMasteries(completions);
  const changes: AdaptiveChange[] = [];
  const totalMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const topicIds = [...new Set(tasks.flatMap((t) => t.topicIds ?? []))];

  for (const topicId of topicIds) {
    const topic = getTopicById(topicId);
    if (!topic) continue;
    const mastery = masteries[topicId];
    const score = mastery?.currentScore ?? 0;

    if (score < topic.minMastery) {
      changes.push({
        type: "add_review_session",
        topicId,
        targetDate: date,
        description: `${topic.name}: Tag war zu viel — Mastery bei ${Math.round(score * 100)}% (Minimum: ${Math.round(topic.minMastery * 100)}%). Unbedingt nachholen!`,
        reason: "Tag automatisch als zu viel erkannt, Thema unter Mindest-Mastery",
      });
    } else {
      changes.push({
        type: "add_exercise",
        topicId,
        targetDate: date,
        description: `${topic.name}: Tag war zu viel — Aufgaben an einem Puffertag nachholen.`,
        reason: "Tag automatisch als zu viel erkannt",
      });
    }
  }

  changes.push({
    type: "increase_time",
    description: `${date}: Tag war zu viel (ca. ${totalMinutes} Min. ausgefallen). Tagesplan für kommende Tage entlasten oder Puffertag nutzen.`,
    reason: "Automatisch erkannter Tag ohne jede Aktivität",
  });

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "day_skipped",
    triggerDetails: `Tag war zu viel — ${date} (${tasks.length} Aufgaben nicht erledigt, ~${totalMinutes} Min.)`,
    changes,
  };
}

// ── Trigger E: Manually skipped tasks ──
export function checkAfterSkip(
  skippedTasks: PlanTask[],
  date: string,
  allSkippedTaskIds: string[],
  completions: ExerciseCompletion[]
): AdaptiveProposal | null {
  if (skippedTasks.length === 0) return null;

  const masteries = calculateAllMasteries(completions);
  const changes: AdaptiveChange[] = [];

  const totalMinutes = skippedTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const isFullDay = skippedTasks.length >= 2;

  // Collect unique topics from skipped tasks
  const skippedTopicIds = [...new Set(skippedTasks.flatMap((t) => t.topicIds ?? []))];

  for (const topicId of skippedTopicIds) {
    const topic = getTopicById(topicId);
    if (!topic) continue;
    const mastery = masteries[topicId];
    const score = mastery?.currentScore ?? 0;

    if (score < topic.minMastery) {
      changes.push({
        type: "add_review_session",
        topicId,
        targetDate: date,
        description: `${topic.name} wurde übersprungen und liegt bei ${Math.round(score * 100)}% (Minimum: ${Math.round(topic.minMastery * 100)}%). Review-Session nachholen!`,
        reason: "Übersprungene Aufgabe bei Thema unter Mindest-Mastery",
      });
    } else {
      changes.push({
        type: "add_exercise",
        topicId,
        targetDate: date,
        description: `${topic.name} wurde übersprungen. Aufgaben an einem Puffertag nachholen.`,
        reason: "Übersprungene Aufgabe",
      });
    }
  }

  if (isFullDay) {
    changes.push({
      type: "increase_time",
      description: `${date}: Ganzer Tag übersprungen (ca. ${totalMinutes} Min). Nächste Woche +30 Min/Tag einplanen oder Puffertag nutzen.`,
      reason: "Kompletter Lerntag ausgefallen",
    });
  }

  if (changes.length === 0) return null;

  const label = isFullDay
    ? `Tag übersprungen (${date}): ${skippedTasks.length} Aufgaben ausgefallen`
    : `${skippedTasks.length} Aufgabe(n) übersprungen am ${date}`;

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "day_skipped",
    triggerDetails: label,
    changes,
  };
}

// ── Trigger C: Weekly review ──
export function checkWeeklyReview(
  completions: ExerciseCompletion[],
  currentWeek: number
): AdaptiveProposal | null {
  const masteries = calculateAllMasteries(completions);
  const changes: AdaptiveChange[] = [];

  // Check all topics
  const allTopics = { ...MATH_TOPICS, ...PROG_TOPICS };

  // Identify topics below minimum that have been introduced
  for (const [topicId, topic] of Object.entries(allTopics)) {
    if (topic.weekIntroduced > currentWeek) continue;

    const mastery = masteries[topicId];
    if (!mastery) {
      // Topic introduced but no exercises done
      if (currentWeek >= topic.weekIntroduced + 1) {
        changes.push({
          type: "add_exercise",
          topicId,
          description: `${topic.name}: Noch keine Aufgaben abgeschlossen (seit Woche ${topic.weekIntroduced} im Plan). Dringend anfangen!`,
          reason: "Thema noch nicht bearbeitet",
        });
      }
      continue;
    }

    if (mastery.currentScore < topic.minMastery) {
      changes.push({
        type: "increase_time",
        topicId,
        description: `${topic.name}: Mastery bei ${Math.round(mastery.currentScore * 100)}% (Minimum: ${Math.round(topic.minMastery * 100)}%). Mehr Zeit einplanen.`,
        reason: `Unter Minimum-Schwellenwert seit Wochen-Review`,
      });
    }
  }

  // Check if all topics above target → free day possible
  const introducedTopics = Object.entries(allTopics).filter(
    ([, t]) => t.weekIntroduced <= currentWeek
  );
  const topicsAboveTarget = introducedTopics.filter(([id]) => {
    const m = masteries[id];
    return m && m.currentScore >= allTopics[id].targetMastery;
  });

  if (
    introducedTopics.length > 0 &&
    topicsAboveTarget.length / introducedTopics.length >= 0.7 &&
    !changes.some((c) => c.type === "add_exercise" || c.type === "increase_time")
  ) {
    changes.push({
      type: "grant_free_day",
      description:
        "Über 70% der Themen über Ziel-Mastery. Freier Halbtag möglich!",
      reason: "Hohe Gesamt-Performance im Wochen-Review",
    });
  }

  if (changes.length === 0) return null;

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "weekly_review",
    triggerDetails: `Wochen-Review Woche ${currentWeek}`,
    changes,
  };
}

// ── Trigger F: SM-2 next-review date not covered in plan ──
// Scans all topics with computed sm2NextReview. If the review date
// falls within SM2_LOOKAHEAD_DAYS and no suitable review task exists
// in the plan for that window, a proposal is generated.
// Deduplication: topics already covered by a pending sm2_review
// proposal are skipped.
export function checkSM2Reviews(
  completions: ExerciseCompletion[],
  existingProposals: AdaptiveProposal[],
  today: string = new Date().toISOString().split("T")[0]
): AdaptiveProposal | null {
  if (completions.length === 0) return null;

  const masteries = calculateAllMasteries(completions, today);
  const changes: AdaptiveChange[] = [];

  // Topics already waiting for a decision in an sm2_review proposal
  const pendingTopicIds = new Set(
    existingProposals
      .filter((p) => p.trigger === "sm2_review" && p.accepted === undefined)
      .flatMap((p) => p.changes.map((c) => c.topicId).filter(Boolean) as string[])
  );

  for (const [topicId, mastery] of Object.entries(masteries)) {
    if (pendingTopicIds.has(topicId)) continue;

    const topic = getTopicById(topicId);
    if (!topic) continue;

    const daysUntilReview = signedDays(today, mastery.sm2NextReview);

    // Only act when review is overdue or within the look-ahead window
    if (daysUntilReview > SM2_LOOKAHEAD_DAYS) continue;

    // Determine the search window in the plan:
    // - Overdue: look for a slot today → today+3 (as soon as possible)
    // - Upcoming: look for a slot today → sm2NextReview+2 (grace period)
    const windowStart = today;
    const windowEnd =
      daysUntilReview < 0 ? addDays(today, 3) : addDays(mastery.sm2NextReview, 2);

    const covered = PLAN_DATA.some((day) => {
      if (day.date < windowStart || day.date > windowEnd) return false;
      return day.tasks.some(
        (t) => t.topicIds.includes(topicId) && SM2_COVERING_TYPES.has(t.type)
      );
    });

    if (covered) continue;

    const isOverdue = daysUntilReview < 0;
    const urgencyLabel = isOverdue
      ? `ÜBERFÄLLIG seit ${Math.round(Math.abs(daysUntilReview))} Tag(en)`
      : `fällig in ${Math.round(daysUntilReview)} Tag(en) (${mastery.sm2NextReview})`;

    changes.push({
      type: "add_review_session",
      topicId,
      targetDate: isOverdue ? addDays(today, 1) : mastery.sm2NextReview,
      description: `${topic.name}: SM-2 Review ${urgencyLabel} — EF ${mastery.sm2EasinessFactor.toFixed(2)}, Intervall ${mastery.sm2Interval} Tage. Kein Wiederholungstag im Plan gefunden. Puffertag oder leichten Tag nutzen.`,
      reason: `SM-2 Next Review: ${mastery.sm2NextReview}${isOverdue ? " (überfällig)" : ""}`,
    });
  }

  if (changes.length === 0) return null;

  const overdueCount = changes.filter((c) => c.reason.includes("überfällig")).length;
  const triggerDetails =
    overdueCount > 0
      ? `SM-2: ${overdueCount} überfällige + ${changes.length - overdueCount} bald fällige Review(s) ohne Planabdeckung`
      : `SM-2: ${changes.length} Review(s) in den nächsten ${SM2_LOOKAHEAD_DAYS} Tagen ohne geplante Wiederholung`;

  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    trigger: "sm2_review",
    triggerDetails,
    changes,
  };
}

// ── Apply accepted proposal → create AdaptiveTasks ───────────────
// For changes of type add_exercise / add_review_session:
//   Finds the next available day from today that is not an exam and
//   that doesn't already have an adaptive task for the same topic.
//   Prefers "leicht" days; falls back to any non-exam day.
// Other change types (informational) produce no tasks.
export function buildAdaptiveTasks(
  proposal: AdaptiveProposal,
  existingTasks: AdaptiveTask[],
  today: string = new Date().toISOString().split("T")[0]
): AdaptiveTask[] {
  const created: AdaptiveTask[] = [];

  for (const change of proposal.changes) {
    if (change.type !== "add_exercise" && change.type !== "add_review_session") continue;
    if (!change.topicId) continue;

    const topic = getTopicById(change.topicId);
    if (!topic) continue;

    const subject: Subject = change.topicId in MATH_TOPICS ? "math" : "prog";

    // Determine candidate days: from tomorrow, within the plan, not exam
    const candidates = PLAN_DATA.filter(
      (d) => d.date > today && d.type !== "exam"
    );

    // Prefer leicht days that don't already have this topic as adaptive task
    const alreadyScheduledDates = new Set(
      [...existingTasks, ...created]
        .filter((t) => t.topicId === change.topicId)
        .map((t) => t.date)
    );

    const preferred = candidates.find(
      (d) => d.type === "leicht" && !alreadyScheduledDates.has(d.date)
    );
    const fallback = candidates.find((d) => !alreadyScheduledDates.has(d.date));
    const targetDay = preferred ?? fallback;
    if (!targetDay) continue;

    const isReview = change.type === "add_review_session";
    created.push({
      id: uuid(),
      date: targetDay.date,
      topicId: change.topicId,
      topicName: topic.name,
      subject,
      title: isReview ? `Review: ${topic.name}` : `Nachholaufgabe: ${topic.name}`,
      description: isReview
        ? `Wiederholung von ${topic.name} — Schwächste Stellen gezielt üben. Vom adaptiven System empfohlen.`
        : `Nachholaufgabe ${topic.name} — übersprungene Inhalte aufholen. Vom adaptiven System empfohlen.`,
      durationMinutes: isReview ? 30 : 45,
      type: isReview ? "wiederholung" : "lueckenschluss",
      proposalId: proposal.id,
      createdAt: new Date().toISOString(),
      completed: false,
    });
  }

  return created;
}
