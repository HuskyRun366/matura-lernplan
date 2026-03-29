import { ExerciseCompletion, TopicMastery, Trend } from "../types";

const DECAY_LAMBDA = 0.1; // half-life ~7 days
const SCORE_WEIGHT = 0.7;
const SELF_WEIGHT = 0.3;
const GUESS_PENALTY = 0.3;

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.abs(da - db) / (1000 * 60 * 60 * 24);
}

function decayWeight(daysSince: number): number {
  return Math.exp(-DECAY_LAMBDA * daysSince);
}

export function calculateMastery(
  completions: ExerciseCompletion[],
  today: string = new Date().toISOString().split("T")[0]
): TopicMastery | null {
  if (completions.length === 0) return null;

  let scoreWeightedSum = 0;
  let selfWeightedSum = 0;
  let totalWeight = 0;
  let guessCount = 0;

  for (const c of completions) {
    const days = daysBetween(c.date, today);
    const w = decayWeight(days);
    scoreWeightedSum += c.percentScore * w;
    selfWeightedSum += ((c.selfAssessment - 1) / 4) * w;
    totalWeight += w;
    if (c.confidence === "geraten") guessCount++;
  }

  if (totalWeight === 0) return null;

  const scoreComponent = scoreWeightedSum / totalWeight;
  const selfComponent = selfWeightedSum / totalWeight;
  let mastery = SCORE_WEIGHT * scoreComponent + SELF_WEIGHT * selfComponent;

  // Guess penalty
  const guessRatio = guessCount / completions.length;
  mastery *= 1 - GUESS_PENALTY * guessRatio;

  // Clamp
  mastery = Math.max(0, Math.min(1, mastery));

  // Trend: compare last 7 days vs 8-14 days ago
  const recent = completions.filter(
    (c) => daysBetween(c.date, today) <= 7
  );
  const older = completions.filter((c) => {
    const d = daysBetween(c.date, today);
    return d > 7 && d <= 14;
  });

  let trend: Trend = "stable";
  let trendDelta = 0;

  if (recent.length > 0 && older.length > 0) {
    const recentAvg =
      recent.reduce((s, c) => s + c.percentScore, 0) / recent.length;
    const olderAvg =
      older.reduce((s, c) => s + c.percentScore, 0) / older.length;
    trendDelta = recentAvg - olderAvg;
    if (trendDelta > 0.05) trend = "improving";
    else if (trendDelta < -0.05) trend = "declining";
  }

  const rawAverage =
    completions.reduce((s, c) => s + c.percentScore, 0) / completions.length;
  const selfAvg =
    completions.reduce((s, c) => s + c.selfAssessment, 0) / completions.length;

  return {
    currentScore: mastery,
    rawAverage,
    selfAssessmentAvg: selfAvg,
    exerciseCount: completions.length,
    lastUpdated: today,
    trend,
    trendDelta,
  };
}

export function calculateAllMasteries(
  completions: ExerciseCompletion[],
  today?: string
): Record<string, TopicMastery> {
  const byTopic: Record<string, ExerciseCompletion[]> = {};
  for (const c of completions) {
    if (!byTopic[c.topicId]) byTopic[c.topicId] = [];
    byTopic[c.topicId].push(c);
  }

  const result: Record<string, TopicMastery> = {};
  for (const [topicId, topicCompletions] of Object.entries(byTopic)) {
    const m = calculateMastery(topicCompletions, today);
    if (m) result[topicId] = m;
  }
  return result;
}
