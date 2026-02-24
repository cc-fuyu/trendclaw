// ─── GitHub Trending Scout — Orchestrator ───
//
// Full pipeline: Scrape → Deep Meta → Diff → Analyze → Generate
// Now with: multi-LLM backend, history comparison, GitHub API deep data.

import type { ScoutParams, PluginConfig, ScoutResult, LLMConfig } from "./types.js";
import { scrapeTrending } from "./agents/scraper.js";
import { analyzeTrending } from "./agents/analyzer.js";
import { generateContent } from "./agents/content-gen.js";
import { fetchDeepMeta, saveSnapshot, computeDiff } from "./utils/history.js";
import { backendLabel } from "./utils/llm.js";

const DEFAULT_CONFIG: PluginConfig = {
  llm: { backend: "openai", model: "gpt-4.1-mini" },
  language: "English",
  topN: 10,
  trendingPeriod: "daily",
  contentFormats: ["digest"],
  enableDeepMeta: true,
  enableDiff: true,
  historyDir: ".scout_history",
};

/**
 * Run the complete Trending Scout pipeline.
 */
export async function runScout(
  params: ScoutParams,
  config: Partial<PluginConfig> = {},
): Promise<ScoutResult> {
  const cfg: PluginConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    llm: { ...DEFAULT_CONFIG.llm, ...(config.llm || {}) },
  };
  const startTime = Date.now();

  const period = params.period || cfg.trendingPeriod;
  const topN = params.topN || cfg.topN;
  const language = params.outputLanguage || cfg.language;
  const formats = (params.formats || cfg.contentFormats) as PluginConfig["contentFormats"];
  const filterLang = params.language || "";
  const llmLabel = backendLabel(cfg.llm);

  console.log(`\n${"═".repeat(56)}`);
  console.log(`  🔭 GitHub Trending Scout — Pipeline`);
  console.log(`  Period: ${period} | Top: ${topN} | Lang filter: ${filterLang || "any"}`);
  console.log(`  Output: ${language} | Formats: ${formats.join(", ")}`);
  console.log(`  LLM: ${llmLabel}`);
  console.log(`  Deep Meta: ${cfg.enableDeepMeta ? "ON" : "OFF"} | History Diff: ${cfg.enableDiff ? "ON" : "OFF"}`);
  console.log(`${"═".repeat(56)}\n`);

  // ━━━ Phase 1: SCRAPE ━━━
  console.log(`[pipeline] Phase 1/4: Scraping GitHub Trending...`);
  const scrape = await scrapeTrending(period, filterLang, topN);
  console.log(`[pipeline] ✓ Scraped ${scrape.repos.length} repos`);

  if (scrape.repos.length === 0) {
    throw new Error("No trending repos found. GitHub might be rate-limiting or the page structure changed.");
  }

  // ━━━ Phase 2: DEEP META (optional) ━━━
  const deepMeta = new Map<string, any>();
  if (cfg.enableDeepMeta) {
    console.log(`[pipeline] Phase 2/4: Fetching GitHub API deep metadata...`);
    const repoNames = scrape.repos.slice(0, Math.min(topN, 10)).map((r) => r.name);
    const meta = await fetchDeepMeta(repoNames);
    for (const [k, v] of meta) deepMeta.set(k, v);
    console.log(`[pipeline] ✓ Deep metadata for ${deepMeta.size} repos`);
  } else {
    console.log(`[pipeline] Phase 2/4: Deep metadata SKIPPED`);
  }

  // ━━━ Phase 2b: HISTORY DIFF (optional) ━━━
  let diff = null;
  if (cfg.enableDiff) {
    diff = computeDiff(scrape, cfg.historyDir);
    saveSnapshot(scrape, cfg.historyDir);
    if (diff) {
      console.log(`[pipeline] ✓ Diff: ${diff.newEntries.length} new, ${diff.dropped.length} dropped`);
    }
  }

  // ━━━ Phase 3: ANALYZE ━━━
  console.log(`[pipeline] Phase 3/4: AI Analysis (${llmLabel})...`);
  const analysis = await analyzeTrending(scrape, deepMeta, diff, cfg.llm, language);
  console.log(`[pipeline] ✓ ${analysis.insights.length} insights, ${analysis.themes.length} themes`);

  // ━━━ Phase 4: GENERATE CONTENT ━━━
  console.log(`[pipeline] Phase 4/4: Content Generation (${formats.join(", ")})...`);
  const content = await generateContent(formats, analysis, cfg.llm, language);
  console.log(`[pipeline] ✓ ${content.length} content pieces`);

  const durationMs = Date.now() - startTime;
  console.log(`\n[pipeline] ✅ Complete in ${(durationMs / 1000).toFixed(1)}s\n`);

  return {
    scrape,
    analysis,
    content,
    metadata: {
      durationMs,
      model: cfg.llm.model,
      llmBackend: cfg.llm.backend,
      generatedAt: new Date().toISOString(),
    },
  };
}
