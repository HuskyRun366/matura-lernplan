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
  trigger: "exercise_completion" | "simulation_result" | "weekly_review" | "phase_transition" | "day_skipped";
  triggerDetails: string;
  changes: AdaptiveChange[];
  accepted?: boolean;
  decidedAt?: string;
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
  adaptiveModifications: "mlp:adaptive-mods",
} as const;
