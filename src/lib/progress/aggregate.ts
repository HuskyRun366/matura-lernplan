import {
  UserTask,
  TopicMastery,
  ExerciseCompletion,
  Trend,
  Subject,
} from "../types";
import { MATH_TOPICS, PROG_TOPICS } from "../topics-data";

export type CategoryId = "math-teil-a" | "math-teil-b" | "prog-praxis" | "prog-theorie";

export interface CategoryProgress {
  id: CategoryId;
  label: string;
  subject: Subject;
  topicIds: string[];
  avgMastery: number;              // 0..1
  topicsAtTarget: number;
  totalTopics: number;
  trend: Trend;
  trendDelta: number;              // avg recent − avg older
}

export interface DailyProgress {
  date: string;                    // ISO
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  completedMinutes: number;
  topicIds: string[];              // unique topics touched
  completions: number;             // # exercise completions on this date
}

const CATEGORY_DEFS: Array<{
  id: CategoryId;
  label: string;
  subject: Subject;
  topicIds: string[];
}> = [
  {
    id: "math-teil-a",
    label: "Mathe — Teil A",
    subject: "math",
    topicIds: Object.values(MATH_TOPICS)
      .filter((t) => t.category === "teil-a")
      .map((t) => t.id),
  },
  {
    id: "math-teil-b",
    label: "Mathe — Teil B",
    subject: "math",
    topicIds: Object.values(MATH_TOPICS)
      .filter((t) => t.category === "teil-b")
      .map((t) => t.id),
  },
  {
    id: "prog-praxis",
    label: "Prog — Praxis",
    subject: "prog",
    topicIds: Object.values(PROG_TOPICS)
      .filter((t) => t.category === "praxis")
      .map((t) => t.id),
  },
  {
    id: "prog-theorie",
    label: "Prog — Theorie",
    subject: "prog",
    topicIds: Object.values(PROG_TOPICS)
      .filter((t) => t.category === "theorie")
      .map((t) => t.id),
  },
];

export function aggregateByCategory(
  masteries: Record<string, TopicMastery>
): CategoryProgress[] {
  return CATEGORY_DEFS.map((def) => {
    let sum = 0;
    let atTarget = 0;
    let trendSum = 0;
    let hasTrend = 0;

    for (const id of def.topicIds) {
      const m = masteries[id];
      const score = m?.currentScore ?? 0;
      sum += score;
      const target = MATH_TOPICS[id]?.targetMastery ?? PROG_TOPICS[id]?.targetMastery ?? 0.85;
      if (score >= target) atTarget++;
      if (m) {
        trendSum += m.trendDelta;
        hasTrend++;
      }
    }

    const avg = def.topicIds.length > 0 ? sum / def.topicIds.length : 0;
    const trendDelta = hasTrend > 0 ? trendSum / hasTrend : 0;
    let trend: Trend = "stable";
    if (trendDelta > 0.02) trend = "improving";
    else if (trendDelta < -0.02) trend = "declining";

    return {
      id: def.id,
      label: def.label,
      subject: def.subject,
      topicIds: def.topicIds,
      avgMastery: avg,
      topicsAtTarget: atTarget,
      totalTopics: def.topicIds.length,
      trend,
      trendDelta,
    };
  });
}

export function aggregateByDate(
  tasks: UserTask[],
  completions: ExerciseCompletion[]
): Record<string, DailyProgress> {
  const byDate: Record<string, DailyProgress> = {};

  for (const task of tasks) {
    const entry = (byDate[task.date] ??= {
      date: task.date,
      totalTasks: 0,
      completedTasks: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      topicIds: [],
      completions: 0,
    });
    entry.totalTasks++;
    entry.totalMinutes += task.durationMinutes;
    if (task.completed) {
      entry.completedTasks++;
      entry.completedMinutes += task.durationMinutes;
    }
    for (const id of task.topicIds) {
      if (!entry.topicIds.includes(id)) entry.topicIds.push(id);
    }
  }

  for (const c of completions) {
    const entry = (byDate[c.date] ??= {
      date: c.date,
      totalTasks: 0,
      completedTasks: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      topicIds: [],
      completions: 0,
    });
    entry.completions++;
    if (!entry.topicIds.includes(c.topicId)) entry.topicIds.push(c.topicId);
  }

  return byDate;
}

export interface OverallProgress {
  math: number;                    // 0..1 avg mastery weighted by priority
  prog: number;                    // 0..1 avg mastery weighted by priority
}

function mathWeight(priority: "basis" | "mittel" | "hoch"): number {
  return priority === "hoch" ? 2 : priority === "mittel" ? 1.5 : 1;
}

function progWeight(priority: 1 | 2 | 3 | 4): number {
  return 5 - priority; // 4, 3, 2, 1
}

export function calculateOverallProgress(
  masteries: Record<string, TopicMastery>
): OverallProgress {
  let mathSum = 0, mathW = 0;
  for (const t of Object.values(MATH_TOPICS)) {
    const w = mathWeight(t.priority);
    mathSum += (masteries[t.id]?.currentScore ?? 0) * w;
    mathW += w;
  }
  let progSum = 0, progW = 0;
  for (const t of Object.values(PROG_TOPICS)) {
    const w = progWeight(t.priority);
    progSum += (masteries[t.id]?.currentScore ?? 0) * w;
    progW += w;
  }
  return {
    math: mathW > 0 ? mathSum / mathW : 0,
    prog: progW > 0 ? progSum / progW : 0,
  };
}
