import "server-only";

import { list } from "@vercel/blob";

export type MaturaPdfLink = {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
};

export type MaturaPartLinks = {
  aufgaben?: MaturaPdfLink;
  loesungen?: MaturaPdfLink;
};

export type MaturaExample = {
  yearKey: string;
  yearLabel: string;
  termCode: string;
  termLabel: string;
  sortKey: string;
  full: MaturaPartLinks;
  teilA: MaturaPartLinks;
  teilB: MaturaPartLinks;
};

type MutableExample = MaturaExample;

const SPLIT_RE =
  /^matura\/htl-2\/(haupttermin|herbsttermin)\/(\d{4}-\d{2})\/teil-(a|b)_(au|lo)\.pdf$/;
const TERM_FULL_RE =
  /^matura\/htl-2\/(haupttermin|herbsttermin)\/(\d{4}-\d{2})\/full_(au|lo)\.pdf$/;
const FULL_RE =
  /^matura\/(\d{4}-\d{2})-([A-Z]+)-htl-2-kl\d{2}_pt\d_htl_amt_ab_h2_(au|lo)\.pdf$/;

const TERM_LABELS: Record<string, string> = {
  H: "Haupttermin",
  HE: "Herbsttermin",
  W: "Wintertermin",
};

const TERM_SORT: Record<string, number> = {
  HE: 40,
  H: 30,
  W: 20,
};

const TERM_SLUG_CODES: Record<string, string> = {
  haupttermin: "H",
  herbsttermin: "HE",
};

function yearLabel(yearKey: string) {
  return yearKey.replace("-", "/");
}

function termLabel(termCode: string) {
  return TERM_LABELS[termCode] ?? `Termin ${termCode}`;
}

function sortKey(yearKey: string, termCode: string) {
  const termRank = TERM_SORT[termCode] ?? 0;
  return `${yearKey}-${termRank.toString().padStart(2, "0")}`;
}

function emptyExample(yearKey: string, termCode: string): MutableExample {
  return {
    yearKey,
    yearLabel: yearLabel(yearKey),
    termCode,
    termLabel: termLabel(termCode),
    sortKey: sortKey(yearKey, termCode),
    full: {},
    teilA: {},
    teilB: {},
  };
}

function toLink(blob: {
  pathname: string;
  url: string;
  downloadUrl: string;
  size: number;
}): MaturaPdfLink {
  return {
    pathname: blob.pathname,
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    size: blob.size,
  };
}

function assignKind(
  target: MaturaPartLinks,
  kind: string,
  link: MaturaPdfLink,
  overwrite = true,
) {
  if (kind === "au" && (overwrite || !target.aufgaben)) target.aufgaben = link;
  if (kind === "lo" && (overwrite || !target.loesungen)) target.loesungen = link;
}

export async function getHtl2MaturaExamples(): Promise<MaturaExample[]> {
  const examples = new Map<string, MutableExample>();
  let cursor: string | undefined;

  do {
    const result = await list({ prefix: "matura/", limit: 1000, cursor });

    for (const blob of result.blobs) {
      const splitMatch = blob.pathname.match(SPLIT_RE);
      if (splitMatch) {
        const [, termSlug, year, part, kind] = splitMatch;
        const termCode = TERM_SLUG_CODES[termSlug];
        const key = `${year}-${termCode}`;
        const example = examples.get(key) ?? emptyExample(year, termCode);
        assignKind(part === "a" ? example.teilA : example.teilB, kind, toLink(blob));
        examples.set(key, example);
        continue;
      }

      const termFullMatch = blob.pathname.match(TERM_FULL_RE);
      if (termFullMatch) {
        const [, termSlug, year, kind] = termFullMatch;
        const termCode = TERM_SLUG_CODES[termSlug];
        const key = `${year}-${termCode}`;
        const example = examples.get(key) ?? emptyExample(year, termCode);
        assignKind(example.full, kind, toLink(blob));
        examples.set(key, example);
        continue;
      }

      const fullMatch = blob.pathname.match(FULL_RE);
      if (fullMatch) {
        const [, year, termCode, kind] = fullMatch;
        const key = `${year}-${termCode}`;
        const example = examples.get(key) ?? emptyExample(year, termCode);
        assignKind(example.full, kind, toLink(blob), false);
        examples.set(key, example);
      }
    }

    cursor = result.cursor;
    if (!result.hasMore) break;
  } while (cursor);

  return [...examples.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
