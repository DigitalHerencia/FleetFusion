[CmdletBinding()]
param(
    [string]$ProjectRoot = "D:\TheCodependentCodingWebAppArchitecture\template",
    [string]$BaseUrl = "http://localhost:3000",
    [string]$OutputDir = "D:\TheCodependentCodingWebAppArchitecture\template\context\frontend-review",
    [string]$CdpUrl = "http://127.0.0.1:9222",
    [switch]$KeepExisting = $true
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Path([string]$Path, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label not found: $Path"
    }
}

Assert-Path $ProjectRoot "Project root"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$manifestPath = Join-Path $OutputDir "manifest.json"
$indexPath = Join-Path $OutputDir "index.html"
$tempScript = Join-Path $env:TEMP ("frontend-review-" + [guid]::NewGuid().ToString("N") + ".mjs")

# Preserve concrete URLs already discovered from data-driven links/detail pages.
$existingUrls = @()
if ($KeepExisting -and (Test-Path -LiteralPath $manifestPath)) {
    try {
        $old = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
        $existingUrls = @(
            $old |
                Where-Object { $_.url -and $_.url -is [string] } |
                ForEach-Object { $_.url } |
                Sort-Object -Unique
        )
    } catch {
        Write-Warning "Existing manifest could not be read; continuing without it."
    }
}

# Find Next.js route pages. Supports src/app and app.
$appRoot = @(
    (Join-Path $ProjectRoot "src\app"),
    (Join-Path $ProjectRoot "app")
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $appRoot) {
    throw "No Next.js App Router directory found under src\app or app."
}

function Convert-PagePathToRoute([string]$PagePath, [string]$AppRoot) {
    $relative = [IO.Path]::GetRelativePath($AppRoot, (Split-Path -Parent $PagePath))
    if ($relative -eq ".") { return "/" }

    $segments = $relative -split '[\\/]'
    $routeSegments = foreach ($segment in $segments) {
        # Route groups do not contribute to the URL.
        if ($segment -match '^\(.*\)$') { continue }
        # Parallel route slots do not contribute to the URL.
        if ($segment -match '^@') { continue }
        # Intercepting-route markers are filesystem syntax, not URL syntax.
        $clean = $segment -replace '^\(\.\.\.\)', '' -replace '^\(\.\.\)', '' -replace '^\(\.\)', ''
        if ($clean) { $clean }
    }

    if (-not $routeSegments) { return "/" }
    return "/" + ($routeSegments -join "/")
}

$staticRoutes = @(
    Get-ChildItem -LiteralPath $appRoot -Recurse -File |
        Where-Object { $_.Name -match '^page\.(tsx|ts|jsx|js)$' } |
        ForEach-Object { Convert-PagePathToRoute $_.FullName $appRoot } |
        # Dynamic filesystem patterns cannot be visited without fixture values.
        Where-Object { $_ -notmatch '\[[^]]+\]' } |
        Sort-Object -Unique
)

$seedUrls = @($staticRoutes + $existingUrls | Sort-Object -Unique)

if (-not $seedUrls.Count) {
    throw "No routes found."
}

# Verify that Edge was started with remote debugging. This is what lets Playwright
# use the already-authenticated browser context instead of making you sign in again.
try {
    Invoke-RestMethod -Uri "$CdpUrl/json/version" -TimeoutSec 2 | Out-Null
} catch {
    throw @"
Cannot attach to the current Edge session at $CdpUrl.

Playwright can reuse the authenticated Edge session only when that Edge instance exposes
the Chrome DevTools Protocol. Start Edge with remote debugging enabled, authenticate once,
then rerun this script.

Example:
  msedge.exe --remote-debugging-port=9222

If Edge is already open without that flag, it cannot be retroactively attached by Playwright.
"@
}

$payload = @{
    projectRoot = $ProjectRoot
    baseUrl = $BaseUrl.TrimEnd("/")
    outputDir = $OutputDir
    cdpUrl = $CdpUrl
    seedUrls = $seedUrls
} | ConvertTo-Json -Depth 8 -Compress

$js = @'
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const cfg = JSON.parse(process.env.FRONTEND_REVIEW_CONFIG);
const requireFromProject = createRequire(path.join(cfg.projectRoot, "package.json"));

let chromium;
for (const pkg of ["@playwright/test", "playwright"]) {
  try {
    ({ chromium } = requireFromProject(pkg));
    break;
  } catch {}
}
if (!chromium) {
  throw new Error(
    "Playwright is not installed in the project. Expected @playwright/test or playwright."
  );
}

const browser = await chromium.connectOverCDP(cfg.cdpUrl);
const contexts = browser.contexts();
if (!contexts.length) throw new Error("Edge exposed no browser context over CDP.");

const context = contexts[0];
const pages = context.pages();
let page = pages.find((p) => p.url().startsWith(cfg.baseUrl)) ?? pages[0];
if (!page) page = await context.newPage();

const viewports = [
  { size: "desktop", width: 1440, height: 1000 },
  { size: "mobile", width: 390, height: 844 },
];

const normalizeRoute = (value) => {
  try {
    const u = new URL(value, cfg.baseUrl);
    if (u.origin !== new URL(cfg.baseUrl).origin) return null;
    return u.pathname + u.search;
  } catch {
    return null;
  }
};

const displayPath = (value) => {
  try { return decodeURIComponent(new URL(value, cfg.baseUrl).pathname); }
  catch { return value; }
};

const fileSafe = (route) => {
  let value = displayPath(route);
  if (value === "/") return "home";
  value = value.replace(/^\/+|\/+$/g, "").replace(/[\\/:*?"<>|]/g, "_").replace(/\//g, "_");
  return value || "home";
};

const queue = [];
const seen = new Set();

for (const route of cfg.seedUrls) {
  const normalized = normalizeRoute(route);
  if (normalized && !seen.has(normalized)) {
    seen.add(normalized);
    queue.push(normalized);
  }
}

const results = [];
const consoleErrors = [];
const pageErrors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(String(err)));

for (let i = 0; i < queue.length; i++) {
  const route = queue[i];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    consoleErrors.length = 0;
    pageErrors.length = 0;

    const requestedUrl = cfg.baseUrl + route;
    let response = null;
    let navigationError = null;

    try {
      response = await page.goto(requestedUrl, { waitUntil: "networkidle", timeout: 30000 });
    } catch (err) {
      navigationError = String(err);
      // A page can be visually useful even if networkidle times out.
      try { await page.waitForLoadState("domcontentloaded", { timeout: 5000 }); } catch {}
    }

    // Give fonts/layout a short deterministic settling window.
    try { await page.evaluate(() => document.fonts?.ready); } catch {}
    await page.waitForTimeout(250);

    const finalUrl = page.url();
    const finalRoute = normalizeRoute(finalUrl) ?? route;

    // Crawl same-origin links from the rendered authenticated page.
    const links = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((a) => a.href)
    ).catch(() => []);

    for (const href of links) {
      const normalized = normalizeRoute(href);
      if (!normalized) continue;
      if (normalized.startsWith("/api/")) continue;
      if (normalized.startsWith("/_next/")) continue;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        queue.push(normalized);
      }
    }

    const prefix = viewport.size + "-" + fileSafe(route);
    const filename = prefix + ".png";
    const screenshotPath = path.join(cfg.outputDir, filename);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: "disabled",
      caret: "hide",
    });

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    ).catch(() => false);

    const state = await page.locator("body").innerText().catch(() => "");
    const title = await page.title().catch(() => "");

    results.push({
      path: displayPath(route),
      size: viewport.size,
      file: filename,
      links: [...new Set(links.map(normalizeRoute).filter(Boolean))],
      overflow,
      url: finalRoute,
      requestedUrl: route,
      status: response?.status?.() ?? null,
      error: Boolean(navigationError || pageErrors.length),
      navigationError,
      pageErrors: [...pageErrors],
      consoleErrors: [...consoleErrors],
      title,
      state,
    });
  }
}

await fs.writeFile(
  path.join(cfg.outputDir, "manifest.json"),
  JSON.stringify(results, null, 2),
  "utf8"
);

const escapeHtml = (s) => String(s ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const cards = results.map((r) => `
<article data-path="${escapeHtml(r.path)}" data-size="${r.size}" data-error="${r.error}">
  <h2>${escapeHtml(r.path)}</h2>
  <small>${r.size}${r.url !== r.requestedUrl ? ` · redirects to ${escapeHtml(r.url)}` : ""}${r.error ? " · ERROR" : ""}</small>
  <a href="${encodeURI(r.file)}"><img loading="lazy" alt="${escapeHtml(r.path)} ${r.size} screenshot" src="${encodeURI(r.file)}"></a>
  <p><a href="${encodeURI(r.file)}">Open full screenshot</a></p>
</article>`).join("");

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Frontend review</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#08070c;color:#faf4e7;font:16px/1.55 system-ui}
header{padding:20px 24px;position:sticky;top:0;background:#08070cf2;border-bottom:1px solid #7095a0;z-index:1;backdrop-filter:blur(10px)}
h1{margin:0} h2{font-size:1rem;overflow-wrap:anywhere}
.controls{display:flex;gap:8px;flex-wrap:wrap}
input,select{font:inherit;padding:8px;background:#111;color:inherit;border:1px solid #7095a0}
main{padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}
article{border:1px solid #7095a0;padding:16px;min-width:0}
article[data-error="true"]{border-style:dashed}
img{width:100%;height:300px;object-fit:contain;object-position:top;background:#111}
a{color:#a6d2df} small{display:block;color:#c7c1b5}
</style>
<header>
  <h1>Frontend visual review</h1>
  <p>${results.length} captures · 1440 × 1000 desktop / 390 × 844 mobile · authenticated Edge session</p>
  <div class="controls">
    <input id="q" aria-label="Filter routes" placeholder="Filter routes">
    <select id="size" aria-label="Viewport">
      <option value="">Both sizes</option><option value="desktop">desktop</option><option value="mobile">mobile</option>
    </select>
    <select id="status" aria-label="Status">
      <option value="">All statuses</option><option value="ok">ok</option><option value="error">error</option>
    </select>
  </div>
</header>
<main>${cards}</main>
<script>
const q=document.querySelector("#q"), size=document.querySelector("#size"), status=document.querySelector("#status");
function filter(){
  const text=q.value.toLowerCase();
  document.querySelectorAll("article").forEach(card=>{
    const textOk=card.dataset.path.toLowerCase().includes(text);
    const sizeOk=!size.value||card.dataset.size===size.value;
    const error=card.dataset.error==="true";
    const statusOk=!status.value||(status.value==="error"?error:!error);
    card.hidden=!(textOk&&sizeOk&&statusOk);
  });
}
q.addEventListener("input",filter); size.addEventListener("change",filter); status.addEventListener("change",filter);
</script>
</html>`;

await fs.writeFile(path.join(cfg.outputDir, "index.html"), html, "utf8");

console.log(`Captured ${results.length} screenshots across ${new Set(results.map(r => r.path)).size} routes.`);
console.log(`Manifest: ${path.join(cfg.outputDir, "manifest.json")}`);
console.log(`Gallery:  ${path.join(cfg.outputDir, "index.html")}`);

// Disconnect only. Do not close the user's Edge browser.
await browser.close();
'@

Set-Content -LiteralPath $tempScript -Value $js -Encoding utf8

try {
    Write-Step "Attaching Playwright to authenticated Edge at $CdpUrl"
    Write-Step "Walking $($seedUrls.Count) seed routes plus same-origin links discovered at runtime"
    $env:FRONTEND_REVIEW_CONFIG = $payload
    node $tempScript
    if ($LASTEXITCODE -ne 0) {
        throw "Node/Playwright capture exited with code $LASTEXITCODE."
    }

    Write-Step "Done"
    Write-Host "Gallery:  $indexPath"
    Write-Host "Manifest: $manifestPath"
} finally {
    Remove-Item Env:FRONTEND_REVIEW_CONFIG -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $tempScript -Force -ErrorAction SilentlyContinue
}
