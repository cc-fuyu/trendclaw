// ─── TrendClaw — Analyzer Agent ───
//
// Takes scraped trending data + deep metadata + history diff,
// uses LLM to produce structured insights.
// Supports OpenAI / Ollama / OpenClaw Gateway via unified LLM interface.

import type {
  ScrapeResult, RepoDeepMeta, TrendingDiff,
  AnalysisResult, RepoInsight, LLMConfig,
} from "../types.js";
import { chatCompletion } from "../utils/llm.js";

/**
 * Build a rich context string from all available data sources.
 */
function buildContext(
  scrape: ScrapeResult,
  deepMeta: Map<string, RepoDeepMeta>,
  diff: TrendingDiff | null,
): string {
  const repoBlocks = scrape.repos.map((repo) => {
    const meta = deepMeta.get(repo.name);
    let block = `### #${repo.rank}: ${repo.name}
- Stars: ${repo.totalStars.toLocaleString()} total, +${repo.starsToday.toLocaleString()} ${scrape.period}
- Language: ${repo.language || "N/A"} | Forks: ${repo.forks.toLocaleString()}
- Description: ${repo.description || "No description"}`;

    if (meta) {
      block += `
- Open Issues: ${meta.openIssues} | Watchers: ${meta.watchers}
- Age: ${meta.ageInDays} days | Last Push: ${meta.pushedAt?.split("T")[0] || "N/A"}
- License: ${meta.license} | Topics: ${meta.topics.join(", ") || "none"}
- Recent Commits (last week): ${meta.recentCommitActivity}`;
      if (meta.readme) {
        block += `\n- README excerpt: ${meta.readme.slice(0, 600)}`;
      }
    }
    return block;
  }).join("\n\n");

  let diffBlock = "";
  if (diff) {
    diffBlock = `\n\n## Trending Changes (vs previous day)
- New entries: ${diff.newEntries.length > 0 ? diff.newEntries.join(", ") : "none"}
- Dropped off: ${diff.dropped.length > 0 ? diff.dropped.join(", ") : "none"}
- Rising: ${diff.risers.map((r) => `${r.name}(+${r.rankChange})`).join(", ") || "none"}
- Falling: ${diff.fallers.map((r) => `${r.name}(${r.rankChange})`).join(", ") || "none"}
- Stable: ${diff.stableCount} repos unchanged`;
  }

  return repoBlocks + diffBlock;
}

/**
 * Run the analysis agent with full context.
 */
export async function analyzeTrending(
  scrape: ScrapeResult,
  deepMeta: Map<string, RepoDeepMeta>,
  diff: TrendingDiff | null,
  llmConfig: LLMConfig,
  language: string,
): Promise<AnalysisResult> {
  console.log(`[analyzer] Analyzing ${scrape.repos.length} repos with ${llmConfig.backend}:${llmConfig.model}`);

  const context = buildContext(scrape, deepMeta, diff);

  const hasDiff = diff !== null;
  const hasMeta = deepMeta.size > 0;

  const systemPrompt = `You are a senior developer and tech trend analyst. Analyze GitHub trending repos and produce insights.

Return a JSON object:
{
  "summary": "2-3 sentence narrative of today's overall trending landscape${hasDiff ? ", mentioning notable changes from yesterday" : ""}",
  "insights": [
    {
      "repoName": "owner/repo",
      "category": "AI/ML | DevTools | Web | Infrastructure | Security | Data | Mobile | Other",
      "whyTrending": "1-2 sentences explaining the likely reason",
      "targetAudience": "who would care",
      "keyTakeaway": "the one thing a developer should know",
      "relevanceScore": 8,
      "velocitySignal": "rocket | rising | stable | fading"
    }
  ],
  "themes": ["theme1", "theme2", "theme3"],
  "hotTake": "A provocative but insightful observation about what these trends say about the industry"
}

Rules:
- One insight per repo, in the same order as input
- relevanceScore: 1-10 based on how impactful/useful the repo is
- velocitySignal: "rocket" if starsToday is exceptionally high${hasMeta ? " and commit activity is high" : ""}, "rising" if growing steadily, "stable" if established, "fading" if losing momentum
- themes: 3-5 cross-cutting themes
- hotTake: be bold, be specific, reference actual repos
${hasDiff ? "- Incorporate the trending changes (new entries, dropped repos) into your analysis" : ""}
${hasMeta ? "- Use deep metadata (issues, commit activity, age, topics) to enrich your analysis" : ""}
- Write in ${language}`;

  const response = await chatCompletion(
    llmConfig,
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Here are today's GitHub trending repos (${scrape.period}, language filter: ${scrape.language}):\n\n${context}`,
      },
    ],
    { jsonMode: true },
  );

  const parsed = JSON.parse(response.content);

  const insights: RepoInsight[] = scrape.repos.map((repo, i) => {
    const ai = parsed.insights?.[i] || {};
    return {
      repo,
      deepMeta: deepMeta.get(repo.name),
      category: ai.category || "Other",
      whyTrending: ai.whyTrending || "",
      targetAudience: ai.targetAudience || "",
      keyTakeaway: ai.keyTakeaway || "",
      relevanceScore: ai.relevanceScore || 5,
      velocitySignal: ai.velocitySignal || "stable",
    };
  });

  console.log(`[analyzer] Analysis complete: ${insights.length} insights, ${parsed.themes?.length || 0} themes`);

  return {
    summary: parsed.summary || "",
    insights,
    themes: parsed.themes || [],
    hotTake: parsed.hotTake || "",
    diff: diff || undefined,
  };
}
