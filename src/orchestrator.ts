// ─── GitHub Trending Scout — Orchestrator ───
//
// Runs the full pipeline: Scrape → Analyze → Generate Content
// This is the core logic that coordinates all three agents.

import type { ScoutParams, PluginConfig, ScoutResult } from "./types.js";
import { scrapeTrending, fetchReadmes } from "./agents/scraper.js";
import { analyzeTrending } from "./agents/analyzer.js";
import { generateContent } from "./agents/content-gen.js";
import OpenAI from "openai";

const DEFAULT_CONFIG: PluginConfig = {
  analysisModel: "gpt-4.1-mini",
  language: "English",
  topN: 10,
  trendingPeriod: "daily",
  contentFormats: ["digest"],
};

/**
 * Run the complete Trending Scout pipeline.
 */
export async function runScout(
  params: ScoutParams,
  config: Partial<PluginConfig> = {},
): Promise<ScoutResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();

  const period = params.period || cfg.trendingPeriod;
  const topN = params.topN || cfg.topN;
  const language = params.outputLanguage || cfg.language;
  const formats = (params.formats || cfg.contentFormats) as PluginConfig["contentFormats"];
  const filterLang = params.language || "";

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  🔭 GitHub Trending Scout — Starting Pipeline`);
  console.log(`  Period: ${period} | Top: ${topN} | Lang filter: ${filterLang || "any"}`);
  console.log(`  Output: ${language} | Formats: ${formats.join(", ")}`);
  console.log(`${"═".repeat(50)}\n`);

  // ━━━ Phase 1: SCRAPE ━━━
  console.log(`[pipeline] Phase 1/3: Scraping GitHub Trending...`);
  const scrape = await scrapeTrending(period, filterLang, topN);
  console.log(`[pipeline] Scraped ${scrape.repos.length} repos`);

  if (scrape.repos.length === 0) {
    throw new Error("No trending repos found. GitHub might be rate-limiting or the page structure changed.");
  }

  // Fetch READMEs for top repos (enriches analysis)
  console.log(`[pipeline] Fetching READMEs for top ${Math.min(5, scrape.repos.length)} repos...`);
  const readmeNames = scrape.repos.slice(0, 5).map((r) => r.name);
  const readmes = await fetchReadmes(readmeNames);
  console.log(`[pipeline] Fetched ${readmes.filter((r) => r.content).length} READMEs`);

  // ━━━ Phase 2: ANALYZE ━━━
  console.log(`[pipeline] Phase 2/3: AI Analysis...`);
  const openai = new OpenAI();
  const analysis = await analyzeTrending(scrape, readmes, openai, cfg.analysisModel, language);
  console.log(`[pipeline] Analysis: ${analysis.insights.length} insights, ${analysis.themes.length} themes`);

  // ━━━ Phase 3: GENERATE CONTENT ━━━
  console.log(`[pipeline] Phase 3/3: Content Generation (${formats.join(", ")})...`);
  const content = await generateContent(formats, analysis, scrape, openai, cfg.analysisModel, language);
  console.log(`[pipeline] Generated ${content.length} content pieces`);

  const durationMs = Date.now() - startTime;
  console.log(`\n[pipeline] ✅ Complete in ${(durationMs / 1000).toFixed(1)}s\n`);

  return {
    scrape,
    analysis,
    content,
    metadata: {
      durationMs,
      model: cfg.analysisModel,
      generatedAt: new Date().toISOString(),
    },
  };
}
