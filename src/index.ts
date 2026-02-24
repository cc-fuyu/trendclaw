// ─── GitHub Trending Scout — OpenClaw Plugin Entry ───
//
// Registers the `github_trending_scout` tool with OpenClaw.
// When invoked, runs the full Scrape → Analyze → Generate pipeline.

import { Type } from "@sinclair/typebox";
import { runScout } from "./orchestrator.js";
import type { PluginConfig, ScoutParams } from "./types.js";

const DEFAULT_CONFIG: PluginConfig = {
  analysisModel: "gpt-4.1-mini",
  language: "English",
  topN: 10,
  trendingPeriod: "daily",
  contentFormats: ["digest"],
};

/**
 * OpenClaw Plugin Entry Point.
 */
export default function (api: any) {
  const pluginConfig: PluginConfig = { ...DEFAULT_CONFIG, ...(api.config || {}) };

  console.log("[trending-scout] Plugin loaded");

  api.registerTool(
    {
      name: "github_trending_scout",
      description: `Scrape GitHub Trending repos, AI-analyze them, and generate ready-to-publish developer content.

Pipeline: Scrape → Analyze → Generate Content

Output formats: tweet_thread, blog_post, newsletter, digest

Use when the user wants to:
- See what's trending on GitHub today/this week
- Get AI analysis of trending repos
- Generate content about trending repos (tweets, blog posts, newsletters)
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

          // Build response text
          const lines: string[] = [
            `## 🔭 GitHub Trending Scout Report`,
            "",
            `**Period:** ${result.scrape.period} | **Repos:** ${result.scrape.repos.length} | **Duration:** ${(result.metadata.durationMs / 1000).toFixed(1)}s`,
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

          // Append each content piece
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

// Export for standalone use
export { runScout } from "./orchestrator.js";
export type { ScoutResult, PluginConfig, ScoutParams } from "./types.js";
