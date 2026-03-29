import { MathTopic, ProgTopic } from "./types";

export const MATH_TOPICS: Record<string, MathTopic> = {
  // ── Teil A: Grundkompetenzen ──
  A1: { id: "A1", name: "Zahlen und Maße", category: "teil-a", priority: "basis", minMastery: 0.70, targetMastery: 0.95, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Zahlen und Maße" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago Erklärung" },
  ]},
  A2: { id: "A2", name: "Algebra", category: "teil-a", priority: "basis", minMastery: 0.70, targetMastery: 0.95, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Algebra" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Algebra" },
  ]},
  A3: { id: "A3", name: "Gleichungen", category: "teil-a", priority: "basis", minMastery: 0.70, targetMastery: 0.95, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Gleichungen" },
  ]},
  A4: { id: "A4", name: "Trigonometrie (Grundl.)", category: "teil-a", priority: "basis", minMastery: 0.70, targetMastery: 0.95, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Trigonometrie" },
  ]},
  A5: { id: "A5", name: "Funktionen", category: "teil-a", priority: "mittel", minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Funktionen" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Funktionen" },
  ]},
  A6: { id: "A6", name: "Analysis Grundlagen", category: "teil-a", priority: "mittel", minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Analysis" },
  ]},
  A7: { id: "A7", name: "Stochastik Grundlagen", category: "teil-a", priority: "mittel", minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Stochastik" },
  ]},

  // ── Teil B: HTL-spezifisch ──
  B1: { id: "B1", name: "Trigonometrie allg. Dreieck", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Sinus-/Cosinussatz" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Trigonometrie" },
    { type: "competenz4u", url: "https://competenz4u.at", label: "Competenz4u: Trigonometrie" },
  ]},
  B2: { id: "B2", name: "Komplexe Zahlen", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Komplexe Zahlen" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Komplexe Zahlen" },
  ]},
  B3: { id: "B3", name: "Vektoren in R² und R³", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 1, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Vektoren" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Vektoren" },
  ]},
  B4: { id: "B4", name: "Matrizen und LGS", category: "teil-b", priority: "mittel", minMastery: 0.40, targetMastery: 0.75, weekIntroduced: 2, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Matrizen" },
  ]},
  B5: { id: "B5", name: "Differentialrechnung", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 2, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Differentialrechnung" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Ableitungen" },
    { type: "competenz4u", url: "https://competenz4u.at", label: "Competenz4u: Analysis" },
  ]},
  B6: { id: "B6", name: "Integralrechnung", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 3, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Integralrechnung" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Integrale" },
  ]},
  B7: { id: "B7", name: "Differentialgleichungen", category: "teil-b", priority: "mittel", minMastery: 0.40, targetMastery: 0.75, weekIntroduced: 4, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: DGL" },
  ]},
  B8: { id: "B8", name: "Normalverteilung & Konfidenz", category: "teil-b", priority: "hoch", minMastery: 0.50, targetMastery: 0.85, weekIntroduced: 3, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Stochastik" },
    { type: "mathago", url: "https://mathago.at", label: "Mathago: Normalverteilung" },
  ]},
  B9: { id: "B9", name: "Regression & Korrelation", category: "teil-b", priority: "mittel", minMastery: 0.40, targetMastery: 0.75, weekIntroduced: 4, resources: [
    { type: "aufgabenpool", url: "https://aufgabenpool.at", label: "Aufgabenpool: Regression" },
  ]},
};

export const PROG_TOPICS: Record<string, ProgTopic> = {
  OOP: { id: "OOP", name: "OOP & Grundlagen", category: "praxis", priority: 1, minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 1, bookChapters: ["3", "4", "5", "6", "7", "8", "9"], project: "NetBoard", resources: [
    { type: "book", label: "Kap. 3-5: Klassen, Vererbung, Interfaces", chapters: "3-5" },
    { type: "book", label: "Kap. 6-9: Collections, Generics, Exceptions", chapters: "6-9" },
  ]},
  WPF_MVVM: { id: "WPF_MVVM", name: "WPF & MVVM", category: "praxis", priority: 1, minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 1, bookChapters: ["18", "19", "21", "22", "24", "28"], project: "NetBoard", resources: [
    { type: "book", label: "Kap. 18-19: WPF Grundlagen, Layouts", chapters: "18-19" },
    { type: "book", label: "Kap. 21: Controls", chapters: "21" },
    { type: "book", label: "Kap. 22-24: Databinding, MVVM", chapters: "22-24" },
    { type: "book", label: "Kap. 28: Styles & Templates", chapters: "28" },
  ]},
  MULTITHREADING: { id: "MULTITHREADING", name: "Multithreading", category: "praxis", priority: 1, minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 2, bookChapters: ["15"], project: "NetBoard", resources: [
    { type: "book", label: "Kap. 15: Thread, Task, async/await, lock", chapters: "15" },
  ]},
  NETZWERK: { id: "NETZWERK", name: "Netzwerk-Programmierung", category: "praxis", priority: 1, minMastery: 0.60, targetMastery: 0.90, weekIntroduced: 2, bookChapters: [], project: "NetBoard", resources: [
    { type: "docs", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/", label: "Microsoft Docs: TcpClient/TcpListener" },
  ]},
  LINQ: { id: "LINQ", name: "LINQ", category: "praxis", priority: 2, minMastery: 0.45, targetMastery: 0.80, weekIntroduced: 3, bookChapters: ["11"], project: "DataLab", resources: [
    { type: "book", label: "Kap. 11: LINQ Query & Method Syntax", chapters: "11" },
  ]},
  XML: { id: "XML", name: "XML & LINQ to XML", category: "praxis", priority: 2, minMastery: 0.45, targetMastery: 0.80, weekIntroduced: 3, bookChapters: ["14"], project: "DataLab", resources: [
    { type: "book", label: "Kap. 14: XDocument, LINQ to XML", chapters: "14" },
  ]},
  CUSTOM_CONTROLS: { id: "CUSTOM_CONTROLS", name: "Custom Controls", category: "praxis", priority: 2, minMastery: 0.45, targetMastery: 0.80, weekIntroduced: 3, bookChapters: ["29"], project: "NetBoard", resources: [
    { type: "book", label: "Kap. 29: UserControl, Dependency Properties", chapters: "29" },
  ]},
  GRAFIK_2D: { id: "GRAFIK_2D", name: "2D-Grafik", category: "praxis", priority: 2, minMastery: 0.45, targetMastery: 0.80, weekIntroduced: 3, bookChapters: ["30"], project: "NetBoard", resources: [
    { type: "book", label: "Kap. 30: Canvas, Shapes, Transformationen", chapters: "30" },
  ]},
  ALGORITHMEN: { id: "ALGORITHMEN", name: "Algorithmen", category: "praxis", priority: 3, minMastery: 0.30, targetMastery: 0.70, weekIntroduced: 4, bookChapters: [], resources: [
    { type: "docs", url: "https://studyflix.de", label: "Studyflix: Sortieralgorithmen" },
  ]},
  GRAMMATIK: { id: "GRAMMATIK", name: "Grammatik & Parsing", category: "praxis", priority: 3, minMastery: 0.30, targetMastery: 0.70, weekIntroduced: 4, bookChapters: [], resources: [
    { type: "docs", url: "https://studyflix.de", label: "Studyflix: BNF, Regex" },
  ]},
  GRAPHENTHEORIE: { id: "GRAPHENTHEORIE", name: "Graphentheorie", category: "theorie", priority: 4, minMastery: 0.25, targetMastery: 0.60, weekIntroduced: 2, bookChapters: [], resources: [
    { type: "docs", url: "https://studyflix.de", label: "Studyflix: Graphen, Dijkstra" },
  ]},
  AUTOMATEN: { id: "AUTOMATEN", name: "Automatentheorie", category: "theorie", priority: 4, minMastery: 0.25, targetMastery: 0.60, weekIntroduced: 3, bookChapters: [], resources: [
    { type: "docs", url: "https://studyflix.de", label: "Studyflix: DEA, NEA" },
  ]},
  LOGIK: { id: "LOGIK", name: "Logik", category: "theorie", priority: 4, minMastery: 0.25, targetMastery: 0.60, weekIntroduced: 1, bookChapters: [], resources: [
    { type: "docs", url: "https://studyflix.de", label: "Studyflix: Aussagen-/Prädikatenlogik" },
  ]},
};

export function getAllTopics(): Record<string, MathTopic | ProgTopic> {
  return { ...MATH_TOPICS, ...PROG_TOPICS };
}

export function getTopicById(id: string): MathTopic | ProgTopic | undefined {
  return MATH_TOPICS[id] || PROG_TOPICS[id];
}

export function isProgTopic(topic: MathTopic | ProgTopic): topic is ProgTopic {
  return "bookChapters" in topic;
}
