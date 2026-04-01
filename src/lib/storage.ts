import {
  UserProfile,
  ExerciseCompletion,
  TaskStatus,
  SimulationResult,
  AdaptiveProposal,
  AdaptiveTask,
  STORAGE_KEYS,
} from "./types";

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── User ──
export function getUser(): UserProfile | null {
  return get<UserProfile>(STORAGE_KEYS.user);
}
export function setUser(user: UserProfile): void {
  set(STORAGE_KEYS.user, user);
}

// ── Completions ──
export function getCompletions(): ExerciseCompletion[] {
  return get<ExerciseCompletion[]>(STORAGE_KEYS.completions) || [];
}
export function addCompletion(completion: ExerciseCompletion): void {
  const all = getCompletions();
  // Replace if same exerciseId exists
  const idx = all.findIndex((c) => c.exerciseId === completion.exerciseId);
  if (idx >= 0) {
    all[idx] = completion;
  } else {
    all.push(completion);
  }
  set(STORAGE_KEYS.completions, all);
}

// ── Task Status ──
export function getTaskStatuses(): Record<string, TaskStatus> {
  return get<Record<string, TaskStatus>>(STORAGE_KEYS.taskStatus) || {};
}
export function setTaskStatus(taskId: string, status: TaskStatus): void {
  const all = getTaskStatuses();
  all[taskId] = status;
  set(STORAGE_KEYS.taskStatus, all);
}

// ── Simulation Results ──
export function getSimResults(): SimulationResult[] {
  return get<SimulationResult[]>(STORAGE_KEYS.simResults) || [];
}
export function addSimResult(result: SimulationResult): void {
  const all = getSimResults();
  const idx = all.findIndex((r) => r.simulationId === result.simulationId);
  if (idx >= 0) {
    all[idx] = result;
  } else {
    all.push(result);
  }
  set(STORAGE_KEYS.simResults, all);
}

// ── Adaptive History ──
export function getAdaptiveHistory(): AdaptiveProposal[] {
  return get<AdaptiveProposal[]>(STORAGE_KEYS.adaptiveHistory) || [];
}
export function addAdaptiveProposal(proposal: AdaptiveProposal): void {
  const all = getAdaptiveHistory();
  all.push(proposal);
  set(STORAGE_KEYS.adaptiveHistory, all);
}
export function updateAdaptiveProposal(
  id: string,
  update: Partial<AdaptiveProposal>
): void {
  const all = getAdaptiveHistory();
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...update };
    set(STORAGE_KEYS.adaptiveHistory, all);
  }
}

// ── Adaptive Tasks ──
export function getAdaptiveTasks(): AdaptiveTask[] {
  return get<AdaptiveTask[]>(STORAGE_KEYS.adaptiveTasks) || [];
}
export function addAdaptiveTask(task: AdaptiveTask): void {
  const all = getAdaptiveTasks();
  all.push(task);
  set(STORAGE_KEYS.adaptiveTasks, all);
}
export function updateAdaptiveTask(id: string, update: Partial<AdaptiveTask>): void {
  const all = getAdaptiveTasks();
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...update };
    set(STORAGE_KEYS.adaptiveTasks, all);
  }
}

// ── Export / Import / Reset ──
export function exportAllData(): string {
  if (typeof window === "undefined") return "{}";
  const data: Record<string, unknown> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw) data[key] = JSON.parse(raw);
  }
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function resetAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
}
