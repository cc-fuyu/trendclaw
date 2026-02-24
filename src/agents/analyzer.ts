// ─── GitHub Trending Scout — Analyzer Agent ───
//
// Takes scraped trending data + READMEs, uses LLM to:
// - Categorize repos
// - Explain why each is trending
// - Identify cross-cutting themes
// - Generate a "hot take"

import type { ScrapeResult, RepoReadme, AnalysisResult, RepoInsight } from "../types.js";
import OpenAI from "openai";

/**
 * Build a compact context string from scraped data + READMEs.
 */
function buildContext(scrape: ScrapeResult, readmes: RepoReadme[]): string {
  const readmeMap = new Map(readmes.map((r) => [r.repoName, r.content]));

  return scrape.repos
    .map((repo) => {
      const readme = readmeMap.get(repo.name) || "";
      const readmeSnippet = readme.slice(0, 800);
      return `### #${repo.rank}: ${repo.name}
- Stars: ${repo.totalStars.toLocaleString()} total, +${repo.starsToday.toLocaleString()} ${scrape.period}
- Language: ${repo.language || "N/A"}
- Forks: ${repo.forks.toLocaleString()}
- Description: ${repo.description || "No description"}
${readmeSnippet ? `- README excerpt: ${readmeSnippet}` : ""}`;
    })
    .join("\n\n");
}

/**
 * Run the analysis agent: categorize, explain, find themes.
 */
export async function analyzeTrending(
  scrape: ScrapeResult,
  readmes: RepoReadme[],
  openai: OpenAI,
  model: string,
  language: string,
): Promise<AnalysisResult> {
  console.log(`[analyzer] Analyzing ${scrape.repos.length} repos with ${model}`);

  const context = buildContext(scrape, readmes);

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior developer and tech trend analyst. Analyze GitHub trending repos and produce insights.

Return a JSON object:
{
  "summary": "2-3 sentence narrative of today's overall trending landscape",
  "insights": [
    {
      "repoName": "owner/repo",
      "category": "AI/ML | DevTools | Web | Infrastructure | Security | Data | Mobile | Other",
      "whyTrending": "1-2 sentences explaining the likely reason",
      "targetAudience": "who would care (e.g. 'Frontend developers', 'ML engineers')",
      "keyTakeaway": "the one thing a developer should know",
      "relevanceScore": 8
    }
  ],
  "themes": ["theme1", "theme2", "theme3"],
  "hotTake": "A provocative but insightful observation about what these trends say about the industry"
}

Rules:
- One insight per repo, in the same order as input
- relevanceScore: 1-10 based on how impactful/useful the repo is for developers
- themes: 3-5 cross-cutting themes you see across all repos
- hotTake: be bold, be specific, reference actual repos
- Write in ${language}`,
      },
      {
        role: "user",
        content: `Here are today's GitHub trending repos (${scrape.period}, language filter: ${scrape.language}):\n\n${context}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  // Map insights back to repo objects
  const insights: RepoInsight[] = scrape.repos.map((repo, i) => {
    const ai = parsed.insights?.[i] || {};
    return {
      repo,
      category: ai.category || "Other",
      whyTrending: ai.whyTrending || "",
      targetAudience: ai.targetAudience || "",
      keyTakeaway: ai.keyTakeaway || "",
      relevanceScore: ai.relevanceScore || 5,
    };
  });

  console.log(`[analyzer] Analysis complete: ${insights.length} insights, ${parsed.themes?.length || 0} themes`);

  return {
    summary: parsed.summary || "",
    insights,
    themes: parsed.themes || [],
    hotTake: parsed.hotTake || "",
  };
}
