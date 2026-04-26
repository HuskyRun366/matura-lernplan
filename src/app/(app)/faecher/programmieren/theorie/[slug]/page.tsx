"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  BookOpen,
  Code2,
  Check,
  Copy,
  CheckCheck,
  Network,
  Cpu,
  GitBranch,
  FileCode2,
  Zap,
} from "lucide-react";
import { THEORIE_PAGES } from "@/lib/theorie-data";
import { cn } from "@/lib/utils";

// ── Topic color themes ────────────────────────────────────────────────────────

const TOPIC_THEMES: Record<
  string,
  {
    accent: string;
    accentText: string;
    headerBg: string;
    headerBorder: string;
    badge: string;
    tocActive: string;
    sectionBorder: string;
    checkBtn: string;
    progressBar: string;
    icon: React.ElementType;
  }
> = {
  NETZWERK: {
    accent: "bg-blue-500",
    accentText: "text-blue-600 dark:text-blue-400",
    headerBg: "bg-blue-50 dark:bg-blue-950/40",
    headerBorder: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    tocActive: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    sectionBorder: "border-blue-200 dark:border-blue-800/60",
    checkBtn: "bg-blue-500 text-white hover:bg-blue-600",
    progressBar: "bg-blue-500",
    icon: Network,
  },
  MULTITHREADING: {
    accent: "bg-purple-500",
    accentText: "text-purple-600 dark:text-purple-400",
    headerBg: "bg-purple-50 dark:bg-purple-950/40",
    headerBorder: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    tocActive: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    sectionBorder: "border-purple-200 dark:border-purple-800/60",
    checkBtn: "bg-purple-500 text-white hover:bg-purple-600",
    progressBar: "bg-purple-500",
    icon: Cpu,
  },
  GRAPHENTHEORIE: {
    accent: "bg-emerald-500",
    accentText: "text-emerald-600 dark:text-emerald-400",
    headerBg: "bg-emerald-50 dark:bg-emerald-950/40",
    headerBorder: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    tocActive: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    sectionBorder: "border-emerald-200 dark:border-emerald-800/60",
    checkBtn: "bg-emerald-500 text-white hover:bg-emerald-600",
    progressBar: "bg-emerald-500",
    icon: GitBranch,
  },
  GRAMMATIK: {
    accent: "bg-amber-500",
    accentText: "text-amber-600 dark:text-amber-400",
    headerBg: "bg-amber-50 dark:bg-amber-950/40",
    headerBorder: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    tocActive: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    sectionBorder: "border-amber-200 dark:border-amber-800/60",
    checkBtn: "bg-amber-500 text-white hover:bg-amber-600",
    progressBar: "bg-amber-500",
    icon: FileCode2,
  },
  ALGORITHMEN: {
    accent: "bg-rose-500",
    accentText: "text-rose-600 dark:text-rose-400",
    headerBg: "bg-rose-50 dark:bg-rose-950/40",
    headerBorder: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-700",
    tocActive: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    sectionBorder: "border-rose-200 dark:border-rose-800/60",
    checkBtn: "bg-rose-500 text-white hover:bg-rose-600",
    progressBar: "bg-rose-500",
    icon: Zap,
  },
};

const DEFAULT_THEME = TOPIC_THEMES.ALGORITHMEN;

function getTheme(topicIds: string[]) {
  for (const id of topicIds) {
    if (TOPIC_THEMES[id]) return TOPIC_THEMES[id];
  }
  return DEFAULT_THEME;
}

// ── C# Syntax Tokenizer ───────────────────────────────────────────────────────

type TokenType =
  | "keyword"
  | "type"
  | "string"
  | "comment"
  | "number"
  | "punctuation"
  | "text";

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "new", "public", "private", "protected", "internal", "static", "void",
  "return", "if", "else", "while", "for", "foreach", "in", "class",
  "interface", "using", "namespace", "null", "true", "false", "this", "base",
  "override", "virtual", "abstract", "sealed", "readonly", "const", "async",
  "await", "try", "catch", "finally", "throw", "lock", "out", "ref", "params",
  "get", "set", "where", "yield", "break", "continue", "switch", "case",
  "default", "delegate", "event", "enum", "struct",
]);

const TYPES = new Set([
  "int", "string", "bool", "float", "double", "long", "byte", "short",
  "char", "object", "var", "uint", "ulong", "ushort", "sbyte", "decimal",
  "List", "Dictionary", "HashSet", "Queue", "Stack", "Array", "IEnumerable",
  "IList", "IDictionary", "Action", "Func", "Task", "Thread", "Socket",
  "IPAddress", "IPEndPoint", "TcpClient", "TcpListener", "UdpClient",
  "NetworkStream", "StreamReader", "StreamWriter", "StringBuilder",
  "WaitHandle", "Mutex", "Semaphore", "SemaphoreSlim", "Monitor",
  "AutoResetEvent", "ManualResetEvent", "CountdownEvent", "Barrier",
  "ThreadPool", "WebClient", "Dns", "IPHostEntry", "SocketFlags",
  "AddressFamily", "SocketType", "ProtocolType", "SocketShutdown",
  "Encoding", "Console", "Math", "String", "Object", "Exception",
]);

function tokenizeCSharp(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Line comment
    if (code[i] === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const value = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: "comment", value });
      i += value.length;
      continue;
    }

    // Block comment
    if (code[i] === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const value = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: "comment", value });
      i += value.length;
      continue;
    }

    // Verbatim string @"..."
    if (code[i] === "@" && code[i + 1] === '"') {
      let j = i + 2;
      while (j < code.length) {
        if (code[j] === '"' && code[j + 1] === '"') { j += 2; continue; }
        if (code[j] === '"') break;
        j++;
      }
      tokens.push({ type: "string", value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // String
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === "\\") j++;
        j++;
      }
      tokens.push({ type: "string", value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Char literal
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === "\\") j++;
        j++;
      }
      tokens.push({ type: "string", value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Identifier / keyword / type
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.has(word)) tokens.push({ type: "keyword", value: word });
      else if (TYPES.has(word)) tokens.push({ type: "type", value: word });
      else tokens.push({ type: "text", value: word });
      i = j;
      continue;
    }

    // Number (hex, decimal)
    if (/\d/.test(code[i]) || (code[i] === "0" && code[i + 1] === "x")) {
      let j = i;
      while (j < code.length && /[\dxXa-fA-F._]/.test(code[j])) j++;
      tokens.push({ type: "number", value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation / operators
    if (/[{}[\]();,.<>!=+\-*/%&|^~?:@]/.test(code[i])) {
      tokens.push({ type: "punctuation", value: code[i] });
      i++;
      continue;
    }

    // Whitespace / everything else
    tokens.push({ type: "text", value: code[i] });
    i++;
  }

  return tokens;
}

const TOKEN_CLASS: Record<TokenType, string> = {
  keyword: "text-blue-400 font-semibold",
  type: "text-cyan-400",
  string: "text-emerald-400",
  comment: "text-slate-500 italic",
  number: "text-orange-400",
  punctuation: "text-slate-400",
  text: "text-slate-200",
};

// ── CodeBlock component ───────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const tokens = tokenizeCSharp(code);

  return (
    <div className="relative group mt-3">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 p-1.5 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
        title="Code kopieren"
      >
        {copied ? (
          <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <div className="flex items-center gap-1.5 bg-slate-800 rounded-t-lg px-4 py-1.5 border-b border-slate-700">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-[10px] text-slate-500 font-mono">C#</span>
      </div>
      <pre className="bg-slate-900 dark:bg-slate-950 rounded-b-lg px-4 py-4 text-xs font-mono overflow-x-auto leading-relaxed">
        {tokens.map((token, idx) => (
          <span key={idx} className={TOKEN_CLASS[token.type]}>
            {token.value}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TheoriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const page = THEORIE_PAGES[slug];

  const [learnedSections, setLearnedSections] = useState<Set<number>>(
    new Set()
  );
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Load learned state from localStorage
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(`theorie-learned-${slug}`);
        if (stored) setLearnedSections(new Set(JSON.parse(stored)));
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [slug]);

  const toggleLearned = useCallback(
    (index: number) => {
      setLearnedSections((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        try {
          localStorage.setItem(
            `theorie-learned-${slug}`,
            JSON.stringify([...next])
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [slug]
  );

  // Scroll spy
  useEffect(() => {
    if (!page) return;
    const refs = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => refs.indexOf(e.target as HTMLElement))
          .filter((i) => i !== -1);
        if (visible.length > 0) setActiveSection(Math.min(...visible));
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );

    refs.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, [page]);

  if (!page) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Theorie-Seite nicht gefunden
      </div>
    );
  }

  const theme = getTheme(page.topicIds);
  const TopicIcon = theme.icon;
  const progress = page.sections.length
    ? Math.round((learnedSections.size / page.sections.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div
        className={cn(
          "rounded-xl border p-5",
          theme.headerBg,
          theme.headerBorder
        )}
      >
        <Link
          href="/faecher/programmieren"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Programmieren
        </Link>

        <div className="flex flex-wrap gap-2 mb-3">
          {page.topicIds.map((id) => (
            <span
              key={id}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                theme.badge
              )}
            >
              <TopicIcon className="h-3 w-3" />
              {id}
            </span>
          ))}
        </div>

        <h1 className={cn("text-2xl font-bold mb-4", theme.accentText)}>
          {page.title}
        </h1>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {learnedSections.size} / {page.sections.length} Abschnitte gelernt
            </span>
            <span className={cn("font-semibold", theme.accentText)}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                theme.progressBar
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Body: TOC + Sections ── */}
      <div className="flex gap-6 items-start">
        {/* Sticky TOC */}
        <nav className="hidden lg:block w-52 shrink-0 sticky top-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            Inhalt
          </p>
          <ul className="space-y-0.5">
            {page.sections.map((section, i) => {
              const isLearned = learnedSections.has(i);
              const isActive = activeSection === i;
              return (
                <li key={i}>
                  <button
                    onClick={() =>
                      sectionRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className={cn(
                      "w-full text-left text-xs px-2.5 py-2 rounded-lg transition-all flex items-start gap-1.5",
                      isActive
                        ? cn("font-medium", theme.tocActive)
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {isLearned ? (
                      <Check
                        className={cn(
                          "h-3 w-3 mt-0.5 shrink-0",
                          theme.accentText
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 transition-colors",
                          isActive ? theme.accent : "bg-muted-foreground/40"
                        )}
                      />
                    )}
                    <span className="line-clamp-2 leading-snug">
                      {section.heading}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sections */}
        <div className="flex-1 space-y-4 min-w-0">
          {page.sections.map((section, i) => {
            const isLearned = learnedSections.has(i);
            return (
              <section
                key={i}
                ref={(el) => {
                  sectionRefs.current[i] = el;
                }}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-200",
                  theme.sectionBorder,
                  isLearned && "opacity-70"
                )}
              >
                {/* colored left accent + content */}
                <div className="flex">
                  <div className={cn("w-1 shrink-0", theme.accent)} />
                  <div className="flex-1 p-4 min-w-0">
                    {/* Section header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {section.code ? (
                          <Code2
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              theme.accentText
                            )}
                          />
                        ) : (
                          <BookOpen
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              theme.accentText
                            )}
                          />
                        )}
                        <h2 className="font-semibold text-sm leading-snug">
                          {section.heading}
                        </h2>
                      </div>

                      <button
                        onClick={() => toggleLearned(i)}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all whitespace-nowrap",
                          isLearned
                            ? cn("border-transparent", theme.checkBtn)
                            : "border-muted text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        )}
                      >
                        <Check className="h-3 w-3" />
                        {isLearned ? "Gelernt" : "Gelernt?"}
                      </button>
                    </div>

                    {/* Body text */}
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.body}
                    </p>

                    {/* Code */}
                    {section.code && <CodeBlock code={section.code} />}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── Related sections ── */}
      {((page.relatedSlugs && page.relatedSlugs.length > 0) ||
        (page.relatedUebungen && page.relatedUebungen.length > 0)) && (
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {page.relatedSlugs && page.relatedSlugs.length > 0 && (
            <div
              className={cn(
                "rounded-xl border p-4",
                theme.headerBg,
                theme.headerBorder
              )}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Verwandte Theorie
              </h3>
              <div className="flex flex-wrap gap-2">
                {page.relatedSlugs.map((relSlug) => {
                  const rel = THEORIE_PAGES[relSlug];
                  return rel ? (
                    <Link
                      key={relSlug}
                      href={`/faecher/programmieren/theorie/${relSlug}`}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors hover:opacity-80",
                          theme.badge
                        )}
                      >
                        <BookOpen className="h-3 w-3" />
                        {rel.title}
                      </span>
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {page.relatedUebungen && page.relatedUebungen.length > 0 && (
            <div className="rounded-xl border p-4 bg-muted/30">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Passende Übungen
              </h3>
              <div className="flex flex-wrap gap-2">
                {page.relatedUebungen.map((uSlug) => (
                  <Link
                    key={uSlug}
                    href={`/faecher/programmieren/uebungen/${uSlug}`}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent text-xs"
                    >
                      {uSlug}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
