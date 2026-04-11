export interface UebungsTask {
  id: string;
  label: string;
  description: string;
}

export interface UebungsPage {
  slug: string;
  title: string;
  subtitle: string;
  topicIds: string[];
  description: string;
  tasks: UebungsTask[];
  helpTopics: string[];
  relatedTheorie: string[];
}

export const UEBUNGEN: Record<string, UebungsPage> = {
  kakuro: {
    slug: "kakuro",
    title: "Kakuro-Puzzle",
    subtitle: "WPF + XML + Custom Control",
    topicIds: ["XML", "WPF_MVVM"],
    description:
      "Die Anwendung soll das Spiel Kakuro aus einer XML-Datei laden und für den Spieler in einer GUI anzeigen und spielbar machen. Kakuro ähnelt einem Kreuzworträtsel, nur mit Ziffern statt Buchstaben und Summen statt Wortdefinitionen. In die freien Felder dürfen nur die Ziffern 1–9 eingetragen werden, und jede Ziffer darf in einer Summe nur einmal vorkommen.",
    tasks: [
      {
        id: "kakuro-1",
        label: "XML-Laden + Menüpunkt",
        description:
          'WPF-Programm mit Menüpunkt „Neues Spiel": öffnet einen FileDialog, lädt eine XML-Datei und deserialisiert sie in das UML-Klassenmodell (Kakuro → Rows, Columns, InaktiveFields: List<Field>, Sums: List<Sum>). Fehlerhafte XML-Dateien → MessageBox mit Fehlermeldung.',
      },
      {
        id: "kakuro-2",
        label: "UniformGrid befüllen",
        description:
          "UniformGrid Rows/Columns aus XML setzen. Bestehende Elemente löschen. Drei Feldtypen einfügen: Inaktive Felder (TextBlock, schwarzer Hintergrund), Kreuzsummen-Felder (inkludiertes KakuroControl, horizontal/vertikal), Eingabe-Felder (TextBox, Black Border, FontSize 20).",
      },
      {
        id: "kakuro-3",
        label: "Eingabe-Validierung",
        description:
          "Event-Handler für alle Eingabe-Felder: nur Ziffern 1–9 erlaubt. Bei falscher Eingabe → letzte korrekte Eingabe wiederherstellen. Datenstruktur für alle Benutzereingaben anlegen (z.B. Dictionary<(int x, int y), int>).",
      },
      {
        id: "kakuro-4",
        label: "Regelprüfung + Einfärben",
        description:
          'Nach jeder Eingabe alle Summen prüfen: 1. Alle Eingabe-Felder auf Weiß zurücksetzen. 2. Kreuzsummen prüfen: inkorrekte Summe → Salmon-Hintergrund für alle Felder der Summe. 3. Doppelte Ziffern in einer Summe → Salmon-Hintergrund. Leere Felder und zu kleine Summen nicht einfärben.',
      },
      {
        id: "kakuro-5",
        label: "Gewinn-Erkennung",
        description:
          "Prüfen ob alle Eingabe-Felder ausgefüllt sind und alle Summen korrekt sind. Bei Gewinn eine MessageBox oder Animation anzeigen.",
      },
    ],
    helpTopics: [
      "XML Deserialisierung: XmlSerializer oder LINQ to XML (XDocument.Load)",
      "UniformGrid: Children.Clear() → dann Elemente hinzufügen; Rows/Columns setzen",
      "KakuroControl: als DLL referenzieren, Namespace im XAML einbinden",
      "TextBox PreviewTextInput Event: e.Handled = true verhindert Eingabe",
      "Salmon = Color.FromRgb(250, 128, 114) oder Colors.Salmon",
    ],
    relatedTheorie: [],
  },

  gomoku: {
    slug: "gomoku",
    title: "Gomoku — Fünf in einer Reihe",
    subtitle: "WPF + MVC/MVVM + Netzwerk",
    topicIds: ["WPF_MVVM", "NETZWERK", "OOP"],
    description:
      "In einem WPF-Programm soll das Spiel Gomoku (Fünf-Gewinnt) realisiert werden. Beim Start kann gewählt werden: Netzwerkspiel (Server/Client), gegen einen Menschen oder gegen den Computer. Server und Offline-Modus: Spielfeldgröße wählbar. Anzeige über Bindings und DataTemplates, Spielmodi über austauschbare Controller-Klasse (MVC-Pattern).",
    tasks: [
      {
        id: "gomoku-1",
        label: "Spielbrett-Modell + Bindings",
        description:
          "Model für das Spielbrett erstellen (ObservableCollection<ObservableCollection<Cell>> o.Ä.). Anzeige des Spielfelds via UniformGrid mit DataTemplates — ein DataTemplate für leeres Feld, eines für Spieler 1 (schwarz), eines für Spieler 2 (weiß). UniformGrid passt sich automatisch quadratisch an.",
      },
      {
        id: "gomoku-2",
        label: "Startdialog + Modi-Auswahl",
        description:
          "Startdialog: RadioButtons für Spielmodus (Lokal, Netzwerk-Server, Netzwerk-Client, Computer). Bei Server/Lokal: Spinner für Feldgröße. Bei Client: Eingabefeld für Server-IP.",
      },
      {
        id: "gomoku-3",
        label: "Controller-Klassen (MVC)",
        description:
          "Abstrakte Basisklasse IGameController mit Methode MakeMove(x, y). Konkrete Klassen: LocalController (beide Spieler lokal), ComputerController (einfache KI, z.B. zufällig oder Minimax), NetworkController (Server/Client). Controller wird im Hauptfenster ausgetauscht.",
      },
      {
        id: "gomoku-4",
        label: "Gewinn-Prüfung",
        description:
          "Nach jedem Zug prüfen ob 5 in einer Reihe: horizontal, vertikal, diagonal (beide Richtungen). Gewinner hervorheben und Spiel sperren.",
      },
      {
        id: "gomoku-5",
        label: "Netzwerk-Implementierung",
        description:
          "TcpListener (Server) / TcpClient (Client). Protokoll: Zug als String senden z.B. \"MOVE 5 3\\n\". Empfang in separatem Thread, Dispatcher.Invoke für UI-Updates. Verbindungsstatus anzeigen.",
      },
    ],
    helpTopics: [
      "UniformGrid: Anzahl Elemente = Rows * Columns einfügen, kein explizites Rows/Columns nötig",
      "DataTemplate mit DataType: automatische Auswahl je nach Zelltyp",
      "INotifyPropertyChanged für Cell-Klasse (Stone-Eigenschaft: None/Black/White)",
      "TcpClient/TcpListener: NetworkStream → StreamReader/StreamWriter",
      "Dispatcher.Invoke(() => ...) für Thread-sichere UI-Updates",
    ],
    relatedTheorie: ["netzwerkgrundlagen", "datensendenundempfangen"],
  },

  taschenrechner: {
    slug: "taschenrechner",
    title: "Wissenschaftlicher Taschenrechner",
    subtitle: "Grammatik + Parser + AST + WPF",
    topicIds: ["GRAMMATIK", "ALGORITHMEN"],
    description:
      "WPF-Taschenrechner mit Ziffern 0–9, Dezimaltrennzeichen, Operatoren (+, -, /, *, ^), Klammern und Variablen (x, y, z; einzelne Kleinbuchstaben). Formel wird in TextBox angezeigt (auch Tastatureingabe). Beim Auswerten: Grammatik → Regex-Tokenizer → Syntaxbaum (Interpreter-Pattern) → Auswertung. Variablen werden abgefragt. Fehler werden hervorgehoben.",
    tasks: [
      {
        id: "taschenrechner-1",
        label: "Grammatik + UML-Klassenstruktur",
        description:
          "Grammatik in EBNF definieren: Expr → Term (('+' | '-') Term)*, Term → Factor (('*' | '/') Factor)*, Factor → Base ('^' Factor)?, Base → Zahl | Variable | '(' Expr ')'. UML: abstrakte Klasse Expression mit Methode Evaluate(vars). Konkrete Klassen: NumberExpr, VariableExpr, BinaryExpr, UnaryExpr.",
      },
      {
        id: "taschenrechner-2",
        label: "Regex-Tokenizer",
        description:
          "Regulären Ausdruck erstellen der den Eingabe-String in Tokens aufteilt: Zahl (\\d+(\\.\\d+)?), Variable ([a-z]), Operator ([+\\-*/^]), Klammer ([()]), Fehler-Gruppe (. für unbekannte Zeichen). Bei Fehler-Token: Dialog mit hervorgehobener Fehlerstelle.",
      },
      {
        id: "taschenrechner-3",
        label: "Parser + Syntaxbaum",
        description:
          "Rekursiv-absteigenden Parser implementieren (eine Methode pro Grammatik-Regel). Gibt Expression-Baum zurück. Bei Syntaxfehler: aussagekräftige Fehlermeldung in Dialog anzeigen (z.B. \"Klammer nicht geschlossen\").",
      },
      {
        id: "taschenrechner-4",
        label: "Auswertung + Variablen",
        description:
          "Syntaxbaum auswerten (Evaluate-Methode). Wenn keine Variablen: Ergebnis direkt anzeigen. Wenn Variablen: für jede Variable einen Eingabe-Dialog öffnen, dann Ergebnis anzeigen. ^ als Potenzoperator (Math.Pow).",
      },
      {
        id: "taschenrechner-5",
        label: "Skalierbare WPF-GUI",
        description:
          "GUI mit Grid-Layout (keine fixen Breiten/Höhen). ViewBox oder UniformGrid für Buttons. TextBox für Formeleingabe oben. Ergebnisanzeige darunter. Alle Buttons verdrahten (Click-Handler oder Commands).",
      },
    ],
    helpTopics: [
      "Interpreter-Pattern: abstrakte Klasse mit Evaluate(), Blätter (Zahlen, Variablen), Knoten (Operatoren)",
      "Regex.Matches mit named groups: (?<number>\\d+) | (?<var>[a-z]) | (?<error>.)",
      "Rekursiv-absteigender Parser: ParseExpr() ruft ParseTerm() ruft ParseFactor() auf",
      "Math.Pow(base, exp) für ^ Operator",
      "ViewBox macht WPF-Inhalt automatisch skalierend",
    ],
    relatedTheorie: ["formale-sprachen-grammatik", "compiler"],
  },

  schiffeversenken: {
    slug: "schiffeversenken",
    title: "Schiffe versenken",
    subtitle: "WPF + MVVM + Netzwerk",
    topicIds: ["WPF_MVVM", "NETZWERK", "OOP"],
    description:
      "Das Spiel Schiffe versenken in WPF über das Netzwerk implementieren (Regeln nach Wikipedia). MVC/MVVM-Pattern mit einem Model und zwei Views: ein View für eigene Schiffe + gegnerische Angriffe, ein View für eigene Angriffe + getroffene Schiffe. Bindings zwischen Model und Views. Zuerst GUI (Schiffe setzen + schießen), dann gemeinsam Netzwerk-Protokoll planen und implementieren.",
    tasks: [
      {
        id: "schiffeversenken-1",
        label: "Spielfeld-Model + Zwei Views",
        description:
          "Model: 2D-Array für eigenes Spielfeld (Schiff/Wasser/Getroffen/Verfehlt) und gegnerisches Spielfeld. ObservableCollection + INotifyPropertyChanged. Zwei UniformGrid-Views via Bindings. DataTemplates für Zell-Zustände (verschiedene Farben/Symbole).",
      },
      {
        id: "schiffeversenken-2",
        label: "Schiffe setzen (Placement-Phase)",
        description:
          "Schiffe aus Wikipedia-Regeln: 1×5, 2×4, 3×3, 4×2 Felder. Klick auf Zelle setzt Schiff (horizontal/vertikal per Toggle). Regelprüfung: Schiffe dürfen sich nicht berühren (auch diagonal). Alle Schiffe platziert → Start-Button aktivieren.",
      },
      {
        id: "schiffeversenken-3",
        label: "Spielphase + Gewinn-Prüfung",
        description:
          "Klick auf gegnerisches Feld → Schuss. Treffer: Zelle als getroffen markieren. Verfehlt: Zelle als Wasser markieren. Schiff komplett getroffen → Schiff als versenkt markieren. Alle Schiffe versenkt → Gewinner anzeigen.",
      },
      {
        id: "schiffeversenken-4",
        label: "Netzwerk-Protokoll",
        description:
          "TcpListener/TcpClient. Protokoll: SHOT x y → Antwort HIT/MISS/SUNK. Nach Schuss: Zug wechselt. Verbindungsaufbau: Server wartet, Client verbindet. Gemeinsam mit Klasse planen welche Daten übertragen werden.",
      },
    ],
    helpTopics: [
      "MVVM: ViewModel implementiert INotifyPropertyChanged, View bindet per Binding",
      "ObservableCollection<ObservableCollection<Cell>> für 2D-Grid",
      "DataTemplate: Style-Triggers oder DataTriggers für Zellfärbung",
      "TcpClient: NetworkStream → StreamReader/StreamWriter mit AutoFlush=true",
      "Dispatcher.Invoke für Thread-sichere UI-Updates vom Netzwerk-Thread",
    ],
    relatedTheorie: ["netzwerkgrundlagen", "datensendenundempfangen", "hoehere-socketklassen"],
  },

  osterhase: {
    slug: "osterhase",
    title: "Osterhase-Routenplanung",
    subtitle: "SQLite + LINQ + Graphenalgorithmen + Karte",
    topicIds: ["LINQ", "ALGORITHMEN", "GRAPHENTHEORIE"],
    description:
      "Programm zur Planung der Osterei-Auslieferung im Raum Wiener Neustadt. Personen mit Namen, Longitude und Latitude werden in einer SQLite-Datenbank (ORM + LINQ) gespeichert. Auf einer Karte visualisiert. Helfer-Aufteilung via Clustering-Algorithmus. Kürzester Weg für jeden Helfer via Graphenalgorithmus.",
    tasks: [
      {
        id: "osterhase-1",
        label: "SQLite + ORM + WPF-Eingabe",
        description:
          "Entity Framework Core mit SQLite. Klasse Person { Id, Name, Longitude, Latitude }. WPF-Formular mit Eingabefeldern. Persons speichern (kein Löschen nötig). LINQ-Abfragen für alle Personen.",
      },
      {
        id: "osterhase-2",
        label: "Karten-Visualisierung",
        description:
          "Karte als Image-Hintergrund (Wiener Neustadt: Links 16.209652, Unten 47.786898, Rechts 16.281017, Oben 47.846533). Personen als geometrische Formen (Ellipse/Rectangle) auf Canvas. Koordinaten umrechnen: x = (lon - links) / (rechts - links) * breite.",
      },
      {
        id: "osterhase-3",
        label: "Clustering — Helfer aufteilen",
        description:
          "K-Means-Algorithmus (oder ähnlich): Anzahl Helfer wählbar. Jede Person einem Helfer zuweisen, sodass Abstände minimiert werden. Jede Gruppe in anderer Farbe auf Karte anzeigen. Iterieren bis Cluster stabil.",
      },
      {
        id: "osterhase-4",
        label: "Kürzester Weg (TSP/Greedy)",
        description:
          "Für jeden Helfer: Startpunkt per Klick auf Karte setzen. Kürzesten Weg durch alle Punkte des Helfers berechnen (Greedy Nearest Neighbor oder exakt für kleine n). Weg als farbige Linien auf Karte zeichnen.",
      },
    ],
    helpTopics: [
      "K-Means: zufällige Zentroide → Punkte zuweisen → Zentroide neu berechnen → wiederholen",
      "Euklidischer Abstand in Lat/Lon: Math.Sqrt(dx*dx + dy*dy) (Näherung für kleinen Bereich)",
      "Canvas.SetLeft/Top für absolute Positionierung der Markierungen",
      "Entity Framework: DbContext, DbSet<Person>, migrations oder EnsureCreated()",
      "Greedy TSP: immer nächsten unbesuchten Punkt wählen",
    ],
    relatedTheorie: ["graphentheorie"],
  },

  aussagenlogikparser: {
    slug: "aussagenlogikparser",
    title: "Aussagenlogik-Parser",
    subtitle: "ABNF + Interpreter-Pattern + Wahrheitstabelle + KV-Diagramm",
    topicIds: ["LOGIK", "GRAMMATIK", "AUTOMATEN"],
    description:
      "WPF-Programm für aussagenlogische Formeln (∧, ∨, ¬, →, ↔). Grammatik in ABNF, UML-Klassenstruktur nach Interpreter-Pattern. Eingabe parsen → Baumstruktur aufbauen → Wahrheitstabelle generieren → KV-Diagramm (Custom Control aus DLL) anzeigen. Beispielformeln: (s ∧ ¬(q ↔ r)) ∨ (q → r) ↔ (p → (q ∧ r)).",
    tasks: [
      {
        id: "aussagenlogik-1",
        label: "ABNF-Grammatik + UML",
        description:
          "Grammatik in ABNF definieren: Formel → Bikonditional, Bikonditional → Implikation ('↔' Implikation)*, Implikation → Disjunktion ('→' Disjunktion)*, Disjunktion → Konjunktion ('∨' Konjunktion)*, Konjunktion → Negation ('∧' Negation)*, Negation → '¬' Negation | Atom, Atom → Variable | '(' Formel ')'. UML-Diagramm: abstrakte Klasse Expression + konkrete Klassen.",
      },
      {
        id: "aussagenlogik-2",
        label: "Parser + Baumstruktur",
        description:
          "Rekursiv-absteigenden Parser implementieren. Tokenizerung: Operatoren (∧ ∨ ¬ → ↔), Variablen (einzelne Buchstaben), Klammern. Basisklasse aus Angabe-Dateien verwenden. Syntaxfehler → aussagekräftige Fehlermeldung.",
      },
      {
        id: "aussagenlogik-3",
        label: "Wahrheitstabelle",
        description:
          "Alle Variablen aus dem Baum extrahieren. Alle 2^n Kombinationen (true/false) durchgehen. Für jede Kombination Baum auswerten (Evaluate(Dictionary<string,bool>)). Ergebnis als DataGrid anzeigen.",
      },
      {
        id: "aussagenlogik-4",
        label: "KV-Diagramm + Custom Control",
        description:
          "DLL-Datei referenzieren, Namespace im XAML einbinden. KV-Custom-Control mit Wahrheitstabellen-Daten befüllen. Für max 4 Variablen.",
      },
      {
        id: "aussagenlogik-5",
        label: "3 Beispielformeln vereinfachen",
        description:
          "Die 3 gegebenen Beispielformeln mit dem KV-Diagramm vereinfachen: (s ∧ ¬(q ↔ r)) ∨ (q → r) ↔ (p → (q ∧ r)) | ¬(¬¬(p → ¬q) ∧ s) → (r ∨ ¬¬p) | (s ∨ (q → r)) ∧ (p → (q ∧ r)). Vereinfachte Form notieren.",
      },
    ],
    helpTopics: [
      "Interpreter-Pattern: abstrakte Klasse Expression { abstract bool Evaluate(Dictionary<string,bool> vars); }",
      "Operatoren: AND → &&, OR → ||, NOT → !, IMP(a→b) → !a || b, BIKON(a↔b) → a==b",
      "Alle Variablen sammeln: HashSet<string> beim Traversieren des Baums",
      "2^n Kombinationen: for(int i=0; i<(1<<n); i++) → i-tes Bit = Wert der i-ten Variable",
      "DLL referenzieren: Rechtsklick Projekt → Hinzufügen → Verweis → DLL-Datei",
    ],
    relatedTheorie: ["formale-sprachen-grammatik", "compiler"],
  },

  ipgraph: {
    slug: "ipgraph",
    title: "IP-Routing-Graph",
    subtitle: "SQLite + ORM + Dijkstra + Custom Control",
    topicIds: ["GRAPHENTHEORIE", "LINQ"],
    description:
      "ISP-Infrastruktur-Optimierung: WPF-Programm das Router aus einer SQLite-Datenbank lädt und als Graph anzeigt (Custom Control aus DLL). Links-Klick = Startknoten, Rechts-Klick = Endknoten. Dijkstra-Algorithmus findet kürzeste Route. Route wird in zufälliger Farbe angezeigt, danach Start/End zurücksetzen.",
    tasks: [
      {
        id: "ipgraph-1",
        label: "SQLite + ORM einbinden",
        description:
          "Entity Framework Core mit SQLite. Klassen für Router und Verbindungen (Kanten mit Gewicht) entsprechend dem Datenbankschema. DbContext erstellen. LINQ-Abfragen für alle Router und Verbindungen. Datenbank ggf. verbessern (fehlende Spalten/Indizes).",
      },
      {
        id: "ipgraph-2",
        label: "Graph-Custom-Control einbinden",
        description:
          "DLL-Datei referenzieren. Graph-Control in XAML einbinden. Router als Knoten, Verbindungen als Kanten mit Gewicht laden. Klick-Events des Controls abonnieren (Links-Klick → Startknoten, Rechts-Klick → Endknoten).",
      },
      {
        id: "ipgraph-3",
        label: "Dijkstra-Algorithmus",
        description:
          "Wenn Start- und Endknoten gesetzt: Dijkstra ausführen. Datenstrukturen: Dictionary<Router, double> distanzen, Dictionary<Router, Router> vorgänger, PriorityQueue. Kürzesten Pfad rekonstruieren.",
      },
      {
        id: "ipgraph-4",
        label: "Route anzeigen + zurücksetzen",
        description:
          "Gefundene Route im Graph-Control mit zufälliger Farbe (Random().Next → Color.FromArgb) anzeigen. Start- und Endknoten auf null zurücksetzen. Mehrere Routen können gleichzeitig sichtbar sein (Knoten können mehrere Farben haben).",
      },
    ],
    helpTopics: [
      "Dijkstra: PriorityQueue<Router, double>, alle Distanzen = ∞, Start = 0",
      "Pfad rekonstruieren: Dictionary<Router, Router> prev, rückwärts vom Ziel zum Start",
      "Zufällige Farbe: Color.FromArgb(255, rnd.Next(256), rnd.Next(256), rnd.Next(256))",
      "Entity Framework Navigation Properties: Router { List<Verbindung> Verbindungen }",
      "LINQ: context.Router.Include(r => r.Verbindungen).ToList()",
    ],
    relatedTheorie: ["graphentheorie"],
  },

  formalesprachen: {
    slug: "formalesprachen",
    title: "Formale Sprachen — Übungen",
    subtitle: "BNF / EBNF · Grammatiken · DEA · Ableitungsbäume",
    topicIds: ["GRAMMATIK", "AUTOMATEN"],
    description:
      "Theoretische Übungsaufgaben zu formalen Sprachen: BNF/EBNF-Grammatiken lesen und schreiben, SPL-Programm analysieren, kontextfreie Grammatiken angeben, deterministische endliche Automaten konstruieren, Minimalautomaten erstellen.",
    tasks: [
      {
        id: "formalesprachen-1",
        label: "Aufgabe 1 — sequence-Grammatik analysieren",
        description:
          "Gegebene Grammatik G = (N, T, P, S) für sequence: N und T bestimmen. Welche der Symbolketten sind keine gültige sequence? Fehler lokalisieren (z.B. a1b2=3 → word endet falsch, aa1=bb1=0 → doppeltes =, s5=25 → Ziffer muss einstellig sein).",
      },
      {
        id: "formalesprachen-2",
        label: "Aufgabe 3 — SPL-Ableitungsbaum",
        description:
          "Prüfe ob das gegebene SPL-Programm syntaktisch korrekt ist (Ableitungsbaum aufzeichnen). Herausfinden was das Programm bewirkt: liest n Zahlen, berechnet für jede positive Zahl x die Fakultät x! und gibt sie aus.",
      },
      {
        id: "formalesprachen-3",
        label: "Aufgabe 6/7 — BNF ↔ EBNF Umformung",
        description:
          "ADA-identifier: Produktionsregeln in EBNF und BNF angeben. PASCAL-Variante: <varianter-teil> und <feldliste> in erweiterter BNF und ursprünglicher BNF beschreiben.",
      },
      {
        id: "formalesprachen-4",
        label: "Aufgabe 10/11 — Kontextfreie Grammatiken",
        description:
          "Für gegebene Sprachen kontextfreie Grammatiken angeben, z.B. L = {w | n₀(w) = 2·n₁(w)}, L = {aⁱbⁱcʲ | i,j≥0} ∪ {aⁱbʲcⁱ | i,j>0}, L = {aᵐbⁿc|m-n|}, L = {wcwᴿ | w ∈ {0,1}⁺}.",
      },
      {
        id: "formalesprachen-5",
        label: "Aufgabe 14–19 — Deterministische endliche Automaten",
        description:
          "DEA konstruieren für: Sprache ohne Teilwort cba, Binärzahlen durch 3 teilbar, Basis-4-Zahlen durch 2 oder 3 teilbar. Grammatik → DEA umwandeln (Aufgabe 17). Nichtdeterministischen Automaten N₁ und N₂ in deterministischen bzw. Minimalautomaten umwandeln (Aufgabe 19).",
      },
    ],
    helpTopics: [
      "BNF: <nichtterm> ::= Alternative1 | Alternative2; EBNF: [ ] optional, { } beliebig oft, ( ) Gruppierung",
      "Ableitungsbaum: Startsymbol oben, jede Regelanwendung = Verzweigung, Terminale = Blätter",
      "DEA: Zustandsmenge Q, Alphabet Σ, Übergangsfunktion δ: Q×Σ→Q, Startzustand q₀, Endzustände F",
      "Kontextfreie Grammatik: Produktionen der Form A → α, A ∈ N, α ∈ (N∪T)*",
      "Potenzmengenkonstruktion: Zustände des DEA = Teilmengen der NFA-Zustände",
    ],
    relatedTheorie: ["formale-sprachen-grammatik", "compiler"],
  },
};
