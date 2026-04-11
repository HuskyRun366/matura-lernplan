// ═══════════════════════════════════════════
// Core Types for Matura Lernplan
// ═══════════════════════════════════════════

export type Subject = "math" | "prog";
export type TaskSubject = "math" | "prog" | "sim";
export type DayType = "stark" | "leicht" | "exam";
export type Phase = "Aufbau" | "Puffer" | "Endphase" | "Pruefung";
export type SelfRating = 1 | 2 | 3 | 4 | 5;
export type Confidence = "sicher" | "teilweise" | "unsicher" | "geraten";
export type Trend = "improving" | "stable" | "declining";

export const SELF_RATING_LABELS: Record<SelfRating, string> = {
  1: "Nicht verstanden",
  2: "Unsicher",
  3: "Teilweise",
  4: "Gut",
  5: "Sicher beherrscht",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  sicher: "Sicher",
  teilweise: "Teilweise sicher",
  unsicher: "Unsicher",
  geraten: "Geraten",
};

// ── User ──
export interface UserProfile {
  name: string;
  createdAt: string;
  theme: "dark" | "light" | "system";
}

// ── Topics ──
export interface TopicResource {
  type: "aufgabenpool" | "mathago" | "book" | "docs" | "video" | "competenz4u";
  url?: string;
  label: string;
  chapters?: string;
}

export interface MathTopic {
  id: string;
  name: string;
  category: "teil-a" | "teil-b";
  priority: "basis" | "mittel" | "hoch";
  minMastery: number;
  targetMastery: number;
  resources: TopicResource[];
  weekIntroduced: number;
}

export interface ProgTopic {
  id: string;
  name: string;
  category: "praxis" | "theorie";
  priority: 1 | 2 | 3 | 4;
  minMastery: number;
  targetMastery: number;
  resources: TopicResource[];
  bookChapters: string[];
  project?: "NetBoard" | "DataLab";
  weekIntroduced: number;
}

// ── Plan ──
export interface Exercise {
  id: string;
  label: string;
  topicId: string;
  subject: Subject;
  maxPoints: number;
  description?: string;
  url?: string;
}

export interface PlanTask {
  id: string;
  subject: TaskSubject;
  topicIds: string[];
  title: string;
  description: string;
  time: string;
  durationMinutes: number;
  type: "diagnose" | "neustoff" | "wiederholung" | "simulation" | "lueckenschluss" | "theorie" | "praxis" | "exam";
  exercises: Exercise[];
  resources: TopicResource[];
  isAdaptive?: boolean;
  adaptiveReason?: string;
}

export interface PlanDay {
  date: string;
  day: string;
  type: DayType;
  week: number;
  phase: Phase;
  tasks: PlanTask[];
}

// ── Completions ──
export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  taskId: string;
  topicId: string;
  subject: Subject;
  date: string;
  timestamp: string;
  pointsAchieved: number;
  pointsMax: number;
  percentScore: number;
  selfAssessment: SelfRating;
  confidence: Confidence;
  timeSpentMinutes?: number;
  notes?: string;
}

// ── Task Status ──
export interface TaskStatus {
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  // Set by auto-detection when a whole past day had no activity.
  // Unlike skipped, carriedOver tasks remain interactive and appear
  // in the next open day's "Nachzuholen" section.
  carriedOver?: boolean;
}

// ── Simulations ──
export interface SimulationDefinition {
  id: string;
  name: string;
  subject: Subject;
  date: string;
  targetPercent: number;
}

export interface SimulationResult {
  simulationId: string;
  actualPercent: number;
  completedAt: string;
  topicBreakdown: Record<string, { points: number; maxPoints: number }>;
  weakTopics: string[];
  strongTopics: string[];
  notes?: string;
}

// ── Mastery ──
export interface TopicMastery {
  currentScore: number;
  rawAverage: number;
  selfAssessmentAvg: number;
  exerciseCount: number;
  lastUpdated: string;
  trend: Trend;
  trendDelta: number;
  // SM-2
  sm2EasinessFactor: number;   // EF: 1.3–∞, typical 1.3–2.5
  sm2Interval: number;         // next review interval in days
  sm2NextReview: string;       // ISO date of recommended next review
  // IRT
  irtAbilityTheta: number;     // learner ability estimate (logit scale)
  // Interleaving
  interleavingBonus: number;   // 0–0.05 bonus applied to currentScore
}

// ── Adaptive ──
export type AdaptiveChangeType =
  | "add_exercise"
  | "remove_exercise"
  | "increase_time"
  | "decrease_time"
  | "grant_free_day"
  | "add_review_session"
  | "intensify_week"
  | "activate_notfall";

export type AdaptiveTrigger =
  | "exercise_completion"
  | "simulation_result"
  | "weekly_review"
  | "phase_transition"
  | "day_skipped"
  | "sm2_review";

export interface AdaptiveChange {
  type: AdaptiveChangeType;
  targetDate?: string;
  topicId?: string;
  description: string;
  reason: string;
}

export interface AdaptiveProposal {
  id: string;
  timestamp: string;
  trigger: AdaptiveTrigger;
  triggerDetails: string;
  changes: AdaptiveChange[];
  accepted?: boolean;
  decidedAt?: string;
}

// ── Adaptive Overrides (applied when proposals are accepted) ──
export interface AdaptiveOverrides {
  notfallMode: boolean;
  notfallActivatedAt?: string;
  freeDays: string[];           // ISO dates granted as optional free days
  intensifyWeekUntil?: string;  // ISO date until which intensify-week banner is shown
}

// ── Adaptive Tasks (created when proposals are accepted) ──
export interface AdaptiveTask {
  id: string;
  date: string;          // ISO date this task is scheduled for
  topicId: string;
  topicName: string;
  subject: Subject;
  title: string;
  description: string;
  durationMinutes: number;
  type: "wiederholung" | "lueckenschluss";
  proposalId: string;    // which proposal created this
  createdAt: string;
  completed: boolean;
  completedAt?: string;
}

// ── Weeks ──
export interface WeekDefinition {
  label: string;
  range: string;
  phase: Phase;
  start: string;
  end: string;
  weekNumber: number;
}

// ── Storage Keys ──
export const STORAGE_KEYS = {
  user: "mlp:user",
  completions: "mlp:completions",
  taskStatus: "mlp:task-status",
  simResults: "mlp:sim-results",
  adaptiveHistory: "mlp:adaptive-history",
  adaptiveTasks: "mlp:adaptive-tasks",
  adaptiveOverrides: "mlp:adaptive-overrides",
} as const;
