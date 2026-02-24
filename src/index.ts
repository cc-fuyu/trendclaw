// ─── GitHub Trending Scout — OpenClaw Plugin Entry ───
//
// Registers the `github_trending_scout` tool with OpenClaw.
// Supports multi-LLM backend: OpenAI / Ollama / OpenClaw Gateway.

import { Type } from "@sinclair/typebox";
import { runScout } from "./orchestrator.js";
import type { PluginConfig, ScoutParams, LLMConfig } from "./types.js";

const DEFAULT_LLM: LLMConfig = { backend: "openai", model: "gpt-4.1-mini" };

const DEFAULT_CONFIG: PluginConfig = {
  llm: DEFAULT_LLM,
  language: "English",
  topN: 10,
  trendingPeriod: "daily",
  contentFormats: ["digest"],
  enableDeepMeta: true,
  enableDiff: true,
  historyDir: ".scout_history",
};

/**
 * OpenClaw Plugin Entry Point.
 */
export default function (api: any) {
  const userConfig = api.config || {};
  const pluginConfig: PluginConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    llm: { ...DEFAULT_LLM, ...(userConfig.llm || {}) },
  };

  console.log("[trending-scout] Plugin loaded");

  api.registerTool(
    {
      name: "github_trending_scout",
      description: `Scrape GitHub Trending repos, AI-analyze them (with deep GitHub metadata and history comparison), and generate ready-to-publish developer content.

Pipeline: Scrape → Deep Meta → History Diff → Analyze → Generate Content

Supports multiple LLM backends: OpenAI, Ollama (local), OpenClaw Gateway.
Output formats: tweet_thread, blog_post, newsletter, digest.

Use when the user wants to:
- See what's trending on GitHub today/this week
- Get AI analysis of trending repos with velocity signals
- Generate content about trending repos (tweets, blog posts, newsletters)
- Compare today's trending with yesterday's
- Run a daily developer content pipeline`,

      parameters: Type.Object({
        language: Type.Optional(
          Type.String({ description: 'Filter by programming language (e.g. "typescript", "python"). Empty = all.' }),
        ),
        period: Type.Optional(
          Type.Union([Type.Literal("daily"), Type.Literal("weekly"), Type.Literal("monthly")], {
            description: "Trending time range. Default: daily.",
          }),
        ),
        topN: Type.Optional(
          Type.Number({ description: "Number of repos to analyze. Default: 10.", minimum: 3, maximum: 25 }),
        ),
        formats: Type.Optional(
          Type.Array(
            Type.Union([
              Type.Literal("tweet_thread"),
              Type.Literal("blog_post"),
              Type.Literal("newsletter"),
              Type.Literal("digest"),
            ]),
            { description: 'Content formats to generate. Default: ["digest"].' },
          ),
        ),
        outputLanguage: Type.Optional(
          Type.String({ description: 'Language for generated content (e.g. "Chinese", "English"). Default: English.' }),
        ),
      }),

      async execute(_toolCallId: string, params: ScoutParams) {
        try {
          const result = await runScout(params, pluginConfig);

          const lines: string[] = [
            `## 🔭 GitHub Trending Scout Report`,
            "",
            `**Period:** ${result.scrape.period} | **Repos:** ${result.scrape.repos.length} | **LLM:** ${result.metadata.llmBackend}:${result.metadata.model} | **Duration:** ${(result.metadata.durationMs / 1000).toFixed(1)}s`,
            "",
            `### Trend Summary`,
            result.analysis.summary,
            "",
            `### Themes: ${result.analysis.themes.join(" · ")}`,
            "",
            `### 🔥 Hot Take`,
            `> ${result.analysis.hotTake}`,
            "",
          ];

          // Diff section
          if (result.analysis.diff) {
            const d = result.analysis.diff;
            lines.push(`### 📊 What Changed`);
            if (d.newEntries.length > 0) lines.push(`- **New today:** ${d.newEntries.join(", ")}`);
            if (d.dropped.length > 0) lines.push(`- **Dropped off:** ${d.dropped.join(", ")}`);
            if (d.risers.length > 0) lines.push(`- **Rising:** ${d.risers.map((r) => `${r.name} (+${r.rankChange})`).join(", ")}`);
            lines.push("");
          }

          for (const piece of result.content) {
            lines.push(`---`, "", `### 📝 ${piece.format.replace("_", " ").toUpperCase()} (${piece.wordCount} words)`, "");
            lines.push(piece.content);
            lines.push("");
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return {
            content: [{ type: "text", text: `## Scout Failed\n\n> ${msg}\n\nTry again or check logs.` }],
          };
        }
      },
    },
    { optional: true },
  );

  console.log('[trending-scout] Tool "github_trending_scout" registered');
}

export { runScout } from "./orchestrator.js";
export type { ScoutResult, PluginConfig, ScoutParams } from "./types.js";
