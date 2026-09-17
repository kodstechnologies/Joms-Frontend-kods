/**
 * Scan client icon packs, dedupe by SHA-256, copy unique files into
 * public/icon-catalog/, and emit public/icon-store.html.
 *
 * Usage: node scripts/generate-icon-store.mjs
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, "..");
const repoRoot = path.join(frontendRoot, "..");

const IMAGE_EXT = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico"]);
const EXCLUDE_NAMES = new Set(["react.svg", "vite.svg"]);

/** Lower number = higher priority when choosing the canonical file for a hash. */
const SOURCES = [
  {
    id: "ui-kit",
    label: "UI Kit",
    priority: 1,
    root: path.join(
      repoRoot,
      "Icon, Illustrations, Images",
      "JOMS_PARTNER APP_ UI_KIT",
      "JOMS_ICONS",
    ),
  },
  {
    id: "icons-3",
    label: "JOMS_ICONS-3",
    priority: 2,
    root: path.join(repoRoot, "JOMS_ICONS-3"),
  },
  {
    id: "assets-icons",
    label: "assets/JOMS_ICONS",
    priority: 3,
    root: path.join(frontendRoot, "src", "assets", "JOMS_ICONS"),
  },
  {
    id: "assets-icons-2",
    label: "assets/JOMS_ICONS-2",
    priority: 3,
    root: path.join(frontendRoot, "src", "assets", "JOMS_ICONS-2"),
  },
  {
    id: "assets-3d",
    label: "assets/JOMS_ADMIN_PANEL_3D_ICONS",
    priority: 3,
    root: path.join(frontendRoot, "src", "assets", "JOMS_ADMIN_PANEL_3D_ICONS"),
  },
];

const catalogDir = path.join(frontendRoot, "public", "icon-catalog");
const htmlPath = path.join(frontendRoot, "public", "icon-store.html");
const manifestPath = path.join(frontendRoot, "public", "icon-catalog", "manifest.json");

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    if (EXCLUDE_NAMES.has(entry.name.toLowerCase())) continue;
    out.push(full);
  }
  return out;
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "icon";
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function relativeFromRepo(abs) {
  return toPosix(path.relative(repoRoot, abs));
}

function assetsImportHint(abs) {
  const assetsRoot = path.join(frontendRoot, "src", "assets");
  const rel = path.relative(assetsRoot, abs);
  if (!rel.startsWith("..") && !path.isAbsolute(rel)) {
    return `@/assets/${toPosix(rel)}`;
  }
  return null;
}

function scanAll() {
  const byHash = new Map();
  let scanned = 0;

  for (const source of SOURCES) {
    const files = walkFiles(source.root);
    for (const abs of files) {
      scanned += 1;
      const buf = readFileSync(abs);
      const hash = createHash("sha256").update(buf).digest("hex");
      const meta = {
        abs,
        name: path.basename(abs),
        ext: path.extname(abs).toLowerCase(),
        sourceId: source.id,
        sourceLabel: source.label,
        priority: source.priority,
        repoPath: relativeFromRepo(abs),
        assetsImport: assetsImportHint(abs),
        hash,
        shortHash: hash.slice(0, 8),
      };

      const existing = byHash.get(hash);
      if (!existing) {
        byHash.set(hash, { canonical: meta, aliases: [] });
        continue;
      }

      if (meta.priority < existing.canonical.priority) {
        existing.aliases.push(existing.canonical);
        existing.canonical = meta;
      } else {
        existing.aliases.push(meta);
      }
    }
  }

  return { byHash, scanned };
}

function writeCatalog(byHash) {
  if (existsSync(catalogDir)) {
    rmSync(catalogDir, { recursive: true, force: true });
  }
  mkdirSync(catalogDir, { recursive: true });

  const entries = [];
  const usedNames = new Set();

  const sorted = [...byHash.values()].sort((a, b) =>
    a.canonical.name.localeCompare(b.canonical.name, undefined, { sensitivity: "base" }),
  );

  for (const group of sorted) {
    const c = group.canonical;
    let catalogName = `${slugify(c.name)}__${c.shortHash}${c.ext}`;
    let n = 2;
    while (usedNames.has(catalogName.toLowerCase())) {
      catalogName = `${slugify(c.name)}-${n}__${c.shortHash}${c.ext}`;
      n += 1;
    }
    usedNames.add(catalogName.toLowerCase());

    const dest = path.join(catalogDir, catalogName);
    copyFileSync(c.abs, dest);

    const aliasNames = [
      ...new Set(
        group.aliases
          .map((a) => a.name)
          .filter((name) => name.toLowerCase() !== c.name.toLowerCase()),
      ),
    ];

    const nameConflict = group.aliases.some(
      (a) => a.name.toLowerCase() === c.name.toLowerCase() && a.hash !== c.hash,
    );

    // Also flag if another unique hash shares the same filename
    entries.push({
      id: c.shortHash,
      displayName: c.name,
      catalogFile: catalogName,
      catalogUrl: `/icon-catalog/${catalogName}`,
      sourceId: c.sourceId,
      sourceLabel: c.sourceLabel,
      repoPath: c.repoPath,
      assetsImport: c.assetsImport,
      copyPath: c.assetsImport || `public/icon-catalog/${catalogName}`,
      hash: c.hash,
      shortHash: c.shortHash,
      ext: c.ext,
      aliases: aliasNames,
      aliasPaths: group.aliases.map((a) => a.repoPath),
      duplicateCount: group.aliases.length,
      nameConflict,
    });
  }

  // Mark filename conflicts across different hashes
  const byName = new Map();
  for (const e of entries) {
    const key = e.displayName.toLowerCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(e);
  }
  for (const group of byName.values()) {
    if (group.length > 1) {
      for (const e of group) e.nameConflict = true;
    }
  }

  writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), icons: entries }, null, 2));
  return entries;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(entries, scanned) {
  const unique = entries.length;
  const skipped = scanned - unique;
  const sources = [...new Set(entries.map((e) => e.sourceLabel))].sort();

  const cards = entries
    .map((e) => {
      const search = [
        e.displayName,
        e.catalogFile,
        e.sourceLabel,
        e.repoPath,
        e.copyPath,
        ...e.aliases,
        ...e.aliasPaths,
      ]
        .join(" ")
        .toLowerCase();

      const badges = [];
      if (e.duplicateCount > 0) {
        badges.push(`<span class="badge badge-dup">${e.duplicateCount + 1} copies</span>`);
      }
      if (e.nameConflict) {
        badges.push(`<span class="badge badge-conflict">name conflict</span>`);
      }
      if (e.ext !== ".svg") {
        badges.push(`<span class="badge badge-raster">${e.ext.slice(1)}</span>`);
      }

      const aliasesHtml =
        e.aliases.length > 0
          ? `<p class="aliases"><strong>Also as:</strong> ${e.aliases.map(escapeHtml).join(", ")}</p>`
          : "";

      return `<article class="card" data-source="${escapeHtml(e.sourceId)}" data-search="${escapeHtml(search)}">
  <button type="button" class="preview" data-copy="${escapeHtml(e.copyPath)}" title="Click to copy path">
    <img src="${escapeHtml(e.catalogUrl)}" alt="${escapeHtml(e.displayName)}" loading="lazy" />
  </button>
  <div class="meta">
    <h3 title="${escapeHtml(e.displayName)}">${escapeHtml(e.displayName)}</h3>
    <p class="source">${escapeHtml(e.sourceLabel)}</p>
    <p class="path" title="${escapeHtml(e.repoPath)}">${escapeHtml(e.repoPath)}</p>
    ${aliasesHtml}
    <div class="badges">${badges.join("")}</div>
    <code class="copy-target">${escapeHtml(e.copyPath)}</code>
    <button type="button" class="copy-btn" data-copy="${escapeHtml(e.copyPath)}">Copy path</button>
  </div>
</article>`;
    })
    .join("\n");

  const sourceChips = sources
    .map((label) => {
      const id = entries.find((e) => e.sourceLabel === label)?.sourceId ?? label;
      return `<button type="button" class="chip" data-filter-source="${escapeHtml(id)}">${escapeHtml(label)}</button>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>JOMS Icon Store</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --panel: #ffffff;
      --ink: #15202b;
      --muted: #5b6b7c;
      --line: #d7dee7;
      --accent: #0f766e;
      --accent-soft: #ccfbf1;
      --warn: #b45309;
      --warn-soft: #ffedd5;
      --dup: #1d4ed8;
      --dup-soft: #dbeafe;
      --shadow: 0 1px 2px rgb(15 23 42 / 6%), 0 8px 24px rgb(15 23 42 / 6%);
      --radius: 14px;
      font-family: "Segoe UI", system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, #e0f2fe 0, transparent 28%),
        linear-gradient(180deg, #eef2f7, var(--bg));
      color: var(--ink);
      min-height: 100vh;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(10px);
      background: rgb(244 246 248 / 88%);
      border-bottom: 1px solid var(--line);
      padding: 1rem 1.25rem 1.1rem;
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      gap: 0.85rem;
    }
    h1 {
      margin: 0;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
    }
    .stats {
      color: var(--muted);
      font-size: 0.92rem;
    }
    .stats strong { color: var(--ink); }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }
    input[type="search"] {
      flex: 1 1 260px;
      min-width: 220px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.7rem 1rem;
      font: inherit;
      background: var(--panel);
    }
    .chip, .copy-btn {
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--ink);
      border-radius: 999px;
      padding: 0.45rem 0.85rem;
      font: inherit;
      cursor: pointer;
    }
    .chip.active, .chip:hover, .copy-btn:hover {
      border-color: var(--accent);
      background: var(--accent-soft);
      color: #115e59;
    }
    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.25rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card.hidden { display: none; }
    .preview {
      border: 0;
      background:
        linear-gradient(45deg, #f8fafc 25%, transparent 25%),
        linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f8fafc 75%),
        linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0;
      background-color: #fff;
      height: 120px;
      display: grid;
      place-items: center;
      cursor: pointer;
      padding: 1rem;
    }
    .preview img {
      max-width: 64px;
      max-height: 64px;
      width: auto;
      height: auto;
      object-fit: contain;
    }
    .meta {
      padding: 0.85rem 0.95rem 1rem;
      display: grid;
      gap: 0.35rem;
      flex: 1;
    }
    h3 {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .source, .path, .aliases {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted);
      line-height: 1.35;
    }
    .path, .aliases {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .badges { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .badge {
      font-size: 0.68rem;
      border-radius: 999px;
      padding: 0.15rem 0.45rem;
      font-weight: 600;
    }
    .badge-dup { background: var(--dup-soft); color: var(--dup); }
    .badge-conflict { background: var(--warn-soft); color: var(--warn); }
    .badge-raster { background: #f1f5f9; color: #334155; }
    .copy-target {
      font-size: 0.68rem;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.4rem 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .copy-btn { width: 100%; margin-top: 0.2rem; }
    .empty {
      display: none;
      text-align: center;
      color: var(--muted);
      padding: 3rem 1rem;
    }
    .empty.show { display: block; }
    .toast {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      background: #0f172a;
      color: white;
      padding: 0.7rem 1rem;
      border-radius: 999px;
      opacity: 0;
      transform: translateY(8px);
      transition: 0.2s ease;
      pointer-events: none;
      z-index: 50;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div>
        <h1>JOMS Icon Store</h1>
        <p class="stats">
          <strong id="visible-count">${unique}</strong> shown ·
          <strong>${unique}</strong> unique ·
          <strong>${scanned}</strong> scanned ·
          <strong>${skipped}</strong> duplicates skipped
        </p>
      </div>
      <div class="controls">
        <input id="search" type="search" placeholder="Search name, alias, path, source…" autocomplete="off" />
        <button type="button" class="chip active" data-filter-source="all">All sources</button>
        ${sourceChips}
      </div>
    </div>
  </header>
  <main>
    <div id="grid" class="grid">
${cards}
    </div>
    <p id="empty" class="empty">No icons match your filters.</p>
  </main>
  <div id="toast" class="toast">Copied</div>
  <script>
    const search = document.getElementById("search");
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const visibleCount = document.getElementById("visible-count");
    const toast = document.getElementById("toast");
    const cards = [...document.querySelectorAll(".card")];
    let sourceFilter = "all";

    function applyFilters() {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      for (const card of cards) {
        const sourceOk = sourceFilter === "all" || card.dataset.source === sourceFilter;
        const searchOk = !q || (card.dataset.search || "").includes(q);
        const ok = sourceOk && searchOk;
        card.classList.toggle("hidden", !ok);
        if (ok) shown += 1;
      }
      visibleCount.textContent = String(shown);
      empty.classList.toggle("show", shown === 0);
    }

    search.addEventListener("input", applyFilters);

    document.querySelectorAll("[data-filter-source]").forEach((chip) => {
      chip.addEventListener("click", () => {
        sourceFilter = chip.dataset.filterSource;
        document.querySelectorAll("[data-filter-source]").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        applyFilters();
      });
    });

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast.textContent = "Copied: " + text;
      toast.classList.add("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
    }

    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", () => copyText(el.dataset.copy));
    });
  </script>
</body>
</html>
`;
}

function main() {
  console.log("Scanning icon sources…");
  for (const s of SOURCES) {
    console.log(`  ${s.label}: ${existsSync(s.root) ? "ok" : "MISSING"} → ${s.root}`);
  }

  const { byHash, scanned } = scanAll();
  const entries = writeCatalog(byHash);
  const html = buildHtml(entries, scanned);
  writeFileSync(htmlPath, html, "utf8");

  console.log(`\nScanned:  ${scanned}`);
  console.log(`Unique:   ${entries.length}`);
  console.log(`Skipped:  ${scanned - entries.length} duplicates`);
  console.log(`Catalog:  ${path.relative(frontendRoot, catalogDir)}`);
  console.log(`HTML:     ${path.relative(frontendRoot, htmlPath)}`);
  console.log(`\nOpen: http://localhost:5173/icon-store.html`);
}

main();
