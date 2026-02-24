// ─── TrendClaw — Content Generator Agent ───
//
// Transforms analysis results into publishable content.
// Supports OpenAI / Ollama / OpenClaw via unified LLM interface.

import type { AnalysisResult, ScrapeResult, ContentPiece, LLMConfig } from "../types.js";
import { chatCompletion } from "../utils/llm.js";

type ContentFormat = "tweet_thread" | "blog_post" | "newsletter" | "digest";

const FORMAT_PROMPTS: Record<ContentFormat, string> = {
  tweet_thread: `Generate a Twitter/X thread (6-10 tweets) about today's GitHub trending repos.

Rules:
- First tweet: hook that grabs attention, mention it's a daily GitHub trending roundup
- Each subsequent tweet covers 1-2 repos with emoji and key insight
- Last tweet: summary + call to action (follow for daily updates)
- Each tweet MUST be under 280 characters
- Use relevant hashtags sparingly (1-2 per tweet max)
- Format: number each tweet as "1/" "2/" etc.
- Be conversational, not corporate`,

  blog_post: `Generate a blog post (800-1200 words) about today's GitHub trending repos.

Rules:
- Catchy title with the date
- Opening paragraph: narrative hook about what's trending
- Group repos by theme/category, don't just list them
- For each highlighted repo: what it does, why it matters, who should check it out
- Include code-relevant details when available (language, key features)
- Closing: what these trends tell us about where dev is heading
- Use markdown formatting (headers, bold, links)
- Professional but approachable tone`,

  newsletter: `Generate a developer newsletter edition about today's GitHub trending repos.

Rules:
- Newsletter title and subtitle
- "TL;DR" section (3 bullet points)
- "Spotlight" section: deep dive on the #1 trending repo
- "Rising Stars" section: 3-4 notable repos with brief descriptions
- "Hot Take" section: your analysis of what these trends mean
- "Quick Links" section: remaining repos as a compact list
- Use markdown formatting
- Friendly, insider-knowledge tone`,

  digest: `Generate a concise daily digest of GitHub trending repos.

Rules:
- Title with date
- Executive summary (2-3 sentences)
- Table: Rank | Repo | Category | Stars Today | Velocity | Key Insight
- Top 3 deep dives (2-3 sentences each)
- "Themes of the Day" section
- If trending changes are available, include a "What Changed" section
- Keep it scannable and information-dense
- Use markdown tables and formatting`,
};

/**
 * Build the data context string for content generation.
 */
function buildRepoContext(analysis: AnalysisResult): string {
  const VELOCITY_EMOJI: Record<string, string> = {
    rocket: "🚀", rising: "📈", stable: "➡️", fading: "📉",
  };

  const repoLines = analysis.insights.map((ins) => {
    const r = ins.repo;
    const emoji = VELOCITY_EMOJI[ins.velocitySignal] || "➡️";
    let line = `#${r.rank} ${emoji} ${r.name} (${r.language || "N/A"}) — ⭐${r.totalStars.toLocaleString()} (+${r.starsToday.toLocaleString()})
  ${r.description}
  Category: ${ins.category} | Why: ${ins.whyTrending}
  Audience: ${ins.targetAudience} | Takeaway: ${ins.keyTakeaway}
  Relevance: ${ins.relevanceScore}/10 | Velocity: ${ins.velocitySignal} | URL: ${r.url}`;

    if (ins.deepMeta) {
      line += `\n  Issues: ${ins.deepMeta.openIssues} | Age: ${ins.deepMeta.ageInDays}d | Commits/wk: ${ins.deepMeta.recentCommitActivity} | License: ${ins.deepMeta.license}`;
    }
    return line;
  }).join("\n\n");

  let diffSection = "";
  if (analysis.diff) {
    const d = analysis.diff;
    diffSection = `\n\nTrending Changes:
- New today: ${d.newEntries.join(", ") || "none"}
- Dropped: ${d.dropped.join(", ") || "none"}
- Rising: ${d.risers.map((r) => `${r.name}(+${r.rankChange})`).join(", ") || "none"}`;
  }

  return repoLines + diffSection;
}

/**
 * Generate a single content piece.
 */
async function generateOne(
  format: ContentFormat,
  analysis: AnalysisResult,
  llmConfig: LLMConfig,
  language: string,
): Promise<ContentPiece> {
  console.log(`[content-gen] Generating ${format}...`);

  const repoContext = buildRepoContext(analysis);

  const response = await chatCompletion(
    { ...llmConfig, temperature: 0.7 },
    [
      {
        role: "system",
        content: `You are a developer content creator with a large following. ${FORMAT_PROMPTS[format]}\n\nWrite in ${language}. Today's date: ${new Date().toISOString().split("T")[0]}.`,
      },
      {
        role: "user",
        content: `Overall trend summary: ${analysis.summary}

Themes: ${analysis.themes.join(", ")}

Hot take: ${analysis.hotTake}

Repo data:
${repoContext}

Generate the ${format.replace("_", " ")} now.`,
      },
    ],
  );

  const content = response.content;
  const wordCount = content.split(/\s+/).length;

  const firstLine = content.split("\n")[0] || "";
  const title = firstLine.replace(/^#+\s*/, "").replace(/^\*+/, "").trim() || `GitHub Trending ${format}`;

  const hashtagMatches = content.match(/#\w+/g) || [];
  const hashtags = [...new Set(hashtagMatches)];

  return { format, title, content, wordCount, hashtags };
}

/**
 * Generate content in all requested formats.
 */
export async function generateContent(
  formats: ContentFormat[],
  analysis: AnalysisResult,
  llmConfig: LLMConfig,
  language: string,
): Promise<ContentPiece[]> {
  console.log(`[content-gen] Generating ${formats.length} content pieces`);

  const pieces: ContentPiece[] = [];
  for (const format of formats) {
    const piece = await generateOne(format, analysis, llmConfig, language);
    pieces.push(piece);
  }

  console.log(`[content-gen] Done: ${pieces.map((p) => `${p.format}(${p.wordCount}w)`).join(", ")}`);
  return pieces;
}
