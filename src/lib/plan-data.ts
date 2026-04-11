import { PlanDay, SimulationDefinition, WeekDefinition } from "./types";

// ═══════════════════════════════════════════
// Static Plan Data — Neu ab 11. April 2026
// ═══════════════════════════════════════════

function taskId(date: string, subject: string, idx: number) {
  return `${date}-${subject}-${idx}`;
}

function exId(taskIdStr: string, idx: number) {
  return `${taskIdStr}-ex${idx}`;
}

function parseTime(time: string): number {
  const num = parseFloat(time.replace(",", ".").replace("h", ""));
  return Math.round(num * 60);
}

// Helper to create a plan day with auto-generated IDs
function day(
  date: string,
  dayName: string,
  type: "stark" | "leicht" | "exam",
  week: number,
  phase: "Aufbau" | "Puffer" | "Endphase" | "Pruefung",
  tasks: Array<{
    subject: "math" | "prog" | "sim";
    title: string;
    desc: string;
    time: string;
    topicIds: string[];
    taskType: PlanDay["tasks"][0]["type"];
    resources?: PlanDay["tasks"][0]["resources"];
    exercises?: Array<{ label: string; topicId: string; maxPoints: number; url?: string }>;
  }>
): PlanDay {
  return {
    date,
    day: dayName,
    type,
    week,
    phase,
    tasks: tasks.map((t, i) => {
      const tid = taskId(date, t.subject, i);
      return {
        id: tid,
        subject: t.subject,
        topicIds: t.topicIds,
        title: t.title,
        description: t.desc,
        time: t.time,
        durationMinutes: parseTime(t.time),
        type: t.taskType,
        resources: t.resources || [],
        exercises: (t.exercises || []).map((ex, ei) => ({
          id: exId(tid, ei),
          label: ex.label,
          topicId: ex.topicId,
          subject: (t.subject === "sim" ? "math" : t.subject) as "math" | "prog",
          maxPoints: ex.maxPoints,
          url: ex.url,
        })),
      };
    }),
  };
}

export const PLAN_DATA: PlanDay[] = [
  // ════════════════════════════════════════
  // WOCHE 1: 11.04 – 12.04 (Aufbau-Start)
  // ════════════════════════════════════════
  day("2026-04-11", "Sa", "stark", 1, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 1 — Mathe",
      desc: "Komplette Matura-Simulation Teil A + B1-B5 soweit vorhanden. 2,5h rechnen + 0,5h Nachanalyse. Jede Aufgabe bewerten: sicher / unsicher / geraten.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3"], taskType: "simulation",
      exercises: [
        { label: "Simulation 1 — Teil A komplett", topicId: "A1", maxPoints: 24, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 1 — Teil B Aufgabe 1", topicId: "B1", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 1 — Teil B Aufgabe 2", topicId: "B2", maxPoints: 8, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Netzwerkgrundlagen — Theorie & Einstieg",
      desc: "Theorie-Seite Netzwerkgrundlagen lesen. Socket-Klasse, Verbindungsaufbau TCP, Basiskonzepte (IP, Port, Protokoll). Erstes Verbindungsbeispiel nachvollziehen.",
      time: "2h", topicIds: ["NETZWERK"], taskType: "neustoff",
      exercises: [
        { label: "Netzwerkgrundlagen — Theorie lesen", topicId: "NETZWERK", maxPoints: 5, url: "/faecher/programmieren/theorie/netzwerkgrundlagen" },
        { label: "Einfachen TCP-Echo-Server implementieren", topicId: "NETZWERK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-12", "So", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "Nachanalyse Sim 1 + B1 Trigonometrie",
      desc: "0,5h Nachanalyse der Sim 1. Dann Sinussatz und Cosinussatz: Formeln herleiten und 4 Aufgaben rechnen.",
      time: "2h", topicIds: ["B1"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Trigonometrie" }],
      exercises: [
        { label: "B1 Trigonometrie — Sinussatz Dreieck berechnen", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B1 Trigonometrie — Cosinussatz fehlende Seite", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B1 Trigonometrie — Winkelberechnung im Dreieck", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B1 Trigonometrie — Anwendungsaufgabe Vermessung", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Daten Senden und Empfangen — Theorie",
      desc: "Theorie-Seite Daten Senden und Empfangen lesen. NetworkStream, StreamReader/StreamWriter, Protokolldesign. Einfachen Chat-Client implementieren.",
      time: "2,5h", topicIds: ["NETZWERK"], taskType: "neustoff",
      exercises: [
        { label: "Daten Senden/Empfangen — Theorie lesen", topicId: "NETZWERK", maxPoints: 5, url: "/faecher/programmieren/theorie/datensendenundempfangen" },
        { label: "Chat-Client: Nachrichten senden + empfangen", topicId: "NETZWERK", maxPoints: 5 },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 2: 13.04 – 19.04 (Aufbau)
  // ════════════════════════════════════════
  day("2026-04-13", "Mo", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B1 Trigonometrie II + B2 Vektorrechnung I",
      desc: "B1 abschließen (2 gemischte Aufgaben). Dann B2 starten: Vektoren, Skalarprodukt, Betrag, Einheitsvektor.",
      time: "1,5h", topicIds: ["B1", "B2"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Vektorrechnung" }],
      exercises: [
        { label: "B1 Trigonometrie — Gemischte Aufgabe Sinussatz/Cosinussatz", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Skalarprodukt berechnen", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Betrag und Einheitsvektor", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Winkel zwischen zwei Vektoren", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Höhere Socketklassen — Theorie",
      desc: "Theorie-Seite Höhere Socketklassen lesen. TcpClient, TcpListener, UdpClient, NetworkStream-Wrappers. Unterschiede TCP vs UDP verstehen.",
      time: "2h", topicIds: ["NETZWERK"], taskType: "neustoff",
      exercises: [
        { label: "Höhere Socketklassen — Theorie lesen", topicId: "NETZWERK", maxPoints: 5, url: "/faecher/programmieren/theorie/hoehere-socketklassen" },
        { label: "TcpListener-Server mit mehreren Clients", topicId: "NETZWERK", maxPoints: 5 },
        { label: "UDP-Broadcast implementieren", topicId: "NETZWERK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-14", "Di", "leicht", 2, "Aufbau", [
    {
      subject: "math", title: "B2 Vektorrechnung II",
      desc: "Kreuzprodukt, Parameterdarstellung von Geraden und Ebenen, Abstandsberechnungen.",
      time: "1h", topicIds: ["B2"], taskType: "neustoff",
      exercises: [
        { label: "B2 Vektorrechnung — Gerade in Parameterform", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Schnittpunkt zweier Geraden", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Abstand Punkt von Gerade", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Gomoku — Übung starten",
      desc: "Gomoku-Übungsangabe lesen und planen. Spielbrett-Model anlegen, UniformGrid mit DataTemplates aufbauen, Startdialog-UI.",
      time: "2h", topicIds: ["WPF_MVVM", "OOP"], taskType: "praxis",
      exercises: [
        { label: "Gomoku — Übungsangabe lesen und planen", topicId: "WPF_MVVM", maxPoints: 5, url: "/faecher/programmieren/uebungen/gomoku" },
        { label: "Gomoku — Spielbrett-Model + UniformGrid", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-15", "Mi", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B3 Analytische Geometrie I",
      desc: "Koordinatensysteme, Geradengleichungen (explizit, implizit, Parameterform), Schnittwinkel zweier Geraden.",
      time: "1,5h", topicIds: ["B3"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Analytische Geometrie" }],
      exercises: [
        { label: "B3 Analytische Geometrie — Geradengleichung aufstellen", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Schnittwinkel zweier Geraden", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Abstandsformel Punkt-Gerade", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Kreisgleichung und Schnitt", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Gomoku — MVC-Controller + Gewinnprüfung",
      desc: "Controller-Klassen (LocalController, ComputerController) nach MVC-Pattern implementieren. Gewinnprüfung: 5 in einer Reihe (horizontal, vertikal, diagonal).",
      time: "2,5h", topicIds: ["WPF_MVVM", "OOP"], taskType: "praxis",
      exercises: [
        { label: "Gomoku — LocalController nach MVC", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "Gomoku — Gewinnprüfung alle Richtungen", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-16", "Do", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B3 Analytische Geometrie II",
      desc: "Ebenengleichungen, Schnitt Gerade–Ebene, Abstand Punkt–Ebene. 4 Aufgaben.",
      time: "1,5h", topicIds: ["B3"], taskType: "neustoff",
      exercises: [
        { label: "B3 Analytische Geometrie — Ebenengleichung aufstellen", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Schnitt Gerade und Ebene", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Abstand Punkt von Ebene", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Gemischte Raumgeometrieaufgabe", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Gomoku — Netzwerk-Spielmodus",
      desc: "NetworkController: TcpListener/TcpClient. Protokoll für Züge (MOVE x y). Empfang in separatem Thread, Dispatcher.Invoke für UI.",
      time: "2h", topicIds: ["NETZWERK", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "Gomoku — NetworkController mit TcpClient", topicId: "NETZWERK", maxPoints: 5 },
        { label: "Gomoku — Thread-sichere UI-Updates per Dispatcher", topicId: "NETZWERK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-17", "Fr", "leicht", 2, "Aufbau", [
    {
      subject: "math", title: "B1–B3 Wiederholung + Teil A",
      desc: "Je 2 Aufgaben aus B1, B2, B3 als Wiederholung. 3 Teil-A-Aufgaben (schwächste Themen aus Sim 1).",
      time: "1h", topicIds: ["A1", "A2", "B1", "B2", "B3"], taskType: "wiederholung",
      exercises: [
        { label: "B1 Trigonometrie — Wiederholungsaufgabe", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Wiederholungsaufgabe", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Wiederholungsaufgabe", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "Teil A — 3 Aufgaben Schwachstellen", topicId: "A1", maxPoints: 6, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Kakuro — Übungsangabe lesen + XML-Laden",
      desc: "Kakuro-Übungsangabe lesen und planen. Datenstruktur (Kakuro, Field, Sum) anlegen. XML-Deserialisierung mit XmlSerializer oder LINQ to XML.",
      time: "2h", topicIds: ["XML", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "Kakuro — Übungsangabe lesen und planen", topicId: "XML", maxPoints: 5, url: "/faecher/programmieren/uebungen/kakuro" },
        { label: "Kakuro — XML-Datei laden + Klassen deserialisieren", topicId: "XML", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-18", "Sa", "stark", 2, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 2 — Mathe",
      desc: "Vollständige Matura-Simulation Teil A + Teil B. 2,5h Bearbeitungszeit. Direkt danach: Lösungen vergleichen, Fehlerprotokoll.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3"], taskType: "simulation",
      exercises: [
        { label: "Simulation 2 — Teil A komplett", topicId: "A1", maxPoints: 24, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 2 — Teil B Aufgabe 1", topicId: "B1", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 2 — Teil B Aufgabe 2", topicId: "B2", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 2 — Teil B Aufgabe 3", topicId: "B3", maxPoints: 8, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "sim", title: "MINI-PRÜFUNG — Programmieren",
      desc: "Eigene Prüfungssimulation Prog: Kleines WPF+Netzwerk Programm in 3h umsetzen (z.B. einfacher Chat-Server mit GUI). Bedingungen wie bei Prüfung.",
      time: "3,5h", topicIds: ["NETZWERK", "WPF_MVVM"], taskType: "simulation",
      exercises: [
        { label: "Mini-Prüfung Prog — Chat-Server + WPF-Client", topicId: "NETZWERK", maxPoints: 10 },
      ],
    },
  ]),
  day("2026-04-19", "So", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "Nachanalyse Sim 2 + B4 Differentialrechnung I",
      desc: "0,5h Sim-2-Nachanalyse. Dann B4: Ableitungsregeln (Ketten-, Produkt-, Quotientenregel), 4 Aufgaben.",
      time: "2h", topicIds: ["B4"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Differentialrechnung" }],
      exercises: [
        { label: "B4 Differentialrechnung — Kettenregel anwenden", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Produktregel anwenden", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Quotientenregel anwenden", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Verkettete Funktionen ableiten", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Threads erstellen — Theorie",
      desc: "Theorie-Seite Threads erstellen lesen. Thread-Klasse, Start/Join, ThreadStart, ParameterizedThreadStart, Thread-Lebenszyklus.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      exercises: [
        { label: "Threads erstellen — Theorie lesen", topicId: "MULTITHREADING", maxPoints: 5, url: "/faecher/programmieren/theorie/threads-erstellen" },
        { label: "Mehrere Threads parallel starten und joinen", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 3: 20.04 – 26.04 (Aufbau)
  // ════════════════════════════════════════
  day("2026-04-20", "Mo", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B4 Differentialrechnung II",
      desc: "Trig-/Log-/Exp-Funktionen ableiten. Extremwertaufgaben (Monotonie, Wendepunkte). 5 Aufgaben.",
      time: "1,5h", topicIds: ["B4"], taskType: "neustoff",
      exercises: [
        { label: "B4 Differentialrechnung — Trigonometrische Funktion ableiten", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Logarithmische Funktion ableiten", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Extremwert berechnen", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Wendepunkt und Monotonie", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Optimierungsaufgabe", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "ThreadPool — Theorie + Praxis",
      desc: "Theorie-Seite ThreadPool lesen. ThreadPool.QueueUserWorkItem, Task Parallel Library (Task.Run), async/await Grundlagen.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      exercises: [
        { label: "ThreadPool — Theorie lesen", topicId: "MULTITHREADING", maxPoints: 5, url: "/faecher/programmieren/theorie/threadpool" },
        { label: "ThreadPool.QueueUserWorkItem vs Task.Run", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Mehrere parallele Downloads simulieren", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-21", "Di", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B5 Integralrechnung I",
      desc: "Stammfunktionen, Hauptsatz der Differential- und Integralrechnung, bestimmtes Integral. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B5"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Integralrechnung" }],
      exercises: [
        { label: "B5 Integralrechnung — Stammfunktion bestimmen (Polynom)", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Stammfunktion Trig/Exp/Log", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Bestimmtes Integral berechnen", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Lineare Substitution", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Flächeninhalt unter Kurve", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Thread-Synchronisation — Theorie",
      desc: "Theorie-Seite Thread-Synchronisation Grundlagen lesen. lock/Monitor, Mutex, kritische Abschnitte, Race Conditions verstehen.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      exercises: [
        { label: "Thread-Synchronisation — Theorie lesen", topicId: "MULTITHREADING", maxPoints: 5, url: "/faecher/programmieren/theorie/thread-synchronisation" },
        { label: "Race Condition mit lock lösen", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Mutex für prozessübergreifende Synchronisation", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-22", "Mi", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B5 Integralrechnung II",
      desc: "Fläche zwischen zwei Kurven, partielle Integration. 4 Aufgaben.",
      time: "1,5h", topicIds: ["B5"], taskType: "neustoff",
      exercises: [
        { label: "B5 Integralrechnung — Fläche zwischen zwei Kurven", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Partielle Integration einfach", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Partielle Integration komplex", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Gemischte Aufgabe", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Thread-Synchronisation Fortgeschritten — Theorie",
      desc: "Theorie-Seite Thread-Synchronisation Fortgeschritten lesen. AutoResetEvent, ManualResetEvent, CountdownEvent, Semaphore, Producer-Consumer.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      exercises: [
        { label: "Thread-Synchronisation Fortgeschritten — Theorie lesen", topicId: "MULTITHREADING", maxPoints: 5, url: "/faecher/programmieren/theorie/thread-synchronisation-fort" },
        { label: "Producer-Consumer mit AutoResetEvent", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Semaphore für beschränkten Ressourcenzugriff", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-23", "Do", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B4 + B5 Wiederholung",
      desc: "Gemischte Aufgaben: 2× Differentialrechnung, 2× Integralrechnung. Ziel: 80% Trefferquote.",
      time: "1h", topicIds: ["B4", "B5"], taskType: "wiederholung",
      exercises: [
        { label: "B4 Differentialrechnung — Wiederholungsaufgabe gemischt", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Optimierungsaufgabe Anwendung", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Wiederholungsaufgabe gemischt", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Flächenaufgabe Anwendung", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Schiffe versenken — Übung",
      desc: "Schiffe versenken Übungsangabe lesen. Model + zwei Views mit MVVM anlegen. Placement-Phase (Schiffe setzen) implementieren.",
      time: "2,5h", topicIds: ["WPF_MVVM", "NETZWERK"], taskType: "praxis",
      exercises: [
        { label: "Schiffe versenken — Übungsangabe lesen und planen", topicId: "WPF_MVVM", maxPoints: 5, url: "/faecher/programmieren/uebungen/schiffeversenken" },
        { label: "Schiffe versenken — Model + MVVM-Bindings", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "Schiffe versenken — Placement-Phase + Regelprüfung", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-24", "Fr", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B6 Stochastik I",
      desc: "Kombinatorik (Permutation, Kombination, Variation), Grundbegriffe Wahrscheinlichkeit, Additions-/Multiplikationssatz.",
      time: "1,5h", topicIds: ["B6"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Stochastik" }],
      exercises: [
        { label: "B6 Stochastik — Kombinatorik Permutation", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Kombinatorik Kombination ohne Wiederholung", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Additionssatz und Multiplikationssatz", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Bedingte Wahrscheinlichkeit", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Formale Sprachen + Grammatiken — Theorie",
      desc: "Theorie-Seite Formale Sprachen und Grammatiken lesen. BNF/EBNF, kontextfreie Grammatiken, DEA/NEA, reguläre Sprachen.",
      time: "2h", topicIds: ["GRAMMATIK", "AUTOMATEN"], taskType: "neustoff",
      exercises: [
        { label: "Formale Sprachen — Theorie lesen", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/theorie/formale-sprachen-grammatik" },
        { label: "Formale Sprachen — Übungsblatt Aufgaben 1–3", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/uebungen/formalesprachen" },
      ],
    },
  ]),
  day("2026-04-25", "Sa", "stark", 3, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 3 — Mathe",
      desc: "Vollständige Matura-Simulation Teil A + Teil B (B1–B6). 2,5h Bearbeitungszeit. Fehlerprotokoll führen.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6"], taskType: "simulation",
      exercises: [
        { label: "Simulation 3 — Teil A komplett", topicId: "A1", maxPoints: 24, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 3 — Teil B Aufgabe 1", topicId: "B4", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 3 — Teil B Aufgabe 2", topicId: "B5", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 3 — Teil B Aufgabe 3", topicId: "B6", maxPoints: 8, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "sim", title: "PROG-SIMULATION — Programmieren",
      desc: "Vollständige Prog-Prüfungssimulation: WPF + Multithreading in 4h umsetzen. Vorgegebenes Projekt erweitern. Nachanalyse: Was hat nicht geklappt?",
      time: "4,5h", topicIds: ["MULTITHREADING", "WPF_MVVM", "NETZWERK"], taskType: "simulation",
      exercises: [
        { label: "Prog-Simulation — WPF + Threading Projekt", topicId: "MULTITHREADING", maxPoints: 10 },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 4: 26.04 – 03.05 (Puffer)
  // ════════════════════════════════════════
  day("2026-04-26", "So", "stark", 4, "Puffer", [
    {
      subject: "math", title: "Nachanalyse Sim 3 + B6 Stochastik II",
      desc: "0,5h Nachanalyse Sim 3. Dann B6: Binomialverteilung, Bernoulli-Experiment, Erwartungswert.",
      time: "2h", topicIds: ["B6"], taskType: "neustoff",
      exercises: [
        { label: "B6 Stochastik — Binomialverteilung berechnen", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Bernoulli-Experiment und Erwartungswert", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Wahrscheinlichkeit aus Tabelle ablesen", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Compiler — Theorie",
      desc: "Theorie-Seite Compiler-Grundlagen lesen. Tokenizer (Regex), rekursiv-absteigender Parser, AST aufbauen, Interpreter-Pattern auswerten.",
      time: "2,5h", topicIds: ["GRAMMATIK", "ALGORITHMEN"], taskType: "neustoff",
      exercises: [
        { label: "Compiler — Theorie lesen", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/theorie/compiler" },
        { label: "Compiler — Einfachen Tokenizer mit Regex implementieren", topicId: "GRAMMATIK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-27", "Mo", "stark", 4, "Puffer", [
    {
      subject: "math", title: "B7 Statistik",
      desc: "Deskriptive Statistik: Mittelwert, Median, Standardabweichung, Boxplot, Häufigkeitsverteilung, Normalverteilung.",
      time: "1,5h", topicIds: ["B7"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://www.aufgabenpool.at", label: "Aufgabenpool.at — Statistik" }],
      exercises: [
        { label: "B7 Statistik — Mittelwert, Median, Modus berechnen", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Standardabweichung und Varianz", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Boxplot interpretieren und zeichnen", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Normalverteilung und Z-Transformation", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Taschenrechner — Übung starten",
      desc: "Taschenrechner-Übungsangabe lesen. Grammatik in EBNF definieren, UML-Klassenstruktur nach Interpreter-Pattern planen.",
      time: "2,5h", topicIds: ["GRAMMATIK", "ALGORITHMEN"], taskType: "praxis",
      exercises: [
        { label: "Taschenrechner — Übungsangabe lesen und planen", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/uebungen/taschenrechner" },
        { label: "Taschenrechner — EBNF-Grammatik für Ausdrücke definieren", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Taschenrechner — UML Interpreter-Pattern planen", topicId: "GRAMMATIK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-28", "Di", "stark", 4, "Puffer", [
    {
      subject: "math", title: "B7 Statistik II + B8 Folgen und Reihen I",
      desc: "B7 abschließen (Regression, Korrelation). B8 starten: Arithmetische und geometrische Folgen, Grenzwerte.",
      time: "1,5h", topicIds: ["B7", "B8"], taskType: "neustoff",
      exercises: [
        { label: "B7 Statistik — Lineare Regression und Korrelationskoeffizient", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Arithmetische Folge: n-tes Glied und Summe", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Geometrische Folge: Quotient und Summe", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Grenzwert einer Folge berechnen", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Taschenrechner — Regex-Tokenizer + Parser",
      desc: "Regex-Tokenizer implementieren. Rekursiv-absteigenden Parser implementieren (ParseExpr, ParseTerm, ParseFactor). AST aufbauen.",
      time: "2,5h", topicIds: ["GRAMMATIK", "ALGORITHMEN"], taskType: "praxis",
      exercises: [
        { label: "Taschenrechner — Regex-Tokenizer implementieren", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Taschenrechner — Rekursiv-absteigender Parser", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Taschenrechner — AST aufbauen + auswerten", topicId: "ALGORITHMEN", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-29", "Mi", "stark", 4, "Puffer", [
    {
      subject: "math", title: "B8 Folgen und Reihen II + B9 Komplexe Zahlen I",
      desc: "B8 abschließen: geometrische Reihe, Grenzwert. B9 starten: Komplexe Zahlen Grundrechenarten, Betrag, konjugiert komplex.",
      time: "1,5h", topicIds: ["B8", "B9"], taskType: "neustoff",
      exercises: [
        { label: "B8 Folgen — Geometrische Reihe und Grenzwert", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Addition und Multiplikation", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Betrag und konjugiert komplex", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Division komplexer Zahlen", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Graphentheorie — Theorie",
      desc: "Theorie-Seite Graphentheorie lesen. Adjazenzmatrix/-liste, BFS, DFS, Dijkstra-Algorithmus, minimaler Spannbaum.",
      time: "2h", topicIds: ["GRAPHENTHEORIE"], taskType: "neustoff",
      exercises: [
        { label: "Graphentheorie — Theorie lesen", topicId: "GRAPHENTHEORIE", maxPoints: 5, url: "/faecher/programmieren/theorie/graphentheorie" },
        { label: "Graphentheorie — BFS und DFS implementieren", topicId: "GRAPHENTHEORIE", maxPoints: 5 },
        { label: "Graphentheorie — Dijkstra implementieren", topicId: "GRAPHENTHEORIE", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-30", "Do", "stark", 4, "Puffer", [
    {
      subject: "math", title: "B9 Komplexe Zahlen II + Teil A Wiederholung",
      desc: "B9 Polarform, De Moivre. 4 Teil-A-Aufgaben (Schwachstellen aus letzter Sim).",
      time: "1,5h", topicIds: ["B9", "A1", "A2"], taskType: "neustoff",
      exercises: [
        { label: "B9 Komplexe Zahlen — Polarform und trigonometrische Form", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — De Moivre und n-te Wurzeln", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "Teil A — Wiederholung Schwachstellen (3 Aufgaben)", topicId: "A1", maxPoints: 6, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "IP-Graph — Übung",
      desc: "IP-Graph Übungsangabe lesen. SQLite-Datenbank mit ORM einbinden, Graph-Custom-Control laden, Dijkstra für kürzeste Route.",
      time: "2,5h", topicIds: ["GRAPHENTHEORIE", "LINQ"], taskType: "praxis",
      exercises: [
        { label: "IP-Graph — Übungsangabe lesen und planen", topicId: "GRAPHENTHEORIE", maxPoints: 5, url: "/faecher/programmieren/uebungen/ipgraph" },
        { label: "IP-Graph — SQLite + ORM einbinden", topicId: "GRAPHENTHEORIE", maxPoints: 5 },
        { label: "IP-Graph — Dijkstra + Route anzeigen", topicId: "GRAPHENTHEORIE", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-05-01", "Fr", "stark", 4, "Puffer", [
    {
      subject: "math", title: "B6–B9 Wiederholung",
      desc: "Je 1 Aufgabe aus B6, B7, B8, B9 als Wiederholung. Dann 3 Teil-A-Aufgaben.",
      time: "1h", topicIds: ["B6", "B7", "B8", "B9"], taskType: "wiederholung",
      exercises: [
        { label: "B6 Stochastik — Wiederholungsaufgabe Binomialverteilung", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Wiederholungsaufgabe Normalverteilung", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Wiederholungsaufgabe Grenzwert", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Wiederholungsaufgabe Polarform", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "sim", title: "GENERALPROBE — Programmieren",
      desc: "Vollständige Prog-Generalprobe (4h) unter Prüfungsbedingungen: Aufgabe aus Übungspool selbst wählen und umsetzen. Danach Selbstbewertung.",
      time: "4,5h", topicIds: ["NETZWERK", "MULTITHREADING", "WPF_MVVM", "GRAMMATIK"], taskType: "simulation",
      exercises: [
        { label: "Generalprobe Prog — Komplettes Projekt umsetzen", topicId: "WPF_MVVM", maxPoints: 10 },
      ],
    },
  ]),
  day("2026-05-02", "Sa", "stark", 4, "Puffer", [
    {
      subject: "math", title: "Komplette Mathe-Wiederholung B1–B5",
      desc: "B1–B5 Blitzdurchlauf: je 1 Aufgabe pro Thema. Ziel: alle in < 20 Min lösen. Fehler sofort nachbessern.",
      time: "2h", topicIds: ["B1", "B2", "B3", "B4", "B5"], taskType: "wiederholung",
      exercises: [
        { label: "B1 Trigonometrie — Schnelltest", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B2 Vektorrechnung — Schnelltest", topicId: "B2", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — Schnelltest", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B4 Differentialrechnung — Schnelltest", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Schnelltest", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Aussagenlogik-Parser — Übung",
      desc: "Aussagenlogik-Parser Übungsangabe lesen. ABNF-Grammatik definieren, Parser implementieren, Wahrheitstabelle aufbauen.",
      time: "3h", topicIds: ["LOGIK", "GRAMMATIK", "AUTOMATEN"], taskType: "praxis",
      exercises: [
        { label: "Aussagenlogik-Parser — Übungsangabe lesen", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/uebungen/aussagenlogikparser" },
        { label: "Aussagenlogik-Parser — Grammatik + Parser implementieren", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Aussagenlogik-Parser — Wahrheitstabelle generieren", topicId: "GRAMMATIK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-05-03", "So", "stark", 4, "Puffer", [
    {
      subject: "math", title: "Komplette Mathe-Wiederholung B6–B9 + Teil A",
      desc: "B6–B9 + Teil A Blitzdurchlauf. Prüfungstaktik wiederholen: Punkte-Management, Zeitaufteilung.",
      time: "2h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B6", "B7", "B8", "B9"], taskType: "wiederholung",
      exercises: [
        { label: "B6 Stochastik — Schnelltest", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Schnelltest", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Schnelltest", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Schnelltest", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "Teil A — 5 gemischte Aufgaben Prüfungstaktik", topicId: "A1", maxPoints: 10, url: "https://www.aufgabenpool.at" },
      ],
    },
    {
      subject: "prog", title: "Formale Sprachen — Übungen + Osterhase",
      desc: "Formale Sprachen Übungsblatt Aufgaben 4–8 (kontextfreie Grammatiken, DEA). Dann Osterhase-Übung anschauen (LINQ + Graphen).",
      time: "2,5h", topicIds: ["GRAMMATIK", "AUTOMATEN", "LINQ"], taskType: "praxis",
      exercises: [
        { label: "Formale Sprachen — Übungen 4–8 (Grammatiken + DEA)", topicId: "GRAMMATIK", maxPoints: 5, url: "/faecher/programmieren/uebungen/formalesprachen" },
        { label: "Osterhase — Übungsangabe lesen und planen", topicId: "LINQ", maxPoints: 5, url: "/faecher/programmieren/uebungen/osterhase" },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 5: 04.05 – 10.05 (Endphase)
  // ════════════════════════════════════════
  day("2026-05-04", "Mo", "exam", 5, "Pruefung", [
    {
      subject: "prog", title: "PROGRAMMIEREN — MATURA-PRÜFUNG",
      desc: "Matura-Prüfung Programmieren. Ruhig bleiben, Zeitmanagement beachten. Frühzeitig starten, Hilfe-Materialien nutzen.",
      time: "4h", topicIds: ["NETZWERK", "MULTITHREADING", "WPF_MVVM", "GRAMMATIK", "GRAPHENTHEORIE"], taskType: "simulation",
      exercises: [],
    },
  ]),
  day("2026-05-05", "Di", "leicht", 5, "Endphase", [
    {
      subject: "math", title: "Mathe Entspannung + B1–B3 Kurzdurchlauf",
      desc: "Lockerer Tag nach Prog-Prüfung. B1–B3 Formeln kurz wiederholen (keine neuen Aufgaben). Skript lesen.",
      time: "1h", topicIds: ["B1", "B2", "B3"], taskType: "wiederholung",
      exercises: [
        { label: "B1–B3 — Formelblatt wiederholen", topicId: "B1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B3 Analytische Geometrie — 1 Aufgabe zur Sicherheit", topicId: "B3", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),
  day("2026-05-06", "Mi", "stark", 5, "Endphase", [
    {
      subject: "sim", title: "SIMULATION 4 — Mathe",
      desc: "Vollständige Matura-Simulation unter Prüfungsbedingungen. Teil A (75 Min) + Teil B. Detaillierte Nachanalyse.",
      time: "3,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [
        { label: "Simulation 4 — Teil A komplett", topicId: "A1", maxPoints: 24, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 4 — Teil B Aufgabe 1", topicId: "B4", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 4 — Teil B Aufgabe 2", topicId: "B5", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 4 — Teil B Aufgabe 3", topicId: "B6", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Simulation 4 — Teil B Aufgabe 4", topicId: "B7", maxPoints: 8, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),
  day("2026-05-07", "Do", "stark", 5, "Endphase", [
    {
      subject: "math", title: "Nachanalyse Sim 4 + Schwachstellen schließen",
      desc: "Sim-4-Nachanalyse. Alle Fehler einzeln nachrechnen. Gezielte Wiederholung der schwächsten 2 B-Themen.",
      time: "2,5h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "lueckenschluss",
      exercises: [
        { label: "Nachanalyse Sim 4 — Fehler aus Teil A korrigieren", topicId: "A1", maxPoints: 6, url: "https://www.aufgabenpool.at" },
        { label: "Nachanalyse Sim 4 — Fehler Teil B Aufgabe 1 nachrechnen", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "Nachanalyse Sim 4 — Schwächstes Thema: 3 Zusatzaufgaben", topicId: "B5", maxPoints: 6, url: "https://www.aufgabenpool.at" },
        { label: "Nachanalyse Sim 4 — Zweit-schwächstes Thema: 2 Aufgaben", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),
  day("2026-05-08", "Fr", "stark", 5, "Endphase", [
    {
      subject: "math", title: "Letzter Schliff — B4–B9 + Prüfungstaktik",
      desc: "Alle B-Themen nochmals je 1 Aufgabe. Prüfungstaktik: Teil A zuerst, Punkte-Management, Zeitaufteilung. Formelblatt auswendig lernen.",
      time: "2h", topicIds: ["B4", "B5", "B6", "B7", "B8", "B9"], taskType: "wiederholung",
      exercises: [
        { label: "B4 Differentialrechnung — Letzter Schliff", topicId: "B4", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B5 Integralrechnung — Letzter Schliff", topicId: "B5", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B6 Stochastik — Letzter Schliff", topicId: "B6", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B7 Statistik — Letzter Schliff", topicId: "B7", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B8 Folgen — Letzter Schliff", topicId: "B8", maxPoints: 4, url: "https://www.aufgabenpool.at" },
        { label: "B9 Komplexe Zahlen — Letzter Schliff", topicId: "B9", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),
  day("2026-05-09", "Sa", "stark", 5, "Endphase", [
    {
      subject: "sim", title: "GENERALPROBE — Mathe",
      desc: "Letzte vollständige Mathe-Generalprobe unter echten Prüfungsbedingungen. Uhr stellen, Handy weg. Detaillierte Selbstbewertung danach.",
      time: "3,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [
        { label: "Generalprobe Mathe — Teil A komplett", topicId: "A1", maxPoints: 24, url: "https://www.aufgabenpool.at" },
        { label: "Generalprobe Mathe — Teil B Aufgabe 1", topicId: "B4", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Generalprobe Mathe — Teil B Aufgabe 2", topicId: "B5", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Generalprobe Mathe — Teil B Aufgabe 3", topicId: "B7", maxPoints: 8, url: "https://www.aufgabenpool.at" },
        { label: "Generalprobe Mathe — Teil B Aufgabe 4", topicId: "B9", maxPoints: 8, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),
  day("2026-05-10", "So", "leicht", 5, "Endphase", [
    {
      subject: "math", title: "Letzter Tag — Formeln wiederholen + entspannen",
      desc: "Kein neues Stoff. Nur Formelblatt durchgehen, letzte Unklarheiten klären. Früh schlafen gehen.",
      time: "1h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"], taskType: "wiederholung",
      exercises: [
        { label: "Formelblatt und Merksätze wiederholen", topicId: "A1", maxPoints: 4, url: "https://www.aufgabenpool.at" },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // 11.05 — MATHE MATURA
  // ════════════════════════════════════════
  day("2026-05-11", "Mo", "exam", 5, "Pruefung", [
    {
      subject: "math", title: "MATHEMATIK — MATURA-PRÜFUNG",
      desc: "Matura-Prüfung Mathematik. Teil A zuerst (75 Min), dann Teil B. Ruhig bleiben, Taschenrechner und Formelblatt nutzen.",
      time: "4h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [],
    },
  ]),
];

// ═══════════════════════════════════════════
// Simulations
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

// ═══════════════════════════════════════════
// Weeks
// ═══════════════════════════════════════════

export const WEEKS: WeekDefinition[] = [
  { label: "Woche 1", range: "11.04. – 12.04.", phase: "Aufbau", start: "2026-04-11", end: "2026-04-12", weekNumber: 1 },
  { label: "Woche 2", range: "13.04. – 19.04.", phase: "Aufbau", start: "2026-04-13", end: "2026-04-19", weekNumber: 2 },
  { label: "Woche 3", range: "20.04. – 26.04.", phase: "Aufbau", start: "2026-04-20", end: "2026-04-26", weekNumber: 3 },
  { label: "Woche 4", range: "27.04. – 03.05.", phase: "Puffer", start: "2026-04-27", end: "2026-05-03", weekNumber: 4 },
  { label: "Woche 5", range: "04.05. – 11.05.", phase: "Endphase", start: "2026-05-04", end: "2026-05-11", weekNumber: 5 },
];

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

export const PROG_EXAM_DATE = "2026-05-04";
export const MATH_EXAM_DATE = "2026-05-11";
export const PLAN_START_DATE = "2026-04-11";
