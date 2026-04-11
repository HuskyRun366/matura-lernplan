"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  ExerciseCompletion,
  TaskStatus,
  SimulationResult,
  AdaptiveProposal,
  AdaptiveTask,
  AdaptiveOverrides,
  TopicMastery,
} from "@/lib/types";
import * as storage from "@/lib/storage";
import { calculateAllMasteries } from "@/lib/adaptive/mastery";
import { checkAfterExercise, checkAfterSimulation, checkAfterSkip, checkMissedDay, checkSM2Reviews, buildAdaptiveTasks } from "@/lib/adaptive/engine";
import { PlanTask } from "@/lib/types";
import { PLAN_DATA } from "@/lib/plan-data";

// Single combined state to avoid race conditions between hydration and data loading
function useLocalStorage<T>(_key: string, reader: () => T): { data: T; setData: (v: T) => void; hydrated: boolean } {
  const [state, setState] = useState<{ data: T; hydrated: boolean }>({
    data: undefined as unknown as T,
    hydrated: false,
  });

  useEffect(() => {
    setState({ data: reader(), hydrated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setData = useCallback((v: T) => {
    setState((prev) => ({ ...prev, data: v }));
  }, []);

  return { data: state.data, setData, hydrated: state.hydrated };
}

export function useUser() {
  const { data: user, setData: setUserState, hydrated } = useLocalStorage<UserProfile | null>(
    "user",
    () => storage.getUser()
  );

  const setUser = useCallback((u: UserProfile) => {
    storage.setUser(u);
    setUserState(u);
  }, [setUserState]);

  return { user, setUser, hydrated };
}

export function useCompletions() {
  const { data: completions, setData: setCompletionsState, hydrated } = useLocalStorage<ExerciseCompletion[]>(
    "completions",
    () => storage.getCompletions()
  );

  // On hydration: run SM-2 review check for all topics
  useEffect(() => {
    if (!hydrated) return;
    const today = new Date().toISOString().split("T")[0];
    const all = storage.getCompletions();
    if (all.length === 0) return;
    const existing = storage.getAdaptiveHistory();
    const proposal = checkSM2Reviews(all, existing, today);
    if (proposal) storage.addAdaptiveProposal(proposal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const addCompletion = useCallback(
    (c: ExerciseCompletion) => {
      storage.addCompletion(c);
      const updated = storage.getCompletions();
      setCompletionsState(updated);

      // Mastery / trend check
      const proposal = checkAfterExercise(updated, c);
      if (proposal) storage.addAdaptiveProposal(proposal);

      // SM-2 review check after each completion (new reviews may have become due)
      const today = new Date().toISOString().split("T")[0];
      const existing = storage.getAdaptiveHistory();
      const sm2Proposal = checkSM2Reviews(updated, existing, today);
      if (sm2Proposal) storage.addAdaptiveProposal(sm2Proposal);

      return proposal;
    },
    [setCompletionsState]
  );

  const refresh = useCallback(() => {
    setCompletionsState(storage.getCompletions());
  }, [setCompletionsState]);

  return { completions: completions ?? [], addCompletion, refresh, hydrated };
}

export function useTaskStatuses() {
  const { data: statuses, setData: setStatusesState, hydrated } = useLocalStorage<Record<string, TaskStatus>>(
    "taskStatus",
    () => storage.getTaskStatuses()
  );

  const [autoSkippedCount, setAutoSkippedCount] = useState(0);

  // Auto-detect missed past days ("Tag war zu viel")
  useEffect(() => {
    if (!hydrated) return;
    const today = new Date().toISOString().split("T")[0];
    const currentStatuses = storage.getTaskStatuses();
    const completions = storage.getCompletions();
    const existingHistory = storage.getAdaptiveHistory();
    let changed = false;

    for (const day of PLAN_DATA) {
      if (day.date >= today) break;
      if (day.tasks.length === 0 || day.type === "exam") continue;

      // Skip if any task is completed
      const anyCompleted = day.tasks.some((t) => currentStatuses[t.id]?.completed);
      if (anyCompleted) continue;

      // Mark all non-completed tasks as carriedOver.
      // This also migrates old auto-skipped tasks (skipped:true without carriedOver)
      // to the new carriedOver model. Manually skipped tasks get the same treatment —
      // they appear in Nachzuholen and the user can skip them again from there.
      const allCarriedOver = day.tasks.every((t) => currentStatuses[t.id]?.carriedOver);
      if (!allCarriedOver) {
        for (const task of day.tasks) {
          if (!currentStatuses[task.id]?.completed) {
            storage.setTaskStatus(task.id, { completed: false, skipped: false, carriedOver: true });
          }
        }
        changed = true;
      }

      // Generate proposal only once per date
      const alreadyHasProposal = existingHistory.some(
        (p) => p.triggerDetails.includes(day.date)
      );
      if (!alreadyHasProposal) {
        const proposal = checkMissedDay(day.tasks, day.date, completions);
        if (proposal) storage.addAdaptiveProposal(proposal);
        changed = true;
      }
    }

    if (changed) {
      setStatusesState(storage.getTaskStatuses());
      setAutoSkippedCount((prev) => prev + 1);
    } else {
      // Always sync state with storage after hydration in case other instances wrote to it
      setStatusesState(storage.getTaskStatuses());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const setTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    storage.setTaskStatus(taskId, status);
    setStatusesState(storage.getTaskStatuses());
  }, [setStatusesState]);

  // Skip a single task and trigger adaptive check
  const skipTask = useCallback((task: PlanTask, date: string) => {
    storage.setTaskStatus(task.id, { completed: false, skipped: true });
    setStatusesState(storage.getTaskStatuses());

    const allStatuses = storage.getTaskStatuses();
    const skippedIds = Object.entries(allStatuses)
      .filter(([, s]) => s.skipped)
      .map(([id]) => id);
    const completions = storage.getCompletions();
    const proposal = checkAfterSkip([task], date, skippedIds, completions);
    if (proposal) storage.addAdaptiveProposal(proposal);
  }, [setStatusesState]);

  // Skip all remaining (non-completed) tasks of a day
  const skipDay = useCallback((tasks: PlanTask[], date: string) => {
    const allStatuses = storage.getTaskStatuses();
    const remaining = tasks.filter((t) => !allStatuses[t.id]?.completed);
    remaining.forEach((t) => {
      storage.setTaskStatus(t.id, { completed: false, skipped: true });
    });
    setStatusesState(storage.getTaskStatuses());

    if (remaining.length === 0) return;
    const updatedStatuses = storage.getTaskStatuses();
    const skippedIds = Object.entries(updatedStatuses)
      .filter(([, s]) => s.skipped)
      .map(([id]) => id);
    const completions = storage.getCompletions();
    const proposal = checkAfterSkip(remaining, date, skippedIds, completions);
    if (proposal) storage.addAdaptiveProposal(proposal);
  }, [setStatusesState]);

  return { statuses: statuses ?? {}, setTaskStatus, skipTask, skipDay, hydrated, autoSkippedCount };
}

export function useSimResults() {
  const { data: results, setData: setResultsState, hydrated } = useLocalStorage<SimulationResult[]>(
    "simResults",
    () => storage.getSimResults()
  );

  const addSimResult = useCallback(
    (r: SimulationResult) => {
      storage.addSimResult(r);
      setResultsState(storage.getSimResults());

      // Check adaptive trigger
      const allCompletions = storage.getCompletions();
      const proposal = checkAfterSimulation(allCompletions, r);
      if (proposal) {
        storage.addAdaptiveProposal(proposal);
      }
      return proposal;
    },
    [setResultsState]
  );

  return { results: results ?? [], addSimResult, hydrated };
}

export function useAdaptiveHistory(onOverridesChanged?: (o: AdaptiveOverrides) => void) {
  const { data: history, setData: setHistoryState, hydrated } = useLocalStorage<AdaptiveProposal[]>(
    "adaptiveHistory",
    () => storage.getAdaptiveHistory()
  );

  const refresh = useCallback(() => {
    setHistoryState(storage.getAdaptiveHistory());
  }, [setHistoryState]);

  const acceptProposal = useCallback((id: string) => {
    storage.updateAdaptiveProposal(id, {
      accepted: true,
      decidedAt: new Date().toISOString(),
    });
    const proposal = storage.getAdaptiveHistory().find((p) => p.id === id);
    if (proposal) {
      // Create AdaptiveTasks for add_exercise / add_review_session / increase_time+topicId
      const existing = storage.getAdaptiveTasks();
      const newTasks = buildAdaptiveTasks(proposal, existing);
      for (const t of newTasks) storage.addAdaptiveTask(t);

      // Apply overrides for grant_free_day / intensify_week / activate_notfall
      const overrides = storage.getAdaptiveOverrides();
      const today = new Date().toISOString().split("T")[0];
      let overridesChanged = false;

      for (const change of proposal.changes) {
        if (change.type === "grant_free_day") {
          const nextDay = PLAN_DATA.find((d) => d.date > today && d.type !== "exam");
          if (nextDay && !overrides.freeDays.includes(nextDay.date)) {
            overrides.freeDays.push(nextDay.date);
            overridesChanged = true;
          }
        } else if (change.type === "activate_notfall") {
          overrides.notfallMode = true;
          overrides.notfallActivatedAt = new Date().toISOString();
          overridesChanged = true;
        } else if (change.type === "intensify_week") {
          const until = new Date();
          until.setDate(until.getDate() + 7);
          overrides.intensifyWeekUntil = until.toISOString().split("T")[0];
          overridesChanged = true;
        }
      }

      if (overridesChanged) {
        storage.setAdaptiveOverrides(overrides);
        onOverridesChanged?.(overrides);
      }
    }
    setHistoryState(storage.getAdaptiveHistory());
  }, [setHistoryState, onOverridesChanged]);

  const rejectProposal = useCallback((id: string) => {
    storage.updateAdaptiveProposal(id, {
      accepted: false,
      decidedAt: new Date().toISOString(),
    });
    setHistoryState(storage.getAdaptiveHistory());
  }, [setHistoryState]);

  return { history: history ?? [], refresh, acceptProposal, rejectProposal, hydrated };
}

export function useAdaptiveTasks() {
  const { data: tasks, setData: setTasksState, hydrated } = useLocalStorage<AdaptiveTask[]>(
    "adaptiveTasks",
    () => storage.getAdaptiveTasks()
  );

  const completeTask = useCallback((id: string) => {
    storage.updateAdaptiveTask(id, { completed: true, completedAt: new Date().toISOString() });
    setTasksState(storage.getAdaptiveTasks());
  }, [setTasksState]);

  const uncompleteTask = useCallback((id: string) => {
    storage.updateAdaptiveTask(id, { completed: false, completedAt: undefined });
    setTasksState(storage.getAdaptiveTasks());
  }, [setTasksState]);

  return { tasks: tasks ?? [], completeTask, uncompleteTask, hydrated };
}

export function useAdaptiveOverrides() {
  const { data: overrides, setData: setOverridesState, hydrated } = useLocalStorage<AdaptiveOverrides>(
    "adaptiveOverrides",
    () => storage.getAdaptiveOverrides()
  );

  const setOverrides = useCallback((o: AdaptiveOverrides) => {
    setOverridesState(o);
  }, [setOverridesState]);

  const deactivateNotfall = useCallback(() => {
    const updated = { ...storage.getAdaptiveOverrides(), notfallMode: false };
    storage.setAdaptiveOverrides(updated);
    setOverridesState(updated);
  }, [setOverridesState]);

  const removeFreeDay = useCallback((date: string) => {
    const cur = storage.getAdaptiveOverrides();
    const updated = { ...cur, freeDays: cur.freeDays.filter((d) => d !== date) };
    storage.setAdaptiveOverrides(updated);
    setOverridesState(updated);
  }, [setOverridesState]);

  return {
    overrides: overrides ?? { notfallMode: false, freeDays: [] },
    setOverrides,
    deactivateNotfall,
    removeFreeDay,
    hydrated,
  };
}

export function useMasteries() {
  const { completions, hydrated } = useCompletions();
  const [masteries, setMasteries] = useState<Record<string, TopicMastery>>({});

  useEffect(() => {
    if (hydrated) {
      setMasteries(calculateAllMasteries(completions));
    }
  }, [completions, hydrated]);

  return { masteries, hydrated };
}
