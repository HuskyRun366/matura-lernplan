import { ExerciseCompletion, TopicMastery, Trend } from "../types";

// ═══════════════════════════════════════════════════════════════════
// Scientific basis:
//
//  1. SM-2 (Wozniak 1987) — adaptive decay: instead of a fixed
//     half-life, each topic's retention curve is driven by its
//     own SM-2 easiness factor (EF). High EF → slower decay.
//
//  2. IRT 1PL / Rasch model — score adjustment: a 70% on a hard
//     simulation counts more than a 70% on an easy diagnose.
//     Per-topic ability θ is estimated via logit of mean score.
//
//  3. Interleaving effect (Kornell & Bjork 2008) — a topic
//     studied in between other topics benefits from spacing;
//     up to +5% bonus when ≥3 unique topics appear between
//     consecutive sessions on the same topic.
//
//  4. Primacy/Recency effect (Murdock 1962) — within a single
//     study day, items at the start and end of a session are
//     better retained than those in the middle. Applied as a
//     U-shaped position weight across same-day completions.
//
//  5. Certainty-Based Marking / CBM (Gardner-Medwin 1995) —
//     scores are penalised when answers are marked as guessed
//     (confidence = "geraten"), preventing inflated mastery.
// ═══════════════════════════════════════════════════════════════════

// ── Weights & constants ──
const SCORE_WEIGHT          = 0.70;
const SELF_WEIGHT           = 0.30;
const GUESS_PENALTY         = 0.30;   // CBM: mastery multiplier per guess ratio
const SM2_EF_INITIAL        = 2.50;
const SM2_EF_MIN            = 1.30;
const IRT_INFLUENCE         = 0.30;   // how strongly IRT adjustment shifts the raw score
const INTERLEAVING_MAX      = 0.05;   // max +5% interleaving bonus
const PRIMACY_RECENCY_DIP   = 0.15;   // middle-of-day items score × (1 − dip)

// ── IRT: task-type difficulty in logit units (b parameter) ──
// Calibrated to typical HTL exam difficulty levels.
const TASK_DIFFICULTY: Record<string, number> = {
  diagnose:       -1.5,   // baseline check, low barrier
  theorie:        -0.5,   // recall/theory questions
  wiederholung:   -0.3,   // review, slightly easier than fresh material
  lueckenschluss:  0.0,   // gap-filling, average difficulty
  neustoff:        0.5,   // new material, above average
  praxis:          1.0,   // applied practice, hard
  simulation:      1.5,   // full exam conditions, very hard
  exam:            2.0,   // actual exam
};

// Task type is now recorded on each ExerciseCompletion at completion time
// (see `taskType` on ExerciseCompletion). When missing on legacy records we
// default to "neustoff" (mid-difficulty) for IRT adjustment.

// ── Math helpers ──
function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

function logit(p: number): number {
  const c = Math.max(0.01, Math.min(0.99, p));
  return Math.log(c / (1 - c));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ── 1. SM-2 algorithm ──────────────────────────────────────────────
// Replays all completions for a topic in chronological order,
// producing the current EF and next interval.
// Quality mapping: combines percentScore (0–1) + selfAssessment (1–5)
// + confidence into a 0–5 integer quality score.
function sm2Quality(c: ExerciseCompletion): number {
  let q = c.percentScore * 3 + ((c.selfAssessment - 1) / 4) * 2;
  if (c.confidence === "geraten")  q = Math.min(q, 2); // guessed → cap at "barely passed"
  if (c.confidence === "unsicher") q = Math.min(q, 3); // unsure  → cap at "passed"
  return Math.round(Math.max(0, Math.min(5, q)));
}

interface SM2State {
  ef: number;
  interval: number;
  repetitions: number;
}

function computeSM2(completions: ExerciseCompletion[]): SM2State {
  const sorted = [...completions].sort((a, b) => a.date.localeCompare(b.date));
  const s: SM2State = { ef: SM2_EF_INITIAL, interval: 1, repetitions: 0 };

  for (const c of sorted) {
    const q = sm2Quality(c);
    // EF update formula (Wozniak 1987)
    s.ef = Math.max(SM2_EF_MIN, s.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

    if (q < 3) {
      // Failed: restart interval sequence
      s.repetitions = 0;
      s.interval = 1;
    } else {
      // Passed: escalate interval
      if      (s.repetitions === 0) s.interval = 1;
      else if (s.repetitions === 1) s.interval = 6;
      else                          s.interval = Math.round(s.interval * s.ef);
      s.repetitions++;
    }
  }

  return s;
}

// ── 2. IRT 1PL (Rasch model) ──────────────────────────────────────
// Adjusts raw percentScore based on item difficulty and learner ability.
//   P(correct | θ, b) = sigmoid(θ − b)
// Adjustment: amplify deviation from expected performance.
//   adjusted = raw + (raw − expected) × IRT_INFLUENCE
// This rewards exceeding expectations on hard items and penalises
// underperforming on easy ones.
function irtAdjustedScore(c: ExerciseCompletion, abilityTheta: number): number {
  const b = TASK_DIFFICULTY[c.taskType ?? "neustoff"] ?? 0;
  const expected = sigmoid(abilityTheta - b);
  const adjusted = c.percentScore + (c.percentScore - expected) * IRT_INFLUENCE;
  return Math.max(0, Math.min(1, adjusted));
}

// ── 3. Interleaving bonus ─────────────────────────────────────────
// For each consecutive pair of same-topic study days, count how many
// unique other topics were studied in between. Average this across all
// pairs. Up to INTERLEAVING_MAX bonus is applied to the final mastery.
function computeInterleavingBonus(
  topicId: string,
  topicCompletions: ExerciseCompletion[],
  allCompletions: ExerciseCompletion[]
): number {
  if (topicCompletions.length < 2) return 0;

  const topicDates = [...new Set(topicCompletions.map((c) => c.date))].sort();
  const allSorted  = [...allCompletions].sort((a, b) => a.date.localeCompare(b.date));

  let totalUnique = 0;
  let pairs = 0;

  for (let i = 0; i < topicDates.length - 1; i++) {
    const between = allSorted.filter(
      (c) => c.date > topicDates[i] && c.date < topicDates[i + 1] && c.topicId !== topicId
    );
    totalUnique += new Set(between.map((c) => c.topicId)).size;
    pairs++;
  }

  if (pairs === 0) return 0;
  // Linear scale: 3 interleaved topics → full bonus
  return Math.min(INTERLEAVING_MAX, (totalUnique / pairs) * (INTERLEAVING_MAX / 3));
}

// ── 4. Primacy/Recency weight ─────────────────────────────────────
// U-shaped weight over the ordered completions of a single day.
// position=0 (first) and position=total−1 (last) → weight 1.0
// position=0.5×(total−1) (middle) → weight 1 − PRIMACY_RECENCY_DIP
// Formula: w = 1 − DIP × 4t(1−t)  where t ∈ [0,1]
function primacyRecencyWeight(position: number, total: number): number {
  if (total <= 2) return 1.0;
  const t = position / (total - 1);
  return 1 - PRIMACY_RECENCY_DIP * 4 * t * (1 - t);
}

// ── Main export ───────────────────────────────────────────────────
export function calculateMastery(
  completions: ExerciseCompletion[],
  allCompletions: ExerciseCompletion[] = [],
  today: string = new Date().toISOString().split("T")[0]
): TopicMastery | null {
  if (completions.length === 0) return null;

  // 1. SM-2: derive per-topic adaptive decay rate from EF
  const sm2 = computeSM2(completions);
  const sm2Lambda = Math.log(2) / Math.max(sm2.interval, 1); // λ = ln2 / half-life

  // 2. IRT: estimate per-topic learner ability θ from mean score
  const meanScore = completions.reduce((s, c) => s + c.percentScore, 0) / completions.length;
  const abilityTheta = logit(meanScore);

  // 3. Group completions by day for primacy/recency
  const byDay: Record<string, ExerciseCompletion[]> = {};
  for (const c of completions) {
    (byDay[c.date] ??= []).push(c);
  }

  // 4. Weighted aggregation: SM-2 time decay × primacy/recency × IRT-adjusted score
  let scoreWeightedSum = 0;
  let selfWeightedSum  = 0;
  let totalWeight      = 0;
  let guessCount       = 0;

  for (const [date, dayCompletions] of Object.entries(byDay)) {
    const daysSince = daysBetween(date, today);
    const timeDecay = Math.exp(-sm2Lambda * daysSince); // SM-2 adaptive curve

    dayCompletions.forEach((c, idx) => {
      const posWeight  = primacyRecencyWeight(idx, dayCompletions.length); // primacy/recency
      const irtScore   = irtAdjustedScore(c, abilityTheta);                // IRT adjustment
      const w          = timeDecay * posWeight;

      scoreWeightedSum += irtScore * w;
      selfWeightedSum  += ((c.selfAssessment - 1) / 4) * w;
      totalWeight      += w;
      if (c.confidence === "geraten") guessCount++;
    });
  }

  if (totalWeight === 0) return null;

  // 5. Combine objective score + metacognitive self-assessment
  const scoreComponent = scoreWeightedSum / totalWeight;
  const selfComponent  = selfWeightedSum  / totalWeight;
  let mastery = SCORE_WEIGHT * scoreComponent + SELF_WEIGHT * selfComponent;

  // 6. CBM guess penalty
  mastery *= 1 - GUESS_PENALTY * (guessCount / completions.length);

  // 7. Interleaving bonus
  const topicId         = completions[0].topicId;
  const interleavingBonus = computeInterleavingBonus(
    topicId,
    completions,
    allCompletions.length > 0 ? allCompletions : completions
  );
  mastery = Math.min(1, mastery + interleavingBonus);
  mastery = Math.max(0, mastery);

  // 8. Trend: compare IRT-adjusted scores over last 7 vs 8–14 days
  const recentC = completions.filter((c) => daysBetween(c.date, today) <= 7);
  const olderC  = completions.filter((c) => {
    const d = daysBetween(c.date, today);
    return d > 7 && d <= 14;
  });

  let trend: Trend = "stable";
  let trendDelta = 0;

  if (recentC.length > 0 && olderC.length > 0) {
    const recentAvg = recentC.reduce((s, c) => s + irtAdjustedScore(c, abilityTheta), 0) / recentC.length;
    const olderAvg  = olderC.reduce((s, c)  => s + irtAdjustedScore(c, abilityTheta), 0) / olderC.length;
    trendDelta = recentAvg - olderAvg;
    if      (trendDelta >  0.05) trend = "improving";
    else if (trendDelta < -0.05) trend = "declining";
  }

  // 9. SM-2 next review date
  const lastDate    = [...completions].sort((a, b) => b.date.localeCompare(a.date))[0].date;
  const nextReview  = new Date(lastDate);
  nextReview.setDate(nextReview.getDate() + sm2.interval);

  const rawAverage  = completions.reduce((s, c) => s + c.percentScore, 0) / completions.length;
  const selfAvg     = completions.reduce((s, c) => s + c.selfAssessment, 0) / completions.length;

  return {
    currentScore:       mastery,
    rawAverage,
    selfAssessmentAvg:  selfAvg,
    exerciseCount:      completions.length,
    lastUpdated:        today,
    trend,
    trendDelta,
    sm2EasinessFactor:  sm2.ef,
    sm2Interval:        sm2.interval,
    sm2NextReview:      nextReview.toISOString().split("T")[0],
    irtAbilityTheta:    abilityTheta,
    interleavingBonus,
  };
}

export function calculateAllMasteries(
  completions: ExerciseCompletion[],
  today?: string
): Record<string, TopicMastery> {
  const byTopic: Record<string, ExerciseCompletion[]> = {};
  for (const c of completions) {
    (byTopic[c.topicId] ??= []).push(c);
  }

  const result: Record<string, TopicMastery> = {};
  for (const [topicId, topicCompletions] of Object.entries(byTopic)) {
    const m = calculateMastery(topicCompletions, completions, today);
    if (m) result[topicId] = m;
  }
  return result;
}
