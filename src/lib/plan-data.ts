import { SimulationDefinition } from "./types";

// ═══════════════════════════════════════════
// Static reference data (post-refactor)
//
// The hardcoded 40-day plan has been removed. Tages-Tasks werden jetzt
// pro Nutzer in `mlp:user-tasks` (siehe types.ts) gespeichert.
// Hier verbleiben nur:
//  - SIMULATIONS: festgelegte Übungs-Simulationen (Mathe / Prog)
//  - Default-Prüfungsdaten (werden im Onboarding kopiert, dann frei wählbar)
// ═══════════════════════════════════════════

export const SIMULATIONS: SimulationDefinition[] = [
  { id: "sim-math-1", name: "Simulation 1", subject: "math", date: "2026-04-11", targetPercent: 60 },
  { id: "sim-math-2", name: "Simulation 2", subject: "math", date: "2026-04-18", targetPercent: 70 },
  { id: "sim-math-3", name: "Simulation 3", subject: "math", date: "2026-04-25", targetPercent: 80 },
  { id: "sim-math-4", name: "Simulation 4", subject: "math", date: "2026-05-06", targetPercent: 85 },
  { id: "sim-math-5", name: "Generalprobe", subject: "math", date: "2026-05-09", targetPercent: 90 },
  { id: "sim-prog-1", name: "Mini-Prüfung", subject: "prog", date: "2026-04-18", targetPercent: 60 },
  { id: "sim-prog-2", name: "Prog-Simulation", subject: "prog", date: "2026-04-25", targetPercent: 70 },
  { id: "sim-prog-3", name: "Generalprobe Prog", subject: "prog", date: "2026-05-01", targetPercent: 80 },
];

// Default-Prüfungsdaten für das Onboarding. Nach Bestätigung werden sie
// in UserPlanConfig gespeichert und können frei geändert werden.
export const DEFAULT_PROG_EXAM_DATE = "2026-05-04";
export const DEFAULT_MATH_EXAM_DATE = "2026-05-11";
