"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  ExerciseCompletion,
  TaskStatus,
  SimulationResult,
  AdaptiveProposal,
  TopicMastery,
} from "@/lib/types";
import * as storage from "@/lib/storage";
import { calculateAllMasteries } from "@/lib/adaptive/mastery";
import { checkAfterExercise, checkAfterSimulation, checkAfterSkip } from "@/lib/adaptive/engine";
import { PlanTask } from "@/lib/types";

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

  const addCompletion = useCallback(
    (c: ExerciseCompletion) => {
      storage.addCompletion(c);
      const updated = storage.getCompletions();
      setCompletionsState(updated);

      // Check adaptive trigger
      const proposal = checkAfterExercise(updated, c);
      if (proposal) {
        storage.addAdaptiveProposal(proposal);
      }
      return proposal;
    },
    [setCompletionsState]
  );

  return { completions: completions ?? [], addCompletion, hydrated };
}

export function useTaskStatuses() {
  const { data: statuses, setData: setStatusesState, hydrated } = useLocalStorage<Record<string, TaskStatus>>(
    "taskStatus",
    () => storage.getTaskStatuses()
  );

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

  return { statuses: statuses ?? {}, setTaskStatus, skipTask, skipDay, hydrated };
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

export function useAdaptiveHistory() {
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
    setHistoryState(storage.getAdaptiveHistory());
  }, [setHistoryState]);

  const rejectProposal = useCallback((id: string) => {
    storage.updateAdaptiveProposal(id, {
      accepted: false,
      decidedAt: new Date().toISOString(),
    });
    setHistoryState(storage.getAdaptiveHistory());
  }, [setHistoryState]);

  return { history: history ?? [], refresh, acceptProposal, rejectProposal, hydrated };
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
