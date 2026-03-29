import {
  AdaptiveChange,
  AdaptiveProposal,
  ExerciseCompletion,
  PlanTask,
  SimulationResult,
  TopicMastery,
} from "../types";
import { MATH_TOPICS, PROG_TOPICS, getTopicById } from "../topics-data";
import { calculateAllMasteries } from "./mastery";
import { SIMULATIONS } from "../plan-data";

function uuid(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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

// ── Trigger D: Skipped tasks ──
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
