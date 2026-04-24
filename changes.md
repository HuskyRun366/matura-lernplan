# Änderungsprotokoll

Format: `## YYYY-MM-DD — <Kurztitel>`, danach Bullet-Liste (Was / Warum).
Neueste Änderung oben. Jede Code-Änderung wird hier eingetragen.

## 2026-04-23 — Matura-Beispiele (Vercel Blob) + Dropdown-Fix

- `scripts/sync-matura-pdfs.mjs` (NEU): Einmal-Script, fetcht alle HTL-Klausuren
  Angewandte Mathematik (HTL 1 = Teil A, HTL 2 = Teil B) von matura.gv.at und
  lädt sie in Vercel Blob. 13 Collections erkannt, 26 PDFs hochgeladen
  (Schuljahre 2020–2025, Winter- und Herbsttermin, je Aufgaben + Lösungen).
- `src/app/api/matura-pdfs/route.ts` (NEU): `GET /api/matura-pdfs` — listet alle
  Blob-Dateien unter dem Prefix `matura/` als JSON.
- `src/app/(app)/matura-beispiele/page.tsx` (NEU): Neue Seite, gruppiert die
  PDFs nach Schuljahr, Termin und Teil (HTL 1/2) mit direkten Blob-Links.
  `export const dynamic = "force-dynamic"` gesetzt (Blob-Token nur zur Laufzeit).
- `src/components/layout/sidebar.tsx`: Nav-Eintrag „Matura-Beispiele" (Icon:
  BookMarked) nach Simulationen eingefügt.
- `src/components/ui/select.tsx:120`: Focus-Farben in `SelectItem` von
  `accent`/`accent-foreground` auf `primary`/`primary-foreground` umgestellt —
  Fix für weißen Text auf weißem Hintergrund im Light Mode (accent ≈ weiß).

## 2026-04-18 — Vordefinierte Aufgaben im AddTaskDialog + Placeholder-Fix

- `src/components/tagesplan/add-task-dialog.tsx`: Neue Select-Liste
  „Vordefiniert (optional)" am Anfang des Formulars. Einträge:
  - 8 Programmier-Übungen aus `UEBUNGEN` (Kakuro, Gomoku, …)
  - 8 Simulationen aus `SIMULATIONS`
  Auswahl füllt Titel, Beschreibung, Fach, Dauer und Themen vor; alle
  Felder bleiben danach editierbar.
- `src/app/page.tsx`: Name-Placeholder von „z.B. Viktor" auf
  „Dein Vorname" geändert — kein Vorname mehr als Demo-Text.

Warum: Der Nutzer wollte eigene Aufgaben auch aus vorhandenen Übungen/
Simulationen befüllen können, statt alles von Hand einzutippen. Der
persönliche Platzhalter-Name passt nicht in die App.

## 2026-04-18 — Konzept-Überarbeitung: Umsetzung abgeschlossen

- **Typen & Storage**
  - `src/lib/types.ts`: Neue Entitäten `UserPlanConfig`, `UserTask`,
    `TaskSuggestion`, `SuggestionReasonKind`, `TaskType` (+ `TaskSubject`).
    `ExerciseCompletion` um optionales `taskType` erweitert, damit die IRT-
    Rasch-Berechnung beim Mastery-Update ohne harten Plan-Bezug auskommt.
  - Neue `STORAGE_KEYS`: `planConfig`, `userTasks`, `suggestions`,
    `schemaVersion`. `CURRENT_SCHEMA_VERSION = 2`.
  - `src/lib/storage.ts`: Migration v1→v2 löscht Legacy-Keys
    (`task-status`, `adaptive-history`, `adaptive-tasks`,
    `adaptive-overrides`) sowie Completions/Simulationsergebnisse.
    Der Name (`mlp:user`) bleibt erhalten, damit kein erneutes Onboarding
    nötig ist. Neu: CRUD-Funktionen für UserTasks, Suggestions,
    Plan-Config.

- **Suggestion-Engine & Plan-Daten**
  - `src/lib/plan-data.ts` entkernt: nur noch `SIMULATIONS` +
    `DEFAULT_PROG_EXAM_DATE` / `DEFAULT_MATH_EXAM_DATE`. `PLAN_DATA` und
    `WEEKS` sind entfernt.
  - `src/lib/suggestions/generator.ts` neu: produziert je nach Mastery,
    Trend, SM-2-Review-Fälligkeit, Nichtbegonnen-Status, Simulationstag
    bis zu 6 priorisierte Vorschläge für ein Datum.
  - `src/lib/adaptive/engine.ts` entfernt — Vorschlags-Logik ist komplett
    in den Generator gewandert, die Mastery-Algorithmen (SM-2, IRT,
    Interleaving) in `mastery.ts` bleiben erhalten.
  - `src/lib/adaptive/mastery.ts`: keine PLAN_DATA-Abhängigkeit mehr, IRT-
    Lookup erfolgt über den `taskType` auf der Completion.

- **Progress-Aggregation**
  - `src/lib/progress/aggregate.ts` neu: `aggregateByCategory`,
    `aggregateByDate`, `calculateOverallProgress` (prioritätsgewichtet).

- **Hooks**
  - `src/hooks/use-storage.ts` komplett neu: `useUser`, `usePlanConfig`,
    `useUserTasks`, `useCompletions`, `useSimResults`, `useMasteries`,
    `useSuggestions`, `useAutoSuggestions(date)` (regeneriert pending
    Suggestions bei Mastery-/Task-/Config-Änderungen).

- **UI**
  - Onboarding (`src/app/page.tsx`): zweistufig — Name, dann Prüfungstermine
    (vorbelegt mit 2026-05-04 / 2026-05-11, frei wählbar) und tägliches
    Lernbudget (1–6h Slider).
  - Dashboard (`src/app/(app)/dashboard/page.tsx`): Countdown,
    Tages-Summary, gewichteter Gesamtfortschritt pro Fach, Bereichs-Liste,
    Bar-Chart der letzten 7 Tage.
  - Tagesplan (`src/app/(app)/tagesplan/[date]/page.tsx`): Nutzer-getriebene
    Task-Liste mit Checkbox/Bewerten/Löschen, `AddTaskDialog`,
    `SuggestionList` (optional, ein-/ausblendbar). Kein starrer Plan, keine
    Carried-Over-/Notfall-Logik mehr.
  - Fortschritt (`src/app/(app)/fortschritt/page.tsx`): Tabs
    **Gesamt / Bereiche / Tage** (Mastery-Bars, Kategorien, Tage-Liste).
  - Einstellungen: neuer Abschnitt „Plan-Konfiguration" (Prüfungsdaten,
    Budget, Vorschläge ein/aus).
  - Neue Komponenten:
    - `src/components/tagesplan/add-task-dialog.tsx`
    - `src/components/tagesplan/suggestion-list.tsx`
    - `src/components/dashboard/category-progress.tsx`
  - `AssessmentDialog` nimmt optional `taskType` entgegen und schreibt es
    in die Completion.
  - Topic-Detail-Seiten (Mathe/Prog) zeigen „Aufgaben" jetzt aus
    `UserTask.exercises` statt aus PLAN_DATA.

- **Verifikation**
  - `npm run build` läuft ohne TS-Fehler durch (Next.js 16.2.1 / Turbopack,
    11 Seiten).

Warum: Der starre 40-Tage-Plan wurde durch Nutzer-gesteuerte Tages-Todos
ersetzt. Die App bleibt als Coach erhalten (optionale Vorschläge,
adaptive Mastery-Berechnung), zwingt aber nichts mehr auf. Der
Vollreset stellt sicher, dass die alten, plan-gebundenen Statusdaten
nicht in die neue Welt leaken.

## 2026-04-17 — Konzept-Überarbeitung: Nutzer-definierte Tagespläne (Start)

- `.claude/launch.json` angelegt (Next.js-Dev-Server-Konfiguration).
- `changes.md` neu: Protokolldatei für alle zukünftigen Änderungen.
- `AGENTS.md` ergänzt um Dokumentationspflicht gegenüber `changes.md`.

Warum: Der starre 40-Tage-Plan wird durch ein Nutzer-getriebenes Todo-System
mit optionalen Vorschlägen ersetzt. Fortschritt wird künftig pro Bereich
(Teil A/B, Praxis/Theorie) und pro Tag angezeigt. Details siehe Plan unter
`~/.claude/plans/bitte-ab-jetzt-alle-glimmering-sonnet.md`.
