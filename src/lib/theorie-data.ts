export interface TheorieSection {
  heading: string;
  body: string;
  code?: string;
}

export interface TheoriePage {
  slug: string;
  title: string;
  topicIds: string[];
  sections: TheorieSection[];
  relatedSlugs?: string[];
  relatedUebungen?: string[];
}

export const THEORIE_PAGES: Record<string, TheoriePage> = {
  "netzwerkgrundlagen": {
    slug: "netzwerkgrundlagen",
    title: "Netzwerk-Grundlagen",
    topicIds: ["NETZWERK"],
    sections: [
      {
        heading: "Client und Server",
        body: "Zur Übermittlung von Informationen sind zwei Stellen erforderlich: Der Client initiiert die Kommunikation, der Server wartet auf Anfragen und antwortet. Der Client muss die Adresse des Servers kennen — nicht umgekehrt. In einer Peer-To-Peer-Anwendung ist der Client gleichzeitig auch Server (z.B. eMule), meist mithilfe von Threads realisiert.",
      },
      {
        heading: "Was ist ein Socket?",
        body: "Ein Socket ist ein Endpunkt einer bi-direktionalen Software-Schnittstelle zur Netzwerk-Kommunikation. Er ist an eine Port-Nummer gebunden, damit die TCP-Schicht die Ziel-Anwendung identifizieren kann. Ein Socket kann wie eine Datei geöffnet, beschrieben, gelesen und geschlossen werden. Im .NET Framework gibt es zwei Schichten: die Socket-Klasse (direkte Berkeley-Sockets-API) und die höheren Klassen TcpClient, TcpListener, UdpClient.",
      },
      {
        heading: "Socket erstellen — AddressFamily, SocketType, ProtocolType",
        body: "Der Socket-Konstruktor erwartet drei Enumerationen:\n• AddressFamily: InterNetwork = IPv4, InterNetworkV6 = IPv6\n• SocketType: Stream = TCP (verbindungsorientiert), Dgram = UDP (verbindungslos)\n• ProtocolType: Tcp, Udp\n\nWichtige Ports: 21=FTP, 80=HTTP, 443=HTTPS, 7=Echo (Standard für Test-Server).",
        code: `Socket sock = new Socket(
    AddressFamily.InterNetwork,
    SocketType.Stream,
    ProtocolType.Tcp);`,
      },
      {
        heading: "IP-Adressen und DNS",
        body: "Dns.GetHostEntry() löst einen Hostname zu einer IPHostEntry-Instanz auf (enthält AddressList und Aliases). IPAddress.Parse() wandelt einen String wie '192.168.0.1' in eine IPAddress um. IPEndPoint kombiniert IPAddress + Port und repräsentiert einen vollständigen Netzwerk-Endpunkt.\n\nDer Konstruktor IPEndPoint(address, port) nimmt eine IPAddress und eine int-Portnummer. Nach sock.Connect(ipEndPoint) gibt sock.Connected an, ob die Verbindung aktiv ist.",
        code: `string host = "www.htlwrn.ac.at";
IPHostEntry hostEntry = Dns.GetHostEntry(host);
IPAddress[] addresses = hostEntry.AddressList;

// IPEndPoint = IP-Adresse + Port
IPEndPoint ipEo = new IPEndPoint(addresses[0], 80);
sock = new Socket(ipEo.AddressFamily,
    SocketType.Stream, ProtocolType.Tcp);
sock.Connect(ipEo);

if (sock.Connected) {
    Console.WriteLine("Verbindung hergestellt!");
    sock.Close();
}

// IPv6: Loopback-Adresse
IPEndPoint ep6 = new IPEndPoint(IPAddress.IPv6Loopback, 7);`,
      },
      {
        heading: "Wichtige Klassen im Überblick",
        body: "System.Net enthält:\n• Dns — Namensauflösung (GetHostEntry, GetHostAddresses)\n• IPAddress — IPv4/IPv6-Adressen (Parse, Any, Loopback, IPv6Any)\n• IPHostEntry — Ergebnis der DNS-Auflösung (AddressList, Aliases)\n• IPEndPoint — IP + Port kombiniert\n• WebClient — Einfache HTTP-Downloads\n\nSystem.Net.Sockets enthält:\n• Socket — Berkeley-API, maximale Kontrolle\n• TcpClient, TcpListener — TCP auf höherem Level\n• UdpClient — UDP-Datagramme",
      },
    ],
    relatedSlugs: ["datensendenundempfangen", "hoehere-socketklassen"],
  },

  "datensendenundempfangen": {
    slug: "datensendenundempfangen",
    title: "Daten senden und empfangen",
    topicIds: ["NETZWERK"],
    sections: [
      {
        heading: "Send und Receive — Methoden-Überblick",
        body: "Die Socket-Klasse stellt Send() und Receive() zum Datenaustausch bereit. Beide sind vierfach überladen. Alle Varianten arbeiten mit byte[]-Arrays.\n• Send() gibt Anzahl gesendeter Bytes zurück\n• Receive() gibt Anzahl empfangener Bytes zurück (0 = Verbindung geschlossen)\n• Available gibt an, wie viele Bytes im Buffer warten\n\nFür String↔Bytes: Encoding.UTF8 / Encoding.ASCII / Encoding.Unicode.",
        code: `// Wichtigste Überladung:
public int Send(byte[] buffer, int offset, int size, SocketFlags flags);
public int Receive(byte[] buffer, int offset, int size, SocketFlags flags);

// String kodieren und senden:
byte[] data = Encoding.UTF8.GetBytes("Hallo!");
socket.Send(data, 0, data.Length, SocketFlags.None);

// Empfangen und dekodieren:
byte[] buf = new byte[4096];
int n = socket.Receive(buf, 0, buf.Length, SocketFlags.None);
string text = Encoding.UTF8.GetString(buf, 0, n);`,
      },
      {
        heading: "TCP — Verbindungsorientiertes Protokoll",
        body: "TCP (Transmission Control Protocol) ist:\n• Verbindungsorientiert: Handshake vor Datenübertragung\n• Zuverlässig: Pakete kommen garantiert an\n• Geordnet: Richtige Reihenfolge garantiert\n• Fehlerkorrekt: Checksums, Neuübertragung\n\nServer-Workflow: Bind() → Listen(backlog) → Accept() → Receive()/Send() → Shutdown() → Close()\n\nbacklog bei Listen() = maximale Anzahl wartender Verbindungen.",
        code: `// Server setup:
servSock.Bind(new IPEndPoint(IPAddress.IPv6Any, 7));
servSock.Listen(5); // max 5 wartende Verbindungen

// Client annehmen:
Socket client = servSock.Accept();

// Echo-Server: empfangen und zurückschicken
int bytesRcvd;
byte[] buf = new byte[4096];
while ((bytesRcvd = client.Receive(buf, 0, buf.Length,
    SocketFlags.None)) > 0) {
    client.Send(buf, 0, bytesRcvd, SocketFlags.None);
}
client.Shutdown(SocketShutdown.Both);
client.Close();`,
      },
      {
        heading: "Paketsegmentierung — Wichtig für Receive-Schleife!",
        body: "TCP ist ein Byte-Stream — kein Nachrichtenprotokoll! Ein Send()-Aufruf kann in mehreren Receive()-Aufrufen ankommen (Paketsegmentierung). Der Nagle-Algorithmus puffert kleine Pakete und sendet sie zusammen — das kann die Segmentierung verstärken.\n\nDeshalb IMMER in einer Schleife empfangen! Receive() blockiert, bis Daten verfügbar sind. Gibt 0 zurück, wenn die Gegenseite die Verbindung schließt.",
        code: `// FALSCH: nur einmal lesen — evtl. unvollständige Daten!
int bytes = client.Receive(buffer);

// RICHTIG: in Schleife lesen bis expected Bytes gelesen:
int total = 0;
int expected = 100;
while (total < expected) {
    int n = client.Receive(buffer, total,
        buffer.Length - total, SocketFlags.None);
    if (n == 0) break; // Verbindung getrennt
    total += n;
}

// Oder: bis Verbindung geschlossen (kein festes Ende):
int bytesRcvd;
while ((bytesRcvd = sock.Receive(buf)) > 0) {
    // Daten verarbeiten...
}`,
      },
      {
        heading: "HTTP-GET Anforderung senden",
        body: "Mit rohen Sockets kann man einen HTTP-GET Request manuell senden. Das zeigt, wie Protokolle auf TCP aufbauen. Der Header muss mit \\r\\n\\r\\n enden (leere Zeile = Ende des Headers). Die Antwort wird in einer do-while-Schleife empfangen, bis keine Daten mehr kommen (Receive gibt 0 zurück).",
        code: `string request = "GET / HTTP/1.1\\r\\nHost: " + host +
    "\\r\\nConnection: Close\\r\\n\\r\\n";
byte[] bytesSent = Encoding.ASCII.GetBytes(request);
sock.Send(bytesSent, bytesSent.Length, SocketFlags.None);

byte[] bytesReceived = new byte[4096];
int bytes;
string response = "";
do {
    bytes = sock.Receive(bytesReceived,
        bytesReceived.Length, SocketFlags.None);
    response += Encoding.ASCII.GetString(
        bytesReceived, 0, bytes);
} while (bytes > 0);
Console.WriteLine(response);`,
      },
    ],
    relatedSlugs: ["netzwerkgrundlagen", "hoehere-socketklassen"],
    relatedUebungen: ["schiffeversenken"],
  },

  "hoehere-socketklassen": {
    slug: "hoehere-socketklassen",
    title: "Höhere Socketklassen",
    topicIds: ["NETZWERK"],
    sections: [
      {
        heading: "TcpClient — Einfache Client-Verbindung",
        body: "TcpClient kapselt die Socket-Klasse zu einer einfacheren API. Der Konstruktor new TcpClient(server, port) erstellt automatisch einen TCP-Socket und verbindet sich. Über GetStream() erhält man einen NetworkStream zum Lesen und Schreiben. NetworkStream ist eine Unterklasse von Stream — man kann auch StreamReader/StreamWriter verwenden.\n\nWichtig: Auch beim NetworkStream IMMER in einer Schleife lesen (Paketsegmentierung)!",
        code: `TcpClient client = new TcpClient(server, port);
NetworkStream netStream = client.GetStream();

// Senden:
byte[] data = Encoding.ASCII.GetBytes("Hallo");
netStream.Write(data, 0, data.Length);

// Empfangen (in Schleife wegen Segmentierung!):
int total = 0;
while (total < data.Length) {
    int n = netStream.Read(data, total,
        data.Length - total);
    if (n == 0) break; // Verbindung getrennt
    total += n;
}

netStream.Close();
client.Close();`,
      },
      {
        heading: "TcpListener — Server für eingehende Verbindungen",
        body: "TcpListener wartet auf eingehende TCP-Verbindungen. IPAddress.Any hört auf allen Netzwerkschnittstellen. Start() initialisiert und bindet den Socket (entspricht Bind + Listen). AcceptTcpClient() blockiert bis ein Client sich verbindet und gibt eine TcpClient-Instanz zurück.\n\nFür Multi-Client-Server: Pro Client einen neuen Thread starten (Thread als Hintergrund-Thread setzen).",
        code: `TcpListener listener = new TcpListener(
    IPAddress.Any, 4200);
listener.Start();

while (true) {
    TcpClient client = listener.AcceptTcpClient();
    // Für jeden Client neuen Thread starten:
    TcpClient localClient = client; // Closure-Variable!
    Thread t = new Thread(() => HandleClient(localClient));
    t.IsBackground = true;
    t.Start();
}

void HandleClient(TcpClient client) {
    NetworkStream ns = client.GetStream();
    byte[] buf = new byte[1024];
    int bytesRcvd;
    while ((bytesRcvd = ns.Read(buf, 0, buf.Length)) > 0) {
        ns.Write(buf, 0, bytesRcvd); // Echo zurück
    }
    ns.Close();
    client.Close();
}`,
      },
      {
        heading: "UDP — Verbindungsloses Protokoll",
        body: "UDP (User Datagram Protocol) ist:\n• Verbindungslos: kein Handshake, kein Aufbau\n• Nicht zuverlässig: keine Garantie auf Ankunft oder Reihenfolge\n• Schnell: ~50% weniger Overhead als TCP\n• FIFO innerhalb eines Pakets: jedes Receive() liefert genau ein vollständiges Datagramm\n• Max. Paketgröße: 65535 Bytes (65507 nutzbar nach Header)\n\nEinsatz: Streaming, Online-Gaming, DNS, VoIP.",
        code: `// UDP Sender:
UdpClient sender = new UdpClient();
IPEndPoint target = new IPEndPoint(
    IPAddress.Loopback, 4201);
sender.Connect(target);
byte[] data = Encoding.ASCII.GetBytes("Hello UDP!");
sender.Send(data, data.Length);
sender.Close();

// UDP Receiver:
UdpClient receiver = new UdpClient(4201);
IPEndPoint remoteEP = new IPEndPoint(
    IPAddress.Any, 0);
byte[] received = receiver.Receive(ref remoteEP);
Console.WriteLine("Von: " + remoteEP);
Console.WriteLine(Encoding.ASCII.GetString(received));
receiver.Close();`,
      },
      {
        heading: "WebClient — Einfache HTTP-Downloads",
        body: "WebClient aus System.Net ist eine Hochlevel-Klasse für einfache HTTP-Operationen. Wichtige Methoden:\n• DownloadFile(url, localPath) — Datei herunterladen\n• DownloadString(url) — Text herunterladen\n• Headers.Add(...) — HTTP-Header setzen (z.B. User-Agent)\n\nFür moderne Projekte: HttpClient bevorzugen (async/await-Support).",
        code: `WebClient wc = new WebClient();
wc.Headers.Add("user-agent",
    "Mozilla/4.0 (compatible; MSIE 6.0)");

// Datei herunterladen:
wc.DownloadFile(
    "http://example.com/bild.jpg",
    "C:\\\\Downloads\\\\bild.jpg");

// Text herunterladen:
string html = wc.DownloadString("http://example.com");
Console.WriteLine(html.Substring(0, 200));`,
      },
    ],
    relatedSlugs: ["datensendenundempfangen", "netzwerkgrundlagen"],
    relatedUebungen: ["schiffeversenken", "gomoku"],
  },

  "threads-erstellen": {
    slug: "threads-erstellen",
    title: "Threads erstellen",
    topicIds: ["MULTITHREADING"],
    sections: [
      {
        heading: "Thread-Klasse und ThreadStart Delegate",
        body: "Threads werden in .NET über die Klasse Thread im Namespace System.Threading erstellt. ThreadStart ist ein Delegate (Funktionsreferenz), das auf die Methode zeigt, die als Thread laufen soll. new Thread(worker) erstellt das Thread-Objekt, .Start() startet ihn asynchron. Main-Thread und Worker-Thread laufen danach parallel — die Ausgabe-Reihenfolge ist nicht determiniert.",
        code: `using System.Threading;

public static void WorkerThreadMethod() {
    Console.WriteLine("Worker thread gestartet");
}

public static void Main() {
    ThreadStart worker = new ThreadStart(WorkerThreadMethod);
    Console.WriteLine("Main - erstelle Thread");
    Thread t = new Thread(worker);
    t.Start();
    Console.WriteLine("Main - Thread wurde gestartet");
    // Beide Zeilen erscheinen in unbestimmter Reihenfolge!
}`,
      },
      {
        heading: "Vordergrund- vs. Hintergrund-Threads",
        body: "Vordergrund-Threads (Standard): Die Anwendung beendet sich NICHT, solange noch Vordergrund-Threads laufen. Hintergrund-Threads (IsBackground = true): Werden automatisch beendet, wenn alle Vordergrund-Threads fertig sind.\n\nKurzform mit Lambda: vermeidet separate Methode. Parametrisierter Thread: ThreadStart erwartet void(), ParameterizedThreadStart erwartet void(object).",
        code: `Thread t = new Thread(WorkerMethod);
t.IsBackground = true; // Hintergrund-Thread
t.Start();

// Kurzform mit Lambda:
Thread t2 = new Thread(() => {
    Console.WriteLine("Lambda-Thread");
    DoWork();
});
t2.Start();

// Parametrisierter Thread:
Thread t3 = new Thread((param) => {
    Console.WriteLine("Parameter: " + param);
});
t3.Start("Hallo");`,
      },
      {
        heading: "Thread Join — Auf Abschluss warten",
        body: "t.Join() blockiert den aufrufenden Thread, bis der Thread t fertig ist. Kann auch einen Timeout nehmen: t.Join(5000) = max 5 Sekunden warten. Gibt true zurück wenn der Thread regulär beendet wurde, false bei Timeout.\n\nWährend Join wartet, wird keine CPU verbraucht (ThreadState.WaitSleepJoin). Thread.Sleep(0) gibt nur das aktuelle Timeslice ab.",
        code: `Thread t = new Thread(Go);
t.Start();
bool finished = t.Join(5000); // max 5s warten
if (finished)
    Console.WriteLine("Thread t ist fertig!");
else
    Console.WriteLine("Timeout!");

Thread.Sleep(500);           // 500ms warten
Thread.Sleep(TimeSpan.FromSeconds(2)); // 2 Sekunden

static void Go() {
    for (int i = 0; i < 1000; i++)
        Console.Write("y");
}`,
      },
      {
        heading: "Thread für Netzwerk-Verbindungen",
        body: "Ein typisches Muster für Multi-Client-Server: TcpListener akzeptiert Verbindungen in einer Schleife, für jeden Client wird ein neuer Thread gestartet.\n\nACHTUNG Closure-Problem: Der Lambda-Ausdruck captured die Variable client per Referenz — bis der Thread startet, könnte client bereits überschrieben sein. Deshalb immer eine lokale Kopie anlegen!",
        code: `while (true) {
    TcpClient client = listener.AcceptTcpClient();
    // WICHTIG: lokale Kopie für den Closure!
    TcpClient localClient = client;
    Thread t = new Thread(() => HandleClient(localClient));
    t.IsBackground = true;
    t.Start();
}

void HandleClient(TcpClient client) {
    // ... Client-Kommunikation ...
    client.Close();
}`,
      },
    ],
    relatedSlugs: ["threadpool", "thread-synchronisation"],
  },

  "threadpool": {
    slug: "threadpool",
    title: "ThreadPool",
    topicIds: ["MULTITHREADING"],
    sections: [
      {
        heading: "Warum ThreadPool?",
        body: "Ein neuer Thread kostet ca. 100–200 Mikrosekunden Startzeit und ~1 MB Speicher (Stack). Für viele kurzlebige Aufgaben ist das zu teuer. Der ThreadPool hält vorgefertigte Threads bereit, die wiederverwendet werden. Nach Beendigung einer Aufgabe geht der Thread zurück in den Pool — kein Destroy/Create.\n\nLimits in .NET 4.0:\n• 32-bit: max 1023 Worker-Threads\n• 64-bit: max 32768 Worker-Threads",
      },
      {
        heading: "QueueUserWorkItem — Aufgaben in den Pool stellen",
        body: "ThreadPool.QueueUserWorkItem() stellt eine Aufgabe in die Warteschlange. Ein freier Pool-Thread führt sie aus. Das Delegate WaitCallback hat die Signatur void(object), der object-Parameter übergibt Zustandsdaten.\n\nFür Benachrichtigung über Fertigstellung: AutoResetEvent mit WaitOne().",
        code: `// Einfache Aufgabe (kein Rückgabewert):
ThreadPool.QueueUserWorkItem(state => {
    Console.WriteLine("Im Pool-Thread: " + state);
}, "Hallo");

// Mit AutoResetEvent für Benachrichtigung:
AutoResetEvent ready = new AutoResetEvent(false);
ThreadPool.QueueUserWorkItem(new WaitCallback(Calculate), ready);
Console.WriteLine("Hauptthread wartet...");
ready.WaitOne(); // Blockiert bis Pool-Thread fertig
Console.WriteLine("Pool-Thread ist fertig.");

static void Calculate(object obj) {
    Console.WriteLine("Im Pool-Thread, berechne...");
    Thread.Sleep(2000);
    ((AutoResetEvent)obj).Set(); // Signal senden
}`,
      },
      {
        heading: "RegisterWaitForSingleObject — Warten ohne Thread",
        body: "Wenn viele Threads die meiste Zeit auf WaitHandles warten, kostet das unnötig Ressourcen. RegisterWaitForSingleObject() führt eine Callback-Methode aus, wenn ein WaitHandle signalisiert wird — ohne einen eigenen Thread zu blockieren.\n\nParameter:\n• WaitHandle — worauf gewartet wird\n• WaitOrTimerCallback — Methode bei Signal\n• state — Zustandsdaten\n• timeout (-1 = kein Timeout)\n• executeOnlyOnce — true = einmalig",
        code: `static ManualResetEvent _starter = new ManualResetEvent(false);

public static void Main() {
    RegisteredWaitHandle reg =
        ThreadPool.RegisterWaitForSingleObject(
            _starter,       // WaitHandle
            Go,             // Methode wenn signalisiert
            "Some Data",    // Zustandsdaten
            -1,             // kein Timeout
            true);          // einmalig ausführen

    Thread.Sleep(3000);
    Console.WriteLine("Signalisiere Worker...");
    _starter.Set();
    Console.ReadLine();
    reg.Unregister(_starter); // Aufräumen
}

static void Go(object data, bool timedOut) {
    Console.WriteLine("Gestartet: " + data);
}`,
      },
      {
        heading: "Thread-Pool Grenzen anpassen",
        body: "ThreadPool.SetMaxThreads(workers, io) setzt die Obergrenze. ThreadPool.SetMinThreads(workers, io) setzt die Untergrenze — verhindert Verzögerung beim Start neuer Threads, nützlich wenn viele Threads blockiert sind (I/O-gebunden). GetMaxThreads() und GetAvailableThreads() zum Abfragen.",
        code: `int maxWorker, maxIO;
ThreadPool.GetMaxThreads(out maxWorker, out maxIO);
Console.WriteLine($"Max Worker: {maxWorker}, Max IO: {maxIO}");

int availWorker, availIO;
ThreadPool.GetAvailableThreads(out availWorker, out availIO);
Console.WriteLine($"Verfügbar: {availWorker}");

// Untergrenze erhöhen für bessere Parallelität:
ThreadPool.SetMinThreads(8, 8);`,
      },
    ],
    relatedSlugs: ["threads-erstellen", "thread-synchronisation"],
  },

  "thread-synchronisation": {
    slug: "thread-synchronisation",
    title: "Thread-Synchronisation — Grundlagen",
    topicIds: ["MULTITHREADING"],
    sections: [
      {
        heading: "Übersicht: Synchronisations-Konstrukte",
        body: "Einfaches Blockieren:\n• Thread.Sleep(ms) — aktuelle Thread pausiert (keine CPU)\n• Thread.Join() — warten bis anderer Thread fertig\n• Thread.Sleep(0) — Timeslice abgeben (Kreiseln)\n\nLocking (exklusiver Zugriff):\n• lock / Monitor — für Threads im selben Prozess\n• Mutex — auch prozessübergreifend\n\nNicht-exklusive Locks:\n• Semaphore/SemaphoreSlim — N Threads gleichzeitig\n\nSignaling (Benachrichtigung):\n• AutoResetEvent, ManualResetEvent\n• Monitor.Wait/Pulse",
      },
      {
        heading: "Blockieren vs. Kreiseln",
        body: "Blockieren (Sleeping/Blocking): Thread gibt CPU ab, OS weckt ihn wenn Bedingung erfüllt. Kein CPU-Verbrauch während des Wartens. Overhead: Context-Switch (~1–2 μs).\n\nKreiseln (Spinning): Thread prüft Bedingung in einer Schleife (busy wait). Verschwendet CPU, aber kein Context-Switch. Sinnvoll nur bei sehr kurzen Wartezeiten (< 20 μs).\n\nSpinLock ist ein Lock der kresilt statt blockiert — für sehr kurze kritische Abschnitte.",
        code: `// Blockieren: CPU wird freigegeben
Thread.Sleep(500);           // 500ms blockieren
Thread.Sleep(TimeSpan.FromSeconds(2)); // 2 Sekunden

// Join blockiert:
Thread t = new Thread(Go);
t.Start();
bool finished = t.Join(5000); // max 5s warten

// Sleep(0) gibt Timeslice ab (kurzes Kreiseln):
Thread.Sleep(0); // Scheduler kann anderen Thread wählen

// SpinLock: kreiselt (nur für sehr kurze Abschnitte!):
SpinLock sl = new SpinLock();
bool taken = false;
sl.Enter(ref taken);
try { /* kritischer Abschnitt */ }
finally { if (taken) sl.Exit(); }`,
      },
      {
        heading: "lock und Monitor — Kritische Abschnitte",
        body: "lock(obj){} verhindert, dass mehrere Threads gleichzeitig einen Codeabschnitt ausführen. Es ist syntaktischer Zucker für Monitor.Enter/Monitor.Exit in einem try/finally-Block.\n\nRegeln für das Lock-Objekt:\n• Immer readonly und private\n• Niemals lock(this) — von außen sichtbar\n• Niemals lock(typeof(Foo)) — global\n• Niemals lock auf Value-Types (wird geboxt)",
        code: `// Race Condition (unsicher!):
class ThreadUnsafe {
    static int _val1 = 1, _val2 = 1;
    static void Go() {
        if (_val2 != 0) Console.WriteLine(_val1 / _val2);
        _val2 = 0; // anderer Thread kann hier unterbrechen!
    }
}

// Sicher mit lock:
class ThreadSafe {
    static readonly object _locker = new object();
    static int _val1, _val2;
    static void Go() {
        lock (_locker) {
            if (_val2 != 0)
                Console.WriteLine(_val1 / _val2);
            _val2 = 0;
        }
    }
}

// lock ist äquivalent zu:
bool taken = false;
Monitor.Enter(_locker, ref taken); // v4.0: lockTaken-Pattern
try { /* kritischer Abschnitt */ }
finally { if (taken) Monitor.Exit(_locker); }`,
      },
      {
        heading: "Monitor.Wait und Monitor.Pulse — Bedingtes Warten",
        body: "Monitor.Wait(obj) blockiert den Thread UND gibt die Sperre frei (ein anderer Thread kann eintreten). Monitor.Pulse(obj) weckt einen wartenden Thread auf. PulseAll() weckt alle.\n\nWichtig: Wait und Pulse müssen IMMER innerhalb eines lock-Blocks aufgerufen werden! Deadlock möglich wenn kein Thread Pulse aufruft.",
        code: `// Producer-Consumer mit Wait/Pulse (Ring-Buffer):
class Buffer {
    const int size = 16;
    char[] buf = new char[size];
    int head = 0, tail = 0, n = 0;

    public void Put(char ch) {
        lock (this) {
            while (n >= size)
                Monitor.Wait(this); // Warte bis Platz frei
            buf[tail] = ch;
            tail = (tail + 1) % size;
            n++;
            Monitor.Pulse(this); // Wecke Get-Thread
        }
    }

    public char Get() {
        lock (this) {
            while (n <= 0)
                Monitor.Wait(this); // Warte bis Daten da
            char ch = buf[head];
            head = (head + 1) % size;
            n--;
            Monitor.Pulse(this); // Wecke Put-Thread
            return ch;
        }
    }
}`,
      },
      {
        heading: "Mutex — Prozessübergreifende Synchronisation",
        body: "Monitor eignet sich nur für Threads im gleichen Prozess. Mutex funktioniert auch prozessübergreifend (systemweit, benannter Mutex). Typischer Einsatz: Verhindern, dass eine Anwendung mehrfach gestartet wird.\n\nWaitOne(0, true) prüft ohne Blockierung ob der Mutex verfügbar ist. Release() gibt den Mutex frei.",
        code: `private static Mutex mutex;

static bool IsAlreadyRunning() {
    mutex = new Mutex(false, "MeineApp.Eindeutig");
    if (mutex.WaitOne(0, true))
        return false; // Erster Start
    return true; // Bereits gestartet
}

static void Main() {
    if (IsAlreadyRunning()) {
        Console.WriteLine("App läuft bereits!");
        return;
    }
    // ... App starten ...
}`,
      },
    ],
    relatedSlugs: ["thread-synchronisation-fort", "threads-erstellen"],
  },

  "thread-synchronisation-fort": {
    slug: "thread-synchronisation-fort",
    title: "Thread-Synchronisation — Fortgeschritten",
    topicIds: ["MULTITHREADING"],
    sections: [
      {
        heading: "Semaphore und SemaphoreSlim — Zählende Sperre",
        body: "Ein Semaphor zählt, wie viele Threads gleichzeitig auf eine Ressource zugreifen dürfen. Bei Zählerstand 0 warten neue Threads. Beim Verlassen wird der Zähler wieder erhöht.\n\nSemaphoreSlim = leichtgewichtigere Variante (nur innerhalb eines Prozesses). Analogie: Nachtclub mit Türsteher — maximal N Gäste gleichzeitig.",
        code: `// Max 3 gleichzeitig:
static SemaphoreSlim _sem = new SemaphoreSlim(3);

static void Enter(object id) {
    Console.WriteLine(id + " will eintreten");
    _sem.Wait();   // Reservieren (blockiert wenn voll)
    try {
        Console.WriteLine(id + " ist drin!");
        Thread.Sleep(1000 * (int)id);
    } finally {
        Console.WriteLine(id + " verlässt");
        _sem.Release(); // Freigeben
    }
}

// Starte 5 Threads — max 3 gleichzeitig aktiv:
for (int i = 1; i <= 5; i++)
    new Thread(Enter).Start(i);`,
      },
      {
        heading: "AutoResetEvent — Einzel-Signalisierung",
        body: "AutoResetEvent = automatisches Drehkreuz: Set() öffnet es für genau einen Thread, dann schließt es sich automatisch wieder. WaitOne() blockiert bis Set() aufgerufen wird. Wenn Set() ohne wartenden Thread aufgerufen wird, bleibt das Event offen bis nächstes WaitOne().\n\nAnwendung: Zwei-Wege-Signalisierung, Producer-Consumer.",
        code: `static EventWaitHandle _wh = new AutoResetEvent(false);

static void Main() {
    new Thread(Waiter).Start();
    Thread.Sleep(1000);
    _wh.Set(); // Waiter aufwecken
}

static void Waiter() {
    Console.WriteLine("Warte...");
    _wh.WaitOne(); // Blockiert bis Set()
    Console.WriteLine("Aufgeweckt!");
}

// Zwei-Wege-Signalisierung:
static EventWaitHandle _ready = new AutoResetEvent(false);
static EventWaitHandle _go    = new AutoResetEvent(false);
// Worker: _ready.Set(); _go.WaitOne();
// Main:   _ready.WaitOne(); _go.Set();`,
      },
      {
        heading: "ManualResetEvent — Broadcast-Signalisierung",
        body: "ManualResetEvent = manuelles Tor: Set() öffnet es für ALLE wartenden Threads gleichzeitig. Reset() schließt es wieder manuell. Analogie: Tor das aufbleibt bis jemand es schließt.\n\nNützlich: Startschuss für viele parallele Threads, oder 'Warte bis System bereit ist'.",
        code: `static ManualResetEvent _gate = new ManualResetEvent(false);

// Viele Threads starten und warten lassen:
for (int i = 0; i < 5; i++) {
    int id = i; // Closure-Variable!
    new Thread(() => {
        Console.WriteLine($"Thread {id} wartet...");
        _gate.WaitOne(); // Alle warten hier
        Console.WriteLine($"Thread {id}: Los!");
    }).Start();
}

Thread.Sleep(2000);
Console.WriteLine("Startschuss!");
_gate.Set(); // Alle gleichzeitig freigeben
// _gate.Reset(); // Wieder schließen wenn nötig`,
      },
      {
        heading: "CountdownEvent und WaitAny / WaitAll",
        body: "CountdownEvent wartet, bis Signal() genau N-mal aufgerufen wurde. AddCount() erhöht den Zähler (auch nach Start), TryAddCount() scheitert wenn Zähler schon 0. Reset() setzt zurück.\n\nWaitHandle.WaitAny(handles) wartet bis EINES der Events signalisiert wird (gibt Index zurück). WaitHandle.WaitAll(handles) wartet bis ALLE Events signalisiert sind.",
        code: `// CountdownEvent: Warte auf 3 Threads:
static CountdownEvent _countdown = new CountdownEvent(3);

static void Main() {
    new Thread(Worker).Start("Thread 1");
    new Thread(Worker).Start("Thread 2");
    new Thread(Worker).Start("Thread 3");
    _countdown.Wait(); // Blockiert bis alle 3 Signal() gerufen
    Console.WriteLine("Alle Threads fertig!");
}

static void Worker(object name) {
    Thread.Sleep(1000);
    Console.WriteLine(name + " fertig");
    _countdown.Signal(); // Zähler -1

}

// WaitAny: warte auf das erste Event:
var events = new WaitHandle[] {
    new AutoResetEvent(false),
    new AutoResetEvent(false)
};
int idx = WaitHandle.WaitAny(events);
Console.WriteLine("Event " + idx + " kam zuerst");`,
      },
      {
        heading: "Producer-Consumer Queue mit AutoResetEvent",
        body: "Ein häufiges Muster: Producer fügt Aufgaben in eine Queue ein und signalisiert den Consumer. Consumer wartet wenn die Queue leer ist. lock() sichert den thread-sicheren Zugriff auf die Queue.",
        code: `class ProducerConsumerQueue : IDisposable {
    EventWaitHandle _wh = new AutoResetEvent(false);
    Thread _worker;
    readonly object _locker = new object();
    Queue<string> _tasks = new Queue<string>();

    public ProducerConsumerQueue() {
        _worker = new Thread(Work);
        _worker.Start();
    }

    public void EnqueueTask(string task) {
        lock (_locker) _tasks.Enqueue(task);
        _wh.Set(); // Consumer aufwecken
    }

    void Work() {
        while (true) {
            string task = null;
            lock (_locker)
                if (_tasks.Count > 0)
                    task = _tasks.Dequeue();
            if (task == null) { _wh.WaitOne(); continue; }
            if (task == "EXIT") return;
            Console.WriteLine("Verarbeite: " + task);
        }
    }

    public void Dispose() {
        EnqueueTask("EXIT");
        _worker.Join();
        _wh.Close();
    }
}`,
      },
    ],
    relatedSlugs: ["thread-synchronisation"],
  },

  "graphentheorie": {
    slug: "graphentheorie",
    title: "Graphentheorie",
    topicIds: ["GRAPHENTHEORIE"],
    sections: [
      {
        heading: "Geschichte — Das Königsberger Brückenproblem",
        body: "1736 stellte Leonhard Euler die Frage: Kann man alle 7 Brücken von Königsberg genau einmal überqueren und zum Ausgangspunkt zurückkehren? Er bewies: Nein — und legte damit den Grundstein der Graphentheorie.\n\nEulers Einsicht: Man muss nur die Struktur der Verbindungen betrachten (Brücken = Kanten, Stadtteile = Knoten). Damit abstrahierte er das erste Mal von der Geometrie und schuf einen neuen Zweig der Mathematik.",
      },
      {
        heading: "Formale Definition G = (V, E)",
        body: "Ein Graph G = (V, E) besteht aus:\n• V = Knotenmenge (Vertices), nichtleer\n• E = Kantenmenge (Edges), Teilmenge von V×V (gerichtet) oder {{u,v} | u,v ∈ V} (ungerichtet)\n\nBesondere Typen:\n• Einfacher Graph: keine Mehrfachkanten, keine Schlingen\n• Multigraph: mehrere Kanten zwischen demselben Knotenpaar möglich\n• Schlinge (Loop): Kante von einem Knoten zu sich selbst\n• Gerichteter Graph (Digraph): Kanten haben eine Richtung (x,y) ≠ (y,x)",
      },
      {
        heading: "Spezielle Graphen — Kₙ, Cₙ, Pₙ, Km,n",
        body: "Wichtige Graphklassen:\n• Kₙ (vollständiger Graph): n Knoten, jeder mit jedem verbunden. |E| = n(n-1)/2\n• Cₙ (Kreis): n Knoten im Kreis. |E| = n\n• Pₙ (Pfad): n Knoten als Kette. |E| = n-1\n• Km,n (vollständig bipartit): m+n Knoten in zwei Gruppen, jeder Knoten der einen Gruppe mit jedem der anderen verbunden\n• Petersen-Graph: 10 Knoten, 3-regulär, dreiecksfrei, nicht bipartit — ein klassisches Gegenbeispiel\n• Hyperwürfel Qₙ: 2ⁿ Knoten, Kanten zwischen Strings die sich in genau 1 Bit unterscheiden",
      },
      {
        heading: "Graphenoperationen — Komplement, Teilgraph",
        body: "Komplement Ḡ von G = (V,E): gleiches V, aber Kanten genau dort wo G keine hat: E(Ḡ) = E(Kₙ) \\ E.\n\nTeilgraph: Entfernt Knoten UND ihre Kanten (G[V'] mit V' ⊂ V).\nUntergraph: Entfernt nur Kanten, alle Knoten bleiben.\n\nClique: vollständiger Teilgraph (alle Knoten untereinander verbunden). Eine maximale Clique kann nicht erweitert werden.\n\nUnabhängige Menge (Anticlique): Teilmenge von Knoten ohne Kanten untereinander. Clique in G = unabhängige Menge in Ḡ.",
      },
      {
        heading: "Chromatische Zahl und bipartite Graphen",
        body: "Knotenfärbung: Jeder Knoten erhält eine Farbe, benachbarte Knoten müssen verschiedene Farben haben. Die chromatische Zahl χ(G) = minimale Anzahl benötigter Farben.\n\nBipartiter Graph: V lässt sich in zwei Mengen A, B aufteilen, alle Kanten gehen von A nach B (keine Kanten innerhalb A oder B). Äquivalent: G ist bipartit ↔ G enthält keinen Kreis ungerader Länge ↔ χ(G) ≤ 2.\n\nVierfarbensatz: Für jeden planaren Graphen gilt χ(G) ≤ 4.",
      },
      {
        heading: "Isomorphie und Hyperwürfel",
        body: "Zwei Graphen G₁ = (V₁, E₁) und G₂ = (V₂, E₂) sind isomorph wenn es eine Bijektion f: V₁ → V₂ gibt, sodass {u,v} ∈ E₁ ↔ {f(u),f(v)} ∈ E₂. Isomorphe Graphen haben dieselbe Struktur, nur unterschiedliche Knotenbezeichnungen.\n\nHyperwürfel Qₙ: n-dimensionaler Würfel. Q₁ = K₂ (Strecke), Q₂ = C₄ (Quadrat), Q₃ = normaler Würfel. 2ⁿ Knoten, n·2ⁿ⁻¹ Kanten, n-regulär. Jeder Knoten entspricht einem Binärstring der Länge n, Kanten verbinden Strings mit Hamming-Distanz 1.",
      },
      {
        heading: "Gradfolge und Havel-Hakimi",
        body: "Grad d(v): Anzahl der Kanten am Knoten v. Gradfolge: sortierte Liste aller Grade (absteigend). Handschlag-Lemma: Σ d(v) = 2|E| (jede Kante trägt zu zwei Knoten bei).\n\nHavel-Hakimi-Algorithmus: Testet ob eine Folge (d₁ ≥ d₂ ≥ ... ≥ dₙ) als Gradfolge realisierbar ist:\n1. Sortiere absteigend\n2. Entferne d₁, subtrahiere 1 von den nächsten d₁ Einträgen\n3. Wiederhole bis alle 0 (realisierbar) oder Negativwert (nicht realisierbar)",
        code: `// Havel-Hakimi in C#:
bool IsGraphicalSequence(int[] seq) {
    var d = new List<int>(seq);
    while (true) {
        d.Sort(); d.Reverse(); // Absteigend
        if (d[0] == 0) return true; // Alle 0 → realisierbar
        int first = d[0];
        d.RemoveAt(0);
        if (first > d.Count) return false;
        for (int i = 0; i < first; i++) {
            d[i]--;
            if (d[i] < 0) return false;
        }
    }
}`,
      },
      {
        heading: "Wege, Kreise und Erreichbarkeit",
        body: "Weg (Walk): Folge von Knoten v₀, v₁, ..., vₖ wobei {vᵢ, vᵢ₊₁} ∈ E. Länge = Anzahl Kanten.\nPfad (Path): Weg ohne Wiederholung von Knoten.\nKreis (Cycle): Geschlossener Pfad (Start = Ende).\n\nErreichbarkeit: v ist von u aus erreichbar wenn ein Weg von u nach v existiert. Erreichbarkeit definiert eine Äquivalenzrelation auf V.\n\nBreitensuche (BFS): Findet kürzesten Weg (ungewichtet).\nTiefensuche (DFS): Erkundet tief zuerst, gut für Zusammenhangs-Tests.",
        code: `// BFS — kürzester Weg in ungewichtetem Graph:
int[] BFS(Dictionary<int,List<int>> g, int start, int n) {
    int[] dist = new int[n];
    for (int i = 0; i < n; i++) dist[i] = -1;
    dist[start] = 0;
    var queue = new Queue<int>();
    queue.Enqueue(start);
    while (queue.Count > 0) {
        int v = queue.Dequeue();
        foreach (int u in g[v])
            if (dist[u] == -1) {
                dist[u] = dist[v] + 1;
                queue.Enqueue(u);
            }
    }
    return dist; // -1 = nicht erreichbar
}`,
      },
      {
        heading: "Euler-Kreise — Satz und Beweis-Idee",
        body: "Euler-Weg: Weg der jede KANTE genau einmal besucht.\nEuler-Kreis: Euler-Weg mit Start = Ende.\n\nSatz von Euler: Ein zusammenhängender Graph G hat einen Euler-Kreis genau dann, wenn jeder Knoten geraden Grad hat.\n\nBeweis-Idee:\n(⇒) Auf einem Euler-Kreis betritt und verlässt man jeden Knoten gleich oft → gerader Grad.\n(⇐) Starte einen Kreis C. Gibt es eine Kante nicht auf C, starte einen neuen Kreis dort und füge ihn in C ein. Da jeder Knoten geraden Grad hat, kann jeder angefangene Weg fortgesetzt werden.\n\nEuler-Weg (nicht geschlossen): Existiert genau dann wenn genau 2 Knoten ungeraden Grad haben.",
      },
      {
        heading: "Zusammenhang — κ(G) und κ'(G)",
        body: "Zusammenhang: G ist zusammenhängend wenn je zwei Knoten durch einen Weg verbunden sind.\n\nKnotenverbindungszahl κ(G): Minimum der Knoten, deren Entfernung G trennt (oder G auf einen Knoten reduziert). Für vollständigen Graphen Kₙ: κ = n-1.\n\nKantenverbindungszahl κ'(G): Minimum der Kanten, deren Entfernung G trennt.\n\nSatz von Whitney: κ(G) ≤ κ'(G) ≤ δ(G), wobei δ = Minimalgrad.\n\nFür 3-reguläre Graphen gilt κ'(G) = κ(G). Bei 4-regulären gilt das nicht (Gegenbeispiel mit κ=2, κ'=4 aus dem Petersen-Graphen).",
      },
      {
        heading: "Separator und Schnitt",
        body: "Separator (Knotenschnitt): Menge S ⊂ V, deren Entfernung G unzusammenhängend macht. Minimaler Separator hat |S| = κ(G) Knoten.\n\nKantenschnitt (Schnitt): Menge F ⊂ E, deren Entfernung G trennt. Minimaler Kantenschnitt hat |F| = κ'(G) Kanten.\n\nKonstruktion für κ' < δ: Nehme G und klebe an jeden Knoten einen Kₙ. Dann gilt κ'(G*) = κ'(G) und δ(G*) = δ(G) + (n-1). So kann κ' beliebig kleiner als δ gemacht werden.",
      },
      {
        heading: "Wälder und Bäume",
        body: "Wald: Graph ohne Kreise (azyklisch). Baum: zusammenhängender Wald. Blatt: Knoten mit Grad 1 in einem Baum.\n\nCharakterisierungen von Bäumen — folgende Aussagen sind äquivalent für G = (V, E):\n1. G ist zusammenhängend und azyklisch (Definition)\n2. G ist azyklisch und |E| = |V| - 1\n3. G ist zusammenhängend und |E| = |V| - 1\n\nJeder endliche Baum auf ≥ 2 Knoten hat mindestens 2 Blätter.\n\nSpannbaum (Aufspannender Baum): Baum T = (V, F) mit F ⊂ E, der alle Knoten von G enthält. T ist aufspannender Baum ↔ T ist maximal azyklisch ↔ T ist minimal zusammenhängend.",
      },
      {
        heading: "Aufspannende Bäume und Cayley's Formel",
        body: "Cayley's Formel: Der vollständige Graph Kₙ hat genau nⁿ⁻² aufspannende Bäume.\n\n| n | 1 | 2 | 3 | 4 | 5 | n |\n|---|---|---|---|---|---|---|\n| Bäume | 1 | 1 | 3 | 16 | 125 | nⁿ⁻² |\n\nMinimaler Spannbaum (MST): Aufspannender Baum mit minimaler Gesamtkantenlänge.\n• Kruskal: Sortiere Kanten nach Gewicht, füge günstigste hinzu die keinen Kreis bildet\n• Prim: Starte bei einem Knoten, füge immer die günstigste Kante zum Baum hinzu",
        code: `// Kruskal-Algorithmus (Union-Find):
int[] parent, rank;

int Find(int x) {
    if (parent[x] != x) parent[x] = Find(parent[x]);
    return parent[x];
}

void Union(int x, int y) {
    int px = Find(x), py = Find(y);
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
}

List<(int,int,int)> Kruskal(List<(int u,int v,int w)> edges, int n) {
    parent = Enumerable.Range(0,n).ToArray();
    rank = new int[n];
    var mst = new List<(int,int,int)>();
    foreach (var (u,v,w) in edges.OrderBy(e => e.w))
        if (Find(u) != Find(v)) { Union(u,v); mst.Add((u,v,w)); }
    return mst;
}`,
      },
      {
        heading: "Planare Graphen und Dreiecksfreie Graphen",
        body: "Planarer Graph: Lässt sich ohne Kantenkreuzungen in der Ebene zeichnen. Jede kreuzungsfreie Zeichnung = Einbettung. Die Kanten der Einbettung teilen die Ebene in Flächen (inklusive der äußeren Fläche).\n\nEulerscher Polyedersatz: Für zusammenhängende planare Graphen gilt v - e + f = 2 (v=Knoten, e=Kanten, f=Flächen). Daraus folgt: e ≤ 3v - 6 (für v ≥ 3).\n\nDreiecksfreier Graph: kein Kreis der Länge 3. Turán: |E(G)| ≤ ⌊n²/4⌋, maximiert durch K_{⌊n/2⌋,⌈n/2⌉}. Dreiecksfreie Graphen ⊃ bipartite Graphen (Petersen-Graph ist ein Beispiel: dreiecksfrei aber nicht bipartit).",
      },
      {
        heading: "Gewichteter Graph und Dijkstra",
        body: "Gewichteter Graph: Jedem Kante e wird eine reelle Zahl d(e) (Gewicht/Kosten) zugeordnet. Metrischer Graph: Dreiecksungleichung d(a,c) ≤ d(a,b) + d(b,c) gilt für alle Knoten.\n\nDijkstra-Algorithmus: Findet kürzeste Wege von einem Startknoten zu allen anderen (nur nicht-negative Gewichte). Laufzeit: O((V+E) log V) mit Priority Queue.",
        code: `int[] Dijkstra(int[,] g, int start, int n) {
    int[] dist = new int[n];
    bool[] visited = new bool[n];
    for (int i = 0; i < n; i++) dist[i] = int.MaxValue;
    dist[start] = 0;

    for (int count = 0; count < n - 1; count++) {
        int u = -1;
        for (int i = 0; i < n; i++)
            if (!visited[i] && (u == -1 || dist[i] < dist[u]))
                u = i;
        visited[u] = true;

        for (int v = 0; v < n; v++) {
            if (g[u,v] > 0 && !visited[v]) {
                int neu = dist[u] + g[u,v];
                if (neu < dist[v]) dist[v] = neu;
            }
        }
    }
    return dist;
}`,
      },
      {
        heading: "Gerichtete Graphen (Digraphen)",
        body: "Digraph: Paar (V, E) mit gerichteten Kanten e = (x, y). x = Fuß/Startknoten, y = Kopf/Endknoten.\n\nGrade in Digraphen:\n• Eingangsgrad d⁻(v): Anzahl eingehender Kanten (Vorgänger)\n• Ausgangsgrad d⁺(v): Anzahl ausgehender Kanten (Nachfolger)\n• Quelle: d⁻(v) = 0; Senke: d⁺(v) = 0\n• Σ d⁺(v) = Σ d⁻(v) = |E|\n\nZusammenhang in Digraphen:\n• Schwach zusammenhängend: unterliegender ungerichteter Graph ist zusammenhängend\n• Stark zusammenhängend: je zwei Knoten sind gegenseitig erreichbar\n\nDAG (Directed Acyclic Graph): Digraph ohne gerichtete Kreise. Ermöglicht topologische Sortierung.",
      },
    ],
    relatedUebungen: ["ipgraph", "osterhase"],
  },

  "formale-sprachen-grammatik": {
    slug: "formale-sprachen-grammatik",
    title: "Formale Sprachen und Grammatiken",
    topicIds: ["GRAMMATIK"],
    sections: [
      {
        heading: "Sprache — Syntax, Semantik, Pragmatik",
        body: "Jede Sprache hat drei Aspekte:\n• SYNTAX: Regeln für den richtigen Aufbau von Zeichenketten (Grammatik + Alphabet)\n• SEMANTIK: Bedeutung syntaktisch richtiger Zeichenketten\n• PRAGMATIK: Persönliche Interpretation, Vorwissen\n\nProgrammiersprachen brauchen Übereinstimmung von syntaktisch richtigen und semantisch gültigen Programmen. Ein Satz kann syntaktisch richtig, aber semantisch ungültig sein ('Der Tisch spricht gelb über Informatik.').\n\nBeispiel: a := b (Pascal), a = b; (C), A=B (FORTRAN), MOVE B TO A (COBOL) — dieselbe Semantik, verschiedene Syntax.",
      },
      {
        heading: "Grammatik G = (N, T, P, S)",
        body: "Eine formale Grammatik G besteht aus vier Komponenten:\n• N = Nichtterminalsymbole (Hilfssymbole, Variablen, in spitzen Klammern)\n• T = Terminalsymbole (Alphabet, eigentliche Symbole der Sprache), N ∩ T = {}\n• P = Produktionsregeln (Ersetzungsregeln der Form linke Seite → rechte Seite)\n• S ∈ N = Startvariable\n\nEin Wort w ∈ T* gehört zur Sprache L(G) genau dann, wenn es aus S durch wiederholtes Anwenden von Produktionsregeln erzeugt werden kann.\n\nDer Prozess eines Ableitungsschritts: α ⇒ β (eine Regel wurde angewendet). Ableitung = Folge von Schritten: S ⇒* w.",
        code: `// Grammatik für ganze Zahlen:
T = { +, -, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }
N = { <ganze Zahl>, <vzl.g.Zahl>, <Ziffer>, <Vorzeichen> }
S = <ganze Zahl>

P:
  <ganze Zahl>   → <vzl.g.Zahl>
  <ganze Zahl>   → <Vorzeichen><vzl.g.Zahl>
  <Vorzeichen>   → + | -
  <vzl.g.Zahl>   → <Ziffer>
  <vzl.g.Zahl>   → <Ziffer><vzl.g.Zahl>
  <Ziffer>       → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      },
      {
        heading: "Formale Hilfsmittel — Alphabet, Wort, T*",
        body: "Alphabet T: nichtleere endliche Menge von Zeichen/Symbolen.\nWort der Länge n: Folge x₁x₂...xₙ von Symbolen. |w| = Länge des Wortes w.\nLeerwort ε: Wort der Länge 0 (|ε| = 0). Achtung: ε ist kein Terminalsymbol!\n\nT⁺ = alle Wörter über T mit Länge ≥ 1 (ohne Leerwort)\nT* = T⁺ ∪ {ε} = alle Wörter über T (inklusive Leerwort)\n\nVerkettung: xy = x₁...xₙy₁...yₘ. Gilt: xε = εx = x, |xy| = |x| + |y|\nFormale Sprache L: beliebige Teilmenge von T*",
        code: `// Beispiel:
T = { a, b, c }

// T+ enthält: a, b, c, aa, ab, ac, ba, bb, ...
// T* enthält zusätzlich: ε

// Wortmengen-Produkt:
Q = { a, b, c }     M = { c, bba, bcacc }
R = { D, E, F, G }  N = { FE, DDF }

// MN = { cFE, cDDF, bbaFE, bbaDDF, bcaccFE, bcaccDDF }
// NM = { FEc, FEbba, ... }  (NM ≠ MN!)`,
      },
      {
        heading: "Backus-Naur-Form (BNF)",
        body: "BNF (Backus-Naur-Form): 1960 von Backus und Naur für ALGOL-60 entwickelt. Verwendet folgende metasprachliche Symbole:\n• ::= Ersetzungszeichen (statt →)\n• | Trennung von Alternativen\n• < > umschließen Nichtterminalsymbole\n\nLinksableitung: immer das am weitesten links stehende Nichtterminalsymbol zuerst ersetzen.\nRechtsableitung: immer das am weitesten rechts stehende zuerst.\n\nBeide Ableitungen führen zum selben Ergebnis, aber der Ableitungsbaum kann unterschiedliche Struktur haben.",
        code: `// BNF für <identifier> (ALGOL-60):
<digit>      ::= 0|1|2|3|4|5|6|7|8|9
<letter>     ::= a|b|c|...|z|A|B|C|...|Z
<identifier> ::= <letter>
               | <identifier><letter>
               | <identifier><digit>

// Ableitung von V17a (Rechtsableitung):
<identifier>
  ⇒ <identifier><letter>        a
  ⇒ <identifier><digit> a      7a
  ⇒ <identifier><digit> 7a     17a
  ⇒ <letter> 17a               V17a`,
      },
      {
        heading: "Erweiterte BNF (EBNF) und ABNF",
        body: "EBNF (Erweiterte BNF): für PASCAL entwickelt. Fügt hinzu:\n• { } = Wiederholung (0 oder mehr)\n\n<identifier> ::= <letter> { <letter or digit> }\n\nABNF (Allgemeine BNF): für COBOL, ADA, MODULA-2. Fügt hinzu:\n• [ ] = optional (0 oder 1 mal)\n\nidentifier ::= letter { [ underscore ] letter_or_digit }\n\nEBNF und ABNF machen Rekursionsregeln einfacher — statt rekursiver Produktionen verwendet man Iterationssymbole.",
        code: `// EBNF: <identifier> für Pascal
<digit>           ::= 0|1|2|3|4|5|6|7|8|9
<letter>          ::= a|b|...|z|A|B|...|Z
<letter or digit> ::= <letter> | <digit>
<identifier>      ::= <letter> { <letter or digit> }

// ABNF: identifier für ADA
digit         ::= 0|1|2|3|4|5|6|7|8|9
letter        ::= lower_case_letter | upper_case_letter
letter_or_digit ::= letter | digit
underscore    ::= _
identifier    ::= letter { [ underscore ] letter_or_digit }

// BNF für Simple Programming Language (SPL):
<program>    ::= <statement list>
<statement>  ::= <input stmt> | <output stmt>
               | <assignment> | <conditional> | <loop>
<assignment> ::= <variable> := <expression>`,
      },
      {
        heading: "Chomsky-Hierarchie — Grammatiktypen",
        body: "Alle Grammatiktypen haben die Form G = (N, T, P, S). Sie unterscheiden sich in der erlaubten Struktur der Produktionsregeln:\n\nTyp 3 — Reguläre Grammatik (RECHTSLINEAR): Rechte Seite: Terminalsymbol oder Terminalsymbol + Variable. Einfachster Typ, durch endliche Automaten erkennbar.\n\nTyp 2 — Kontextfreie Grammatik: Links genau eine Variable, rechts beliebige Folge aus V*. Für Programmiersprachen-Syntax. Durch Kellerautomaten erkennbar.\n\nTyp 1 — Kontextsensitive Grammatik: Linke Seite kann Kontext enthalten, rechte Seite muss gleich lang oder länger sein.\n\nTyp 0 — Allgemeine Regelgrammatik: Keine Einschränkungen. Durch Turing-Maschinen erkennbar.\n\nHierarchie: Typ-3 ⊂ Typ-2 ⊂ Typ-1 ⊂ Typ-0",
        code: `// Reguläre Grammatik (Typ 3) — erzeugt ganze Zahlen:
T = {+, -, 0..9}
N = {S, Z}
P:
  S → +Z | -Z | 0Z | 1Z | ... | 9Z
  S → 0 | 1 | ... | 9
  Z → 0Z | 1Z | ... | 9Z | 0 | 1 | ... | 9

// Kontextfreie Grammatik (Typ 2) — erzeugt aⁿbⁿ:
T = {a, b}
N = {S}
P:
  S → aSb | ab
// aⁿbⁿ kann NICHT durch Typ-3 erzeugt werden!

// Formale Sprache der Grammatik G:
L(G) = {w | w ∈ T*, S ⇒* w}`,
      },
      {
        heading: "Syntaxdiagramme",
        body: "Syntaxdiagramme (Railroad Diagrams): Visuelle Darstellung von Grammatikregeln. Jedes Diagramm hat genau einen Eingang und Ausgang.\n\nGrundbausteine:\n• Terminalsymbol: abgerundetes Rechteck\n• Nichtterminalsymbol: eckiges Rechteck\n• Sequenz: Pfeile von links nach rechts\n• Alternative (Auswahl): Verzweigung\n• Iteration (Wiederholung): Schleife zurück\n\nZwei Verwendungen:\n• Synthese: Gültige Sätze erzeugen (folge den Pfeilen)\n• Analyse: Prüfen ob eine Zeichenkette zur Sprache gehört (verfolge den Weg durch das Diagramm)",
      },
      {
        heading: "Endliche Automaten — NEA und DEA",
        body: "Endlicher Automat: gerichteter Graph mit Zuständen und beschrifteten Transitionen. Akzeptiert Wörter wenn vom Startknoten ein Weg zum Endknoten existiert.\n\nNEA (Nichtdeterministischer Endlicher Automat): N = (K, T, δN, q₀, F)\n• K = endliche Menge von Zuständen\n• T = Terminalalphabet\n• δN: K × T → P(K) (Überführungsfunktion in Potenzmenge)\n• q₀ ∈ K = Anfangszustand\n• F ⊆ K = Menge der Endzustände\n\nNEA ist nichtdeterministisch wenn von einem Zustand mit gleichem Symbol mehrere Kanten ausgehen.\n\nSatz: Zu jedem NEA N gibt es einen DEA D mit T(N) = T(D). Die Zustände des DEA entsprechen Teilmengen der NEA-Zustände (Potenzmengenkonstruktion).",
        code: `// NEA für die Sprache der ganzen Zahlen:
// Zustände: S (Start), Z (Ziffer), F (Endknoten)
// Überführungstabelle:
//      Symbol: +,-       0-9
//  S:          → Z       → F
//  Z:          (—)       → F (Schleife)
//  F:          (—)       → F (Schleife)
// F ist Endknoten

// DEA (deterministisch): Von S mit +/- → Zustand Z
// Von Z oder F mit 0-9 → Zustand F (Schleife)
// DEA akzeptiert: -739, +42, 0, 123
// DEA lehnt ab: "", "+", "12+3"`,
      },
      {
        heading: "Deterministische Automaten und Potenzmengenkonstruktion",
        body: "Potenzmengenkonstruktion: NEA → DEA\n1. Startzustand des DEA = {q₀}\n2. Für jeden neuen Zustand {S₁,...,Sₖ} und jedes Symbol a: neuer DEA-Zustand = ∪ δN(Sᵢ, a)\n3. Endzustände des DEA = alle Mengen die mindestens einen NEA-Endzustand enthalten\n4. Wiederhole bis keine neuen Zustände entstehen\n\nDer DEA kann bis zu 2^|K| Zustände haben (meist viel weniger nötig).",
        code: `// Beispiel Potenzmengenkonstruktion:
// NEA-Überführungstabelle:
//        a        b
// S: {S,A}      {S}
// A:  —         {B,C}
// B: {C}        —
// C:  —         —   (C ist Endknoten)

// DEA-Konstruktion:
// Start: {S}
//   {S} --a--> {S,A}    {S} --b--> {S}
//   {S,A} --a--> {S,A}  {S,A} --b--> {S,B,C}  ← Endknoten!
//   ...
// Endknoten DEA = alle Zustände die C enthalten`,
      },
      {
        heading: "Minimalautomaten (MEA)",
        body: "Minimalautomaten M: deterministischer vollständiger Automat mit minimaler Zustandsanzahl für eine reguläre Sprache. Eindeutig bis auf Isomorphie.\n\nKonstruktion:\n1. Vollständigen DEA herstellen (Falle-Zustand für fehlende Kanten)\n2. Vereinfachen: unerreichbare Zustände entfernen\n3. Äquivalenzklassen berechnen: q ≈ q' wenn für alle w: δ(q,w)∈F ↔ δ(q',w)∈F\n\nIterationsverfahren:\n• Zerlegung Z₁: {Endzustände} und {Nicht-Endzustände}\n• Z_{k+1}: Verfeinere jeden Block falls zwei Zustände unter einem Symbol in verschiedene Blöcke führen\n• Stoppe wenn keine weitere Teilung möglich",
      },
    ],
    relatedSlugs: ["compiler"],
    relatedUebungen: ["taschenrechner", "aussagenlogikparser", "formalesprachen"],
  },

  "compiler": {
    slug: "compiler",
    title: "Compiler — Phasen und Parser",
    topicIds: ["GRAMMATIK", "ALGORITHMEN"],
    sections: [
      {
        heading: "Phasenmodell des Compilers",
        body: "Ein Compiler übersetzt Quellcode in Maschinencode in mehreren Phasen:\n\n1. Lexikalische Analyse (Lexer/Scanner): Zerlegt den Quelltext in Token\n2. Syntaxanalyse (Parser): Prüft die Grammatik, baut Syntaxbaum\n3. Semantische Analyse: Prüft Typen, Deklarationen, Gültigkeitsbereiche\n4. Zwischencodeoptimierung: Vereinfacht den internen Repräsentation\n5. Codegenerierung: Erzeugt Maschinencode\n\nCompiler vs. Interpreter: Compiler übersetzt alles in Maschinencode (schnell zur Laufzeit). Interpreter führt direkt aus (langsamer, aber keine Kompilierphase). JIT (Just-In-Time) kombiniert beides.",
        code: `// Phasenmodell zusammengefasst:
Quelltext
  → [Lexer]        → Token-Folge
  → [Parser]       → Syntaxbaum (AST)
  → [Semantik]     → Annotierter AST
  → [Optimierung]  → Optimierter Zwischencode
  → [Codegen]      → Maschinencode / IL

// Beispiel Token-Folge für "x = 3 + y * 2":
ID("x"), ASSIGN, NUM(3), PLUS, ID("y"), STAR, NUM(2)`,
      },
      {
        heading: "Lexikalische Analyse — Token-Typen",
        body: "Der Lexer liest den Quelltext zeichenweise und erkennt Token:\n• Keywords: if, while, int, class, ...\n• Identifier: Bezeichner (beginnen mit Buchstabe)\n• Literale: Zahlen, Strings, Chars, Booleans\n• Operatoren: +, -, *, /, ==, <=, ...\n• Satzzeichen: (, ), {, }, ;, ,\n• Whitespace/Kommentare: werden verworfen\n\nDie Grammatik der Token ist regulär — erkennbar durch endliche Automaten (DEA). In der Praxis: reguläre Ausdrücke (Regex).",
        code: `enum TokenType {
    Number, Plus, Minus, Star, Slash,
    LParen, RParen, Identifier,
    Assign, Semicolon, EOF
}

class Token {
    public TokenType Type;
    public string Value;
    public Token(TokenType t, string v) { Type=t; Value=v; }
}

List<Token> Tokenize(string input) {
    var tokens = new List<Token>();
    string pattern = @"\\d+\\.?\\d*|[+\\-*/()=;]|[a-zA-Z_]\\w*";
    foreach (Match m in Regex.Matches(input, pattern)) {
        string v = m.Value;
        if (double.TryParse(v, out _))
            tokens.Add(new Token(TokenType.Number, v));
        else if (v == "+") tokens.Add(new Token(TokenType.Plus, v));
        else if (v == "-") tokens.Add(new Token(TokenType.Minus, v));
        else if (v == "*") tokens.Add(new Token(TokenType.Star, v));
        else if (v == "/") tokens.Add(new Token(TokenType.Slash, v));
        else if (v == "(") tokens.Add(new Token(TokenType.LParen, v));
        else if (v == ")") tokens.Add(new Token(TokenType.RParen, v));
        else tokens.Add(new Token(TokenType.Identifier, v));
    }
    tokens.Add(new Token(TokenType.EOF, ""));
    return tokens;
}`,
      },
      {
        heading: "LL(1)-Grammatik und FIRST/FOLLOW",
        body: "LL(1): Links-to-right, Leftmost derivation, 1 Lookahead-Token. Voraussetzung für den Recursive-Descent Parser.\n\nFIRST(A): Menge der Terminalsymbole, mit denen eine von A ableitbare Zeichenkette beginnen kann.\nFOLLOW(A): Menge der Terminalsymbole, die in einer Ableitung direkt hinter A stehen können.\n\nEine Grammatik ist LL(1) wenn für jedes Nichtterminal A alle Alternativen disjunkte FIRST-Mengen haben. Bei linker Rekursion (A → Aα) muss die Grammatik erst umgeformt werden.",
        code: `// Grammatik für arithmetische Ausdrücke (LL(1)):
// expr   = term { ('+' | '-') term }
// term   = factor { ('*' | '/') factor }
// factor = number | '(' expr ')' | identifier

// FIRST-Mengen:
// FIRST(expr)   = FIRST(term)   = FIRST(factor) = {number, '(', identifier}
// FIRST('+')    = {'+'}
// FIRST('-')    = {'-'}

// Diese Grammatik ist LL(1), weil:
// - expr startet mit: Zahl, '(' oder Bezeichner
// - '+' und '-' schließen sich gegenseitig aus
// - Kein Konflikt beim Lookahead`,
      },
      {
        heading: "Rekursiv-absteigender Parser (Top-Down)",
        body: "Jede Grammatikregel wird zu einer Methode. Die Methoden rufen sich gegenseitig auf. Der Parser schaut 1 Token voraus (Lookahead) um zu entscheiden welche Regel anzuwenden.\n\nFür expr → term { ('+' | '-') term }: while-Schleife.\nFür factor → '(' expr ')': rekursiver Aufruf von ParseExpr().",
        code: `class Parser {
    List<Token> _tokens;
    int _pos = 0;
    Token Current => _tokens[_pos];

    void Consume(TokenType t) {
        if (Current.Type != t)
            throw new Exception($"Erwartet {t}, war {Current.Value}");
        _pos++;
    }

    // expr = term { ('+' | '-') term }
    double ParseExpr() {
        double val = ParseTerm();
        while (Current.Type == TokenType.Plus ||
               Current.Type == TokenType.Minus) {
            bool isPlus = Current.Type == TokenType.Plus;
            _pos++;
            double right = ParseTerm();
            val = isPlus ? val + right : val - right;
        }
        return val;
    }

    // term = factor { ('*' | '/') factor }
    double ParseTerm() {
        double val = ParseFactor();
        while (Current.Type == TokenType.Star ||
               Current.Type == TokenType.Slash) {
            bool isMul = Current.Type == TokenType.Star;
            _pos++;
            double right = ParseFactor();
            val = isMul ? val * right : val / right;
        }
        return val;
    }

    // factor = number | '(' expr ')' | identifier
    double ParseFactor() {
        if (Current.Type == TokenType.Number) {
            double val = double.Parse(Current.Value);
            _pos++; return val;
        }
        if (Current.Type == TokenType.LParen) {
            _pos++;
            double val = ParseExpr();
            Consume(TokenType.RParen);
            return val;
        }
        throw new Exception("Unerwartetes Token: " + Current.Value);
    }
}`,
      },
      {
        heading: "Bottom-Up Parser (LR-Parsing)",
        body: "LR-Parser: Links-to-right, Rightmost derivation (in umgekehrter Reihenfolge). Erkennt mächtigere Grammatiken als LL(1).\n\nFunktionsprinzip:\n• Shift: Nächstes Token auf den Stack legen\n• Reduce: Oberste Stack-Symbole durch Nichtterminalsymbol ersetzen (Regel rückwärts anwenden)\n\nLR(k): schaut k Tokens voraus. SLR(1), LALR(1), LR(1) sind Varianten mit je mehr Ausdrucksmächtigkeit. Parser-Generatoren (yacc, bison, ANTLR) erzeugen LR-Parser automatisch aus Grammatikregeln.",
        code: `// Bottom-Up Beispiel für "3 + 4 * 5":
// Grammatik: E → E+T | T, T → T*F | F, F → number

// Schritt   Stack           Input         Aktion
//   1       []              3 + 4 * 5$    Shift 3
//   2       [3]             + 4 * 5$      Reduce F→3
//   3       [F]             + 4 * 5$      Reduce T→F
//   4       [T]             + 4 * 5$      Reduce E→T
//   5       [E]             + 4 * 5$      Shift +
//   6       [E,+]           4 * 5$        Shift 4
//   7       [E,+,4]         * 5$          Reduce F→4, T→F
//   8       [E,+,T]         * 5$          Shift *
//   9       [E,+,T,*]       5$            Shift 5
//  10       [E,+,T,*,5]     $             Reduce F→5
//  11       [E,+,T,*,F]     $             Reduce T→T*F
//  12       [E,+,T]         $             Reduce E→E+T
//  13       [E]             $             Akzeptieren!`,
      },
      {
        heading: "AST — Abstract Syntax Tree",
        body: "Statt direkt auszuwerten kann man einen Syntaxbaum (AST) aufbauen. Jeder Knoten implementiert ein Interface mit Evaluate(). Vorteil: Mehrfache Auswertung, Optimierungen, Serialisierung.",
        code: `interface IExpression {
    double Evaluate(Dictionary<string, double> vars);
}

class NumberExpr : IExpression {
    double _value;
    public NumberExpr(double v) { _value = v; }
    public double Evaluate(Dictionary<string, double> _)
        => _value;
}

class BinaryExpr : IExpression {
    IExpression _left, _right;
    char _op;
    public BinaryExpr(IExpression l, char op, IExpression r)
        { _left = l; _op = op; _right = r; }
    public double Evaluate(Dictionary<string, double> vars) {
        double l = _left.Evaluate(vars);
        double r = _right.Evaluate(vars);
        return _op switch {
            '+' => l + r, '-' => l - r,
            '*' => l * r, '/' => l / r,
            _ => throw new Exception("Unbekannter Operator")
        };
    }
}

class VariableExpr : IExpression {
    string _name;
    public VariableExpr(string n) { _name = n; }
    public double Evaluate(Dictionary<string, double> vars)
        => vars.TryGetValue(_name, out double v) ? v
           : throw new Exception($"Unbekannte Variable: {_name}");
}`,
      },
    ],
    relatedSlugs: ["formale-sprachen-grammatik"],
    relatedUebungen: ["taschenrechner", "aussagenlogikparser"],
  },
};
