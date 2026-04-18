// ═══════════════════════════════════════════
// Core Types for Matura Lernplan
// ═══════════════════════════════════════════

export type Subject = "math" | "prog";
export type TaskSubject = "math" | "prog" | "sim";
export type SelfRating = 1 | 2 | 3 | 4 | 5;
export type Confidence = "sicher" | "teilweise" | "unsicher" | "geraten";
export type Trend = "improving" | "stable" | "declining";

export type TaskType =
  | "diagnose"
  | "neustoff"
  | "wiederholung"
  | "simulation"
  | "lueckenschluss"
  | "theorie"
  | "praxis"
  | "exam";

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

// ── Plan Configuration ──
export interface UserPlanConfig {
  progExamDate: string;           // ISO YYYY-MM-DD
  mathExamDate: string;           // ISO YYYY-MM-DD
  studyStartDate: string;         // ISO YYYY-MM-DD
  dailyTimeBudgetMinutes: number; // 60 – 360
  suggestionsEnabled: boolean;
  createdAt: string;
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

// ── Exercises (kept for assessment dialog) ──
export interface Exercise {
  id: string;
  label: string;
  topicId: string;
  subject: Subject;
  maxPoints: number;
  description?: string;
  url?: string;
}

// ── User-defined Task ──
export interface UserTask {
  id: string;
  date: string;                    // ISO YYYY-MM-DD
  title: string;
  description?: string;
  subject: TaskSubject;
  topicIds: string[];
  durationMinutes: number;
  type: TaskType;
  source: "user" | "suggestion";
  suggestionId?: string;           // populated when task came from a suggestion
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  exercises: Exercise[];
  resources: TopicResource[];
}

// ── Suggestions (app → user, optional) ──
export type SuggestionReasonKind =
  | "below_min"
  | "trend_declining"
  | "sm2_review_due"
  | "exam_close"
  | "simulation_due"
  | "not_started";

export interface TaskSuggestion {
  id: string;
  date: string;                    // ISO YYYY-MM-DD
  title: string;
  description: string;
  subject: Subject;
  topicIds: string[];
  durationMinutes: number;
  type: TaskType;
  priority: "hoch" | "mittel" | "niedrig";
  reasonKind: SuggestionReasonKind;
  reason: string;                  // human-readable explanation
  createdAt: string;
  dismissed: boolean;
  dismissedAt?: string;
  accepted: boolean;
  acceptedAt?: string;
}

// ── Completions ──
export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  taskId: string;
  taskType?: TaskType;             // recorded at completion time for IRT lookup
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
  sm2EasinessFactor: number;
  sm2Interval: number;
  sm2NextReview: string;
  irtAbilityTheta: number;
  interleavingBonus: number;
}

// ── Storage Keys ──
export const STORAGE_KEYS = {
  user: "mlp:user",
  schemaVersion: "mlp:schema-version",
  planConfig: "mlp:user-plan",
  userTasks: "mlp:user-tasks",       // Record<dateISO, UserTask[]>
  suggestions: "mlp:suggestions",    // TaskSuggestion[]
  completions: "mlp:completions",
  simResults: "mlp:sim-results",
} as const;

export const CURRENT_SCHEMA_VERSION = 2;
