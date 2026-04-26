"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserProfile,
  UserPlanConfig,
  UserTask,
  TaskSuggestion,
  ExerciseCompletion,
  SimulationResult,
  TopicMastery,
} from "@/lib/types";
import * as storage from "@/lib/storage";
import { calculateAllMasteries } from "@/lib/adaptive/mastery";
import { generateSuggestionsForDate } from "@/lib/suggestions/generator";

// Run v1→v2 migration on first client render.
function useSchemaMigration(): boolean {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      storage.runMigrationIfNeeded();
      setDone(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);
  return done;
}

function useLocalStorage<T>(
  reader: () => T
): { data: T; setData: (v: T) => void; hydrated: boolean; refresh: () => void } {
  const migrated = useSchemaMigration();
  const [state, setState] = useState<{ data: T; hydrated: boolean }>({
    data: undefined as unknown as T,
    hydrated: false,
  });

  useEffect(() => {
    if (!migrated) return;
    const timer = window.setTimeout(() => {
      setState({ data: reader(), hydrated: true });
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [migrated]);

  const setData = useCallback((v: T) => {
    setState((prev) => ({ ...prev, data: v }));
  }, []);

  const refresh = useCallback(() => {
    setState({ data: reader(), hydrated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: state.data, setData, hydrated: state.hydrated, refresh };
}

// ── User ──
export function useUser() {
  const { data: user, setData, hydrated } = useLocalStorage<UserProfile | null>(
    () => storage.getUser()
  );
  const setUser = useCallback((u: UserProfile) => {
    storage.setUser(u);
    setData(u);
  }, [setData]);
  return { user, setUser, hydrated };
}

// ── Plan Config ──
export function usePlanConfig() {
  const { data: config, setData, hydrated } = useLocalStorage<UserPlanConfig | null>(
    () => storage.getPlanConfig()
  );
  const setConfig = useCallback((c: UserPlanConfig) => {
    storage.setPlanConfig(c);
    setData(c);
  }, [setData]);
  return { config, setConfig, hydrated };
}

// ── User Tasks (all) ──
export function useUserTasks() {
  const { data: byDate, setData, hydrated, refresh } = useLocalStorage<Record<string, UserTask[]>>(
    () => storage.getUserTasksByDate()
  );

  const tasksForDate = useCallback(
    (date: string): UserTask[] => (byDate?.[date] ?? []),
    [byDate]
  );

  const allTasks = useMemo(
    () => (byDate ? Object.values(byDate).flat() : []),
    [byDate]
  );

  const addTask = useCallback((task: UserTask) => {
    storage.addUserTask(task);
    setData(storage.getUserTasksByDate());
  }, [setData]);

  const updateTask = useCallback((id: string, update: Partial<UserTask>) => {
    storage.updateUserTask(id, update);
    setData(storage.getUserTasksByDate());
  }, [setData]);

  const toggleComplete = useCallback((id: string, completed: boolean) => {
    storage.updateUserTask(id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
    setData(storage.getUserTasksByDate());
  }, [setData]);

  const deleteTask = useCallback((id: string) => {
    storage.deleteUserTask(id);
    setData(storage.getUserTasksByDate());
  }, [setData]);

  return {
    byDate: byDate ?? {},
    allTasks,
    tasksForDate,
    addTask,
    updateTask,
    toggleComplete,
    deleteTask,
    hydrated,
    refresh,
  };
}

// ── Completions ──
export function useCompletions() {
  const { data, setData, hydrated, refresh } = useLocalStorage<ExerciseCompletion[]>(
    () => storage.getCompletions()
  );

  const addCompletion = useCallback((c: ExerciseCompletion) => {
    storage.addCompletion(c);
    setData(storage.getCompletions());
  }, [setData]);

  return {
    completions: data ?? [],
    addCompletion,
    refresh,
    hydrated,
  };
}

// ── Simulation Results ──
export function useSimResults() {
  const { data, setData, hydrated } = useLocalStorage<SimulationResult[]>(
    () => storage.getSimResults()
  );

  const addSimResult = useCallback((r: SimulationResult) => {
    storage.addSimResult(r);
    setData(storage.getSimResults());
  }, [setData]);

  return { results: data ?? [], addSimResult, hydrated };
}

// ── Masteries (derived) ──
export function useMasteries() {
  const { completions, hydrated } = useCompletions();
  const masteries = useMemo<Record<string, TopicMastery>>(
    () => (hydrated ? calculateAllMasteries(completions) : {}),
    [completions, hydrated]
  );

  return { masteries, hydrated };
}

// ── Suggestions (all; generation is caller-driven for a date) ──
export function useSuggestions() {
  const { data, setData, hydrated } = useLocalStorage<TaskSuggestion[]>(
    () => storage.getSuggestions()
  );

  const dismissSuggestion = useCallback((id: string) => {
    storage.updateSuggestion(id, { dismissed: true, dismissedAt: new Date().toISOString() });
    setData(storage.getSuggestions());
  }, [setData]);

  const markAccepted = useCallback((id: string) => {
    storage.updateSuggestion(id, { accepted: true, acceptedAt: new Date().toISOString() });
    setData(storage.getSuggestions());
  }, [setData]);

  const replaceForDate = useCallback((date: string, fresh: TaskSuggestion[]) => {
    storage.replacePendingSuggestionsForDate(date, fresh);
    setData(storage.getSuggestions());
  }, [setData]);

  return {
    suggestions: data ?? [],
    dismissSuggestion,
    markAccepted,
    replaceForDate,
    hydrated,
  };
}

// Auto-regenerate pending suggestions for a given date whenever the inputs
// change. Called from pages that show suggestions.
export function useAutoSuggestions(date: string) {
  const { config, hydrated: configH } = usePlanConfig();
  const { masteries } = useMasteries();
  const { completions, hydrated: compH } = useCompletions();
  const { tasksForDate, hydrated: tasksH } = useUserTasks();
  const { suggestions, dismissSuggestion, markAccepted, replaceForDate, hydrated: sugH } =
    useSuggestions();

  const ready = configH && compH && tasksH && sugH && !!config;

  useEffect(() => {
    if (!ready || !config) return;
    if (!config.suggestionsEnabled) {
      replaceForDate(date, []);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const fresh = generateSuggestionsForDate({
      date,
      today,
      config,
      masteries,
      completions,
      existingTasksForDate: tasksForDate(date),
    });
    replaceForDate(date, fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, ready, completions.length, Object.keys(masteries).length, tasksForDate(date).length, config?.suggestionsEnabled]);

  const visible = suggestions.filter(
    (s) => s.date === date && !s.dismissed && !s.accepted
  );

  return { suggestions: visible, dismissSuggestion, markAccepted, ready };
}
