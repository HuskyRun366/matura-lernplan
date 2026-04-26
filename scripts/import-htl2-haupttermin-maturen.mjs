#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";
import { list, put } from "@vercel/blob";

const BASE_URL = "https://www.matura.gv.at";
const SEARCH_PATH = "/downloads";
const TMP_DIR = path.join(process.cwd(), "tmp", "pdfs", "htl2-haupttermin-import");
const MAX_SEARCH_PAGES = 40;
const PDF_CONTENT_TYPE = "application/pdf";
const TERMS = [
  { label: "Haupttermin", code: "H", slug: "haupttermin", legacyRoot: true },
  { label: "Herbsttermin", code: "HE", slug: "herbsttermin", legacyRoot: false },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPLIT_SCRIPT = path.join(__dirname, "split-matura-pdf.py");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function buildSearchUrl(page) {
  const url = new URL(SEARCH_PATH, BASE_URL);
  url.searchParams.set(
    "tx_solr[filter][0]",
    "documentType:/Frühere Prüfungsaufgaben/Klausuren/",
  );
  url.searchParams.set("tx_solr[filter][1]", "subject:/Angewandte Mathematik/");
  url.searchParams.set("tx_solr[filter][2]", "schoolType:BHS");
  url.searchParams.set("tx_solr[filter][3]", "accessebility:");
  if (page > 1) {
    url.searchParams.set("tx_solr[page]", String(page));
  }
  return url.toString();
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function detailTitleFromUrl(detailUrl) {
  const marker = "/downloads/download/";
  const index = detailUrl.indexOf(marker);
  if (index === -1) return "";
  const encodedTitle = detailUrl.slice(index + marker.length);
  return decodeURIComponent(encodedTitle);
}

function normalizeTitle(value) {
  return value.replace(/\s+/g, " ").trim();
}

function termFromTitle(title) {
  const normalized = normalizeTitle(title);
  return TERMS.find((term) => normalized.startsWith(`${term.label} `));
}

function isHtl2TargetTitle(title) {
  const normalized = normalizeTitle(title);
  if (!termFromTitle(normalized)) return false;
  if (!normalized.includes("Angewandte Mathematik")) return false;
  if (!normalized.includes("(BHS)")) return false;
  if (!/(^|[–-]\s*)HTL 2$/.test(normalized)) return false;

  const excluded = [
    "Blindheit",
    "Sehbehinderung",
    "slowen",
    "BRP",
    "Berufsreifeprüfung",
    "Kandidat",
    "P (",
    "HTL 1",
  ];
  return !excluded.some((term) =>
    normalized.toLowerCase().includes(term.toLowerCase()),
  );
}

function parseYear(title) {
  const match = title.match(/(?:Haupttermin|Herbsttermin)\s+(\d{4})\/(\d{2})/);
  if (!match) {
    throw new Error(`Could not parse school year from title: ${title}`);
  }
  return {
    label: `${match[1]}/${match[2]}`,
    key: `${match[1]}-${match[2]}`,
    graduationYear: match[2],
  };
}

function legacyFullBlobPath(term, yearKey, graduationYear, kind) {
  return `matura/${yearKey}-${term.code}-htl-2-kl${graduationYear}_pt2_htl_amt_ab_h2_${kind}.pdf`;
}

function termFullBlobPath(term, yearKey, kind) {
  return `matura/htl-2/${term.slug}/${yearKey}/full_${kind}.pdf`;
}

function splitBlobPath(term, yearKey, part, kind) {
  return `matura/htl-2/${term.slug}/${yearKey}/teil-${part}_${kind}.pdf`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "matura-lernplan-import/1.0" },
  });
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  return response.text();
}

async function fetchPdf(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "matura-lernplan-import/1.0" },
  });
  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error(`Downloaded file is not a PDF: ${url}`);
  }
  return buffer;
}

function extractDetailUrls(html) {
  const detailUrls = new Set();
  const regex = /data-document-url="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    const rawPath = decodeHtml(match[1]);
    const detailUrl = new URL(rawPath, BASE_URL).toString();
    const title = detailTitleFromUrl(detailUrl);
    if (isHtl2TargetTitle(title)) {
      detailUrls.add(detailUrl);
    }
  }
  return [...detailUrls];
}

function extractPdfLinks(html, detailUrl) {
  const links = {};
  const anchorRegex = /<a\b[^>]*class="[^"]*\bfile-link\b[^"]*"[^>]*>[\s\S]*?<\/a>/g;
  let match;
  while ((match = anchorRegex.exec(html))) {
    const anchor = match[0];
    const href = anchor.match(/\bhref="([^"]+)"/)?.[1];
    if (!href) continue;
    const label = stripTags(anchor);
    const normalizedLabel = label.toLowerCase();
    const absoluteUrl = new URL(decodeHtml(href), BASE_URL).toString();
    if (normalizedLabel.includes("aufgabenheft")) {
      links.au = absoluteUrl;
    }
    if (normalizedLabel.includes("korrekturheft")) {
      links.lo = absoluteUrl;
    }
  }

  if (!links.au || !links.lo) {
    throw new Error(`Could not find Aufgabenheft and Korrekturheft links: ${detailUrl}`);
  }
  return links;
}

async function discoverCollections() {
  const detailUrls = new Map();
  let emptyPages = 0;

  for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
    const url = buildSearchUrl(page);
    const html = await fetchText(url);
    const pageUrls = extractDetailUrls(html);
    for (const detailUrl of pageUrls) {
      detailUrls.set(detailUrl, detailTitleFromUrl(detailUrl));
    }

    if (pageUrls.length === 0) {
      emptyPages += 1;
      if (emptyPages >= 3) break;
    } else {
      emptyPages = 0;
    }
  }

  const collections = [...detailUrls.entries()]
    .map(([detailUrl, title]) => ({
      detailUrl,
      title,
      year: parseYear(title),
      term: termFromTitle(title),
    }))
    .filter((collection) => collection.term)
    .sort((a, b) => b.year.key.localeCompare(a.year.key));

  if (collections.length === 0) {
    throw new Error("No official HTL 2 target collections were discovered.");
  }

  return collections;
}

async function getExistingBlobPathnames() {
  const existing = new Set();
  let cursor;

  do {
    const result = await list({ prefix: "matura/", limit: 1000, cursor });
    for (const blob of result.blobs) {
      existing.add(blob.pathname);
    }
    cursor = result.cursor;
    if (!result.hasMore) break;
  } while (cursor);

  return existing;
}

async function uploadIfNeeded(pathname, body, existing) {
  if (!force && existing.has(pathname)) {
    console.log(`skip existing ${pathname}`);
    return;
  }

  if (dryRun) {
    console.log(`${force ? "would overwrite" : "would upload"} ${pathname}`);
    return;
  }

  await put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: force,
    contentType: PDF_CONTENT_TYPE,
  });
  existing.add(pathname);
  console.log(`${force ? "overwrote" : "uploaded"} ${pathname}`);
}

async function splitPdf(inputPath, outputAPath, outputBPath) {
  const stdout = execFileSync("python3", [SPLIT_SCRIPT, inputPath, outputAPath, outputBPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(stdout);
}

async function processCollection(collection, existing) {
  const detailHtml = await fetchText(collection.detailUrl);
  const pdfLinks = extractPdfLinks(detailHtml, collection.detailUrl);
  const yearDir = path.join(TMP_DIR, collection.year.key);
  await mkdir(yearDir, { recursive: true });

  console.log(`\n${collection.title}`);
  console.log(collection.detailUrl);

  for (const kind of ["au", "lo"]) {
    const pdfBuffer = await fetchPdf(pdfLinks[kind]);
    const fullPath = path.join(yearDir, `full_${kind}.pdf`);
    const teilAPath = path.join(yearDir, `teil-a_${kind}.pdf`);
    const teilBPath = path.join(yearDir, `teil-b_${kind}.pdf`);

    await writeFile(fullPath, pdfBuffer);

    const splitInfo = await splitPdf(fullPath, teilAPath, teilBPath);
    console.log(
      `${kind}: Teil A pages ${splitInfo.teilA.from}-${splitInfo.teilA.to}, Teil B pages ${splitInfo.teilB.from}-${splitInfo.teilB.to}`,
    );

    await uploadIfNeeded(termFullBlobPath(collection.term, collection.year.key, kind), pdfBuffer, existing);
    if (collection.term.legacyRoot) {
      await uploadIfNeeded(
        legacyFullBlobPath(collection.term, collection.year.key, collection.year.graduationYear, kind),
        pdfBuffer,
        existing,
      );
    }
    await uploadIfNeeded(
      splitBlobPath(collection.term, collection.year.key, "a", kind),
      await readFile(teilAPath),
      existing,
    );
    await uploadIfNeeded(
      splitBlobPath(collection.term, collection.year.key, "b", kind),
      await readFile(teilBPath),
      existing,
    );
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !dryRun) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for uploads.");
  }

  await mkdir(TMP_DIR, { recursive: true });

  const collections = await discoverCollections();
  console.log(`Discovered ${collections.length} HTL 2 target collections.`);
  for (const collection of collections) {
    console.log(`- ${collection.title}`);
  }

  const existing = await getExistingBlobPathnames();
  for (const collection of collections) {
    await processCollection(collection, existing);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
