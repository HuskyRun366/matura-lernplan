import {
  UserProfile,
  UserPlanConfig,
  UserTask,
  TaskSuggestion,
  ExerciseCompletion,
  SimulationResult,
  STORAGE_KEYS,
  CURRENT_SCHEMA_VERSION,
} from "./types";

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Schema version / migration ──
// On first load after the redesign (v2), drop all plan-bound data.
// The user's name survives so they don't re-onboard the identity step.
const LEGACY_KEYS_TO_PURGE = [
  "mlp:task-status",
  "mlp:adaptive-history",
  "mlp:adaptive-tasks",
  "mlp:adaptive-overrides",
];

export function getSchemaVersion(): number {
  return get<number>(STORAGE_KEYS.schemaVersion) ?? 1;
}

export function runMigrationIfNeeded(): boolean {
  if (typeof window === "undefined") return false;
  const current = getSchemaVersion();
  if (current >= CURRENT_SCHEMA_VERSION) return false;

  // v1 → v2: Reset plan, completions and simulation results.
  // Keep: user profile. Drop: everything else.
  for (const legacy of LEGACY_KEYS_TO_PURGE) {
    localStorage.removeItem(legacy);
  }
  localStorage.removeItem(STORAGE_KEYS.completions);
  localStorage.removeItem(STORAGE_KEYS.simResults);
  localStorage.removeItem(STORAGE_KEYS.userTasks);
  localStorage.removeItem(STORAGE_KEYS.suggestions);
  localStorage.removeItem(STORAGE_KEYS.planConfig);

  set(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
  return true;
}

// ── User ──
export function getUser(): UserProfile | null {
  return get<UserProfile>(STORAGE_KEYS.user);
}
export function setUser(user: UserProfile): void {
  set(STORAGE_KEYS.user, user);
}

// ── Plan Config ──
export function getPlanConfig(): UserPlanConfig | null {
  return get<UserPlanConfig>(STORAGE_KEYS.planConfig);
}
export function setPlanConfig(config: UserPlanConfig): void {
  set(STORAGE_KEYS.planConfig, config);
}

// ── User Tasks (keyed by ISO date) ──
export function getUserTasksByDate(): Record<string, UserTask[]> {
  return get<Record<string, UserTask[]>>(STORAGE_KEYS.userTasks) ?? {};
}

export function getUserTasksForDate(date: string): UserTask[] {
  const all = getUserTasksByDate();
  return all[date] ?? [];
}

export function getAllUserTasks(): UserTask[] {
  const byDate = getUserTasksByDate();
  return Object.values(byDate).flat();
}

export function addUserTask(task: UserTask): void {
  const all = getUserTasksByDate();
  const list = all[task.date] ?? [];
  list.push(task);
  all[task.date] = list;
  set(STORAGE_KEYS.userTasks, all);
}

export function updateUserTask(id: string, update: Partial<UserTask>): void {
  const all = getUserTasksByDate();
  for (const date of Object.keys(all)) {
    const idx = all[date].findIndex((t) => t.id === id);
    if (idx >= 0) {
      all[date][idx] = { ...all[date][idx], ...update };
      set(STORAGE_KEYS.userTasks, all);
      return;
    }
  }
}

export function deleteUserTask(id: string): void {
  const all = getUserTasksByDate();
  for (const date of Object.keys(all)) {
    const before = all[date].length;
    all[date] = all[date].filter((t) => t.id !== id);
    if (all[date].length !== before) {
      if (all[date].length === 0) delete all[date];
      set(STORAGE_KEYS.userTasks, all);
      return;
    }
  }
}

// ── Suggestions ──
export function getSuggestions(): TaskSuggestion[] {
  return get<TaskSuggestion[]>(STORAGE_KEYS.suggestions) ?? [];
}

export function setSuggestions(suggestions: TaskSuggestion[]): void {
  set(STORAGE_KEYS.suggestions, suggestions);
}

export function updateSuggestion(id: string, update: Partial<TaskSuggestion>): void {
  const all = getSuggestions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...update };
    setSuggestions(all);
  }
}

// Replace all pending (not accepted, not dismissed) suggestions for a given
// date with a freshly generated batch. Preserves user's accept/dismiss state.
export function replacePendingSuggestionsForDate(
  date: string,
  fresh: TaskSuggestion[]
): void {
  const existing = getSuggestions();
  const kept = existing.filter(
    (s) => s.date !== date || s.accepted || s.dismissed
  );
  setSuggestions([...kept, ...fresh]);
}

// ── Completions ──
export function getCompletions(): ExerciseCompletion[] {
  return get<ExerciseCompletion[]>(STORAGE_KEYS.completions) ?? [];
}

export function addCompletion(completion: ExerciseCompletion): void {
  const all = getCompletions();
  const idx = all.findIndex((c) => c.exerciseId === completion.exerciseId);
  if (idx >= 0) all[idx] = completion;
  else all.push(completion);
  set(STORAGE_KEYS.completions, all);
}

// ── Simulation Results ──
export function getSimResults(): SimulationResult[] {
  return get<SimulationResult[]>(STORAGE_KEYS.simResults) ?? [];
}

export function addSimResult(result: SimulationResult): void {
  const all = getSimResults();
  const idx = all.findIndex((r) => r.simulationId === result.simulationId);
  if (idx >= 0) all[idx] = result;
  else all.push(result);
  set(STORAGE_KEYS.simResults, all);
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
