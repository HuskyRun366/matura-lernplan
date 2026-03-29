import { PlanDay, SimulationDefinition, WeekDefinition } from "./types";

// ═══════════════════════════════════════════
// Static Plan Data (migrated from HTML)
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
  // WOCHE 1: 29.03 - 04.04
  // ════════════════════════════════════════
  day("2026-03-29", "So", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "Teil A Diagnose",
      desc: "Komplette Teil-A-Probematura (aufgabenpool.at). Stoppuhr. Jede Aufgabe bewerten: sicher/unsicher/geraten. Fehlerprotokoll anlegen.",
      time: "2,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"], taskType: "diagnose",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool.at" }],
      exercises: [
        { label: "Teil A Probematura komplett", topicId: "A1", maxPoints: 24 },
      ],
    },
    {
      subject: "prog", title: "WPF Grundlagen — NetBoard Start",
      desc: "Fenster mit Grid/DockPanel-Layout. TextBox für Chat, Canvas für Zeichnen.",
      time: "3h", topicIds: ["WPF_MVVM"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 18-19", chapters: "18-19" }],
      exercises: [
        { label: "Window mit Grid/DockPanel erstellen", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "TextBox + Canvas einbauen", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-03-30", "Mo", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "B1 Trigonometrie",
      desc: "Sinussatz + Cosinussatz: Formeln verstehen, 5 Aufgaben rechnen.",
      time: "1,5h", topicIds: ["B1"], taskType: "neustoff",
      resources: [
        { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Trigonometrie" },
        { type: "mathago", url: "https://mathago.at", label: "Mathago: Sinussatz/Cosinussatz" },
      ],
      exercises: [
        { label: "Sinussatz Aufgabe 1", topicId: "B1", maxPoints: 4 },
        { label: "Sinussatz Aufgabe 2", topicId: "B1", maxPoints: 4 },
        { label: "Cosinussatz Aufgabe 1", topicId: "B1", maxPoints: 4 },
        { label: "Cosinussatz Aufgabe 2", topicId: "B1", maxPoints: 4 },
        { label: "Gemischte Aufgabe", topicId: "B1", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "MVVM Pattern",
      desc: "MainViewModel erstellen, INotifyPropertyChanged, RelayCommand. Databinding für Chat-Eingabe.",
      time: "2h", topicIds: ["WPF_MVVM", "OOP"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 22-24", chapters: "22-24" }],
      exercises: [
        { label: "INotifyPropertyChanged implementieren", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "RelayCommand erstellen", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "Chat-Eingabe mit Databinding", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-03-31", "Di", "leicht", 1, "Aufbau", [
    {
      subject: "math", title: "Teil A Lücken",
      desc: "Schwächste 2 Themen aus Sonntags-Diagnose: je 3 Aufgaben wiederholen.",
      time: "0,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"], taskType: "lueckenschluss",
      exercises: [
        { label: "Schwächstes Thema: 3 Aufgaben", topicId: "A1", maxPoints: 6 },
        { label: "Zweitschwächstes Thema: 3 Aufgaben", topicId: "A2", maxPoints: 6 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Aussagenlogik I",
      desc: "Grundoperatoren (UND, ODER, NICHT, Implikation). 3 Wahrheitstafeln auf Papier.",
      time: "0,5h", topicIds: ["LOGIK"], taskType: "theorie",
      exercises: [
        { label: "3 Wahrheitstafeln erstellen", topicId: "LOGIK", maxPoints: 6 },
      ],
    },
  ]),
  day("2026-04-01", "Mi", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "B2 Komplexe Zahlen I",
      desc: "Kartesische Form, Gaußsche Ebene, Addition/Subtraktion. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B2"], taskType: "neustoff",
      resources: [
        { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Komplexe Zahlen" },
        { type: "mathago", url: "https://mathago.at", label: "Mathago: Komplexe Zahlen" },
      ],
      exercises: [
        { label: "Kartesische Form: Addition", topicId: "B2", maxPoints: 4 },
        { label: "Kartesische Form: Subtraktion", topicId: "B2", maxPoints: 4 },
        { label: "Gaußsche Ebene einzeichnen", topicId: "B2", maxPoints: 4 },
        { label: "Betrag berechnen", topicId: "B2", maxPoints: 4 },
        { label: "Gemischte Aufgabe", topicId: "B2", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "WPF Controls + Binding",
      desc: "ListBox für Chat-Nachrichten, ObservableCollection, Databinding vertiefen.",
      time: "2h", topicIds: ["WPF_MVVM"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 21", chapters: "21" }],
      exercises: [
        { label: "ListBox mit ObservableCollection", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "Databinding für Messages", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-02", "Do", "leicht", 1, "Aufbau", [
    {
      subject: "math", title: "Wiederholung B1",
      desc: "Trigonometrie: 3 Aufgaben ohne Notizen lösen.",
      time: "0,5h", topicIds: ["B1"], taskType: "wiederholung",
      exercises: [
        { label: "Trig-Aufgabe ohne Notizen 1", topicId: "B1", maxPoints: 4 },
        { label: "Trig-Aufgabe ohne Notizen 2", topicId: "B1", maxPoints: 4 },
        { label: "Trig-Aufgabe ohne Notizen 3", topicId: "B1", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Aussagenlogik II",
      desc: "KNF/DNF, De Morgan, 3 Umformungsaufgaben auf Papier.",
      time: "0,5h", topicIds: ["LOGIK"], taskType: "theorie",
      exercises: [
        { label: "KNF/DNF Umformungen", topicId: "LOGIK", maxPoints: 6 },
      ],
    },
  ]),
  day("2026-04-03", "Fr", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "B2 Komplexe Zahlen II",
      desc: "Polarform, Multiplikation/Division, Umrechnung zwischen Formen. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B2"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Komplexe Zahlen" }],
      exercises: [
        { label: "Polarform berechnen", topicId: "B2", maxPoints: 4 },
        { label: "Multiplikation in Polarform", topicId: "B2", maxPoints: 4 },
        { label: "Division in Polarform", topicId: "B2", maxPoints: 4 },
        { label: "Kartesisch → Polar", topicId: "B2", maxPoints: 4 },
        { label: "Polar → Kartesisch", topicId: "B2", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "WPF Commands + Styling",
      desc: "ICommand implementieren, Buttons binden, einfaches Styling.",
      time: "2h", topicIds: ["WPF_MVVM"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 28", chapters: "28" }],
      exercises: [
        { label: "ICommand + Button Binding", topicId: "WPF_MVVM", maxPoints: 5 },
        { label: "Styling der Chat-Oberfläche", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-04", "Sa", "stark", 1, "Aufbau", [
    {
      subject: "math", title: "B3 Vektoren I + Mini-Test",
      desc: "Vektoren R²/R³, Grundoperationen (1,5h). Dann: 5 gemischte Aufgaben A+B als Selbsttest (1h).",
      time: "2,5h", topicIds: ["B3", "A1", "A2", "A3"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Vektoren" }],
      exercises: [
        { label: "Vektor-Addition/Subtraktion", topicId: "B3", maxPoints: 4 },
        { label: "Skalare Multiplikation", topicId: "B3", maxPoints: 4 },
        { label: "Länge und Einheitsvektor", topicId: "B3", maxPoints: 4 },
        { label: "Mini-Test: 5 gemischte A+B", topicId: "B3", maxPoints: 20 },
      ],
    },
    {
      subject: "prog", title: "OOP Review + Projekterweiterung",
      desc: "Interfaces für Message-Typen, Vererbung für verschiedene Nachrichten. Delegates/Events.",
      time: "3h", topicIds: ["OOP"], taskType: "wiederholung",
      resources: [{ type: "book", label: "Kap. 3-5", chapters: "3-5" }],
      exercises: [
        { label: "Interface IMessage erstellen", topicId: "OOP", maxPoints: 5 },
        { label: "Vererbungshierarchie für Messages", topicId: "OOP", maxPoints: 5 },
        { label: "Delegates/Events implementieren", topicId: "OOP", maxPoints: 5 },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 2: 05.04 - 11.04
  // ════════════════════════════════════════
  day("2026-04-05", "So", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B3 Vektoren II",
      desc: "Skalarprodukt, Kreuzprodukt, Anwendungen. 6 Aufgaben.",
      time: "2,5h", topicIds: ["B3"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Vektoren" }],
      exercises: [
        { label: "Skalarprodukt berechnen", topicId: "B3", maxPoints: 4 },
        { label: "Winkel zwischen Vektoren", topicId: "B3", maxPoints: 4 },
        { label: "Kreuzprodukt R³", topicId: "B3", maxPoints: 4 },
        { label: "Fläche mit Kreuzprodukt", topicId: "B3", maxPoints: 4 },
        { label: "Orthogonalität prüfen", topicId: "B3", maxPoints: 4 },
        { label: "Anwendungsaufgabe", topicId: "B3", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Netzwerk-Grundlagen",
      desc: "Echo-Server mit TcpListener + TcpClient bauen. NetworkStream, StreamReader/Writer.",
      time: "3h", topicIds: ["NETZWERK"], taskType: "neustoff",
      resources: [{ type: "docs", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/", label: "Microsoft Docs: Networking" }],
      exercises: [
        { label: "TcpListener Echo-Server", topicId: "NETZWERK", maxPoints: 5 },
        { label: "TcpClient implementieren", topicId: "NETZWERK", maxPoints: 5 },
        { label: "StreamReader/Writer nutzen", topicId: "NETZWERK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-06", "Mo", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B4 Matrizen",
      desc: "Matrizenrechnung, LGS mit Matrizen lösen. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B4"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Matrizen" }],
      exercises: [
        { label: "Matrix-Addition/Multiplikation", topicId: "B4", maxPoints: 4 },
        { label: "Determinante berechnen", topicId: "B4", maxPoints: 4 },
        { label: "LGS mit Gauß", topicId: "B4", maxPoints: 4 },
        { label: "Inverse Matrix", topicId: "B4", maxPoints: 4 },
        { label: "Anwendungsaufgabe LGS", topicId: "B4", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Multithreading: Thread-Klasse",
      desc: "Server Multi-Client: pro Client neuer Thread. Thread.Start, .Join, .IsBackground. lock.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 15", chapters: "15" }],
      exercises: [
        { label: "Multi-Client Server mit Thread", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "lock für Thread-Safety", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Thread.Join + IsBackground", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-07", "Di", "leicht", 2, "Aufbau", [
    {
      subject: "math", title: "Wdh. Komplexe Zahlen",
      desc: "3 Umrechnungsaufgaben (kartesisch ↔ polar ↔ exponentiell).",
      time: "0,5h", topicIds: ["B2"], taskType: "wiederholung",
      exercises: [
        { label: "Kartesisch → Polar", topicId: "B2", maxPoints: 4 },
        { label: "Polar → Exponentiell", topicId: "B2", maxPoints: 4 },
        { label: "Exponentiell → Kartesisch", topicId: "B2", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Prädikatenlogik",
      desc: "Quantoren (∀, ∃), Formalisierung natürlichsprachlicher Aussagen. 3 Aufgaben.",
      time: "0,5h", topicIds: ["LOGIK"], taskType: "theorie",
      exercises: [
        { label: "Quantoren-Aufgaben", topicId: "LOGIK", maxPoints: 6 },
      ],
    },
  ]),
  day("2026-04-08", "Mi", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B5 Differentialrechnung I",
      desc: "Ableitungsregeln + Kettenregel + Quotientenregel. 6 Aufgaben.",
      time: "1,5h", topicIds: ["B5"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Differentialrechnung" }],
      exercises: [
        { label: "Potenzregel", topicId: "B5", maxPoints: 4 },
        { label: "Kettenregel", topicId: "B5", maxPoints: 4 },
        { label: "Quotientenregel", topicId: "B5", maxPoints: 4 },
        { label: "Produktregel", topicId: "B5", maxPoints: 4 },
        { label: "Gemischt 1", topicId: "B5", maxPoints: 4 },
        { label: "Gemischt 2", topicId: "B5", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Multithreading: Task + async/await",
      desc: "Server mit Task.Run + async/await. Dispatcher.Invoke für UI-Updates.",
      time: "2h", topicIds: ["MULTITHREADING"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 15", chapters: "15" }],
      exercises: [
        { label: "Task.Run Server", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "async/await Pattern", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Dispatcher.Invoke für UI", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-09", "Do", "leicht", 2, "Aufbau", [
    {
      subject: "math", title: "Wdh. Vektoren",
      desc: "3 Aufgaben Skalar-/Kreuzprodukt.",
      time: "0,5h", topicIds: ["B3"], taskType: "wiederholung",
      exercises: [
        { label: "Skalarprodukt", topicId: "B3", maxPoints: 4 },
        { label: "Kreuzprodukt", topicId: "B3", maxPoints: 4 },
        { label: "Anwendung", topicId: "B3", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Graphentheorie I",
      desc: "Knoten, Kanten, Grad, Adjazenzmatrix. 2 Aufgaben auf Papier.",
      time: "0,5h", topicIds: ["GRAPHENTHEORIE"], taskType: "theorie",
      exercises: [
        { label: "Adjazenzmatrix erstellen", topicId: "GRAPHENTHEORIE", maxPoints: 4 },
        { label: "Grad-Berechnung", topicId: "GRAPHENTHEORIE", maxPoints: 4 },
      ],
    },
  ]),
  day("2026-04-10", "Fr", "stark", 2, "Aufbau", [
    {
      subject: "math", title: "B5 Differentialrechnung II",
      desc: "Ableitung Trig-/Log-/Exp-Funktionen. Optimierungsaufgaben. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B5"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Analysis" }],
      exercises: [
        { label: "Trig-Funktionen ableiten", topicId: "B5", maxPoints: 4 },
        { label: "Log/Exp ableiten", topicId: "B5", maxPoints: 4 },
        { label: "Optimierung 1", topicId: "B5", maxPoints: 4 },
        { label: "Optimierung 2", topicId: "B5", maxPoints: 4 },
        { label: "Gemischte Aufgabe", topicId: "B5", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "NetBoard: Netzwerk integrieren",
      desc: "Chat-Nachrichten über Netzwerk senden/empfangen. Threads für Empfang. UI-Thread-Sync.",
      time: "2h", topicIds: ["NETZWERK", "MULTITHREADING", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "Chat über TCP senden/empfangen", topicId: "NETZWERK", maxPoints: 5 },
        { label: "UI-Thread Synchronisation", topicId: "MULTITHREADING", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-11", "Sa", "stark", 2, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 1 — Mathe",
      desc: "Komplette Matura-Simulation (Teil A + soweit möglich Teil B). 2,5h rechnen + 0,5h Nachanalyse.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5"], taskType: "simulation",
      exercises: [
        { label: "Simulation 1 komplett", topicId: "A1", maxPoints: 48 },
      ],
    },
    {
      subject: "prog", title: "NetBoard: Vollintegration + Test",
      desc: "Server + Client testen (2 Instanzen). Bug-Fixing. Synchronisierungsprobleme.",
      time: "2,5h", topicIds: ["NETZWERK", "MULTITHREADING", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "2-Instanzen Test + Bugfixing", topicId: "NETZWERK", maxPoints: 10 },
      ],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 3: 12.04 - 18.04
  // ════════════════════════════════════════
  day("2026-04-12", "So", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "Nachanalyse Sim 1 + B6 Integralrechnung I",
      desc: "Nachanalyse (0,5h). Stammfunktionen, lineare Substitution, bestimmtes Integral. 6 Aufgaben.",
      time: "2,5h", topicIds: ["B6"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Integralrechnung" }],
      exercises: [
        { label: "Stammfunktionen finden", topicId: "B6", maxPoints: 4 },
        { label: "Lineare Substitution", topicId: "B6", maxPoints: 4 },
        { label: "Bestimmtes Integral 1", topicId: "B6", maxPoints: 4 },
        { label: "Bestimmtes Integral 2", topicId: "B6", maxPoints: 4 },
        { label: "Gemischt 1", topicId: "B6", maxPoints: 4 },
        { label: "Gemischt 2", topicId: "B6", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "2D-Grafik + Canvas",
      desc: "NetBoard: Zeichnen auf Canvas (Polyline, Ellipse, Rectangle). Mouse-Events. Farb-/Stärkeauswahl.",
      time: "3h", topicIds: ["GRAFIK_2D"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 30", chapters: "30" }],
      exercises: [
        { label: "Canvas mit Shapes", topicId: "GRAFIK_2D", maxPoints: 5 },
        { label: "Mouse-Events für Zeichnen", topicId: "GRAFIK_2D", maxPoints: 5 },
        { label: "Farb-/Stärkeauswahl", topicId: "GRAFIK_2D", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-13", "Mo", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B6 Integralrechnung II",
      desc: "Flächenberechnung, Rotationsvolumen. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B6"], taskType: "neustoff",
      exercises: [
        { label: "Fläche zwischen Kurven 1", topicId: "B6", maxPoints: 4 },
        { label: "Fläche zwischen Kurven 2", topicId: "B6", maxPoints: 4 },
        { label: "Rotationsvolumen 1", topicId: "B6", maxPoints: 4 },
        { label: "Rotationsvolumen 2", topicId: "B6", maxPoints: 4 },
        { label: "Gemischte Aufgabe", topicId: "B6", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Custom Controls",
      desc: "Eigenes ColorPicker-UserControl mit Dependency Properties bauen. In NetBoard einbauen.",
      time: "2h", topicIds: ["CUSTOM_CONTROLS"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 29", chapters: "29" }],
      exercises: [
        { label: "UserControl erstellen", topicId: "CUSTOM_CONTROLS", maxPoints: 5 },
        { label: "Dependency Property", topicId: "CUSTOM_CONTROLS", maxPoints: 5 },
        { label: "In NetBoard einbauen", topicId: "CUSTOM_CONTROLS", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-14", "Di", "leicht", 3, "Aufbau", [
    {
      subject: "math", title: "Wdh. Differentialrechnung",
      desc: "3 Optimierungsaufgaben.",
      time: "0,5h", topicIds: ["B5"], taskType: "wiederholung",
      exercises: [
        { label: "Optimierung 1", topicId: "B5", maxPoints: 4 },
        { label: "Optimierung 2", topicId: "B5", maxPoints: 4 },
        { label: "Optimierung 3", topicId: "B5", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Graphentheorie II",
      desc: "Dijkstra auf Papier durchspielen. Euler-/Hamilton-Kreise.",
      time: "0,5h", topicIds: ["GRAPHENTHEORIE"], taskType: "theorie",
      exercises: [
        { label: "Dijkstra auf Papier", topicId: "GRAPHENTHEORIE", maxPoints: 4 },
        { label: "Euler-/Hamilton-Kreise", topicId: "GRAPHENTHEORIE", maxPoints: 4 },
      ],
    },
  ]),
  day("2026-04-15", "Mi", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B8 Stochastik I",
      desc: "Normalverteilung: Eigenschaften, Berechnung, z-Werte. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B8"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Stochastik" }],
      exercises: [
        { label: "Normalverteilung: Eigenschaften", topicId: "B8", maxPoints: 4 },
        { label: "z-Werte berechnen", topicId: "B8", maxPoints: 4 },
        { label: "Wahrscheinlichkeit berechnen", topicId: "B8", maxPoints: 4 },
        { label: "Umkehraufgabe", topicId: "B8", maxPoints: 4 },
        { label: "Anwendungsaufgabe", topicId: "B8", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "LINQ Intensiv",
      desc: "DataLab starten: Beispieldaten (List<T>). 10 verschiedene LINQ-Abfragen (Query + Method Syntax).",
      time: "2h", topicIds: ["LINQ"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 11", chapters: "11" }],
      exercises: [
        { label: "Where/Select Abfragen", topicId: "LINQ", maxPoints: 5 },
        { label: "GroupBy/OrderBy", topicId: "LINQ", maxPoints: 5 },
        { label: "Join/Aggregate", topicId: "LINQ", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-16", "Do", "leicht", 3, "Aufbau", [
    {
      subject: "math", title: "Wdh. Integralrechnung",
      desc: "2 Flächen- + 1 Volumenaufgabe.",
      time: "0,5h", topicIds: ["B6"], taskType: "wiederholung",
      exercises: [
        { label: "Flächenberechnung", topicId: "B6", maxPoints: 4 },
        { label: "Flächenberechnung 2", topicId: "B6", maxPoints: 4 },
        { label: "Volumenberechnung", topicId: "B6", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Automaten I",
      desc: "DEA: Zustandsdiagramm für 'Binärzahl durch 3 teilbar'. Übergangstabelle.",
      time: "0,5h", topicIds: ["AUTOMATEN"], taskType: "theorie",
      exercises: [
        { label: "DEA Zustandsdiagramm", topicId: "AUTOMATEN", maxPoints: 4 },
        { label: "Übergangstabelle", topicId: "AUTOMATEN", maxPoints: 4 },
      ],
    },
  ]),
  day("2026-04-17", "Fr", "stark", 3, "Aufbau", [
    {
      subject: "math", title: "B8 Stochastik II",
      desc: "Konfidenzintervalle, Stichprobenmittel. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B8"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Konfidenzintervalle" }],
      exercises: [
        { label: "Konfidenzintervall berechnen", topicId: "B8", maxPoints: 4 },
        { label: "Stichprobenumfang", topicId: "B8", maxPoints: 4 },
        { label: "Interpretation", topicId: "B8", maxPoints: 4 },
        { label: "Anwendung 1", topicId: "B8", maxPoints: 4 },
        { label: "Anwendung 2", topicId: "B8", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "XML + LINQ to XML",
      desc: "DataLab: Daten als XML speichern/laden. LINQ to XML Abfragen.",
      time: "2h", topicIds: ["XML"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 14", chapters: "14" }],
      exercises: [
        { label: "XDocument erstellen", topicId: "XML", maxPoints: 5 },
        { label: "XML laden/speichern", topicId: "XML", maxPoints: 5 },
        { label: "LINQ to XML Abfragen", topicId: "XML", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-18", "Sa", "stark", 3, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 2 — Mathe",
      desc: "Komplette Matura (A+B). 2,5h + 0,5h Nachanalyse.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B8"], taskType: "simulation",
      exercises: [{ label: "Simulation 2 komplett", topicId: "A1", maxPoints: 48 }],
    },
    {
      subject: "sim", title: "Mini-Prüfung — Programmieren",
      desc: "2,5h: 'Baue Chat-Client mit WPF, TCP-Verbindung, Nachrichten senden/empfangen, Verlauf in XML speichern.' Ohne Hilfe.",
      time: "2,5h", topicIds: ["WPF_MVVM", "NETZWERK", "XML"], taskType: "simulation",
      exercises: [{ label: "Mini-Prüfung: Chat-Client", topicId: "WPF_MVVM", maxPoints: 20 }],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 4: 19.04 - 25.04
  // ════════════════════════════════════════
  day("2026-04-19", "So", "stark", 4, "Aufbau", [
    {
      subject: "math", title: "Nachanalyse Sim 2 + B7 DGL",
      desc: "Nachanalyse (0,5h). Trennung der Variablen, DGL 1. Ordnung. 5 Aufgaben.",
      time: "2,5h", topicIds: ["B7"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: DGL" }],
      exercises: [
        { label: "Trennung der Variablen 1", topicId: "B7", maxPoints: 4 },
        { label: "Trennung der Variablen 2", topicId: "B7", maxPoints: 4 },
        { label: "Homogene DGL", topicId: "B7", maxPoints: 4 },
        { label: "Inhomogene DGL", topicId: "B7", maxPoints: 4 },
        { label: "Anwendungsaufgabe", topicId: "B7", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Algorithmen",
      desc: "Sortieralgorithmen (Bubble, Insertion, Quick) in C#. Binäre Suche. Rekursion (Fibonacci, Hanoi).",
      time: "3h", topicIds: ["ALGORITHMEN"], taskType: "neustoff",
      exercises: [
        { label: "BubbleSort implementieren", topicId: "ALGORITHMEN", maxPoints: 5 },
        { label: "QuickSort implementieren", topicId: "ALGORITHMEN", maxPoints: 5 },
        { label: "Binäre Suche", topicId: "ALGORITHMEN", maxPoints: 5 },
        { label: "Rekursion: Fibonacci + Hanoi", topicId: "ALGORITHMEN", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-20", "Mo", "stark", 4, "Aufbau", [
    {
      subject: "math", title: "B9 Regression",
      desc: "Lineare Regression, Korrelationskoeffizient, Interpretation. 5 Aufgaben.",
      time: "1,5h", topicIds: ["B9"], taskType: "neustoff",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Regression" }],
      exercises: [
        { label: "Regressionsgerade berechnen", topicId: "B9", maxPoints: 4 },
        { label: "Korrelationskoeffizient", topicId: "B9", maxPoints: 4 },
        { label: "Interpretation", topicId: "B9", maxPoints: 4 },
        { label: "Prognose", topicId: "B9", maxPoints: 4 },
        { label: "Bestimmtheitsmaß", topicId: "B9", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Grammatik / Parser",
      desc: "BNF-Notation. Einfachen Expression-Parser bauen (3+4*2). Regex-Klasse in C#.",
      time: "2h", topicIds: ["GRAMMATIK"], taskType: "neustoff",
      exercises: [
        { label: "BNF-Notation verstehen", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Expression-Parser bauen", topicId: "GRAMMATIK", maxPoints: 5 },
        { label: "Regex in C#", topicId: "GRAMMATIK", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-21", "Di", "leicht", 4, "Aufbau", [
    {
      subject: "math", title: "Wdh. Stochastik",
      desc: "3 Konfidenzintervall-Aufgaben.",
      time: "0,5h", topicIds: ["B8"], taskType: "wiederholung",
      exercises: [
        { label: "Konfidenzintervall 1", topicId: "B8", maxPoints: 4 },
        { label: "Konfidenzintervall 2", topicId: "B8", maxPoints: 4 },
        { label: "Konfidenzintervall 3", topicId: "B8", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie: Automaten II",
      desc: "NEA zeichnen, NEA → DEA Umwandlung. 2 Aufgaben.",
      time: "0,5h", topicIds: ["AUTOMATEN"], taskType: "theorie",
      exercises: [
        { label: "NEA zeichnen", topicId: "AUTOMATEN", maxPoints: 4 },
        { label: "NEA → DEA Umwandlung", topicId: "AUTOMATEN", maxPoints: 4 },
      ],
    },
  ]),
  day("2026-04-22", "Mi", "stark", 4, "Aufbau", [
    {
      subject: "math", title: "Lückenschluss",
      desc: "Schwächste 2 Themen aus Simulation 2 gezielt nacharbeiten. 6 Aufgaben.",
      time: "1,5h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6"], taskType: "lueckenschluss",
      exercises: [
        { label: "Schwächstes Thema: 3 Aufgaben", topicId: "B5", maxPoints: 12 },
        { label: "Zweitschwächstes: 3 Aufgaben", topicId: "B6", maxPoints: 12 },
      ],
    },
    {
      subject: "prog", title: "Restthemen + Lücken",
      desc: "Collections (Dictionary, Queue, Stack). Generics. Fehlerbehandlung (try/catch, eigene Exceptions).",
      time: "2h", topicIds: ["OOP"], taskType: "neustoff",
      resources: [{ type: "book", label: "Kap. 6-9", chapters: "6-9" }],
      exercises: [
        { label: "Dictionary/Queue/Stack nutzen", topicId: "OOP", maxPoints: 5 },
        { label: "Generics implementieren", topicId: "OOP", maxPoints: 5 },
        { label: "Custom Exceptions", topicId: "OOP", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-23", "Do", "leicht", 4, "Aufbau", [
    {
      subject: "math", title: "Wdh. DGL",
      desc: "2 Aufgaben Trennung der Variablen.",
      time: "0,5h", topicIds: ["B7"], taskType: "wiederholung",
      exercises: [
        { label: "DGL Aufgabe 1", topicId: "B7", maxPoints: 4 },
        { label: "DGL Aufgabe 2", topicId: "B7", maxPoints: 4 },
      ],
    },
    {
      subject: "prog", title: "Theorie-Review",
      desc: "Alle Theorie-Karteikarten durchgehen (Logik, Graphen, Automaten).",
      time: "0,5h", topicIds: ["LOGIK", "GRAPHENTHEORIE", "AUTOMATEN"], taskType: "theorie",
      exercises: [
        { label: "Theorie-Karteikarten Review", topicId: "LOGIK", maxPoints: 6 },
      ],
    },
  ]),
  day("2026-04-24", "Fr", "stark", 4, "Aufbau", [
    {
      subject: "math", title: "Lückenschluss + Ankreuzfragen",
      desc: "10 Ankreuzfragen aus dem Aufgabenpool. Eliminationsstrategie trainieren.",
      time: "1,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"], taskType: "lueckenschluss",
      resources: [{ type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Ankreuzfragen" }],
      exercises: [
        { label: "10 Ankreuzfragen", topicId: "A1", maxPoints: 10 },
      ],
    },
    {
      subject: "prog", title: "Gemischte Praxis",
      desc: "3 Aufgaben (je 40 Min.): 1) Thread-Synchronisation, 2) LINQ-Abfrage, 3) WPF-Databinding. Ohne Hilfe.",
      time: "2h", topicIds: ["MULTITHREADING", "LINQ", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "Thread-Synchronisation", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "LINQ-Abfrage", topicId: "LINQ", maxPoints: 5 },
        { label: "WPF-Databinding", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-25", "Sa", "stark", 4, "Aufbau", [
    {
      subject: "sim", title: "SIMULATION 3 — Mathe (Echtbedingungen)",
      desc: "Komplette Matura unter Echtbedingungen (270 Min. simulieren). Nachanalyse.",
      time: "3h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [{ label: "Simulation 3 komplett", topicId: "A1", maxPoints: 48 }],
    },
    {
      subject: "sim", title: "Prog-Simulation",
      desc: "Vollständige Prüfungssimulation (2,5h): Aufgabe mit WPF + Netzwerk + Threading. Nachanalyse.",
      time: "2,5h", topicIds: ["WPF_MVVM", "NETZWERK", "MULTITHREADING"], taskType: "simulation",
      exercises: [{ label: "Prog-Simulation komplett", topicId: "WPF_MVVM", maxPoints: 20 }],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 5: 26.04 - 03.05
  // ════════════════════════════════════════
  day("2026-04-26", "So", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Nachanalyse Sim 3",
      desc: "Detaillierte Fehleranalyse. Priorisierte Nacharbeitsliste erstellen.",
      time: "1,5h", topicIds: ["A1", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "lueckenschluss",
      exercises: [{ label: "Fehleranalyse + Prioritätenliste", topicId: "A1", maxPoints: 10 }],
    },
    {
      subject: "prog", title: "Nachanalyse + Lücken füllen",
      desc: "Prog-Sim nacharbeiten. Schwächstes Thema vertiefen. Syntax-Cheat-Sheet erstellen.",
      time: "4h", topicIds: ["WPF_MVVM", "NETZWERK", "MULTITHREADING"], taskType: "lueckenschluss",
      exercises: [
        { label: "Simulation nacharbeiten", topicId: "WPF_MVVM", maxPoints: 10 },
        { label: "Cheat-Sheet erstellen", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-27", "Mo", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Schwächstes Thema #1",
      desc: "Gezielt 5 Aufgaben zum schwächsten Thema.",
      time: "1h", topicIds: ["B5"], taskType: "lueckenschluss",
      exercises: [{ label: "5 gezielte Aufgaben", topicId: "B5", maxPoints: 20 }],
    },
    {
      subject: "prog", title: "Gezieltes Üben",
      desc: "3 Aufgaben à 50 Min. zu den 3 schwächsten Themen.",
      time: "2,5h", topicIds: ["NETZWERK", "MULTITHREADING", "WPF_MVVM"], taskType: "praxis",
      exercises: [
        { label: "Schwäche 1: 50-Min-Aufgabe", topicId: "NETZWERK", maxPoints: 5 },
        { label: "Schwäche 2: 50-Min-Aufgabe", topicId: "MULTITHREADING", maxPoints: 5 },
        { label: "Schwäche 3: 50-Min-Aufgabe", topicId: "WPF_MVVM", maxPoints: 5 },
      ],
    },
  ]),
  day("2026-04-28", "Di", "leicht", 5, "Puffer", [
    {
      subject: "math", title: "Ankreuzfragen",
      desc: "5 Ankreuzfragen üben (gemischt).",
      time: "0,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"], taskType: "wiederholung",
      exercises: [{ label: "5 Ankreuzfragen", topicId: "A1", maxPoints: 5 }],
    },
    {
      subject: "prog", title: "Theorie-Wiederholung",
      desc: "Alle Theorie-Karteikarten. Unsichere markieren.",
      time: "0,5h", topicIds: ["LOGIK", "GRAPHENTHEORIE", "AUTOMATEN"], taskType: "theorie",
      exercises: [{ label: "Karteikarten durchgehen", topicId: "LOGIK", maxPoints: 6 }],
    },
  ]),
  day("2026-04-29", "Mi", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Schwächstes Thema #2",
      desc: "Gezielt 5 Aufgaben.",
      time: "1h", topicIds: ["B6"], taskType: "lueckenschluss",
      exercises: [{ label: "5 gezielte Aufgaben", topicId: "B6", maxPoints: 20 }],
    },
    {
      subject: "prog", title: "Wdh. Netzwerk + Threading",
      desc: "Von Null: TCP-Server mit 3 Clients, Thread-basiert. 90 Min. Zeitlimit.",
      time: "2,5h", topicIds: ["NETZWERK", "MULTITHREADING"], taskType: "praxis",
      exercises: [
        { label: "TCP-Server von Null (90 Min.)", topicId: "NETZWERK", maxPoints: 10 },
      ],
    },
  ]),
  day("2026-04-30", "Do", "leicht", 5, "Puffer", [
    {
      subject: "math", title: "Formelwiederholung",
      desc: "Alle Formeln durchgehen, Lücken notieren.",
      time: "0,5h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "wiederholung",
      exercises: [{ label: "Formelblatt Review", topicId: "B1", maxPoints: 5 }],
    },
    {
      subject: "prog", title: "Theorie: unsichere Karten",
      desc: "Nur die markierten Theorie-Karten wiederholen.",
      time: "0,5h", topicIds: ["LOGIK", "GRAPHENTHEORIE", "AUTOMATEN"], taskType: "theorie",
      exercises: [{ label: "Unsichere Karten wiederholen", topicId: "LOGIK", maxPoints: 6 }],
    },
  ]),
  day("2026-05-01", "Fr", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Gemischte Aufgaben",
      desc: "6 gemischte Aufgaben aus verschiedenen Themen.",
      time: "1h", topicIds: ["B1", "B2", "B3", "B5", "B6", "B8"], taskType: "wiederholung",
      exercises: [{ label: "6 gemischte Aufgaben", topicId: "B5", maxPoints: 24 }],
    },
    {
      subject: "sim", title: "GENERALPROBE — Programmieren",
      desc: "Letzte Komplett-Simulation unter Prüfungsbedingungen. Aufgabenstellung vorher nicht ansehen.",
      time: "2,5h", topicIds: ["WPF_MVVM", "NETZWERK", "MULTITHREADING", "LINQ", "XML"], taskType: "simulation",
      exercises: [{ label: "Generalprobe Programmieren", topicId: "WPF_MVVM", maxPoints: 20 }],
    },
  ]),
  day("2026-05-02", "Sa", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Kurz-Simulation",
      desc: "10 ausgewählte Aufgaben (A+B gemischt) unter Zeitdruck.",
      time: "1,5h", topicIds: ["A1", "B1", "B2", "B3", "B5", "B6", "B8"], taskType: "simulation",
      exercises: [{ label: "10 Aufgaben unter Zeitdruck", topicId: "A1", maxPoints: 40 }],
    },
    {
      subject: "prog", title: "Nachanalyse + Cheat-Sheet final",
      desc: "Generalprobe auswerten. Syntax-Cheat-Sheet finalisieren.",
      time: "3h", topicIds: ["WPF_MVVM", "NETZWERK", "MULTITHREADING"], taskType: "lueckenschluss",
      exercises: [{ label: "Generalprobe nacharbeiten", topicId: "WPF_MVVM", maxPoints: 10 }],
    },
  ]),
  day("2026-05-03", "So", "stark", 5, "Puffer", [
    {
      subject: "math", title: "Formelblatt durchlesen",
      desc: "3 leichte Aufgaben. Kopf freihalten für morgen.",
      time: "0,5h", topicIds: ["B1", "B2", "B3", "B5", "B6"], taskType: "wiederholung",
      exercises: [{ label: "3 leichte Aufgaben", topicId: "B5", maxPoints: 12 }],
    },
    {
      subject: "prog", title: "Letzte Wiederholung",
      desc: "Cheat-Sheet durchgehen. 1 leichte Aufgabe zum Warmwerden. FRÜH SCHLAFEN!",
      time: "1,5h", topicIds: ["WPF_MVVM"], taskType: "wiederholung",
      exercises: [{ label: "1 leichte Aufgabe", topicId: "WPF_MVVM", maxPoints: 5 }],
    },
  ]),

  // EXAM
  day("2026-05-04", "Mo", "exam", 5, "Pruefung", [
    {
      subject: "sim", title: "PROGRAMMIEREN-PRÜFUNG",
      desc: "Viel Erfolg!",
      time: "Prüfung", topicIds: [], taskType: "exam",
      exercises: [],
    },
  ]),

  // ════════════════════════════════════════
  // WOCHE 6: 05.05 - 10.05
  // ════════════════════════════════════════
  day("2026-05-05", "Di", "leicht", 6, "Endphase", [
    {
      subject: "math", title: "Wiedereinstieg",
      desc: "Formelblatt + 5 gemischte Aufgaben zum Aufwärmen.",
      time: "1h", topicIds: ["B1", "B2", "B3", "B5", "B6", "B8"], taskType: "wiederholung",
      exercises: [{ label: "5 Aufwärm-Aufgaben", topicId: "B5", maxPoints: 20 }],
    },
  ]),
  day("2026-05-06", "Mi", "stark", 6, "Endphase", [
    {
      subject: "sim", title: "SIMULATION 4 — Mathe",
      desc: "Komplette Matura unter Echtbedingungen. Sofortige Nachanalyse.",
      time: "3,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [{ label: "Simulation 4 komplett", topicId: "A1", maxPoints: 48 }],
    },
  ]),
  day("2026-05-07", "Do", "leicht", 6, "Endphase", [
    {
      subject: "math", title: "Nacharbeit Sim 4",
      desc: "Fehler aus Simulation gezielt korrigieren.",
      time: "1h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "lueckenschluss",
      exercises: [{ label: "Sim-4-Fehler korrigieren", topicId: "B5", maxPoints: 10 }],
    },
  ]),
  day("2026-05-08", "Fr", "stark", 6, "Endphase", [
    {
      subject: "math", title: "Schwächen-Intensiv",
      desc: "Alle noch unsicheren Themen: je 3-4 Aufgaben. Ankreuzfragen-Block (10 Stück).",
      time: "3,5h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "lueckenschluss",
      exercises: [
        { label: "Schwächen: je 3-4 Aufgaben", topicId: "B5", maxPoints: 30 },
        { label: "10 Ankreuzfragen", topicId: "A1", maxPoints: 10 },
      ],
    },
  ]),
  day("2026-05-09", "Sa", "stark", 6, "Endphase", [
    {
      subject: "sim", title: "SIMULATION 5 — Generalprobe Mathe",
      desc: "Letzte Komplett-Simulation (3,5h) + ausführliche Nachanalyse (2h).",
      time: "5,5h", topicIds: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "simulation",
      exercises: [{ label: "Simulation 5 (Generalprobe)", topicId: "A1", maxPoints: 48 }],
    },
  ]),
  day("2026-05-10", "So", "stark", 6, "Endphase", [
    {
      subject: "math", title: "Letzte Festigung",
      desc: "Formelblatt final. Nur sichere Aufgaben wiederholen. Kein neuer Stoff. FRÜH SCHLAFEN!",
      time: "3h", topicIds: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"], taskType: "wiederholung",
      exercises: [{ label: "Sichere Aufgaben wiederholen", topicId: "B5", maxPoints: 20 }],
    },
  ]),
  day("2026-05-11", "Mo", "exam", 6, "Pruefung", [
    {
      subject: "sim", title: "MATHEMATIK-PRÜFUNG",
      desc: "Viel Erfolg!",
      time: "Prüfung", topicIds: [], taskType: "exam",
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
  { label: "Woche 1", range: "29.03. – 04.04.", phase: "Aufbau", start: "2026-03-29", end: "2026-04-04", weekNumber: 1 },
  { label: "Woche 2", range: "05.04. – 11.04.", phase: "Aufbau", start: "2026-04-05", end: "2026-04-11", weekNumber: 2 },
  { label: "Woche 3", range: "12.04. – 18.04.", phase: "Aufbau", start: "2026-04-12", end: "2026-04-18", weekNumber: 3 },
  { label: "Woche 4", range: "19.04. – 25.04.", phase: "Aufbau", start: "2026-04-19", end: "2026-04-25", weekNumber: 4 },
  { label: "Woche 5", range: "26.04. – 03.05.", phase: "Puffer", start: "2026-04-26", end: "2026-05-03", weekNumber: 5 },
  { label: "Woche 6", range: "05.05. – 10.05.", phase: "Endphase", start: "2026-05-05", end: "2026-05-10", weekNumber: 6 },
];

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

export const PROG_EXAM_DATE = "2026-05-04";
export const MATH_EXAM_DATE = "2026-05-11";
export const PLAN_START_DATE = "2026-03-29";
